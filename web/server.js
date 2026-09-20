import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import next from "next";
import { parse } from "node:url";

dotenv.config();
process.env.TZ = "UTC";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);
const app = next({ dev });
const handle = app.getRequestHandler();

function nextCallback(req, res) {
  try {
    handle(req, res, parse(req.url, true));
  } catch (error) {
    console.error("[server] request failed", req.url, error);
    res.statusCode = 500;
    res.end("internal server error");
  }
}

async function startWorkersIfNeeded() {
  if (process.env.WORKER_MODE !== "true") return;
  const { startWorkers } = await import("./src/lib/queues/worker.ts");
  startWorkers();
  console.log("[server] webhook workers started");
}

async function run() {
  await app.prepare();
  await startWorkersIfNeeded();

  const server = express();
  server.set("trust proxy", true);
  server.use(cors());
  server.all(/(.*)/, nextCallback);

  server.listen(port, "0.0.0.0", () => {
    console.log(`[server] listening on ${port}`);
  });
}

run().catch((error) => {
  console.error("[server] failed to start", error);
  process.exit(1);
});
