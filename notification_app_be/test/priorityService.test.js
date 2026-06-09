const test = require('node:test');
const assert = require('node:assert');
const { calculatePriorityScore, processNotifications } = require('../services/priorityService');

test('Priority Service Unit Tests', async (t) => {
  
  await t.test('1. Should ignore notifications where read = true', () => {
    const input = [
      { id: '1', type: 'Placement', message: 'Unread Placement', timestamp: '2026-06-09T10:00:00.000Z', read: false },
      { id: '2', type: 'Placement', message: 'Read Placement', timestamp: '2026-06-09T10:30:00.000Z', read: true }
    ];

    const result = processNotifications(input);
    
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, '1');
    assert.strictEqual(result[0].message, 'Unread Placement');
  });

  await t.test('2. Should assign correct weight values', () => {
    const placementScore = calculatePriorityScore({ type: 'Placement', timestamp: '2026-06-09T10:00:00.000Z' });
    const resultScore = calculatePriorityScore({ type: 'Result', timestamp: '2026-06-09T10:00:00.000Z' });
    const eventScore = calculatePriorityScore({ type: 'Event', timestamp: '2026-06-09T10:00:00.000Z' });

    // Placement (weight 3) > Result (weight 2) > Event (weight 1)
    assert.ok(placementScore > resultScore, 'Placement score should be higher than Result score');
    assert.ok(resultScore > eventScore, 'Result score should be higher than Event score');
  });

  await t.test('3. Should sort by higher weight first', () => {
    const input = [
      { id: 'E1', type: 'Event', message: 'New Event', timestamp: '2026-06-09T11:50:00.000Z', read: false },
      { id: 'P1', type: 'Placement', message: 'Old Placement', timestamp: '2026-06-09T10:00:00.000Z', read: false },
      { id: 'R1', type: 'Result', message: 'Medium Result', timestamp: '2026-06-09T11:00:00.000Z', read: false }
    ];

    const result = processNotifications(input);

    // Expected order: P1 (Placement, weight 3) -> R1 (Result, weight 2) -> E1 (Event, weight 1)
    // Even though E1 has a newer timestamp, P1 and R1 must rank higher due to weights.
    assert.strictEqual(result[0].id, 'P1');
    assert.strictEqual(result[1].id, 'R1');
    assert.strictEqual(result[2].id, 'E1');
  });

  await t.test('4. Should break ties using newer timestamp first if weights are equal', () => {
    const input = [
      { id: 'P_OLD', type: 'Placement', message: 'Old Placement', timestamp: '2026-06-09T10:00:00.000Z', read: false },
      { id: 'P_NEW', type: 'Placement', message: 'New Placement', timestamp: '2026-06-09T11:00:00.000Z', read: false },
      { id: 'P_MID', type: 'Placement', message: 'Mid Placement', timestamp: '2026-06-09T10:30:00.000Z', read: false }
    ];

    const result = processNotifications(input);

    // All are Placements (same weight). Expected order: P_NEW -> P_MID -> P_OLD
    assert.strictEqual(result[0].id, 'P_NEW');
    assert.strictEqual(result[1].id, 'P_MID');
    assert.strictEqual(result[2].id, 'P_OLD');
  });

  await t.test('5. Should limit results to Top 10 notifications', () => {
    const input = [];
    for (let i = 1; i <= 15; i++) {
      input.push({
        id: `N${i}`,
        type: 'Placement',
        message: `Placement ${i}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(), // older notifications
        read: false
      });
    }

    const result = processNotifications(input);
    
    assert.strictEqual(result.length, 10, 'Result size should be capped at exactly 10');
    // N1 is the newest (subtracted 1 minute) and should be first, N10 (subtracted 10 minutes) should be last in Top 10
    assert.strictEqual(result[0].id, 'N1');
    assert.strictEqual(result[9].id, 'N10');
  });
});
