# Homeys World

A free, open-source, multi-city housing board for finding roommates, subleases, and apartments. Think Craigslist housing meets a modern, warm, handcrafted design.

**Live at [homeys.world](https://gev6unri.insforge.site)**

## Features

- **Multi-city**: Browse listings in 13+ cities (SF, NYC, LA, Chicago, Austin, Seattle, Boston, DC, Miami, Denver, Portland, Philadelphia, London)
- **Post listings**: Free, takes under 60 seconds. Room available, whole place, looking for room, or looking for a roommate
- **Roommate profiles**: Create a profile with your bio, budget, lifestyle tags, and move-in date. Browse and connect with potential roommates
- **Crash pads (couchsurfing)**: Locals can offer their couch or spare room to travelers. Per-city crash pad boards
- **Smart filters**: Type, price range, neighborhood, bedrooms, amenities. URL-synced so links are shareable
- **Photo uploads**: Drag-and-drop, auto-compressed, up to 6 per listing
- **Auth**: Google OAuth, GitHub OAuth, or email/password with verification
- **Anti-spam**: Honeypot fields, rate limiting (3 listings/day), auto-expiry (60 days), report system
- **Admin panel**: Add/manage cities from the browser at `/admin/cities`
- **Open source**: MIT license, designed so adding a new city is a single database insert

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS 3.4
- **Backend**: [InsForge](https://insforge.com) (PostgreSQL, Auth, Storage)
- **Fonts**: Fraunces (headings), Nunito (body)
- **Icons**: Lucide React

## Self-Host in 5 Minutes

1. **Clone the repo**
   ```bash
   git clone https://github.com/FluentFlier/homeys-world.git
   cd homeys-world
   ```

2. **Create an InsForge project** at [insforge.com](https://insforge.com)

3. **Set up the database** — run the SQL from `supabase/migrations/001_schema.sql` in your InsForge SQL editor

4. **Configure environment**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your InsForge URL and anon key
   ```

5. **Install and run**
   ```bash
   npm install
   npm run dev
   ```

## Adding a New City

It's one database insert:

```sql
INSERT INTO cities (slug, name, country, neighborhoods, currency) VALUES
  ('berlin', 'Berlin', 'Germany', ARRAY['Kreuzberg','Neukolln','Mitte','Prenzlauer Berg','Friedrichshain'], 'EUR');
```

Or use the admin panel at `/admin/cities` if your email is in `NEXT_PUBLIC_ADMIN_EMAILS`.

## Project Structure

```
src/
  app/
    page.tsx              # Landing page, city picker
    sign-in/              # Auth (OAuth + email/password)
    about/                # About page
    me/                   # My listings
    profiles/             # Browse roommate profiles (auth-gated)
    profiles/[id]/        # Individual profile detail
    profiles/edit/        # Create or edit your profile
    admin/cities/         # Admin city management
    [city]/               # City landing
    [city]/listings/      # Browse listings with filters
    [city]/listings/[id]/ # Listing detail
    [city]/post/          # Post a listing
    [city]/couches/       # Browse crash pads (couchsurfing)
    [city]/couches/post/  # Offer your couch
  components/             # Shared components (nav, footer, cards, blob)
  lib/
    insforge.ts           # InsForge SDK client
    types.ts              # TypeScript types and utilities
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

Good first issues:
- Add a map view for listings
- Add saved searches / email alerts
- Add more cities with neighborhoods
- Improve mobile filter UX
- Add internationalization support

## License

MIT -- see [LICENSE](LICENSE).

Built by [Anirudh](https://tryada.app).
