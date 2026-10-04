# SHOPORA (PANHASHOP) — Angular Ecommerce Application

A modern, responsive ecommerce web application built with **Angular 22** as a student final project. The app fetches real product data from the [DummyJSON API](https://dummyjson.com/) and provides a complete shopping experience including product browsing, search, filtering, sorting, cart management, and a simulated checkout flow.

## What's new in this revision

The original project was solid — this pass fixed a few real bugs and rounded out gaps rather than restyling anything:

- **Bug fix — stale order confirmation.** Refreshing the checkout page after starting a new order (with an empty cart) could show your *previous* order's confirmation screen. The order is now cleared once you navigate away from it.
- **Bug fix — "Buy Now" over-adding stock.** Clicking Buy Now on a product already in your cart could silently add another unit past what you intended. It now only adds the item if it isn't already in the cart.
- **Bug fix — product detail race condition.** Navigating quickly between two products (e.g. via browser back/forward) could momentarily show the wrong product if the slower request resolved last. Requests are now cancelled with `switchMap` so only the latest one wins.
- **Bug fix — footer links.** "Help Center", "Shipping" and "Returns" all pointed at the Contact page. They now point at a real Help Center with anchored sections.
- **New pages:** `/about` (About Us) and `/help` (Help Center with an FAQ accordion covering shipping, returns, payments, and orders).
- **New feature:** sort products by price, rating, or name on the Products page, alongside the existing search and category filters.
- **New feature:** the Products page now reflects its filters (page, category, search, sort) in the URL query string, so a filtered view can be bookmarked or shared.
- **Removed dead code:** the project shipped Angular SSR/`@angular/ssr` scaffolding (`server.ts`, `app.config.server.ts`, etc.) that was never wired into `angular.json` and could not run. It's been removed along with the unused `express` dependency to keep the install lean.
- **Performance:** all routes are now lazy-loaded (`loadComponent`), cutting the initial bundle roughly in half; each page ships its own chunk.
- **Accessibility:** added a skip-to-content link, a visible focus ring, `aria-expanded`/`aria-controls` on the mobile menu toggle, a live cart-item count in the cart button's label, and per-page `<title>` updates via Angular's `Title` service.
- **Housekeeping:** de-duplicated the broken-image fallback (previously copy-pasted in five components) into one shared helper; removed leftover inline `style="..."` attributes in favor of CSS classes; added `robots.txt` and a web app manifest; render-blocking Google Fonts `@import` swapped for a preconnected `<link>`.
- **Tests:** added specs for the two new pages. The full suite is 15 files / 42 tests, all passing.

## Features

- **Home Page** — Hero section with featured products loaded from the API
- **Product Listing** — Browse all products with server-side pagination (12 per page)
- **Search** — Debounced search bar to find products by name
- **Category Filtering** — Horizontal scrollable category chips to filter by category
- **Sorting** — Sort by featured, price, rating, or name
- **Product Details** — Dedicated page with image gallery, ratings, stock info, and Add to Cart / Buy Now actions
- **Shopping Cart** — Add, increase, decrease, and remove items with stock-limit enforcement and `localStorage` persistence
- **Checkout** — Simulated order form with validation, payment method selection, order confirmation with unique order ID
- **About Us** — Brief company story and values
- **Help Center** — FAQ accordion covering shipping, returns, payments, and orders
- **Contact Form** — Validated contact form with name, email, subject, and message fields plus submission feedback
- **404 Page** — Custom "Not Found" page for invalid routes
- **Responsive Design** — Mobile-friendly layout across all pages
- **Accessibility** — Skip link, visible focus states, `aria-label`/`aria-expanded` attributes, proper `type="button"` on interactive elements, semantic HTML
- **Currency Formatting** — All prices displayed using Angular's `CurrencyPipe` in USD
- **Loading & Error States** — Skeleton loaders and user-friendly error messages on all data-fetching pages

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 22 (Standalone Components, lazy-loaded routes) |
| Language | TypeScript |
| Styling | Scoped CSS per component |
| State | Angular Signals + localStorage |
| API | DummyJSON REST API |
| Testing | Vitest (via `@angular/build:unit-test`) |
| Build | Angular CLI / `@angular/build:application` |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22.22.3+ (or v24.15+ / v26+) and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd final

# Install dependencies
npm install
```

### Development Server

```bash
ng serve -o
```

Opens the app at `http://localhost:4200/`. Hot-reload is enabled.

### Production Build

```bash
npm run build
```

Build artifacts are written to the `dist/` directory. Note: production builds try to inline the Google Fonts stylesheet at build time, which requires outbound network access to `fonts.googleapis.com`.

### Running Tests

```bash
npm test -- --watch=false
```

Runs all unit tests once with Vitest.

## Project Architecture

```
src/app/
├── components/
│   ├── navbar/          # Top navigation bar with cart badge and mobile menu
│   ├── footer/          # Site footer with navigation links
│   └── product-card/    # Reusable product card component
├── models/
│   └── product.ts       # Product, CartItem, Order interfaces
├── pages/
│   ├── home/             # Landing page with hero and featured products
│   ├── products/         # Product listing with search, category, sort, pagination
│   ├── product-detail/   # Single product view with Add to Cart / Buy Now
│   ├── cart/             # Shopping cart management
│   ├── checkout/         # Simulated checkout with order confirmation
│   ├── about/             # About Us page
│   ├── help/              # Help Center (FAQ accordion)
│   ├── contact/          # Contact form with validation
│   └── not-found/        # 404 error page
├── services/
│   ├── product.service.ts   # HTTP client for DummyJSON API
│   └── cart.service.ts      # Cart state management with localStorage
├── utils/
│   └── image.ts          # Shared broken-image fallback handler
├── app.ts                # Root component (navbar + router-outlet + footer)
└── app.routes.ts         # Lazy-loaded route definitions
```

## API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /products?limit=N&skip=N&sortBy=&order=` | Paginated, sortable product list |
| `GET /products/search?q=...` | Product search |
| `GET /products/category/{slug}` | Filter by category |
| `GET /products/{id}` | Single product details |
| `GET /products/category-list` | List of all categories |

## Important Notes

> **Demo Disclaimer:** The checkout process is fully simulated for demonstration purposes. No real payment processing or order fulfillment occurs. Order IDs are randomly generated client-side.

> **Data Source:** All product data comes from the free [DummyJSON API](https://dummyjson.com/). Product images, prices, and stock values are provided by that service.

## License

This project is a student assignment and is not intended for production use.
