# Contributing to Homeys World

Thanks for wanting to contribute! Here's how to get started.

## Local Setup

1. Fork and clone the repo
2. Create an InsForge project at [insforge.com](https://insforge.com) (free tier works)
3. Run the schema SQL in your InsForge SQL editor (see `supabase/migrations/001_schema.sql`)
4. Copy `env.example` to `.env.local` and fill in your InsForge credentials
5. Install dependencies: `npm install`
6. Start the dev server: `npm run dev`

## Development

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript type checking
```

## Code Style

- TypeScript strict mode
- Tailwind CSS for styling (no CSS modules)
- Fraunces for headings (`font-heading`), Nunito for body (`font-body`)
- Design tokens in `tailwind.config.js` -- use semantic colors (primary, secondary, accent, muted)
- Components go in `src/components/`, pages in `src/app/`
- Client components marked with `'use client'`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run build` to verify everything compiles
4. Open a PR with a clear description of what changed and why
5. Keep PRs focused -- one feature or fix per PR

## Adding a City

If you want to add a city, open an issue with:
- City name and country
- List of 8-12 common neighborhoods
- Currency code (USD, GBP, EUR, etc.)

We'll add it to the database -- no code change needed.

## Architecture Decisions

- **Single database, multi-city**: Cities are rows in a `cities` table, not separate deployments
- **Client components**: Most pages are client components using the InsForge SDK directly
- **No SSR auth**: Auth state is checked client-side with `insforge.auth.getCurrentUser()`
- **URL-synced filters**: Browse page filters are reflected in query params for shareable links
- **60-day auto-expiry**: Listings expire automatically, users can extend

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
