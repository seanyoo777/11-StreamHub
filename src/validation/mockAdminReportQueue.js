/** In-memory mock admin report queue — no network */

/** @type {{ id: string; status: string }[]} */
const queue = []

/**
 * @param {string} reportId
 */
export function mockEnqueueReport(reportId) {
  queue.push({ id: reportId, status: 'OPEN' })
}

/**
 * @param {string} reportId
 * @returns {boolean}
 */
export function mockActionReport(reportId) {
  const row = queue.find((r) => r.id === reportId)
  if (!row) return false
  row.status = 'ACTIONED'
  return true
}

/** @returns {readonly { id: string; status: string }[]} */
export function getMockReportQueue() {
  return queue
}

export function resetMockReportQueueForTests() {
  queue.length = 0
}
