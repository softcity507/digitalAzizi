# DigitalAzizi — Application Structure

DigitalAzizi is a Next.js App Router application using React, TypeScript, Tailwind CSS, Supabase, Zustand, and `next-intl`. Application code is organized into `src/`, with reusable UI in the root `components/` folder and Zustand state in `store/`.

## Repository layout

```text
digitalAzizi/
├── DB/                                  # Supabase schema/setup SQL
│   ├── businesses.sql
│   ├── cashbook.sql
│   ├── customers.sql
│   ├── customer_ledger_transactions.sql
│   ├── user.sql
│   └── user_credentials.sql
├── components/                          # Reusable React UI
│   ├── max/                              # Page-level containers and landing page
│   ├── max_second/                       # Secondary page containers and shared app UI
│   ├── mini/                             # Cash book, customer, exchange and navigation UI
│   ├── mini_second/                      # Settings, legal, customer and account UI
│   └── shared/                           # Shared utilities such as PDF export
├── messages/                            # next-intl translation dictionaries
│   ├── ar.json
│   ├── bn.json
│   ├── en.json
│   ├── fa.json
│   ├── fr.json
│   ├── hi.json
│   ├── ps.json
│   ├── tr.json
│   └── ur.json
├── public/                              # Static assets and verification files
├── src/
│   ├── app/                             # Next.js App Router routes and handlers
│   │   ├── [locale]/                    # Localized application routes
│   │   │   ├── about/page.tsx
│   │   │   ├── cash-book/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── details/page.tsx
│   │   │   ├── exchange/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── settings/biometrics/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── about/page.tsx               # Non-localized route variants
│   │   ├── cash-book/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── details/page.tsx
│   │   ├── exchange/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── settings/biometrics/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx                   # Root document layout
│   │   └── page.tsx                     # Root landing page
│   ├── callapi/                         # Shared API caller modules
│   │   ├── auth.ts
│   │   ├── authz.ts
│   │   ├── security.ts
│   │   └── index.ts
│   ├── data/                            # Static application data
│   │   └── navigation.ts
│   ├── i18n/                            # Internationalization setup
│   │   ├── languages.ts
│   │   └── request.ts
│   ├── lib/                             # Browser Supabase client and domain helpers
│   │   ├── supabaseClient.ts
│   │   ├── subscription.ts
│   │   ├── planLimits.ts
│   │   └── calendarDate.ts
│   ├── types/                           # Shared TypeScript domain types
│   │   ├── auth.ts
│   │   ├── cashbook.ts
│   │   ├── customer.ts
│   │   ├── exchange.ts
│   │   └── settings.ts
├── supabase/                            # Supabase project config and hosted backend
│   ├── functions/authz-api/index.ts     # Auth/session, PIN and passkey API
│   ├── migrations/                      # Backend schema changes
│   └── config.toml
├── store/                               # Zustand stores and shared state
│   ├── useCashBookStore.ts              # Cash book data and actions
│   ├── useCustomerDetailsStore.ts       # Customer ledger/details state
│   ├── useExchangeDeskStore.ts          # Exchange desk and rates state
│   ├── useSettingsStore.ts              # Settings and account state
│   ├── useCreateBussines.ts             # Business creation state/actions
│   ├── SinglePageState.tsx              # Shared page state provider/state
│   └── AllJs.json                       # Store-related data/configuration
├── .gitignore
├── AGENTS.md                            # Repository-specific agent instructions
├── CNAME.md                             # This architecture guide
├── Dockerfile
├── docker-compose.yml
├── eslint.config.mjs
├── gemini-code.md
├── next.config.ts                       # Static Next.js export configuration
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Application boundaries

- **Routes and rendering:** `src/app/` contains localized and non-localized pages. `next.config.ts` builds static output; Next.js API routes, Proxy, and Server Actions are not used.
- **UI:** `components/` holds reusable page containers and smaller feature components. Route files compose these components.
- **State and data operations:** `store/` contains the Zustand stores used by the application. Stores coordinate feature state and data actions for cash book, customer ledger, exchange, settings, and business creation.
- **Supabase:** `src/lib/supabaseClient.ts` provides the browser client for feature stores. Auth and authorization endpoints are grouped in the Supabase Edge Function `supabase/functions/authz-api/`. Database setup SQL is kept in `DB/`, and Supabase migrations are in `supabase/migrations/`.
- **Shared contracts:** `src/types/` defines the TypeScript types used across route, store, and UI layers.
- **Localization:** `src/i18n/` configures `next-intl`; translated message catalogs live in `messages/`.
- **Static assets:** `public/` contains files served directly by Next.js.

## Main feature routes

| Feature | Localized route | Page container / feature UI |
| --- | --- | --- |
| Landing and authentication | `/{locale}` | `LandingContainer`, `AuthCard` |
| Cash book | `/{locale}/cash-book` | `CashBookContainer`, `useCashBookStore` |
| Customer accounts | `/{locale}/customers` | `CustomerLedgerContainer`, `useCustomerDetailsStore` |
| Customer statement | `/{locale}/details` | `CustomerDetailsContainer`, `useCustomerDetailsStore` |
| Currency exchange | `/{locale}/exchange` | `ExchangeDeskContainer`, `useExchangeDeskStore` |
| Settings | `/{locale}/settings` | `SettingsHubContainer`, `useSettingsStore` |
| Biometrics | `/{locale}/settings/biometrics` | Biometrics settings page and auth handlers |
| About | `/{locale}/about` | `AboutContainer` |

The matching non-localized route files are also present under `src/app/` for the feature routes listed above.

## Data flow overview

```text
App Router pages
      ↓
Feature containers and components
      ↓
Zustand stores in store/
      ↓
Supabase clients and shared helpers in src/lib/
      ↓
Supabase database (schema scripts in DB/)
```

Google sign-in is handled by Supabase Auth from the client. Session provisioning, subscription checks, PIN operations, and passkey verification call the `authz-api` Edge Function. Feature stores query Supabase directly and rely on database Row Level Security for data authorization.
