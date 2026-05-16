/** Screen IA routes — docs/STREAMHUB_SCREEN_FLOW.md §1.2 */

export const STREAMHUB_ROUTES = Object.freeze({
  home: '/',
  live: '/live',
  liveRoom: '/live/:roomId',
  userProfile: '/u/:handle',
  login: '/login',
  signup: '/signup',
  creator: '/creator',
  creatorRooms: '/creator/rooms',
  creatorRoom: '/creator/rooms/:id',
  creatorRoomStream: '/creator/rooms/:id/stream',
  creatorRoomMods: '/creator/rooms/:id/mods',
  creatorInsights: '/creator/insights',
  me: '/me',
  meWallet: '/me/wallet',
  meFollowing: '/me/following',
  admin: '/admin',
  legal: '/legal',
})

export const STREAMHUB_ROUTE_KEYS = Object.freeze(Object.keys(STREAMHUB_ROUTES))

/** Dev-only routes (mock self-test UI) */
export const STREAMHUB_DEV_ROUTES = Object.freeze({
  selfTest: '/dev/self-test',
})

export const STREAMHUB_DEV_ROUTE_PATHS = Object.freeze(Object.values(STREAMHUB_DEV_ROUTES))
