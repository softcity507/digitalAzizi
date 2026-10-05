# DigitalAzizi - Architecture & Application Structure

```text
digitalazizi/
│
├── .next/                                  # Next.js build cache & output
│
├── components/                             # UI Component Hierarchy
│   ├── max/                                # Primary page container & layout organisms
│   │   ├── AuthCard.tsx                    # Landing auth & authentication UI
│   │   ├── CashBookContainer.tsx           # Cash Book page container
│   │   ├── CurrencySummaryGrid.tsx         # Multi-currency summary grid
│   │   ├── CustomerLedgerContainer.tsx     # Customers main ledger container
│   │   ├── CustomerList.tsx                # Customer accounts list
│   │   ├── DeskMirrorSection.tsx           # Desk mirror position calculation view
│   │   ├── ExchangeDeskContainer.tsx       # Currency exchange desk container
│   │   ├── FeatureHighlights.tsx           # Landing feature highlights
│   │   ├── Header.tsx                      # Main application top navigation header
│   │   ├── HeroSection.tsx                 # Landing hero section
│   │   ├── LandingContainer.tsx            # Public landing view container
│   │   ├── LandingFooter.tsx               # Public landing footer
│   │   ├── LandingHeader.tsx               # Public landing header
│   │   └── LanguageSection.tsx             # Landing language selection grid
│   │
│   ├── max_second/                         # Secondary page containers & utilities
│   │   ├── CustomerDetailsContainer.tsx    # Customer details & statement container
│   │   ├── CustomerPdfExport.tsx           # Customer ledger PDF generator & exporter
│   │   ├── Footer.tsx                      # Application-wide footer with links & dynamic date
│   │   ├── MaxLoader.tsx                   # Full page / global store loading overlay
│   │   └── SettingsHubContainer.tsx        # System settings & configuration container
│   │
│   ├── mini/                               # Primary UI atoms, modals & widgets
│   │   ├── AccountFilterTabs.tsx           # Customer receivable/payable filter tabs
│   │   ├── AddCustomerButton.tsx           # Quick action button to add customer
│   │   ├── CashBookCurrencyFilter.tsx      # Cash Book currency selector filter
│   │   ├── CashBookDateBar.tsx             # Date navigation bar with picker
│   │   ├── CashBookHeader.tsx              # Cash Book statistics header
│   │   ├── CashBookOperations.tsx          # Cash in / Cash out action buttons
│   │   ├── CashBookSearch.tsx              # Search bar for cash book entries
│   │   ├── CashBookTransactionItem.tsx     # Single cash book entry row
│   │   ├── CashBookTransactionList.tsx     # List wrapper for cash transactions
│   │   ├── CashInModal.tsx                 # Modal to record cash in / deposit
│   │   ├── CashOutModal.tsx                # Modal to record cash out / payment
│   │   ├── CashSummaryCard.tsx             # Currency balance summary card
│   │   ├── CurrencySummaryCard.tsx         # Multi-currency mini card
│   │   ├── CustomerCard.tsx                # Customer account card with balances
│   │   ├── CustomerSearch.tsx              # Search input for customer ledger
│   │   ├── DeleteConfirmModal.tsx          # Delete confirmation modal
│   │   ├── DoubleEntryBookCard.tsx         # Double entry balance tracker
│   │   ├── EditTransactionModal.tsx        # Modal to edit cash book transaction
│   │   ├── ExchangeAmountInput.tsx         # Give/Get currency amount input
│   │   ├── ExchangeCommitButton.tsx        # Exchange transaction submission button
│   │   ├── ExchangeCustomerSelect.tsx      # Customer selector dropdown for exchange
│   │   ├── ExchangeDeleteModal.tsx         # Exchange transaction deletion modal
│   │   ├── ExchangeEditModal.tsx           # Exchange transaction edit modal
│   │   ├── ExchangeLiveComputed.tsx        # Live conversion calculation widget
│   │   ├── ExchangeModal.tsx               # Currency exchange dialog
│   │   ├── ExchangeRateInput.tsx           # Exchange rate entry & market rate toggle
│   │   ├── ExchangeRecentItem.tsx          # Exchange history row item
│   │   ├── ExchangeRecentList.tsx          # Recent currency conversions list
│   │   ├── ExchangeTypeToggle.tsx          # Buy / Sell conversion mode toggle
│   │   ├── FeatureCard.tsx                 # Landing page feature card
│   │   ├── GoogleLogin.tsx                 # Google OAuth login button
│   │   ├── LanguageSelector.tsx            # Full language switcher dropdown
│   │   ├── Links.tsx                       # Navigation link items & mobile bar
│   │   ├── Logo.tsx                        # DigitalAzizi brand text logo
│   │   ├── NoticeCard.tsx                  # System notification card
│   │   ├── Notification.tsx                # Topbar notification drawer & badge
│   │   ├── QuickLanguageSelector.tsx       # Compact language selector
│   │   ├── SecurityPill.tsx                # Security indicator badge
│   │   ├── StatusBadge.tsx                 # Cloud sync status indicator
│   │   ├── ThemeToggle.tsx                 # Dark / Light mode toggle switch
│   │   ├── TodayCashInOutSummary.tsx       # Daily cash flow summary widget
│   │   └── TransactionCounterBadge.tsx     # Transaction count badge
│   │
│   └── mini_second/                        # Secondary UI atoms & settings widgets
│       ├── AddCustomerModal.tsx            # Modal to create new customer account
│       ├── AdminProfileCard.tsx            # User/Admin profile overview card
│       ├── AuditLogModal.tsx               # Security audit log history modal
│       ├── BusinessProfilesSection.tsx     # Company & shop configuration section
│       ├── ClientNameCard.tsx              # Customer header & contact banner
│       ├── CloudBackupSection.tsx          # Cloud database backup & restore tools
│       ├── CustomerBalanceCard.tsx         # Detailed currency balances with totals
│       ├── CustomerCurrencyTabs.tsx        # AFN / USD / PKR currency tabs
│       ├── CustomerTransactionFilterBar.tsx # Filter bar by type, currency & date
│       ├── CustomerTransactionItemCard.tsx # Customer transaction item row
│       ├── CustomerTransactionsFeed.tsx    # Customer statement transactions feed
│       ├── DeleteCustomerTxModal.tsx       # Delete customer transaction dialog
│       ├── EditCustomerTxModal.tsx         # Edit customer transaction dialog
│       ├── MiniLoader.tsx                  # Button, inline & small widget loader
│       ├── PreferencesSection.tsx          # System preferences (Theme, Sound, Lang)
│       ├── RegisteredUsersSection.tsx      # Authorized users & permission management
│       ├── SettingsHeader.tsx              # Settings subpage title header
│       └── SignOutSection.tsx              # Secure session sign-out action
│
├── design/                                 # UI/UX Mockups & Wireframes (.png)
│
├── messages/                               # i18n Translation Dictionaries (JSON)
│   ├── ar.json                             # Arabic
│   ├── bal.json                            # Balochi
│   ├── bn.json                             # Bengali
│   ├── en.json                             # English (Default)
│   ├── fa.json                             # Persian / Farsi
│   ├── fr.json                             # French
│   ├── hi.json                             # Hindi
│   ├── pa.json                             # Punjabi
│   ├── ps.json                             # Pashto
│   ├── sd.json                             # Sindhi
│   ├── tr.json                             # Turkish
│   └── ur.json                             # Urdu
│
├── public/                                 # Static public assets & icons
│
├── src/
│   ├── app/                                # Next.js App Router
│   │   ├── [locale]/                       # Internationalized Route Group
│   │   │   ├── cash-book/page.tsx          # Cash Book Daily Ledger (/cash-book)
│   │   │   ├── customers/page.tsx          # Customers Account Book (/customers)
│   │   │   ├── details/page.tsx            # Customer Account Statement (/details)
│   │   │   ├── exchange/page.tsx           # Currency Exchange Desk (/exchange)
│   │   │   ├── settings/page.tsx           # System & Business Settings (/settings)
│   │   │   ├── layout.tsx                  # Localized layout (NextIntl, Header, Footer)
│   │   │   └── page.tsx                    # Landing / Auth entrance page
│   │   ├── api/                            # API endpoints & route handlers
│   │   ├── favicon.ico                     # App favicon
│   │   ├── globals.css                     # Global styles, variables & Tailwind CSS
│   │   ├── layout.tsx                      # Root HTML layout & fonts setup
│   │   └── page.tsx                        # Root redirect to default locale
│   │
│   ├── callapi/                            # Centralized API service functions
│   │   ├── auth.ts                         # Google authentication & session callers
│   │   └── index.ts                        # Central callapi export index
│   │
│   ├── data/                               # Static Data & Configurations
│   │   ├── customerData.ts                 # Initial demo customer accounts & transactions
│   │   └── navigation.ts                   # Navigation menu items & icons config
│   │
│   ├── i18n/                               # Localization logic & middleware
│   │   ├── languages.ts                    # Supported languages list & RTL metadata
│   │   └── request.ts                      # next-intl request configuration
│   │
│   ├── lib/                                # Supabase client and shared backend utilities
│   │   ├── supabase.ts                     # Server-side Supabase client (service role)
│   │   └── supabaseClient.ts               # Browser-side Supabase client (anon)
│   │
│   ├── middleware.ts                       # Private route authentication guard (Google Cookies)
│   │
│   └── types/                              # TypeScript Domain Interfaces & Types
│       ├── cashbook.ts                     # Cash Book transaction interfaces
│       ├── customer.ts                     # Customer account & ledger models
│       ├── exchange.ts                     # Currency conversion & exchange rates
│       └── settings.ts                     # Business settings & user profile types
│
├── store/                                  # Zustand Global State Management
│   ├── useCashBookStore.ts                 # Cash Book state & transaction actions
│   ├── useCustomerDetailsStore.ts          # Customer details & statements state
│   ├── useExchangeDeskStore.ts             # Currency exchange desk & rate state
│   └── useSettingsStore.ts                 # System settings, users & backup state
│
├── .dockerignore                           # Docker build ignore rules
├── .gitattributes                          # Git attributes
├── .gitignore                              # Git ignored files
├── AGENTS.md                               # Agent & Next.js conventions
├── CNAME.md                                # Application architecture & directory guide
├── Dockerfile                              # Docker container definition
├── docker-compose.yml                      # Docker Compose orchestrator
├── eslint.config.mjs                       # ESLint configuration
├── gemini-code.md                          # Gemini IDE specifications
├── next.config.ts                          # Next.js configuration
├── next-env.d.ts                           # Next.js TypeScript declarations
├── package.json                            # Project dependencies & scripts
├── postcss.config.mjs                      # PostCSS plugin configurations
├── README.md                               # Project documentation
├── tailwind.config.js                      # Tailwind CSS design tokens & theme
├── tsconfig.json                           # TypeScript configuration
└── tsconfig.tsbuildinfo                    # TypeScript build info cache
```
