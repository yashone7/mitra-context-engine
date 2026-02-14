import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { commitments } from '../db/schema';
import { splitAndClassify } from '../services/classifier';
import { type Bindings } from '../types';

const dump = new Hono<{ Bindings: Bindings }>();

dump.post('/', async (c) => {
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

export default dump;
