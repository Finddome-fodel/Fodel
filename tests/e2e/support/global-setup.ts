/**
 * Runs once before the suite: refuses an unsafe configuration and empties
 * the captured-email outbox so each run reads only its own messages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { assertSafeToWrite, OUTBOX } from './env';

export default async function globalSetup() {
  assertSafeToWrite();
  // The suite starts its own dev server from this folder unless E2E_BASE_URL
  // points elsewhere. A `.env` here is the live database's — run the suite
  // from a clone without it (see .env.test.example).
  if (!process.env.E2E_BASE_URL && fs.existsSync(path.join(process.cwd(), '.env'))) {
    throw new Error(
      'A .env file (the LIVE database) is present in this folder. Run the end-to-end suite from a copy without it, ' +
        'e.g. rsync -a --exclude node_modules --exclude .env ./ ../fodel-e2e/ — see .env.test.example.'
    );
  }
  fs.rmSync(OUTBOX, { recursive: true, force: true });
  fs.mkdirSync(OUTBOX, { recursive: true });
}
