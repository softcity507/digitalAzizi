# AGENT DEVELOPMENT RULES & GUIDELINES

## 1. Target Platforms & Multi-Platform Compatibility
- **Google Play Store (Android / APK):** Fully optimized for Android devices and APK wrapper/Capacitor builds with Android touch gestures, back-button handling, and flexible viewport adaptability.
- **Apple App Store (iOS):** Strict adherence to Apple App Store guidelines and iOS standards, supporting iOS safe areas (`safe-area-inset-*`, notch & home indicators), smooth 60fps gesture interactions, and iOS WebKit compatibility.
- **Custom Web Domain (Web / Desktop & Mobile):** Flawless cross-browser performance on custom domains with SSR/hydration safety, zero hydration mismatches, and responsive layouts across all screen sizes.
- **Zero-Error Execution:** All features, APIs, and storage layers must be resilient across all platforms without platform-specific crashes, layout overflows, or runtime exceptions.

## 2. Component Reusability & Architecture
- **DRY & High Reusability:** Always design modular, reusable UI primitives (buttons, inputs, modals, cards, badges, table cells) and custom hooks. Avoid duplicated logic or duplicate component variations.
- **Single Responsibility Principle:** Every component must do one thing well. Separate presentation (UI) from business logic, data fetching, and state management.
- **Component Limit:** Every individual component or file must stay **under 150 lines** of code.
- **Hard Maximum:** Under no circumstances should a single file exceed **200 lines**. Refactor larger components into smaller micro-components and shared hooks immediately.

## 3. Database Safety & Data Integrity
- **NO DESTRUCTIVE QUERIES:** Never execute direct `DELETE` statements on database tables or collections.
- **Soft Deletes Only:** Always implement soft deletes by updating a status flag (e.g., `is_deleted: true`, `deleted_at: TIMESTAMP`) instead of wiping records.

## 4. Design System & Theming
- **Design Reference:** Check the `design/` folder (`Cash Book Register.png`, `Currency Exchange Desk.png`, `Customer Book (Main Ledger).png`, `Customer Details & Ledger.png`, `Settings & System Hub.png`) and strictly follow these reference layouts for all UI components.
- **Color Palette:** Strictly use `#000000` (pure black) and `#FFFFFF` (pure white) shades, grayscale accents, and high-contrast UI elements.
- **Responsiveness:** Designs must be **100% fully responsive** across mobile, tablet, and desktop viewports, suitable for multi-platform delivery (Play Store APK, App Store, and Web Domain).

## 5. Code Style & Clean Code Standards
- **Senior Human Code Style:** Write clean, readable, elegant, and idiomatic code that reads like a senior human engineer wrote it—clear naming conventions, declarative patterns, and zero messy boilerplate.
- **Minimal Comments:** Keep comments strictly to a maximum of **1 line** where logic is complex. Never write multi-line block comments or obvious commentary.
- **No Markdown Symbols:** Do not use `###` header symbols or markdown artifacts inside code files.

## 6. Type Safety & ESLint Compliance
- **Strict Data Types:** Always define clear, explicit TypeScript types and interfaces for all component props, state, event handlers, and data structures. Never use `any` or leave types implicit.
- **ESLint & Static Analysis:** Every component and file must strictly pass ESLint with zero errors, zero warnings, and clean imports before completion.

## 7. Execution Protocol
- **Analyze First:** Whenever a user gives a command, the agent must **first analyze and read** the codebase context before generating any response or code output.