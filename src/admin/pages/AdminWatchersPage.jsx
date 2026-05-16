import { useCallback, useState } from 'react'
import { appendWatcherChannelAudit } from '../../watchers/channel/watchedChannelAudit.js'
import {
  loadContentFactorySettings,
  saveContentFactorySettings,
} from '../../watchers/channel/watchedChannelRules.js'
import {
  seedDefaultWatchedChannels,
  upsertWatchedChannel,
} from '../../watchers/channel/watchedChannelStore.js'
import { loadChannelMoments } from '../../watchers/channel/watchedChannelStore.js'
import { runChannelWatcherPipeline } from '../../watchers/trend/trendContentFactory.js'
import { runTrendWatcherPipeline } from '../../watchers/trend/trendContentFactory.js'
import { loadTrendCandidates, seedDefaultTrendKeywords } from '../../watchers/trend/trendKeywordStore.js'
import { AutoContentFactoryPanel } from '../../watchers/ui/AutoContentFactoryPanel.jsx'
import { ChannelWatcherSettingsPanel } from '../../watchers/ui/ChannelWatcherSettingsPanel.jsx'
import { TrendContentCandidateCard } from '../../watchers/ui/TrendContentCandidateCard.jsx'
import { TrendKeywordPanel } from '../../watchers/ui/TrendKeywordPanel.jsx'
import { WatchedChannelCard } from '../../watchers/ui/WatchedChannelCard.jsx'
import { WatcherActivityFeed } from '../../watchers/ui/WatcherActivityFeed.jsx'
import { AdminPageFrame } from './AdminPageCommon.jsx'

export function AdminWatchersPage() {
  const [tick, setTick] = useState(0)
  const [lastResult, setLastResult] = useState('')
  const refresh = useCallback(() => setTick((n) => n + 1), [])
  void tick

  const channels = seedDefaultWatchedChannels()
  const keywords = seedDefaultTrendKeywords()
  const settings = loadContentFactorySettings()
  const moments = loadChannelMoments().slice(-5).reverse()
  const trends = loadTrendCandidates().slice(-5).reverse()

  const feed = [
    ...moments.map((m) => ({
      id: m.momentId,
      label: `Channel moment: ${m.reason} (${m.channelId})`,
      at: m.createdAt,
    })),
    ...trends.map((t) => ({
      id: t.trendId,
      label: `Trend: ${t.keyword} (${t.category})`,
      at: t.createdAt,
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 8)

  return (
    <AdminPageFrame
      title="AI Channel Watcher / Trend Factory"
      description="Mock channel & trend watch — no download, no crawl, no upload"
    >
      <ChannelWatcherSettingsPanel
        settings={settings}
        onChange={(next) => {
          saveContentFactorySettings(next)
          refresh()
        }}
      />

      <AutoContentFactoryPanel
        lastResult={lastResult}
        onRunChannel={() => {
          const ch = channels[0]
          const result = runChannelWatcherPipeline(ch.channelId, 'surge_mention')
          setLastResult(
            result.blocked
              ? `Channel pipeline blocked: ${result.reason}`
              : `Clip queued: ${result.clip?.id} · safety ${result.review?.verdict}`,
          )
          refresh()
        }}
        onRunTrend={() => {
          const result = runTrendWatcherPipeline(keywords[0]?.keywordId)
          setLastResult(
            result.blocked
              ? `Trend pipeline blocked: ${result.reason}`
              : `Clip queued: ${result.clip?.id} · safety ${result.review?.verdict}`,
          )
          refresh()
        }}
      />

      <h3 className="sh-watcher-section-title">Watched channels</h3>
      <div className="sh-watcher-grid">
        {channels.map((ch) => (
          <WatchedChannelCard
            key={ch.channelId}
            channel={ch}
            onToggle={(enabled) => {
              upsertWatchedChannel({ ...ch, enabled })
              appendWatcherChannelAudit('watcher.channel.enabled', {
                correlation_id: `watcher_${Date.now()}`,
                payload: { channelId: ch.channelId, enabled },
              })
              refresh()
            }}
            onDetect={() => {
              const result = runChannelWatcherPipeline(ch.channelId)
              setLastResult(`Moment → clip ${result.clip?.id ?? 'blocked'}`)
              refresh()
            }}
          />
        ))}
      </div>

      <TrendKeywordPanel
        keywords={keywords}
        onDetect={(keywordId) => {
          const result = runTrendWatcherPipeline(keywordId)
          setLastResult(`Trend → clip ${result.clip?.id ?? 'blocked'}`)
          refresh()
        }}
      />

      <h3 className="sh-watcher-section-title">Recent trend candidates</h3>
      <div className="sh-watcher-grid">
        {trends.length === 0 ? (
          <p>Run trend detection to see candidates.</p>
        ) : (
          trends.map((c) => <TrendContentCandidateCard key={c.trendId} candidate={c} />)
        )}
      </div>

      <WatcherActivityFeed items={feed} />
    </AdminPageFrame>
  )
}
