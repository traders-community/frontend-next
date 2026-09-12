# Engineering Standards & Architecture Guidelines

> **Traders Community — Production Codebase Rules**  
> This guide is the single source of truth for architectural conventions, directory structure, coding standards, reusable core components, and production best practices. All new features, pages, components, and refactors must strictly follow these conventions.

---

## 1. Repository Architecture & Workspace Setup

> [!NOTE]
> **Production vs. Local Development:**  
> In production, `frontend-next` and `backend` are **independent, standalone repositories and deployments** (e.g., `frontend-next` deployed on Vercel, `backend` deployed on Render). They are **not** a monorepo.  
> They are grouped together locally in this workspace purely for local development convenience, rapid cross-stack iteration, and reference.

```
Traders Community/project/  (Local Development Workspace)
├── backend/            # Standalone Express.js + MongoDB API (Local dev: Port 3000 / Fallback: Port 4401)
├── frontend-next/      # [ACTIVE PRODUCTION REPO] Standalone Next.js 16 + React 19 Frontend (Port 3001)
├── frontend/           # [DEPRECATED REPO] Legacy Vite React SPA (Reference only — do not touch)
└── rules.md            # Architectural standards & rules
```

### Port Configuration & Local Alignment
- **Backend API (`backend/`):**
  - **Code Fallback:** Defaults to Port `4401` in code if unset (`process.env.PORT || 4401`).
  - **Local Development Standard:** In local development, the backend should be configured with `PORT=3000` in `backend/.env` to align directly with `frontend-next`'s default `NEXT_PUBLIC_API_URL=http://localhost:3000/api`.
  - If the backend is left running on its default fallback `4401`, update `frontend-next/.env.local` to point to `http://localhost:4401/api`.
- **Frontend (`frontend-next/`):**
  - Runs on Port `3001` by default during local development to avoid conflicting with the backend running on `3000`.

### Core Technologies (`frontend-next`)
- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI & Runtime:** React 19, TypeScript 5 (Strict mode)
- **Styling:** Tailwind CSS v4 (`@theme` token system in `globals.css`)
- **Theme:** `next-themes` (Light / Dark mode support via `.dark` class)
- **Animations:** `motion` (`motion/react`)
- **Icons:** `@remixicon/react` & `remixicon`
- **Notifications:** `react-toastify`
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), ImageKit CDN

---

## 2. Directory Structure & File Placement

### 2.1 Frontend Structure (`frontend-next/src/`)
All frontend application code lives in `frontend-next/src/`. Routes are organized cleanly under `app/` without artificial grouping directories:

```
src/
├── app/                        # Next.js App Router (pages, layouts, route handlers)
│   ├── about/                  # About page (/about)
│   ├── admin/                  # Admin portal (/admin/listBlog, /admin/addBlog, /admin/categories, etc.)
│   ├── blog/                   # Blog listing & single post (/blog, /blog/[slug])
│   ├── courses/                # Courses directory (/courses)
│   ├── explore/                # Explore landing page (/explore)
│   ├── login/                  # Admin login portal (/login)
│   ├── error.tsx               # Route-level error boundary
│   ├── favicon.ico             # Site favicon
│   ├── globals.css             # Tailwind v4 theme tokens, utilities, rich-text styling
│   ├── icon.png                # App icon asset
│   ├── layout.tsx              # Root HTML shell, fonts, global providers
│   ├── not-found.tsx           # Global 404 page
│   ├── page.tsx                # Public homepage (/)
│   ├── robots.ts               # Dynamic robots.txt
│   ├── sitemap.ts              # Dynamic sitemap
│   └── template.tsx            # Route transition template
├── components/                 # Reusable UI components
│   ├── about/                  # About page domain components
│   ├── admin/                  # Admin-specific components (AdminDataTable, AdminSidebar, etc.)
│   ├── blog/                   # Blog & article domain components (BlogCard, ArticleRenderer, etc.)
│   ├── common/                 # Shared widgets (TradingBackground, ContactModal, DisclaimerGate, etc.)
│   ├── layout/                 # Structural chrome (Navbar, Footer, AppShell)
│   ├── motion/                 # Reusable motion wrapper components (FadeIn, SlideUp)
│   ├── seo/                    # Schema.org JSON-LD generators (ArticleJsonLd, WebSiteJsonLd)
│   ├── theme-provider.tsx      # next-themes Provider wrapper
│   ├── theme-toggle.tsx        # Light/Dark mode switcher
│   └── ui/                     # Universal UI primitives (Button, etc.)
├── config/                     # Static site configurations (seo.config.ts)
├── hooks/                      # Custom React hooks (use-debounce.ts, etc.)
├── lib/                        # Core utilities and shared helpers
│   ├── api/client.ts           # Centralized HTTP client (fetch wrapper with interceptors)
│   ├── motion.ts               # Framer motion variants & transition curves
│   ├── sanitizeHtml.ts         # HTML sanitizer with heading demotion & table responsive wrapper
│   ├── seo/metadata.ts         # constructMetadata() helper with OpenGraph & image handling
│   └── utils.ts                # cn(), formatDate(), getPlainExcerpt(), calculateReadingTime()
├── services/                   # Decoupled API service layer (NO direct fetches in UI components)
│   ├── admin.service.ts        # Admin metrics & management operations
│   ├── auth.service.ts         # Authentication & token management
│   ├── blog.service.ts         # Blog CRUD, queries, comments
│   ├── category.service.ts     # Category CRUD & ordering
│   └── settings.service.ts     # Site settings & admin profile
├── styles/                     # Supplementary CSS assets (quill.snow.css)
└── types/                      # TypeScript definitions & API contracts
    └── index.ts                # Centralized domain interfaces & response envelopes
```

