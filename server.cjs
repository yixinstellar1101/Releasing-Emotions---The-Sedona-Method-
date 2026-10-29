const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const os = require('node:os');
const port = Number(process.env.SEDONA_PORT || 8765);
const mobile = process.argv.includes('--mobile');
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/emotion-chart.js', ['emotion-chart.js', 'text/javascript; charset=utf-8']],
  ['/enhancements.css', ['enhancements.css', 'text/css; charset=utf-8']],
  ['/themes.css', ['themes.css', 'text/css; charset=utf-8']],
  ['/theme-data.js', ['theme-data.js', 'text/javascript; charset=utf-8']],
  ['/practice-notes.js', ['practice-notes.js', 'text/javascript; charset=utf-8']],
  ['/practice-notes.css', ['practice-notes.css', 'text/css; charset=utf-8']],
  ['/motion-interactions.css', ['motion-interactions.css', 'text/css; charset=utf-8']]
]);
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
  const file = files.get(pathname);
  if (!file) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(__dirname, file[0]), (error, data) => {
    if (error) { res.writeHead(500); return res.end('Unable to read page'); }
    res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Port ' + port + ' is in use. Set SEDONA_PORT to another port and try again.'
    : error.message);
  process.exitCode = 1;
});
server.listen(port, mobile ? '0.0.0.0' : '127.0.0.1', () => {
  const url = 'http://127.0.0.1:' + port;
  console.log('Songjian / Sedona: ' + url);
  console.log('Keep this terminal open while using the page. Press Ctrl+C to stop.');
  if (mobile) {
    console.log('Phone: connect to the same Wi-Fi and open one of these addresses:');
    for (const network of Object.values(os.networkInterfaces())) {
      for (const address of network || []) {
        if (address.family === 'IPv4' && !address.internal) console.log('  http://' + address.address + ':' + port);
      }
    }
    console.log('Browser microphone access requires HTTPS. On plain HTTP, use the phone keyboard microphone.');
  }
  if (process.argv.includes('--open')) {
    spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { windowsHide: true, stdio: 'ignore' })
      .on('error', () => console.log('Open this address in your browser: ' + url));
  }
});
