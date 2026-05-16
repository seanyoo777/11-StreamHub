/**
 * @param {{ items: { id: string; label: string; at: number }[] }} props
 */
export function WatcherActivityFeed({ items }) {
  return (
    <section className="sh-watcher-panel" data-testid="watcher-activity-feed">
      <h3>Activity feed (mock)</h3>
      {items.length === 0 ? (
        <p>No activity yet.</p>
      ) : (
        <ul className="sh-watcher-feed">
          {items.map((item) => (
            <li key={item.id}>
              <time>{new Date(item.at).toLocaleTimeString()}</time>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
