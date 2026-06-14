# F1 Wiki

Personal Formula 1 reference app. Browse seasons, race results, driver stats, and championship standings from 1950 to present.

The **Race Weekend** view (`/race`) resolves the current or next Grand Prix, shows the full session schedule (practice, sprint, qualifying, race) with live status and countdowns in your local timezone, and surfaces race / qualifying / sprint / pit-stop data as the API publishes them — auto-refreshing while a session is in progress.

> Note: the Jolpica (Ergast) API publishes results after each session completes; it does not provide lap-by-lap live timing. The "live" indicators are derived from the official session schedule.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Test

```bash
npm test         # run once (Vitest)
npm run test:watch
```

## Deploy

Connected to Vercel for auto-deploy from `main`.
