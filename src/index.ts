import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';
import { commitments } from './db/schema';
import { splitAndClassify } from './services/classifier';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.post('/dump', async (c) => {
  const body = await c.req.json<{ text?: string }>();

  if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
    return c.json({ error: 'Text input is required' }, 400);
  }

  // 1. Split and Classify
  const suggestions = await splitAndClassify(body.text);

  // 2. Persist as 'unconfirmed'
  const db = drizzle(c.env.DB, { schema });

  if (suggestions.length > 0) {
    await db.insert(commitments).values(
      suggestions.map(s => ({
        title: s.description,
        workStream: s.workStream,
        energyLevel: s.energyLevel,
        status: 'unconfirmed' as const,
      }))
    );
  }

  return c.json({ suggestions });
});

export default app;

app.post('/confirm', async (c) => {
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
  // We need to check if it exists AND if it is unconfirmed.
  // We can do this in one query or two. Let's do it explicitly for clearer error messages.
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
