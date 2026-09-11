# AGENT DEVELOPMENT RULES & GUIDELINES

## 1. Target Platforms & Deployment Scope
- **Google Play Store (Android):** The app must be fully optimized for Android devices (native webview, PWA, or Capacitor/hybrid build) with Android-friendly touch targets, navigation patterns, and viewport adaptability.
- **Apple App Store (iOS):** Fully compliant with iOS guidelines and UI standards, supporting iOS safe areas (notches/home indicators), smooth touch gestures, and responsive mobile layouts.
- **Custom Web Domain (Web / Desktop & Mobile):** Accessible via standard web browsers on custom domains. Must deliver a fast, responsive, and seamless experience across desktop, laptop, tablet, and mobile browsers.

## 2. Database Safety & Integrity
- **NO DESTRUCTIVE QUERIES:** Never execute direct `DELETE` statements on database tables or collections. 
- **Soft Deletes Only:** Always implement soft deletes by updating a status flag (e.g., `is_deleted: true`, `deleted_at: TIMESTAMP`) instead of wiping records.

## 3. Component Size & Modularity
- **Component Limit:** Every individual component or file must stay **under 150 lines** of code. 
- **Hard Maximum:** Under no circumstances should a single file exceed **200 lines**. Refactor larger components into smaller, highly reusable micro-components immediately.

## 4. Design System & Theming
- **Design Reference:** Check the `design/` folder (`Cash Book Register.png`, `Currency Exchange Desk.png`, `Customer Book (Main Ledger).png`, `Customer Details & Ledger.png`, `Settings & System Hub.png`) and strictly follow these reference layouts for all UI components.
- **Color Palette:** Strictly use `#000000` (pure black) and `#FFFFFF` (pure white) shades, grayscale accents, and high-contrast UI elements.
- **Responsiveness:** Designs must be **100% fully responsive** across mobile, tablet, and desktop viewports, suitable for multi-platform delivery (Play Store, App Store, and Web Domain).

## 5. Code Style & Documentation
- **Minimal Comments:** Keep comments strictly to a maximum of **1 line** where logic is complex. Never write multi-line block comments.
- **No Markdown Symbols:** Do not use `###` header symbols or markdown artifacts inside the code files themselves.
- **Human Code Style:** Write clean, readable, idiomatic code that mimics senior human developer patterns without over-engineered boilerplate.

## 6. Execution Protocol
- **Analyze First:** Whenever a user gives a command, the agent must **first analyze and read** the codebase context before generating any response or code output.