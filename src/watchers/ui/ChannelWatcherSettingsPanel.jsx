import { TREND_CATEGORIES } from '../trend/trendWatcherTypes.js'

/**
 * @param {{
 *   settings: import('../channel/watchedChannelRules.js').ContentFactorySettings;
 *   onChange: (next: import('../channel/watchedChannelRules.js').ContentFactorySettings) => void;
 * }} props
 */
export function ChannelWatcherSettingsPanel({ settings, onChange }) {
  return (
    <section className="sh-watcher-panel" data-testid="channel-watcher-settings">
      <h3>Factory settings (mock)</h3>
      <label className="sh-watcher-toggle">
        <input
          type="checkbox"
          checked={settings.autoQueueEnabled}
          onChange={(e) => onChange({ ...settings, autoQueueEnabled: e.target.checked })}
        />
        Auto queue generation
      </label>
      <label className="sh-watcher-toggle">
        <input
          type="checkbox"
          checked={settings.operatorApprovalRequired}
          onChange={(e) => onChange({ ...settings, operatorApprovalRequired: e.target.checked })}
        />
        Operator approval required (always recommended)
      </label>
      <label className="sh-watcher-toggle">
        <input
          type="checkbox"
          checked={settings.channelWatcherEnabled}
          onChange={(e) => onChange({ ...settings, channelWatcherEnabled: e.target.checked })}
        />
        Channel watcher ON
      </label>
      <label className="sh-watcher-toggle">
        <input
          type="checkbox"
          checked={settings.trendWatcherEnabled}
          onChange={(e) => onChange({ ...settings, trendWatcherEnabled: e.target.checked })}
        />
        Trend watcher ON
      </label>
      <label className="sh-watcher-field">
        Global daily limit
        <input
          type="number"
          min={1}
          max={200}
          value={settings.globalDailyClipLimit}
          data-testid="global-daily-limit"
          onChange={(e) =>
            onChange({ ...settings, globalDailyClipLimit: Number(e.target.value) })
          }
        />
      </label>
      <div className="sh-watcher-categories">
        <span>Categories</span>
        {TREND_CATEGORIES.map((cat) => (
          <label key={cat}>
            <input
              type="checkbox"
              checked={settings.categoryEnabled[cat] !== false}
              data-testid={`category-${cat}`}
              onChange={(e) =>
                onChange({
                  ...settings,
                  categoryEnabled: { ...settings.categoryEnabled, [cat]: e.target.checked },
                })
              }
            />
            {cat}
          </label>
        ))}
      </div>
      <p className="sh-watcher-blocked">
        Blocked keywords: {settings.blockedKeywords.join(', ')}
      </p>
    </section>
  )
}