### 2.2 Backend Structure (`backend/`)
```
backend/
├── configs/                    # Service configurations (db.js, imageKit.js)
├── controllers/                # Request handlers (adminController.js, blogController.js)
├── middleware/                 # Express middleware (auth.js, multer.js, error.js)
├── models/                     # Mongoose models (AdminUser.js, Blog.js, Category.js, Comment.js, SiteSettings.js)
├── routes/                     # Route definitions (adminRoutes.js, blogRoutes.js)
├── utils/                      # Helper utilities (htmlSanitizer.js, jwt.js, pagination.js, seed.js, slug.js)
├── server.js                   # Application entry point, CORS, routes & centralized error handler
└── .env.example                # Canonical environment variable schema
```

### 2.3 File & Component Naming Conventions
- **Files & Folders:** Standard is **`kebab-case`** for all filenames and folders (e.g. `blog-card.tsx`, `admin-data-table.tsx`, `use-debounce.ts`).  
  *Note on existing violations:* Certain legacy files (e.g. `sanitizeHtml.ts`, `listBlog/`, `adminRoutes.js`) predate this standard. **Do not weaken the rule** to accommodate legacy files; all new files, folders, and active refactors must strictly use `kebab-case`.
- **React Components:** Use `PascalCase` for component declarations and exports (e.g. `export function BlogCard()`).
- **Services & Helpers:** Use `camelCase` (e.g. `blogService`, `formatDate`).
- **Types & Interfaces:** Use `PascalCase` (e.g. `Blog`, `ApiResponse<T>`, `ColumnDef<T>`).

---

## 3. Reusable Core Components (Single Source of Truth)

To maintain consistency and reduce code duplication, **never reinvent wheels**. Always use the existing shared components:

### 3.1 Data Tables (`AdminDataTable`)
**Location:** [`@/components/admin/admin-data-table`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/components/admin/admin-data-table.tsx)  
- **Scope:** Dedicated standard for **admin entity-management views** (blogs, categories, users, comments, inquiries, and future administrative dashboards).
- **Built-in features:**
  - Debounced search input (`onSearchChange`, `searchValue`)
  - Filter popover modal (`filterContent`, `filterActive`)
  - Column definitions with custom renderers & alignment (`ColumnDef<T>`)
  - 3-state column sorting (`asc`, `desc`, null)
  - Pagination controls (`currentPage`, `totalPages`, `pageSizeOptions`)
  - Loading skeleton & empty state displays
  - Primary action button (`+ Add ...`)
- **Rule:** Never write raw `<table>` tags or ad-hoc pagination controls for administrative management views. For public user-facing comparisons or editorial tables, use semantic HTML or standard responsive table wrappers.

