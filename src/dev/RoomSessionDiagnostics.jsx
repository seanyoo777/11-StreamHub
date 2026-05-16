import { getRoomSessionDiagnosticsViewModel } from './viewModels.js'

/**
 * @param {{ session: ReturnType<import('../validation/mockRoomSession.js').getMockRoomSession> }} props
 */
export function RoomSessionDiagnostics({ session }) {
  const vm = getRoomSessionDiagnosticsViewModel(session)

  return (
    <section className="sh-room-diagnostics" aria-labelledby="room-diagnostics-heading">
      <header className="sh-room-diagnostics-header">
        <div>
          <h2 id="room-diagnostics-heading">Room / Session diagnostics</h2>
          <p className="sh-subtitle">Mock snapshot — no live stream</p>
        </div>
        <span className="sh-badge sh-badge-mock" data-testid="room-mock-badge">
          {vm.mockOnlyBadge}
        </span>
      </header>

      <div className="sh-room-cards" data-testid="room-session-cards">
        <div className="sh-room-card">
          <span className="sh-label">room_id</span>
          <strong>{vm.room_id}</strong>
        </div>
        <div className="sh-room-card" data-testid="live-state">
          <span className="sh-label">live_state</span>
          <strong>{vm.live_state}</strong>
        </div>
        <div className="sh-room-card" data-testid="active-session-id">
          <span className="sh-label">active_session_id</span>
          <strong>{vm.active_session_id ?? '—'}</strong>
        </div>
        <div className="sh-room-card">
          <span className="sh-label">session_state</span>
          <strong>{vm.session_state}</strong>
        </div>
        <div className="sh-room-card" data-testid="last-chat-seq">
          <span className="sh-label">last_chat_seq</span>
          <strong>{vm.last_chat_seq}</strong>
        </div>
        <div className="sh-room-card" data-testid="channel-id">
          <span className="sh-label">channel_id</span>
          <strong>
            <code>{vm.channel_id}</code>
          </strong>
        </div>
        <div className="sh-room-card" data-testid="recovery-state">
          <span className="sh-label">recovery</span>
          <strong>
            {vm.transport_state} / {vm.recovery_label}
          </strong>
        </div>
        <div className="sh-room-card">
          <span className="sh-label">last streamhub.error</span>
          <strong>{vm.last_error_code}</strong>
        </div>
      </div>
    </section>
  )
}
