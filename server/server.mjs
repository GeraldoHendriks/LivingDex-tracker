import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const dataDir = join(rootDir, 'data');
const stateFile = join(dataDir, 'living-dex-state.json');
const port = Number(process.env.PORT || 4173);
const eventClients = new Set();

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

async function ensureStateFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(stateFile, 'utf8');
  } catch {
    await writeFile(stateFile, JSON.stringify({ owned: {} }, null, 2));
  }
}

// Shared checklist state is intentionally a plain JSON file so it is easy to inspect, back up, and restore.
async function readState() {
  await ensureStateFile();

  try {
    const state = JSON.parse(await readFile(stateFile, 'utf8'));
    return state && typeof state === 'object' && state.owned ? state : { owned: {} };
  } catch {
    return { owned: {} };
  }
}

async function writeState(state) {
  await ensureStateFile();
  await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        request.destroy();
        reject(new Error('Request body too large'));
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function sendEvent(response, event, payload) {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

async function sendStateEvent(response) {
  sendEvent(response, 'state', await readState());
}

function broadcastState(state) {
  for (const response of eventClients) {
    sendEvent(response, 'state', state);
  }
}

// Server-Sent Events are enough here because clients only need broadcast updates from the host server.
async function handleEventStream(request, response) {
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream; charset=utf-8',
    'X-Accel-Buffering': 'no',
  });

  eventClients.add(response);
  await sendStateEvent(response);

  const keepAlive = setInterval(() => {
    response.write(': keep-alive\n\n');
  }, 25000);

  request.on('close', () => {
    clearInterval(keepAlive);
    eventClients.delete(response);
  });
}

function sendNotFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
}

async function serveStatic(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = normalize(requestedPath).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = join(distDir, safePath);

  try {
    await readFile(filePath);
  } catch {
    try {
      // Unknown frontend routes fall back to the React entrypoint.
      const indexPath = join(distDir, 'index.html');
      await readFile(indexPath);
      response.writeHead(200, { 'Content-Type': contentTypes['.html'] });
      createReadStream(indexPath).pipe(response);
    } catch {
      sendNotFound(response);
    }
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') {
      sendJson(response, 204, {});
      return;
    }

    if (request.url?.startsWith('/api/state')) {
      if (request.method === 'GET') {
        sendJson(response, 200, await readState());
        return;
      }

      if (request.method === 'PUT') {
        const body = await readRequestBody(request);
        const payload = JSON.parse(body || '{}');
        const owned = payload && typeof payload.owned === 'object' ? payload.owned : {};
        const state = { owned };

        await writeState(state);
        // Push entry changes to every connected browser immediately.
        broadcastState(state);
        sendJson(response, 200, state);
        return;
      }

      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    if (request.url?.startsWith('/api/events')) {
      if (request.method === 'GET') {
        await handleEventStream(request, response);
        return;
      }

      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : 'Server error' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Living Dex shared server running at http://0.0.0.0:${port}`);
});
