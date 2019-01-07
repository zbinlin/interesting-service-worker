const { promises: fs } = require("fs");
const sqlite = require("sqlite");
const os = require("os");
const path = require("path");
const { createHash } = require("./lib.js");

const puppeteer = require("puppeteer-core");

const CHROME_BIN_PATH = process.env.CHROME_BIN_PATH || "/usr/bin/chromium";
const USER_DATA_DIR_PREFIX = path.join(os.tmpdir(), "dl-");
const DB_PATH = path.join(__dirname, "./response.sqlite");

const DL_LINK = process.argv[2];
if (!/https?:/i.test(DL_LINK)) {
    console.error(`Arguments 1 \`${DL_LINK || ""}\` is an invalid URL!`);
    process.exit(1);
}

async function main() {
    const userDataDir = await fs.mkdtemp(USER_DATA_DIR_PREFIX);
    const db = await sqlite.open(DB_PATH);
    await db.migrate({
        force: "last",
        migrationsPath: path.join(__dirname, "./migrations"),
    });

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: CHROME_BIN_PATH,
        userDataDir,
        devtools: false,
    });

    const page = await browser.newPage();

    await page.setViewport({
        width: 1920,
        height: 1040,
    });

    page.on("requestfinished", async req => {
        try {
            const method = req.method().toUpperCase();

            const link = req.url();
            const linkObj = new URL(link);
            const host = linkObj.host;
            const pathname = linkObj.pathname + linkObj.search;

            const body = req.postData();

            const res = await req.response();
            const buf = await res.buffer();

            const headers = res.headers();
            const contentType = headers["content-type"];

            const rid = createHash()(method, host, pathname, body);
            const isEntry = req.isNavigationRequest();

            await db.run(`INSERT INTO res(rid, method, host, path, body, content_type, response, is_entry)
                          VALUES(:rid, :method, :host, :path, :body, :content_type, :response, :is_entry)`, {
                ":rid": rid,
                ":method": method,
                ":host": host,
                ":path": pathname,
                ":body": body === undefined ? null : body,
                ":content_type": contentType,
                ":response": buf,
                ":is_entry": isEntry,
            });
        } catch (ex) {
            console.error(ex);
        }
    });
    await page.goto(DL_LINK);
    return new Promise((resolve, reject) => {
        page.on("close", async () => {
            await db.close();
            resolve();
        });
        page.on("error", reject);
    });
}

main().catch(console.error.bind(console));
