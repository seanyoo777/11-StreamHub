import { OVERLAY_ANIMATION_PRESETS } from '../overlaySceneTypes.js'

/**
 * @param {{ value: string; onChange: (v: string) => void }} props
 */
export function OverlayAnimationSelector({ value, onChange }) {
  return (
    <label className="sh-overlay-field">
      <span>Animation</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="overlay-animation-select"
      >
        {OVERLAY_ANIMATION_PRESETS.map((preset) => (
          <option key={preset} value={preset}>
            {preset}
          </option>
        ))}
      </select>
    </label>
  )
}
