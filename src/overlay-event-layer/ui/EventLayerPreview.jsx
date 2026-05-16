/**
 * @param {{ previewHtml: string }} props
 */
export function EventLayerPreview({ previewHtml }) {
  return (
    <div className="sh-event-layer-preview" data-testid="overlay-event-layer-preview">
      <div className="sh-overlay-preview-meta">
        <span className="sh-pill sh-badge-mock" data-testid="event-layer-mock-badge">
          MOCK ONLY · EVENT LAYER
        </span>
      </div>
      <div className="sh-overlay-iframe-frame">
        <iframe
          title="Overlay event layer preview"
          srcDoc={previewHtml}
          sandbox="allow-same-origin"
          className="sh-overlay-iframe"
          data-testid="event-layer-preview-iframe"
        />
      </div>
    </div>
  )
}