### 3.2 Buttons (`Button` Component & `.btn` Utilities)
**Location:** [`@/components/ui/button`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/components/ui/button.tsx) & `globals.css`  
- **Mandatory Standard:** Always use `<Button variant="..." size="...">` for interactive UI actions. Do not use raw `<button>` elements with ad-hoc classes. Existing raw buttons in legacy code are technical debt to be migrated.
- **Variants:** `primary`, `secondary`, `outline`, `ghost`, `tertiary`.
- **Polymorphic Link Behavior:** If an `href` prop is passed, `<Button>` automatically renders as an optimized Next.js `<Link>`.
- In CSS/HTML template contexts where React primitives cannot be mounted directly, use the utility classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-sm`, `.btn-md`, `.btn-lg`.

### 3.3 Feedback & Notifications (`react-toastify`)
- **Rule:** Never use native browser dialogs: `alert()`, `confirm()`, or `prompt()`.
- Use `toast.success("...")`, `toast.error("...")`, `toast.info("...")`, or `toast.warning("...")` from `react-toastify`.
- The global `<AppToastContainer />` is mounted once in `layout.tsx`.

### 3.4 Modals & Dialogs
- Follow the floating backdrop modal pattern established in `ContactModal` and `DisclaimerGate`:
  - Fixed backdrop with blur (`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm`).
  - Centered card container with responsive padding and max-width.
  - Keyboard listener for `Escape` key and outside backdrop click to dismiss.
  - Body scroll locking (`document.body.style.overflow = "hidden"` while modal is open; reset on unmount).

### 3.5 Rich Text & Table Content
- All HTML content (articles, rich text descriptions) must be rendered using `<ArticleRenderer html={...} />`.
- Container must be styled with the `.rich-text` CSS class.
- Tables inside rich text are automatically wrapped in a `.table-wrapper` with horizontal scroll (`overflow-x: auto`) via `sanitizeHtml.ts`.

### 3.6 Error Boundaries (`error.tsx`)
- All major App Router segments must provide an `error.tsx` component (Client Component with `"use client"`).
- Accepts `{ error: Error & { digest?: string }, reset: () => void }`.
- Must render a user-friendly error card with a retry button (`reset()`) and home navigation instead of crashing the view.
- A root `global-error.tsx` must be present to catch unhandled layout exceptions.

---

## 4. API Service Layer & Authentication Lifecycle

### 4.1 Zero Direct `fetch` in UI Components
- Components and page files must **never** invoke `fetch()` or `axios` directly.
- All HTTP calls must live in dedicated service files under `src/services/` (e.g. `blog.service.ts`, `category.service.ts`, `auth.service.ts`).

### 4.2 Centralized API Client & Canonical Response Contract
All services interact through `api` from [`@/lib/api/client.ts`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/lib/api/client.ts).

#### Canonical Response Envelope Definitions
To prevent confusion between the backend JSON payload and the HTTP client response wrapper:
1. **Server JSON Payload (`src/types/index.ts`):**
   ```ts
   export interface ApiResponse<T = unknown> {
     success: boolean;
     message?: string;
     data?: T;
   }
   ```
2. **HTTP Client Return Envelope (`src/lib/api/client.ts`):**
   ```ts
   export interface ApiClientResponse<T = unknown> {
     data: T;          // Parsed server response body
     status: number;   // HTTP status code (200, 201, 400, 401, 500, etc.)
     success: boolean; // Computed validity: (res.ok && data?.success !== false)
     message?: string; // Informational or error message
   }
   ```

#### Service Example:
```ts
import { api } from "@/lib/api/client";
import { BlogListResponse, ApiResponse, Blog } from "@/types";

