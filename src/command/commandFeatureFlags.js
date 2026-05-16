import {
  assertCommandPaletteFlagsRegistered,
  isCommandKeyboardShortcutEnabled,
  isCommandPaletteEnabled,
} from '@tetherget/global-command-palette-core'
import { isProfileChipEnabled } from '@tetherget/global-profile-chip-core'

export function isStreamHubCommandPaletteEnabled() {
  return isCommandPaletteEnabled() && isProfileChipEnabled()
}

export function isStreamHubCommandKeyboardShortcutEnabled() {
  return isStreamHubCommandPaletteEnabled() && isCommandKeyboardShortcutEnabled()
}

export function assertStreamHubCommandFlagsRegistered() {
  return assertCommandPaletteFlagsRegistered()
}
