# Parkline — Mobile

Premium React Native app for **Parkline**, a vehicle parking management platform for Indian parking vendors. Expo · TypeScript · Expo Router · Zustand · TanStack Query · Reanimated.

The API lives in a separate repository: `parking-management-backend`.

## Getting started

```bash
npm install
cp .env.example .env    # set EXPO_PUBLIC_API_URL to your backend
npx expo start
```

- On a physical device, `EXPO_PUBLIC_API_URL` must be your machine's LAN IP (e.g. `http://192.168.1.10:4000`), not `localhost`.
- If your installed Expo SDK differs, run `npx expo install --fix` once to align native package versions.

### Google Sign-In

Google auth uses `@react-native-google-signin/google-signin`, which needs a **development build** (it is not available in Expo Go — the button explains this if tapped there).

1. In Google Cloud Console create OAuth client IDs: **Web** (used by app *and* verified by the backend), **Android** (package `com.parkline.app` + your SHA-1), **iOS** (bundle `com.parkline.app`).
2. Fill `.env`:
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — the Web client ID
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — iOS client ID (iOS only)
   - `GOOGLE_IOS_URL_SCHEME` — reversed iOS client ID; setting it activates the native config plugin (see `app.config.ts`)
3. Build a dev client: `npx expo run:android` (or `run:ios`), then start normally.

The app sends the Google ID token to `POST /api/v1/auth/google`; the backend verifies it and signs in or auto-creates the account — one flow for both login and signup.

### Gilroy typography

Gilroy is commercial and not bundled; the app falls back to system fonts with matching weights. See [assets/fonts/README.md](assets/fonts/README.md) for the two-step enablement.

## Architecture

```
src/
├── app/            Expo Router routes
│   ├── (auth)/     login, register
│   └── (app)/      authenticated shell
│       ├── (tabs)/ Home · Parking · Activity · More (+ center entry action)
│       ├── entry   vehicle entry (modal)
│       ├── exit    lookup → amount reveal → payment → receipt (modal)
│       └── lots/ passes/ staff/ shift reports alerts profile
├── components/     ui/ (design system) · parking/ · analytics/ · shared/
├── features/       per-feature TanStack Query hooks
├── services/       axios client (auth refresh single-flight), domain services,
│                   socket.io client, Google Sign-In wrapper, secure storage
├── store/          zustand: auth session, active lot
├── hooks/          realtime invalidation, network status, haptics
├── theme/          palette (dark-first), Gilroy typography tokens, spacing
├── utils/          Indian plate formatter, ₹ grouping (worklet), durations
└── types/          API + domain models
```

### Design decisions

- **Typography over cards** — screens are built from type hierarchy, hairline dividers and whitespace; surfaces appear only in sheets, inputs and the tab bar.
- **Dark-first palette** — near-black charcoal, warm white text, a single volt accent; light mode mirrors it.
- **Motion where it earns its place** — occupancy ring fill, animated rupee counters (UI-thread via Reanimated), entry/exit success moments, gesture-driven bottom sheets, skeleton loading. Nothing else animates.
- **Server-computed money** — the app never calculates a charge; it renders `estimatedAmount`/`currentAmount` from the API and the exit endpoint recomputes the final figure.
- **Realtime** — an authenticated Socket.IO connection invalidates the relevant queries on `vehicle:entered/exited`, `occupancy:updated`, `payment:received`, so every open device stays live.
- **Tokens in SecureStore** — access + refresh tokens live in the device keychain; AsyncStorage holds only the selected lot preference. Refresh is single-flight with rotation.

### Offline behavior

Implemented today: NetInfo is bridged into TanStack Query's `onlineManager`, so queries pause offline and refetch on reconnect; cached data (1h gc) keeps screens usable; a quiet banner signals the state; mutations fail with readable messages and can be retried by the operator.

Future-ready (deliberately **not** implemented, to avoid pretending): a durable queue for offline entries/exits with server-side reconciliation. The mutation layer is centralized in `features/*/hooks.ts`, which is where such a queue would slot in.