export const blogService = {
  getBlogs: (params?: Record<string, any>) =>
    api.get<BlogListResponse>("/blog/all", { params, revalidate: 60 }),

  getBlogById: (id: string, revalidate?: number | false) =>
    api.get<ApiResponse<Blog>>(`/blog/${id}`, { revalidate }),

  addBlog: (formData: FormData) =>
    api.post<ApiResponse<Blog>>("/blog/add", formData),
};
```

### 4.3 Authentication Lifecycle & 401 Session Expiry
- **Bearer Token Standard:** All authenticated requests must include the `Authorization` header formatted with the standard Bearer scheme: `Authorization: Bearer <token>`.
- **Automatic 401 Interception:** When the client receives a `401 Unauthorized` response in a browser environment:
  1. Purge expired credentials: `localStorage.removeItem("token")`.
  2. Emit a session expiration toast: `toast.error("Session expired. Please log in again.")`.
  3. Redirect user to the login route (`/login`).
- **Backend Verification:** The backend `auth.js` middleware must cleanly strip the `Bearer ` prefix before passing the token to `jwt.verify()`, returning a structured `{ success: false, message: "Invalid or expired session" }` on failure.

---

## 5. Data Fetching, Freshness & Cache Invalidation

### 5.1 Server-First Performance Principle
- **Server Components by Default:** Layouts, static pages, and initial data fetching should leverage Server Components to pre-render HTML at the server/edge. This optimizes search engine crawlability, reduces client bundle weight, and eliminates Cumulative Layout Shift (CLS).
- **Client Components (`"use client"`):** Use strictly when client-side interactivity is required (state, event listeners, browser storage, interactive filtering).

### 5.2 Freshness Architecture & Event-Driven Sync
- **No Unconditional Duplicate Mount Fetch:** When a Server Component fetches data and passes `initialData` to a client component, the client component **must NOT** execute an immediate unconditional re-fetch on mount. Doing so produces an unnecessary duplicate round-trip for identical data.
- **Event-Driven Freshness:**
  - Client state initializes cleanly from `initialData`.
  - Background revalidation is triggered conditionally (e.g. on window/tab focus only after a designated freshness TTL has elapsed, or when the user updates a search/filter query).
  - Silent updates: Background refreshes must update local state smoothly without showing full-screen blocking spinners.

### 5.3 Edge Caching (ISR)
All public dynamic pages must declare static ISR revalidation intervals:
- **Home & Single Blog:** `export const revalidate = 60;` (60 seconds)
- **Explore & Courses:** `export const revalidate = 300;` (5 minutes)
- **Prohibition:** Never use `export const dynamic = "force-dynamic"` or `revalidate = 0` on public marketing pages.

### 5.4 Cache Invalidation After Admin Mutations
- When an administrator creates, updates, or deletes an entity (such as publishing a blog post, updating categories, or modifying site settings), public cached content must be invalidated promptly.
- **Standard:** Use on-demand cache revalidation (`revalidatePath` or `revalidateTag`) via an authenticated internal API route handler (e.g. `/api/revalidate`) triggered post-mutation, ensuring visitors see updated content without waiting out the full ISR TTL.

---

## 6. Shared Helpers & Utility Functions

Always import utilities from [`@/lib/utils`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/lib/utils.ts) rather than writing ad-hoc helpers:

| Helper | Purpose | Desired Standard & Example |
| :--- | :--- | :--- |
| `cn(...inputs)` | Merges classes cleanly, resolving conflicts | Combines `clsx` + `twMerge`: `cn("px-4 py-2", isActive && "bg-primary")` |
| `formatDate(date)` | Standard date formatting (`en-IN`) | `formatDate(blog.createdAt)` → `10 Sep 2026` |
| `getPlainExcerpt(html, max)` | Strips HTML and truncates text for cards/meta | `getPlainExcerpt(blog.description, 160)` |
| `calculateReadingTime(text)` | Calculates reading duration (200 wpm) | `calculateReadingTime(blog.description)` |
| `debounce(fn, wait)` | Delays function execution | `debounce(handleSearch, 300)` |
| `useDebounce(val, wait)` | Hook for state debouncing | `const debouncedQuery = useDebounce(query, 300);` |
| `sanitizeHtml(raw)` | Sanitizes HTML, wraps tables, demotes body H1s | `sanitizeHtml(blog.description)` |

> [!IMPORTANT]
> **`cn()` Standard:** The architectural requirement for `cn()` is `clsx` merged with `tailwind-merge` (`twMerge`) to guarantee that conflicting Tailwind utility classes resolve predictably. (Project implementation will be fully aligned to this standard).

---

## 7. TypeScript Standards & Type Safety

### 7.1 Centralized Types
All entity interfaces and API contracts belong in [`src/types/index.ts`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/types/index.ts):
- Domain Models: `Blog`, `Category`, `Comment`, `SiteSettings`, `AdminProfile`
- Response Envelopes: `ApiResponse<T>`, `BlogListResponse`, `PublicDataResponse`
- Client Inputs: `ConstructMetadataParams`, `LoginCredentials`, `AuthResponse`

### 7.2 Strict Type Rules
- **No Unconstrained `any`:** Use explicit interfaces or typed generics (`ApiResponse<T>`).
- **Component Props:** Always declare an interface directly above the component file (e.g. `interface BlogCardProps { ... }`).
- **Async Route Params (Next.js 16):** Route parameters are asynchronous promises:
  ```ts
  interface PageProps {
    params: Promise<{ slug: string }>;
  }
  export default async function Page({ params }: PageProps) {
    const { slug } = await params;
  }
  ```

---

## 8. Styling, Theming & Design System (Tailwind CSS v4)

### 8.1 Theme Tokens
Never hardcode arbitrary hex values (e.g. `bg-[#00c950]`) in Tailwind class strings. Always utilize predefined semantic tokens configured in `globals.css`:
- **Primary:** `text-primary`, `bg-primary` (`#00c950`), hover: `bg-primary-hover` (`#00b046`)
- **Background:** `bg-background` (Light `#e7e7e7` / Dark `#080e1e`)
- **Foreground / Text:** `text-foreground` (Light `#202020` / Dark `#f4f4f4`)
- **Cards & Surfaces:** `bg-card`, `bg-surface` (Light `#ffffff` / Dark `#0d162c`)
- **Muted Elements:** `text-muted-foreground`, `bg-muted`
- **Borders:** `border-border` (Light `#e0e0e0` / Dark `#1a2542`)

### 8.2 Typography
- Headings: `font-heading` (`--font-ibm-plex`)
- Body: `font-sans` (`--font-manrope`, `--font-inter`)

### 8.3 Sticky Navbar CSS Guard
- The navbar in `navbar.tsx` morphs from full width to a floating pill on scroll (>25px).
- **CRITICAL:** Never apply global CSS transitions to `header` or `nav` in `globals.css`. Doing so disrupts the pill morph animation.

---

## 9. SEO & Social Sharing Best Practices

### 9.1 Metadata Engine
Every page must export dynamic metadata using `constructMetadata` from [`@/lib/seo/metadata.ts`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/lib/seo/metadata.ts):
```ts
export const metadata = constructMetadata({
  title: "Article Title",
  description: "Summary...",
  canonicalUrl: "/blog/my-slug",
  image: blog.image,
  type: "article",
});
```

### 9.2 Social Sharing Compatibility & Single H1
- **Social Sharing Best Practices (WhatsApp & Mobile Scrapers):**
  - To maximize reliability of link preview card generation across mobile chat clients (WhatsApp iOS & Android), share links should format the clean URL first or exclusively (e.g. `https://wa.me/?text=${encodedUrl}`). Prepending extensive body text before the URL can cause certain mobile scraper parsers to fail preview generation.
  - OpenGraph images should be optimized to progressive JPEGs under 300KB using ImageKit transformation parameters (`/tr:w-1200,h-630,fo-auto,q-75,f-jpg`) to ensure mobile crawlers retrieve the thumbnail without timeouts.
- **Single H1 Tag:** Every page must render exactly one `<h1>`. In rich-text content, `sanitizeHtml.ts` automatically demotes body `<h1>` tags to `<h2>`.

---

## 10. Backend Architecture, Database & Asset Storage (`backend/`)

### 10.1 Mongoose `.lean()` for Read Queries
Always chain `.lean()` onto read-only queries in Express controllers (`Blog.find(...).lean()`). This skips heavy Mongoose document hydration and reduces memory overhead.

### 10.2 Database Indexing Guidelines
- Indexes must directly support the actual query and sort workloads executed by the application:
  - Feed queries: Compound index on `{ isPublished: 1, createdAt: -1 }`
  - Category filtered queries: Compound index on `{ isPublished: 1, category: 1, createdAt: -1 }`
  - Unique lookup: Unique sparse index on `{ slug: 1 }`
  - Comment queries: Compound index on `{ blog: 1, isApproved: 1, createdAt: -1 }`
- **Avoid Dead Indexes:** Do not define indexes that the codebase does not query. For example, do not maintain a MongoDB `{ title: "text", subTitle: "text" }` text index if search is implemented via regex filters. If full-text search is adopted, queries and indexes must be purposefully matched.

### 10.3 Guarded Mutations
Never run batch mutations, migrations, or database writes inside read endpoints (`GET /api/blog/all`, `GET /api/blog/:id`). Read endpoints must remain idempotent and free from write-side-effects.

### 10.4 Asset Storage & Binary Data
- **No Large Binary Assets in MongoDB:** MongoDB documents have a 16MB BSON limit, and storing raw file buffers consumes excessive RAM cache.
- **Rule:** Never store raw binary buffers (e.g. `pdf.data: Buffer`) in MongoDB documents.
- **Storage Standard:** All uploaded media (images, PDFs, documents) must be streamed to cloud object storage or CDN (ImageKit), and only the resulting metadata (`{ url, name, size, contentType }`) should be stored in MongoDB collections.

### 10.5 Centralized Backend Error Handling & Logging
- **Centralized Middleware:** The backend must register a centralized error-handling middleware (`(err, req, res, next) => ...`) as the final handler in `server.js`.
- **No Information Leaks:** In production, never return raw stack traces or database error details to clients. Return standardized `{ success: false, message: "Internal server error" }`.
- **Structured Error Logging:** Log errors server-side with timestamp, request route, HTTP method, and error details for diagnostics.

---

## 11. Security Standards

- **NoSQL Injection Prevention & Query Validation:**
  - Never pass unvalidated user inputs directly into Mongoose queries or query selectors.
  - Sanitize search queries and escape regex special characters before constructing regular expressions.
  - Validate all incoming route and query parameters (IDs must pass `mongoose.Types.ObjectId.isValid()`).
- **File Upload Security:**
  - Enforce strict MIME-type and extension checks in Multer (allow only approved image and PDF types).
  - Enforce maximum file size limits (5MB for images, 10MB for PDFs).
  - Always clean up temporary upload files from the local filesystem in a `finally` block or error handler.
- **CORS Hardening:**
  - In production, restrict CORS origins strictly to authorized frontend domains via environment variables (`process.env.FRONTEND_URL`), rather than using open wildcard origins.
- **Rate Limiting:**
  - Protect sensitive routes (login, comments, public search) against brute force and DDoS using Express rate-limiting middleware.
- **Secrets Management:**
  - Never commit `.env` files or hardcode API keys.
  - All secrets (`JWT_SECRET`, ImageKit keys, database credentials) must be supplied through environment variables.

---

## 12. Dependency Hygiene & Package Management

- **Audit Before Installing:** Before adding any new dependency, verify whether the functionality can be cleanly handled using native Web APIs or existing libraries in the project.
- **Prevent Duplicate Libraries:**
  - Use `motion` (`motion/react`) as the primary animation package; do not add overlapping animation libraries.
  - Do not introduce `axios` when the project's native `fetch` client (`@/lib/api/client.ts`) already handles requests, caching, and interceptors.
  - Do not maintain unneeded sitemap packages (e.g. `next-sitemap`) when Next.js App Router provides dynamic `sitemap.ts`.
- **Routine Pruning:** Periodically prune unused or obsolete dependencies from `package.json` to keep bundle sizes lean and reduce potential security vulnerabilities.

---

## 13. Production Verification Checklist

Before deploying or submitting any pull request, verify the following:

- [ ] **Type & Build Validation:** Run `npm run build` in `frontend-next` to ensure successful TypeScript compilation and Next.js page generation with zero errors.
- [ ] **Lint Verification:** Run `npm run lint` in `frontend-next` to confirm clean code quality.
- [ ] **Consistent Helpers:** All date formatting uses `formatDate()`, class concatenation uses `cn()`, and HTTP requests route through `@/services`.
- [ ] **Shared Components:** Administrative entity management views use `<AdminDataTable />`, buttons use `<Button />`, and notifications use `react-toastify`.
- [ ] **Data Freshness & Revalidation:** Client navigation renders smoothly without redundant duplicate mount fetches.
- [ ] **Error Boundaries:** Tested failure states render graceful error boundaries (`error.tsx`) with recovery actions.
- [ ] **Responsive Design:** Verified on mobile (`360px`), tablet (`768px`), and desktop (`1280px+`).
- [ ] **Theme Support:** Polished appearance in both Light and Dark modes.
- [ ] **SEO & Metadata:** Appropriate page title, description, canonical link, and strictly one `<h1>` per page.
