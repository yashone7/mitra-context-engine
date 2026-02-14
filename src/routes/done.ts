import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { commitments } from '../db/schema';
import { type Bindings } from '../types';

const done = new Hono<{ Bindings: Bindings }>();

done.post('/', async (c) => {
    const body = await c.req.json<{ id?: string }>();

    // 1. Validate Input
    if (!body.id || typeof body.id !== 'string') {
        return c.json({ error: 'Commitment ID is required' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });

    // 2. Fetch Existing Commitment
    const existing = await db.select().from(commitments).where(eq(commitments.id, body.id)).get();

    if (!existing) {
        return c.json({ error: 'Commitment not found' }, 404);
    }

    // 3. Validate Current Status
    // STRICT RULE: Only 'open' commitments can be marked as 'done'.
    if (existing.status !== 'open') {
        return c.json({
            error: `Cannot complete a commitment that is ${existing.status}. Only open commitments can be completed.`,
        }, 400);
    }

    // 4. Update Status
    await db.update(commitments)
        .set({ status: 'done' })
        .where(eq(commitments.id, body.id));

    return c.json({
        id: body.id,
        status: 'done',
    });
});

export default done;
