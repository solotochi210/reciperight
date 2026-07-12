const dns = require('dns');
const mongoose = require('mongoose');

/**
 * Harden DNS resolution.
 *
 * On some Windows/network setups Node's default resolver intermittently fails
 * to resolve the Atlas hosts — surfacing as `getaddrinfo ENOTFOUND` on the
 * shard A-record lookups and `querySrv ECONNREFUSED` on the SRV lookup — even
 * though the cluster is healthy. We fix this by:
 *   1. Pinning reliable public DNS servers (used by c-ares for SRV/TXT lookups).
 *   2. Forcing IPv4-first result order so flaky IPv6 (AAAA) lookups in
 *      getaddrinfo don't stall or fail host resolution.
 */
function hardenDns() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (err) {
    console.warn(`[db] could not set DNS servers: ${err.message}`);
  }
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
}

/**
 * Connect to MongoDB with simple exponential-backoff retry logic.
 * Resolves once connected; throws after exhausting retries.
 */
async function connectDB(uri = process.env.MONGODB_URI, { retries = 5, delayMs = 2000 } = {}) {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  hardenDns();
  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected — driver will attempt to reconnect'));
  mongoose.connection.on('reconnected', () => console.log('[db] reconnected'));
  mongoose.connection.on('error', (err) => console.error(`[db] connection error: ${err.message}`));

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      attempt += 1;
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        family: 4,
      });
      console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error(`[db] connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= retries) {
        throw err;
      }
      const wait = delayMs * attempt;
      console.log(`[db] retrying in ${wait}ms...`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
}

module.exports = connectDB;
