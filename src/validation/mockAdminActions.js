import { mockActionReport, mockEnqueueReport } from './mockAdminReportQueue.js'
import { applyMockRoomScenario } from './mockRoomSessionScenarios.js'
import { runPostChangeValidation } from './postChangeValidation.js'

/**
 * @typedef {'report.actioned' | 'room.force_end' | 'scenario.apply' | 'fees.flag_toggle'} MockAdminActionKind
 */

/**
 * @param {MockAdminActionKind} kind
 * @param {Record<string, unknown>} [params]
 */
export function performMockAdminAction(kind, params = {}) {
  switch (kind) {
    case 'report.actioned': {
      const reportId = String(params.reportId ?? `mock_report_${Date.now()}`)
      mockEnqueueReport(reportId)
      mockActionReport(reportId)
      return runPostChangeValidation({
        kind,
        payload: { reportId, status: 'ACTIONED' },
      })
    }
    case 'room.force_end':
      applyMockRoomScenario('FORCE_ENDED')
      return runPostChangeValidation({
        kind,
        payload: { room_id: params.roomId ?? 'room_mock_p2' },
      })
    case 'scenario.apply': {
      const scenario = /** @type {import('./mockRoomSessionScenarios.js').ROOM_SESSION_SCENARIOS[number]} */ (
        params.scenario ?? 'APP_SYNCED'
      )
      applyMockRoomScenario(scenario)
      return runPostChangeValidation({
        kind,
        payload: { scenario },
      })
    }
    case 'fees.flag_toggle':
      return runPostChangeValidation({
        kind,
        payload: {
          flag: params.flag ?? 'streamhub.fees.display_experiment',
          enabled: params.enabled ?? true,
        },
      })
    default:
      throw new Error(`Unknown mock admin action: ${kind}`)
  }
}
