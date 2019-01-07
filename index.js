const koa = require("koa");
const koaStatic = require("koa-static");
const sqlite = require("sqlite");
const { createHash } = require("./lib.js");
const path = require("path");

const DB_PATH = path.join(__dirname, "./response.sqlite");

async function getBody(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        chunks.size = 0;
        stream.on("data", chunk => {
            chunks.push(chunk);
            chunks.size += chunk.length;
        });
        stream.on("end", () => {
            const buffer = Buffer.concat(chunks, chunks.size);
            resolve(buffer);
        });
        stream.on("error", reject);
    });
}

async function bootstrap() {
    const db = await sqlite.open(DB_PATH);
    const app = new koa();

    const entry = await db.get("SELECT * FROM res WHERE is_entry IS TRUE");

    app.use(async (ctx, next) => {
        if (ctx.method === "POST" && ctx.url === "/") {
            const headers = ctx.request.headers;
            const method = headers["x-original-method"].toUpperCase();
            let host = headers["x-original-host"];
            let pathname = headers["x-original-path"];
            if (host === "") {
                host = entry.host;
            }
            if (pathname === "") {
                pathname = entry.path;
            }
            const body = await getBody(ctx.req);
            const rid = createHash()(method, host, pathname, body);
            const res = await db.get(`
                SELECT content_type AS "contentType",
                       response
                FROM res
                WHERE rid = ?`, rid,
            );
            if (res) {
                ctx.response.status = 200;
                ctx.response.type = res.contentType;
                ctx.response.body = res.response;
            } else {
                console.log(rid, method, host, pathname, body);
                ctx.response.status = 404;
            }
        } else {
            await next();
        }
    });
    app.use(koaStatic(path.join(__dirname, "./public"), {
    }));

    app.listen(process.env.PORT || 3000);
}

bootstrap().catch(console.error.bind(console));
