# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Importing runs without the Strava API

The Runs page and the existing `/api/strava` endpoint read the prepared
`src/lib/data/runs-public.json` snapshot. Strava API credentials and a
subscription are not needed. The page opens with all-time mileage and pace
charts; year controls filter both the charts and journal in Asia/Jakarta time.

### First import

1. On the Strava website, open Settings > My Account > Download your account
   and request an export. See the
   [official export guide](https://support.strava.com/en-us/articles/15401919-how-do-i-export-my-strava-data).
2. Extract the ZIP, keeping `activities.csv` beside its `activities/` folder.
   You can use the ignored `strava-export/` directory in this project.
3. Preview the import, then save it after checking the counts and distances:

   ```powershell
   node scripts/import-runs.mjs "C:\path\to\extracted-export"
   node scripts/import-runs.mjs "C:\path\to\extracted-export" --apply
   ```

4. Check `/runs` locally, then deploy the website normally to update the live page.

The import keeps running activities, merges by activity ID, and retains existing
routes when a later CSV has no route file. Repeating an import does not add the
same run twice. `--replace` replaces the whole snapshot instead of merging; use
it with a complete, reviewed export when removing old activities.

### Adding a new run

Export your activity as GPX from its Strava page, then import that file:

```powershell
node scripts/import-runs.mjs "C:\path\to\Morning_Run.gpx"
node scripts/import-runs.mjs "C:\path\to\Morning_Run.gpx" --apply
```

TCX, `.gpx.gz`, `.tcx.gz`, an `activities.csv` path, and folders of track files
are also supported. FIT files are not parsed; a bulk CSV still provides their
stats, and a separate GPX/TCX export can add a route later.

CSV detailed distances (metres) and moving times are preferred. If an older CSV
has only its rounded Distance column, it defaults to kilometres; pass
`--distance-unit mi` or `--distance-unit m` if needed. CSV timestamps without a
zone are read as UTC, matching Strava's export format. Track-only GPX imports
calculate distance/elevation from GPS and use elapsed time, including stops;
they may differ from Strava's corrected metrics. A later CSV updates those
metrics. The page labels these times as "Elapsed time".

The atlas uses Leaflet with Mapbox light/dark tiles when a public `pk.` token is
set as `PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env.local` (and Vercel). It falls back to
OpenStreetMap tiles without a valid token. Attribution remains visible. Only
visible map tiles are requested; there is no prefetching or offline tile cache.
Route geometry and the collection still work if street tiles are unavailable.

Monthly mileage bars and a moving-pace line share a timeline, inspected by hover,
touch, a month slider, or keyboard. Pace is total moving time divided by total
distance, excluding elapsed-only records. Missing months retain zero recorded
mileage and break the pace line. The latest imported month is labelled with its
data cutoff. Chart animations respect reduced motion. Journal entries open a
static route map and activity details; route playback has been removed.

Best times show the fastest continuous 1K, 5K, 10K and 15K windows found in the
original GPX/TCX samples. They use GPS distance and elapsed timestamps, including
stops, with interpolation at distance boundaries. These are GPS estimates, not
Strava's official best-effort records or projections from a full run's pace.
Missing timestamps, non-increasing clocks and track-segment gaps break efforts.
Year filters apply to records too, and each record links to its source run.
Only distance/time summaries are published, not timestamped GPS samples.
Reimport older exports once to populate these records in existing snapshots.

The original `src/lib/data/runs.json` is a Git-ignored local cache. Each normal
import also prepares the publishable `runs-public.json` with full imported route
geometry. There are no endpoint masks: recorded starts, ends, and other route
locations are public. Original distances and times remain unchanged. Do not
publish the raw cache, which is not restricted to the public field allowlist.
Redundant GPS points are simplified for display with a 0.00002-degree tolerance
(roughly two metres), retaining the recorded endpoints and continuous path.
Keep that cache or the full Strava export backed up. On a fresh checkout,
reimport the complete export before adding individual runs.

Names, dates, metrics and full imported routes are public after deployment, including
private activities in the export. Remove runs you do not want to publish before
importing. Descriptions, private notes, heart rate and other sensor/account data
are not copied. For GPS tracks with gaps, distance excludes the gaps and import keeps
the longest continuous segment. Standalone files without an explicit sport type
are treated as runs.

Run importer checks with `npm run runs:test`.

## Automatic listens sync

The `/listens` page reads its latest prepared snapshot from
`public.listens_snapshots` in Supabase. If that request fails, it falls back to
`src/lib/data/spotifyAlbums.json`, so a Supabase outage does not break the page.

The `sync-listens` Edge Function refreshes the snapshot from Last.fm. A
Postgres Cron job invokes it at minute 17 every six hours. The function reuses
the existing album catalogue for Spotify artwork and links, and uses Last.fm
artwork for newly seen albums.

### One-time activation

1. Authenticate and link the local Supabase CLI:

   ```powershell
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

2. Apply the snapshot table and six-hour Cron schedule:

   ```powershell
   npx supabase db push
   ```

3. Add the Edge Function secrets. Use the existing values from `.env`:

   ```powershell
   npx supabase secrets set LASTFM_API_KEY=YOUR_VALUE LASTFM_USERNAME=YOUR_VALUE LASTFM_SYNC_MAX_PAGES=100 LISTENS_SYNC_MINUTES=30
   ```

4. Deploy the function:

   ```powershell
   npx supabase functions deploy sync-listens
   ```

5. In the Supabase SQL Editor, run
   `supabase/setup-listens-vault.sql.example` after replacing its two
   placeholders. These encrypted Vault values authorize Cron to call the
   protected function.

6. Seed the database once with the existing snapshot:

   ```powershell
   npm run listens:seed
   ```

After the normal website deployment containing this code, listening updates no
longer require a new website build or deployment. Supabase refreshes the data,
and the page checks for a newer snapshot on each request with a five-minute CDN
cache.

### Previous years

The listens year selector loads one prepared yearly summary at a time. Archives
for 2016–2025 come from the Spotify audio export, count entries with at least
80 seconds played, and group estimated start times in Asia/Jakarta. This is an
approximation, not Last.fm's duration-based scrobble rule. Only aggregate counts,
top album/track names, artwork and links are published; raw export records are
not included. Current-year data continues to use the live Supabase snapshot.

Regenerate archives with `node scripts/build-listens-archive.mjs "PATH_TO_EXPORT"`.
The generator excludes the current year and includes the top 60 albums per year.

### Importing a history gap

Spotify's Extended Streaming History export can be imported into the private
`public.listens_backfill_events` table. The importer ignores IP, device,
location, and account fields; it uploads only sanitized track metadata and
timestamps. Imported events are merged with Last.fm whenever `sync-listens`
builds a snapshot.

Run a dry run first, then apply the reviewed result:

```powershell
npm run listens:backfill -- "C:\path\to\Spotify Extended Streaming History"
node scripts/import-spotify-backfill.mjs "C:\path\to\Spotify Extended Streaming History" --apply
```
