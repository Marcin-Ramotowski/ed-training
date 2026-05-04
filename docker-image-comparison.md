# Porównanie rozmiarów obrazów Docker dla RunwayBriefing (FIDS)

Data analizy: 2026-05-04
Projekt: Next.js 16 z `output: 'standalone'`

## Warianty Dockerfile

| Plik | Opis |
|---|---|
| `Dockerfile.naive` | Pojedynczy etap, `node:22` (Debian), `npm install`, `npm start`, root, brak `.dockerignore` |
| `Dockerfile` | 2-stage, `node:22-alpine`, `npm ci` z cache mount, standalone output, non-root `nextjs:1001` |
| `Dockerfile.dhi.naive` | Pojedynczy etap, `dhi.io/node:24-alpine3.23-dev`, `npm install`, `npm start` |
| `Dockerfile.dhi` | 2-stage, builder `dhi.io/node:24-alpine3.23-dev` + runner `dhi.io/node:24-alpine3.23` (bez shella, non-root domyślnie) |

## Wyniki

| Obraz | Bazowy | Rozmiar | vs największy |
|---|---|---:|---:|
| `fids:naive` | `node:22` (Debian) | **2.94 GB** | 1.00× |
| `fids:dhi-naive` | `dhi.io/node:24-alpine3.23-dev` | **1.50 GB** | 0.51× |
| `fids:optimized` | `node:22-alpine` (multi-stage) | **303 MB** | 0.10× |
| `fids:dhi-optimized` | `dhi.io/node:24-alpine3.23` runtime (multi-stage) | **229 MB** | 0.078× |

Smoke test `fids:dhi-optimized`: aplikacja startuje poprawnie, `GET /` zwraca HTTP 200.

## Wnioski

### Multi-stage robi większą różnicę niż wybór obrazu bazowego
- Naive Debian → naive DHI: 2.94 GB → 1.50 GB (zysk 49%)
- Naive DHI → optimized DHI: 1.50 GB → 229 MB (zysk 85%)
- Sama wymiana obrazu bazowego daje 2×, multi-stage z standalone output daje ~6.5× — to one robi główną robotę.

### Skąd zysk w naive vs optimized (ten sam Node base)
- Naive zawiera całe `node_modules` z devDependencies (TypeScript, ESLint, Tailwind, @types/*) + cache npm.
- Optimized kopiuje tylko `.next/standalone`, gdzie Next.js robi tree-shaking i pakuje wyłącznie runtime potrzebny do `server.js`.
- Naive trzyma cały kod źródłowy (`app/`, `components/`, `lib/`, `tsconfig.tsbuildinfo`); optimized — tylko zbudowany output.
- Brak `.dockerignore` w naiwnej dokleja `.git`, lokalne `node_modules`, `.next`, itd.

### DHI optimized vs zwykły Alpine optimized (229 MB vs 303 MB, ~24% mniej)
- Runtime `dhi.io/node:24-alpine3.23` nie zawiera `npm`, `npx`, `sh` — tylko binarki Node.js i minimalne libs.
- DHI ma stripped/hardened layout: brak package managera, brak shella w runtime.
- User `node` jest domyślny — nie trzeba ręcznie tworzyć `nextjs:1001`.

### Bonus bezpieczeństwa DHI runtime
- **Brak shella** (`sh: not found`) — atakujący po RCE nie ma `/bin/sh` do pivotowania, brak narzędzi do reconu.
- **Brak npm/npx** — nie da się doinstalować pakietów w runtime.
- DHI dostarcza SBOM i podpisane attestations (provenance, vulnerability scans).
- Domyślny non-root user (`node`).

### Inne różnice operacyjne (poza rozmiarem)
- Naive używa `npm install` (niedeterministyczne, może zaktualizować lockfile) zamiast `npm ci`.
- Naive uruchamia `npm start` → odpala `next start` z pełnym Next.js w `node_modules`. Optimized uruchamia `node server.js` (lekki entrypoint z standalone output).
- Naive działa jako root; optimized — non-root.
- Naive nie ma BuildKit cache mount → kolejne buildy są wolniejsze.

## Rekomendacja

Dla produkcji: **`Dockerfile.dhi`** (229 MB) — najmniejszy obraz, najsilniejsze defaulty bezpieczeństwa, brak shella i package managera w runtime.

Dla środowisk bez dostępu do DHI (np. development, OSS bez subskrypcji): **`Dockerfile`** (303 MB) — porównywalny rozmiar, jawny non-root user, standardowy ekosystem.
