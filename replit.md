# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts — Registro Docente (teacher-spa)

Italian-language SPA for teachers. Glassmorphism Emerald style.

### Features
- **Auth**: SHA-256 PIN hashing, AES-256 field encryption, session PIN in memory only
- **Sections**: Home/Calendar, Lezioni, Riunioni, Udienze, Studenti, Note Rapide, Classi Condivise
- **Sidebar**: collapsible push-content (w-64 expanded / w-14 icon-only); mobile hamburger overlay
- **Framer Motion**: page transitions (fade+slide), calendar popup scale-up animation, calendar view fade
- **Calendar views**: Giorno, Settimana, Mese (default), Anno — with animated transitions
- **Event popup**: click any event pill → modal with full details + delete button
- **Classi Condivise**: create a shared class → auto-generated 6-char alphanumeric code; join by code; events: Verifiche (red), Gite (gold), Progetti (orange)
- **Firebase stub**: `src/lib/firebase.ts` ready for credentials

### Key files
- `artifacts/teacher-spa/src/App.tsx` — routing, sidebar, Framer Motion transitions
- `artifacts/teacher-spa/src/lib/auth.ts` — SHA-256 PIN auth, session management
- `artifacts/teacher-spa/src/lib/crypto.ts` — AES-256 encrypt/decrypt utilities
- `artifacts/teacher-spa/src/lib/store.ts` — encrypted personal data store
- `artifacts/teacher-spa/src/lib/sharedStore.ts` — shared class store (unencrypted, by code)
- `artifacts/teacher-spa/src/pages/Home.tsx` — 4-view calendar + stats + popup
- `artifacts/teacher-spa/src/components/EventPopup.tsx` — animated event detail popup
- `artifacts/teacher-spa/src/pages/SharedClasses.tsx` — shared class management

## Other Artifacts

### Registro Docente (`artifacts/teacher-spa`)

- **Type**: React + Vite SPA
- **Preview path**: `/`
- **Description**: Professional SPA for teachers with glassmorphism emerald design
- **Sections**: Home (calendar), Lezioni, Riunioni, Udienze, Annotazioni Studenti, Note Rapide
- **Auth**: Username + PIN (hashed, stored in localStorage)
- **Persistence**: localStorage (Firebase Firestore config stub in `src/lib/firebase.ts`)
- **Styling**: Glassmorphism extreme, emerald color palette, Tailwind CSS

### API Server (`artifacts/api-server`)

- Express 5 REST API
- Preview path: `/api`
