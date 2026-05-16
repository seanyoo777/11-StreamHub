/**
 * @param {{
 *   channel: import('../channel/watchedChannelTypes.js').WatchedChannel;
 *   onToggle: (enabled: boolean) => void;
 *   onDetect: () => void;
 * }} props
 */
export function WatchedChannelCard({ channel, onToggle, onDetect }) {
  return (
    <article className="sh-watcher-card" data-testid={`watched-channel-${channel.channelId}`}>
      <header>
        <strong>{channel.channelName}</strong>
        <span className="sh-pill">{channel.platform}</span>
      </header>
      <p className="sh-watcher-meta">
        {channel.watchMode} · limit {channel.dailyClipLimit}/day · risk {channel.riskLevel}
      </p>
      <p className="sh-watcher-keywords">
        {channel.keywords.map((k) => (
          <code key={k}>{k}</code>
        ))}
      </p>
      <div className="sh-watcher-card-actions">
        <label>
          <input
            type="checkbox"
            checked={channel.enabled}
            data-testid={`toggle-${channel.channelId}`}
            onChange={(e) => onToggle(e.target.checked)}
          />
          Enabled
        </label>
        <button
          type="button"
          className="sh-admin-mock-btn"
          data-testid={`detect-moment-${channel.channelId}`}
          disabled={!channel.enabled}
          onClick={onDetect}
        >
          Detect moment (mock)
        </button>
      </div>
    </article>
  )
}
