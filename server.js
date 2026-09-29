/**
 * GEMS Service Desk - local server
 * ---------------------------------
 * Serves the app (public/index.html) and a tiny key-value API that the
 * front end uses instead of browser localStorage, so every department's
 * browser reads/writes the SAME data (stored as JSON files in ./data).
 *
 * Run:   npm install
 *        npm start
 * Then open http://localhost:8080  (or http://<this-PC's-LAN-IP>:8080
 * from any other machine on the same office network).
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function keyToFile(key) {
  // Keep filenames safe regardless of what key the front end sends.
  const safe = String(key).replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, safe + '.json');
}

// GET /api/kv/:key -> { key, value }  (value is null if never set)
app.get('/api/kv/:key', (req, res) => {
  const file = keyToFile(req.params.key);
  if (!fs.existsSync(file)) {
    return res.json({ key: req.params.key, value: null });
  }
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    res.json({ key: req.params.key, value: parsed.value });
  } catch (err) {
    console.error('Read failed for key', req.params.key, err);
    res.status(500).json({ error: 'read failed' });
  }
});

// POST /api/kv/:key  body: { value: "<string>" } -> { key, value }
app.post('/api/kv/:key', (req, res) => {
  const file = keyToFile(req.params.key);
  const value = req.body && req.body.value;
  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'value must be a string' });
  }
  try {
    // Write to a temp file then rename, so a crash mid-write can't corrupt data.
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ value, updatedAt: new Date().toISOString() }, null, 2));
    fs.renameSync(tmp, file);
    res.json({ key: req.params.key, value });
  } catch (err) {
    console.error('Write failed for key', req.params.key, err);
    res.status(500).json({ error: 'write failed' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, '0.0.0.0', () => {
  console.log('GEMS Service Desk is running.');
  console.log('  On this PC:      http://localhost:' + PORT);
  console.log('  From other PCs:  http://<this-PC-LAN-IP>:' + PORT);
  console.log('  Data is stored in: ' + DATA_DIR);
});
