/**
 * @param {{ value: string; onChange: (v: string) => void }} props
 */
export function OverlayTickerEditor({ value, onChange }) {
  return (
    <label className="sh-overlay-field">
      <span>Ticker line</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="BTC +4.2% · ETH +2.1% · mock feed"
        data-testid="overlay-ticker-input"
      />
    </label>
  )
}
