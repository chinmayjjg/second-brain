import express from 'express';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/download', async (req, res) => {
  const extensionPath = path.resolve(__dirname, '../../../extension');

  if (!fs.existsSync(extensionPath)) {
    return res.status(404).json({ error: 'Extension directory not found' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="second-brain-extension.zip"');

  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.on('error', (err: Error) => {
    console.error('Archive error:', err);
    res.status(500).send({ error: 'Failed to create zip' });
  });

  archive.on('end', () => {
    console.log('Archive size:', archive.pointer());
  });

  archive.pipe(res);
  archive.directory(extensionPath, false);
  archive.finalize();
});

export default router;
