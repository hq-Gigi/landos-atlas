import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../../lib/prisma';
import { requireProjectAccess } from '../../../lib/apiGuard';
import { getProjectState } from '../../../lib/platformStore';

function buildScr(scenarios) {
  const lines = ['; LandOS Atlas SCR export'];
  scenarios.forEach((s, idx) => {
    lines.push(`; Scenario ${idx + 1}: ${s.name}`);
    lines.push(`TEXT 0,${idx * 5} 2 0 ${s.name} score ${s.optimizationScore}`);
  });
  return lines.join('\n');
}

function buildPdfBytes(state) {
  const lines = [
    'LandOS Atlas Development Report',
    `Project: ${state.project.name}`,
    `Objective: ${state.project.objective}`,
    ...state.scenarios.map((s) => `${s.name} | Units ${s.metrics.yieldUnits} | Margin ${s.metrics.margin} | Score ${s.optimizationScore}`)
  ];
  const text = lines.join(' | ').replace(/[()]/g, '');
  const stream = `BT /F1 12 Tf 40 760 Td (${text.slice(0, 1800)}) Tj ET`;
  const pdf = `%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>endobj\n4 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n5 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000241 00000 n \n0000000311 00000 n \ntrailer<< /Size 6 /Root 1 0 R >>\nstartxref\n420\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

function buildPngBytes() {
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAASwAAABQCAIAAADyzfNTAAAAA3NCSVQICAjb4U/gAAAAF0lEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAA4G0GfQABmQm0qgAAAABJRU5ErkJggg==';
  return Buffer.from(base64, 'base64');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  req.query.projectId = req.body?.projectId;
  const access = await requireProjectAccess(req, res, req.body?.projectId);
  if (!access) return;

  const payment = await prisma.payment.findFirst({ where: { projectId: req.body?.projectId, status: 'SUCCESS' }, orderBy: { createdAt: 'desc' } });
  if (!payment) return res.status(403).json({ error: 'project exports locked until payment is verified' });

  const state = await getProjectState(req.body.projectId);
  const type = (req.body.type || 'PDF').toUpperCase();
  const outDir = path.join(process.cwd(), 'public', 'exports');
  await fs.mkdir(outDir, { recursive: true });
  const ts = Date.now();

  let filename = `${req.body.projectId}-${ts}.txt`;
  let content = Buffer.from('');

  if (type === 'SCR') {
    filename = `${req.body.projectId}-${ts}.scr`;
    content = Buffer.from(buildScr(state.scenarios), 'utf8');
  } else if (type === 'PNG') {
    filename = `${req.body.projectId}-${ts}.png`;
    content = buildPngBytes();
  } else {
    filename = `${req.body.projectId}-${ts}.pdf`;
    content = buildPdfBytes(state);
  }

  await fs.writeFile(path.join(outDir, filename), content);
  const record = await prisma.export.create({
    data: {
      projectId: req.body.projectId,
      type,
      status: 'READY',
      url: `/exports/${filename}`,
      metadata: { generatedAt: new Date().toISOString(), paymentReference: payment.reference, bytes: content.length }
    }
  });
  return res.status(201).json(record);
}
