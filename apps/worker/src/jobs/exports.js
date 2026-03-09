import fs from 'fs/promises';
import path from 'path';

export async function runExportJobs() {
  const queueDir = path.join(process.cwd(), 'tmp', 'export-queue');
  await fs.mkdir(queueDir, { recursive: true });
  const jobs = await fs.readdir(queueDir);
  for (const job of jobs) {
    const full = path.join(queueDir, job);
    const payload = JSON.parse(await fs.readFile(full, 'utf8'));
    const outDir = path.join(process.cwd(), 'public', 'exports');
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, `${payload.projectId}-${Date.now()}.json`), JSON.stringify(payload));
    await fs.unlink(full);
  }
}
