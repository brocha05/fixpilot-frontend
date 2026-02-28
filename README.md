# SaaS Frontend Boilerplate

A professional, production-ready Next.js frontend boilerplate designed for multi-tenant B2B SaaS products. Built to integrate seamlessly with a **NestJS backend** using JWT authentication and Stripe billing.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS v4 + shadcn/ui |
| Data fetching | TanStack React Query v5 |
| HTTP client | Axios (centralized, with interceptors) |
| Validation | Zod + React Hook Form |
| Global state | Zustand |
| Auth | JWT + refresh token rotation |
| Billing | Stripe Checkout / Portal |
| Toasts | Sonner |
| Dark mode | next-themes |
| Containerization | Docker (multi-stage) |

---

## Project structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Unauthenticated routes
│   │   ├── login/
│   │   ├── register/
│   │   └── pricing/
│   ├── (dashboard)/            # Authenticated routes (sidebar + topbar layout)
│   │   └── dashboard/
│   │       ├── page.tsx        # Home / overview
│   │       ├── users/
│   │       ├── organization/
│   │       ├── billing/
│   │       ├── profile/
│   │       └── upgrade/
│   ├── layout.tsx              # Root layout (ThemeProvider, QueryClient, Toaster)
│   ├── providers.tsx           # React Query provider
│   └── globals.css             # CSS variables + Tailwind @theme
│
├── modules/                    # Feature modules (business logic)
│   ├── auth/
│   │   ├── api/authApi.ts
│   │   ├── components/         # LoginForm, RegisterForm
│   │   ├── hooks/              # useAuth, useLogin, useRegister
│   │   ├── schemas/            # Zod schemas
│   │   └── types/
│   ├── users/
│   ├── organization/
│   └── billing/
│
├── components/
│   ├── ui/                     # shadcn/ui primitives (Button, Input, Card…)
│   ├── layout/                 # Sidebar, Topbar, UserDropdown, OrgSelector
│   └── shared/                 # DataTable, Modal, ConfirmDialog, FeatureGate…
│
├── lib/
│   ├── api/client.ts           # Axios instance + JWT interceptors + token refresh
│   ├── config/                 # env.ts, queryClient.ts
│   ├── hooks/                  # useDebounce, usePagination
│   └── utils/                  # cn, formatters
│
├── store/
│   ├── authStore.ts            # Zustand: user, tokens, login/logout
│   └── orgStore.ts             # Zustand: current org, org list, switcher
│
├── types/
│   └── index.ts                # Shared types + PLAN_FEATURES map
│
└── middleware.ts               # Route protection
```

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_APP_NAME="My SaaS"
NEXT_PUBLIC_API_URL="http://localhost:3000"   # Your NestJS backend URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Add extra shadcn/ui components as needed

```bash
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add accordion
```

### 4. Run in development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

---

## Docker

### Development with Docker Compose

```bash
docker compose up
```

### Production build

```bash
DOCKER_BUILD=1 docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_APP_NAME="My SaaS" \
  --build-arg NEXT_PUBLIC_APP_URL=https://app.yourdomain.com \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... \
  -t saas-frontend .

docker run -p 3001:3001 saas-frontend
```

---

## Key architectural decisions

### Axios client with automatic token refresh (`src/lib/api/client.ts`)

- Injects `Authorization: Bearer <token>` on every request.
- Injects `X-Organization-Id` for multi-tenant routing.
- On `401`, silently calls `POST /auth/refresh`.
- Queues all concurrent requests while refreshing — replays them after success.
- On refresh failure → `logout()` → redirect to `/login`.

### Multi-tenancy

`orgStore` persists `currentOrgId` and the full `organizations[]` array. Every API call receives `X-Organization-Id` automatically. The `OrgSelector` component lets users switch organizations in the Topbar.

### Feature gating

```tsx
// Render only when plan allows
<FeatureGate feature="analytics">
  <AnalyticsPanel />
</FeatureGate>

// With blurred overlay + upgrade CTA (default)
<FeatureGate feature="sso" overlay>
  <SsoSettings />
</FeatureGate>

// Programmatic
const { hasFeature, canUse } = useSubscription();
if (!hasFeature('auditLogs')) return <UpgradePrompt />;
```

Plan features are centralized in `src/types/index.ts → PLAN_FEATURES`.

### React Query conventions

```ts
// Query key factory pattern (per module)
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params) => [...userKeys.lists(), params] as const,
  detail: (id) => [...userKeys.all, 'detail', id] as const,
};

// Instant pagination (no loading flash between pages)
useQuery({ placeholderData: (prev) => prev })

// Mutations auto-invalidate + show toasts
useMutation({ onSuccess: () => queryClient.invalidateQueries(...) })
```

### Protected routes (`src/middleware.ts`)

Reads the `access-token` cookie. Unauthenticated requests to `/dashboard/*` are redirected to `/login?callbackUrl=<original>`. Authenticated users are redirected away from `/login` and `/register`.

> **Cookie strategy:** After login, write the token to a cookie so the middleware can read it server-side. Example in `useLogin`:
>
> ```ts
> document.cookie = `access-token=${data.accessToken}; path=/; SameSite=Lax`;
> ```

---

## Customization guide

### Adding a new feature module

```
src/modules/yourFeature/
  api/yourFeatureApi.ts
  hooks/useYourFeature.ts
  types/yourFeature.types.ts
  schemas/yourFeature.schemas.ts
  components/
```

### Adding a new dashboard page

1. Create `src/app/(dashboard)/dashboard/your-page/page.tsx`
2. Add nav item in `src/components/layout/Sidebar.tsx`
3. Export `metadata` from the page file

### Extending the plan system

```ts
// src/types/index.ts
export interface PlanFeatures {
  // add new feature flag
  yourNewFeature: boolean;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free:       { ..., yourNewFeature: false },
  starter:    { ..., yourNewFeature: false },
  pro:        { ..., yourNewFeature: true  },
  enterprise: { ..., yourNewFeature: true  },
};
```

Then gate it anywhere: `<FeatureGate feature="yourNewFeature">`.

---

## Available scripts

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier
npm run typecheck    # TypeScript (no emit)
```

---

## Recommended next steps

1. **Cookie sync on login** — write the JWT to a cookie in `useLogin` so `middleware.ts` can verify it server-side.
2. **Error boundary** — wrap each page in a React error boundary for graceful fallbacks.
3. **i18n** — add `next-intl` for multi-language support.
4. **Testing** — add `vitest` + `@testing-library/react`.
5. **CI/CD** — GitHub Actions: `typecheck` → `lint` → `build` on every PR.
6. **Analytics** — integrate PostHog or Plausible behind `<FeatureGate feature="analytics">`.
