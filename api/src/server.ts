import Koa from 'koa';

const app = new Koa();

app.use(async (ctx) => {
    if (ctx.method === 'GET') {
        ctx.body = {
            message: 'Hello from KOA!',
        };
        ctx.status = 200;
    } else {
        ctx.status = 405;
    }
});

const port = 80; // TODO: get these env vars working
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
