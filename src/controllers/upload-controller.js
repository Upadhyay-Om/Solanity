import { db } from '../db/index.js'
import { documents } from '../db/schema.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export const healthCheck = (_req, res) => {
  return res.status(200).json({ status: 'ok' });
};

export const upload_controller = async function uploadFile(req, res) {
  let content;
  if (req.file.mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
    const pdfData = await parser.getText();
    content = pdfData;
    await parser.destroy();
  } else {
    content = req.file.buffer.toString('utf-8');
  }
  const [row] = await db.insert(documents).values({
    title: req.file.originalname,
    content: content
  }).returning();
  return res.status(200).json({ document: row });
}