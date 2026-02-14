import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { selectNextCommitment } from '../services/selector';
import { type Bindings } from '../types';

const now = new Hono<{ Bindings: Bindings }>();

now.get('/', async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const result = await selectNextCommitment(db);

    if (!result) {
        return c.json({
            now: null,
            message: 'Nothing actionable right now.',
        });
    }

    return c.json(result);
});

export default now;
