import { Hono } from 'hono';
import { type Bindings } from './types';
import dump from './routes/dump';
import confirm from './routes/confirm';
import now from './routes/now';
import done from './routes/done';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.route('/dump', dump);
app.route('/confirm', confirm);
app.route('/now', now);
app.route('/done', done);

export default app;
