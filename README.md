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

### Repairing a Last.fm history gap

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
