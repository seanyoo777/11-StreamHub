import { useCallback, useState } from 'react'
import { detectAllMockClipReasons, detectMockClip } from '../../shorts/autoClipDetector.js'
import { CLIP_DETECTION_REASONS, CLIP_DETECTION_LABELS } from '../../shorts/contracts/clipDetection.js'
import { loadShortsQueue } from '../../shorts/shortsQueueStore.js'
import { getShortsNotifications } from '../../shorts/shortsNotifications.js'
import { StockPickCandidatesPanel } from '../../oneai/stockpick/ui/StockPickCandidatesPanel.jsx'
import { ViralTrendCandidatesPanel } from '../../oneai/trends/ui/ViralTrendCandidatesPanel.jsx'
import { ShortsClipCard } from '../../shorts/ui/ShortsClipCard.jsx'
import { AdminPageFrame, MockActionButton } from './AdminPageCommon.jsx'

export function AdminShortsQueuePage() {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])
  void tick

  const queue = loadShortsQueue()
  const notifications = getShortsNotifications()

  return (
    <AdminPageFrame
      title="Shorts Queue"
      description="Auto clip detection mock — operator review, no FFmpeg or upload"
    >
      <ViralTrendCandidatesPanel onImported={refresh} />
      <StockPickCandidatesPanel onImported={refresh} />

      <div className="sh-shorts-toolbar" data-testid="shorts-toolbar">
        <MockActionButton
          label="Detect all mock reasons"
          testId="detect-all-clips"
          onClick={() => {
            detectAllMockClipReasons()
            refresh()
          }}
        />
        <MockActionButton
          label={`Detect: ${CLIP_DETECTION_LABELS[CLIP_DETECTION_REASONS.SURGE_SPIKE]}`}
          testId="detect-surge"
          onClick={() => {
            detectMockClip({ reason: CLIP_DETECTION_REASONS.SURGE_SPIKE })
            refresh()
          }}
        />
        <MockActionButton
          label="Detect: high-risk caption (block mock)"
          testId="detect-unsafe-clip"
          onClick={() => {
            detectMockClip({
              reason: CLIP_DETECTION_REASONS.HIGH_PNL,
              contentOverrides: {
                caption: '100% 수익 무조건 확정 · 무단 복제',
                sourceType: 'market',
              },
            })
            refresh()
          }}
        />
      </div>

      <p className="sh-subtitle">
        Queue: {queue.length} clips · Notifications: {notifications.length} (in-memory mock)
      </p>

      <div className="sh-shorts-grid" data-testid="shorts-queue-list">
        {queue.length === 0 ? (
          <p>No clips queued — run a mock detection above.</p>
        ) : (
          [...queue].map((clip) => (
            <ShortsClipCard key={clip.id} clip={clip} onUpdated={refresh} />
          ))
        )}
      </div>
    </AdminPageFrame>
  )
}
