import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { commitments } from '../db/schema';
import { type Bindings } from '../types';

const confirm = new Hono<{ Bindings: Bindings }>();

confirm.post('/', async (c) => {
    const body = await c.req.json<{ id?: string; action?: string }>();

    // 1. Validate Input
    if (!body.id || typeof body.id !== 'string') {
        return c.json({ error: 'Commitment ID is required' }, 400);
    }
    if (!body.action || (body.action !== 'confirm' && body.action !== 'dismiss')) {
        return c.json({ error: 'Action must be either "confirm" or "dismiss"' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });

    // 2. Fetch Existing Commitment
    const existing = await db.select().from(commitments).where(eq(commitments.id, body.id!)).get();

    if (!existing) {
        return c.json({ error: 'Commitment not found' }, 404);
    }

    // 3. Validate Current Status
    if (existing.status !== 'unconfirmed') {
        return c.json({
            error: `Cannot ${body.action} a commitment that is already ${existing.status}`,
        }, 400);
    }

    // 4. Update Status
    const newStatus = body.action === 'confirm' ? 'open' : 'dismissed';

    await db.update(commitments)
        .set({ status: newStatus })
        .where(eq(commitments.id, body.id!));

    return c.json({
        id: body.id,
        status: newStatus,
    });
});

export default confirm;
