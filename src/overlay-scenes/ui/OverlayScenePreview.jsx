/**
 * @param {{ previewHtml: string; browserSourceUrlMock: string; active?: boolean }} props
 */
export function OverlayScenePreview({ previewHtml, browserSourceUrlMock, active }) {
  return (
    <div className="sh-overlay-preview-wrap" data-testid="overlay-scene-preview">
      <div className="sh-overlay-preview-meta">
        <span className="sh-pill sh-badge-mock">OBS Browser Source mock</span>
        {active ? <span className="sh-pill">ACTIVE</span> : null}
      </div>
      <p className="sh-overlay-url" title={browserSourceUrlMock}>
        {browserSourceUrlMock}
      </p>
      <div className="sh-overlay-iframe-frame">
        <iframe
          title="Overlay scene preview"
          srcDoc={previewHtml}
          sandbox="allow-same-origin"
          className="sh-overlay-iframe"
          data-testid="overlay-preview-iframe"
        />
      </div>
    </div>
  )
}
