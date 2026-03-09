import { runExportJobs } from './jobs/exports.js';

async function main() {
  await runExportJobs();
  setInterval(runExportJobs, Number(process.env.WORKER_POLL_MS || 15000));
}

main().catch((err) => {
  console.error('worker_failed', err);
  process.exit(1);
});
