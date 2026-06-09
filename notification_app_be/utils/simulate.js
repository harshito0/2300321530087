const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSimulation() {
  console.log('================================================================');
  console.log(' STARTING SYSTEM SIMULATION FOR CAMPUS NOTIFICATIONS SERVICE');
  console.log('================================================================\n');

  const client = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 15000
  });

  // Wait for server to boot
  await sleep(1500);

  // 1. Fetch Priority Inbox (Batch flow)
  // This will trigger the Axios request interceptors, response interceptors,
  // and the mock server's transient 503 failure, triggering a retry.
  console.log('[SIMULATOR] Triggering GET /api/priority-inbox...');
  try {
    const inboxRes = await client.get('/api/priority-inbox');
    console.log('\n[SIMULATOR] GET /api/priority-inbox SUCCESS!');
    console.log('[SIMULATOR] Response Count:', inboxRes.data.count);
    console.log('[SIMULATOR] Top 10 Priority Inbox Result:');
    console.table(inboxRes.data.data.map(item => ({
      ID: item.id,
      Type: item.type,
      Message: item.message.substring(0, 45) + '...',
      Timestamp: item.timestamp,
      'Priority Score': item.calculatedPriorityScore
    })));
  } catch (err) {
    console.error('[SIMULATOR] Failed to fetch priority inbox:', err.message);
  }

  console.log('\n----------------------------------------------------------------\n');

  // 2. Stream a brand new Placement notification (Should displace lower items in Top 10)
  console.log('[SIMULATOR] Streaming a new high-priority Placement notification...');
  try {
    const streamRes = await client.post('/api/notifications/stream', {
      id: "N-STREAM-99",
      type: "Placement",
      message: "Urgent: Google Off-campus shortlisting started for 2026 graduates!",
      timestamp: new Date().toISOString(),
      read: false
    });
    console.log('[SIMULATOR] Stream response status:', streamRes.status);
    console.log('[SIMULATOR] Message:', streamRes.data.message);
    console.log('[SIMULATOR] Inserted into Top 10 Inbox?', streamRes.data.insertedIntoInbox);
    console.log('[SIMULATOR] Current Top 10:');
    console.table(streamRes.data.currentTop10.map(item => ({
      ID: item.id,
      Type: item.type,
      Message: item.message.substring(0, 45) + '...',
      Timestamp: item.timestamp,
      'Priority Score': item.calculatedPriorityScore
    })));
  } catch (err) {
    console.error('[SIMULATOR] Streaming failed:', err.response ? err.response.data : err.message);
  }

  console.log('\n----------------------------------------------------------------\n');

  // 3. Stream a low-priority Event notification (Should be ignored by Top 10 Heap since score is lower than root)
  console.log('[SIMULATOR] Streaming a low-priority Event notification...');
  try {
    const streamRes2 = await client.post('/api/notifications/stream', {
      id: "N-STREAM-100",
      type: "Event",
      message: "Reminder: Badminton club weekly meet at 5 PM.",
      timestamp: "2026-06-09T03:00:00.000Z",
      read: false
    });
    console.log('[SIMULATOR] Stream response status:', streamRes2.status);
    console.log('[SIMULATOR] Message:', streamRes2.data.message);
    console.log('[SIMULATOR] Inserted into Top 10 Inbox?', streamRes2.data.insertedIntoInbox);
  } catch (err) {
    console.error('[SIMULATOR] Streaming failed:', err.response ? err.response.data : err.message);
  }

  console.log('\n================================================================');
  console.log(' SIMULATION COMPLETE');
  console.log('================================================================');
}

runSimulation();
