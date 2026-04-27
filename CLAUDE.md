# RunwayBriefing - FIDS (Flight Information Display System)

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- Zustand 5 for state management
- Tailwind CSS 4

## Code Style
- ES modules (import/export), never CommonJS (require)
- Path aliases: import from '@/types', '@/store', '@/lib', '@/components'
- Prefer const over let, never use var
- Destructure imports: import { Flight } from '@/types'

## Project Structure
- app/ - Next.js App Router pages and API routes
- app/api/flights/route.ts - REST API (GET, POST, PATCH, DELETE)
- components/fids/ - flight board UI components
- components/admin/ - admin panel components
- store/flightsStore.ts - Zustand store with filters and selectors
- types/index.ts - Flight, FlightStatus, Airline, Terminal types
- lib/flights.ts - server-side read/write to data/flights.json
- data/flights.json - mutable flight data
- data/flights.seed.json - seed data for reset

## Workflow
- Dev server: npm run dev
- Typecheck: npm run typecheck
- Lint: npm run lint

## Constraints
- Never modify data/flights.seed.json (seed data for reset)
- Do not install new dependencies without asking first
- API routes return NextResponse.json(), not raw Response
- All flight data mutations go through lib/flights.ts (readFlights/writeFlights)

## Architecture
- API routes in app/api/ handle HTTP (thin controllers)
- Business logic lives in lib/ (server-side only, uses fs)
- Client state in store/flightsStore.ts - single Zustand store
- Components are client ('use client') or server (default) - don't mix