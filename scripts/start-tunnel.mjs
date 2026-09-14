#!/usr/bin/env node

/**
 * Sobe o Metro atrás de um túnel ngrok próprio.
 *
 * O `expo start --tunnel` depende de uma conta ngrok compartilhada do Expo que estourou o limite
 * de sessões (expo/expo#43335) e do agente ngrok v2, recusado por contas gratuitas. Aqui o túnel
 * é criado pelo ngrok instalado na máquina e entregue ao Expo via `EXPO_PACKAGER_PROXY_URL`,
 * que tem precedência sobre as demais URLs do dev server.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.RCT_METRO_PORT ?? 8081);
const NGROK_API_URL = 'http://127.0.0.1:4040/api/tunnels';
const TUNNEL_TIMEOUT_MS = 30_000;
const TUNNEL_POLL_INTERVAL_MS = 500;

async function findTunnelUrl() {
  try {
    const response = await fetch(NGROK_API_URL);

    if (!response.ok) {
      return null;
    }

    const { tunnels = [] } = await response.json();

    return tunnels.find((tunnel) => tunnel.config?.addr?.endsWith(`:${PORT}`))?.public_url ?? null;
  } catch {
    // A API local só existe depois que o agente sobe.
    return null;
  }
}

function startNgrok() {
  const ngrok = spawn(
    'ngrok',
    [
      'http',
      String(PORT),
      // O Metro rejeita requisições com Host externo.
      '--host-header=localhost',
      '--log=stdout',
      '--log-format=logfmt',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const logs = [];
  const collect = (chunk) => logs.push(chunk.toString());

  ngrok.stdout.on('data', collect);
  ngrok.stderr.on('data', collect);
  ngrok.on('error', (error) => {
    console.error(`\nNão foi possível executar o ngrok: ${error.message}`);
    console.error('Instale o ngrok e autentique com `ngrok config add-authtoken <token>`.\n');
    process.exit(1);
  });

  return { ngrok, logs };
}

async function waitForTunnelUrl(logs) {
  const deadline = Date.now() + TUNNEL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const url = await findTunnelUrl();

    if (url) {
      return url;
    }

    await new Promise((resolve) => setTimeout(resolve, TUNNEL_POLL_INTERVAL_MS));
  }

  console.error('\nO túnel do ngrok não ficou pronto a tempo. Saída do agente:\n');
  console.error(logs.join('').trim() || '(sem saída)');
  console.error('');

  return null;
}

function startExpo(publicUrl, args) {
  const expoBin = fileURLToPath(new URL('../node_modules/.bin/expo', import.meta.url));

  if (!existsSync(expoBin)) {
    console.error('\nExpo CLI não encontrado. Rode `pnpm install` antes.\n');
    process.exit(1);
  }

  return spawn(expoBin, ['start', '--lan', ...args], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Em https o CLI monta `exp://host:443`, que o Expo Go não abre. O ngrok atende os dois esquemas.
      EXPO_PACKAGER_PROXY_URL: publicUrl.replace(/^https:/, 'http:'),
    },
  });
}

async function main() {
  const existingUrl = await findTunnelUrl();
  const reusedTunnel = Boolean(existingUrl);
  let ngrok = null;
  let publicUrl = existingUrl;

  if (reusedTunnel) {
    console.log(`Reaproveitando túnel ngrok já ativo: ${publicUrl}`);
  } else {
    console.log(`Subindo túnel ngrok para a porta ${PORT}...`);

    const started = startNgrok();
    ngrok = started.ngrok;
    publicUrl = await waitForTunnelUrl(started.logs);

    if (!publicUrl) {
      ngrok.kill('SIGTERM');
      process.exit(1);
    }

    console.log(`Túnel pronto: ${publicUrl}`);
  }

  const expo = startExpo(publicUrl, process.argv.slice(2));

  const shutdown = (code) => {
    if (ngrok && !ngrok.killed) {
      ngrok.kill('SIGTERM');
    }

    process.exit(code ?? 0);
  };

  expo.on('exit', (code) => shutdown(code ?? 0));
  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
}

void main();
