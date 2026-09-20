import { startWorkers } from "./src/lib/queues/worker";

console.log("[worker] starting webhook workers");
startWorkers();
