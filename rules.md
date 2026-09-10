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
├── backend/            # Standalone Express.js + MongoDB API (Port 3000)
├── frontend-next/      # [ACTIVE PRODUCTION REPO] Standalone Next.js 16 + React 19 Frontend (Port 3001)
├── frontend/           # [DEPRECATED REPO] Legacy Vite React SPA (Reference only — do not touch)
└── rules.md            # Architectural standards & rules
```

### Core Technologies (`frontend-next`)
- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI & Runtime:** React 19, TypeScript 5 (Strict mode)
- **Styling:** Tailwind CSS v4 (`@theme` token system in `globals.css`)
- **Theme:** `next-themes` (Light / Dark mode support via `.dark` class)
- **Icons:** `@remixicon/react` & `remixicon`
- **Notifications:** `react-toastify`
- **Backend:** Node.js, Express, MongoDB (Mongoose), ImageKit CDN

---

## 2. Directory Structure & File Placement

All frontend code lives in `frontend-next/src/`. Follow this strict folder mapping:

```
src/
├── app/                        # Next.js App Router (pages, layouts, route handlers)
│   ├── (public)/               # Public pages (/, /about, /explore, /courses, /blog/[slug])
│   ├── admin/                  # Admin portal (/admin/listBlog, /admin/addBlog, /admin/categories, etc.)
│   ├── layout.tsx              # Root HTML shell, fonts, global providers
│   ├── globals.css             # Tailwind v4 theme tokens, utilities, rich-text styling
│   ├── sitemap.ts              # Dynamic sitemap
│   └── robots.ts               # Dynamic robots.txt
├── components/                 # Reusable UI components
│   ├── ui/                     # Universal UI primitives (Button, etc.)
│   ├── admin/                  # Admin-specific components (AdminDataTable, AdminSidebar, etc.)
│   ├── blog/                   # Blog & article domain components (BlogCard, ArticleRenderer, etc.)
│   ├── common/                 # Shared widgets (TradingBackground, ContactModal, DisclaimerGate, etc.)
│   ├── layout/                 # Structural chrome (Navbar, Footer, AppShell)
│   └── seo/                    # Schema.org JSON-LD generators (ArticleJsonLd, WebSiteJsonLd)
├── config/                     # Static site configurations (seo.config.ts)
├── hooks/                      # Custom React hooks (use-debounce.ts, etc.)
├── lib/                        # Core utilities and shared helpers
│   ├── api/client.ts           # Centralized HTTP client (fetch wrapper with interceptors)
│   ├── seo/metadata.ts         # constructMetadata() helper with OpenGraph & image handling
│   ├── sanitizeHtml.ts         # HTML sanitizer with heading demotion & table responsive wrapper
│   └── utils.ts                # cn(), formatDate(), getPlainExcerpt(), calculateReadingTime()
├── services/                   # Decoupled API service layer (NO direct fetches in UI components)
│   ├── blog.service.ts         # Blog CRUD, queries, comments
│   ├── category.service.ts     # Category CRUD & ordering
│   ├── settings.service.ts     # Site settings & admin profile
│   ├── auth.service.ts         # Authentication & token management
│   └── admin.service.ts        # Admin metrics & management operations
└── types/                      # TypeScript definitions & API contracts
    └── index.ts                # Centralized domain interfaces & response envelopes
```

### File & Component Naming Conventions
- **Files & Folders:** Use `kebab-case` for all file names (e.g. `blog-card.tsx`, `admin-data-table.tsx`, `use-debounce.ts`).
- **React Components:** Use `PascalCase` for component declarations and exports (e.g. `export function BlogCard()`).
- **Services & Helpers:** Use `camelCase` (e.g. `blogService`, `formatDate`).
- **Types & Interfaces:** Use `PascalCase` (e.g. `Blog`, `ApiResponse<T>`, `ColumnDef<T>`).

---

## 3. Reusable Core Components (Single Source of Truth)

To maintain a clean, consistent codebase, **never reinvent wheels**. Always use the existing shared components:

### 3.1 Data Tables (`AdminDataTable`)
**Location:** [`@/components/admin/admin-data-table`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/components/admin/admin-data-table.tsx)  
- **Rule:** Wherever tabular data, lists, or records need to be displayed (admin lists, reports, future dashboards), **always** use `<AdminDataTable<T> />`.
- **Built-in features:**
  - Debounced search input (`onSearchChange`, `searchValue`)
  - Filter popover modal (`filterContent`, `filterActive`)
  - Column definitions with custom renderers & alignment (`ColumnDef<T>`)
  - 3-state column sorting (`asc`, `desc`, null)
  - Pagination controls (`currentPage`, `totalPages`, `pageSizeOptions`)
  - Loading skeleton & empty state displays
  - Primary action button (`+ Add ...`)
- **Never** write raw `<table>` tags or custom pagination logic for data management views.

### 3.2 Buttons (`Button` Component & `.btn` Utilities)
**Location:** [`@/components/ui/button`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/components/ui/button.tsx) & `globals.css`  
- Use `<Button variant="..." size="...">` for interactive UI elements.
- Variants: `primary`, `secondary`, `outline`, `ghost`, `tertiary`.
- If an `href` prop is passed, `<Button>` automatically renders as a Next.js `<Link>`.
- In CSS/HTML contexts, use the utility classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-sm`, `.btn-md`, `.btn-lg`.

### 3.3 Feedback & Notifications (`react-toastify`)
- **Rule:** Never use browser `alert()` or `confirm()`.
- Use `toast.success("...")`, `toast.error("...")`, `toast.info("...")` from `react-toastify`.
- The global `<AppToastContainer />` is already mounted in `layout.tsx`.

### 3.4 Modals & Dialogs
- Follow the floating backdrop modal pattern established in `ContactModal` and `DisclaimerGate`:
  - Fixed backdrop with blur (`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm`).
  - Centered card container with responsive padding and max-width.
  - Listeners for `Escape` key and outside click to close.
  - Body scroll locking (`document.body.style.overflow = "hidden"` while open).

### 3.5 Rich Text & Table Content
- All HTML content (articles, rich text descriptions) must be rendered using `<ArticleRenderer html={...} />`.
- Enclosed in the `.rich-text` CSS class.
- All tables in rich text are automatically wrapped in a `.table-wrapper` with horizontal scroll (`overflow-x: auto`) via `sanitizeHtml.ts`.

---

## 4. API Service Layer Pattern

### 4.1 Zero Direct `fetch` in UI Components
- Components must **never** call `fetch()` or `axios` directly.
- All HTTP calls must live in a dedicated service file under `src/services/` (e.g. `blog.service.ts`, `category.service.ts`).

### 4.2 Centralized API Client
All services call `api` from [`@/lib/api/client.ts`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/lib/api/client.ts):
```ts
import { api } from "@/lib/api/client";
import { BlogListResponse } from "@/types";

export const blogService = {
  getBlogs: (params?: GetBlogsParams) =>
    api.get<BlogListResponse>("/blog/all", { params, revalidate: 60 }),

  getBlogById: (id: string, revalidate?: number | false) =>
    api.get<SingleBlogResponse>(`/blog/${id}`, { revalidate }),

  addBlog: (formData: FormData) =>
    api.post<ApiResponse<Blog>>("/blog/add", formData),
};
```
- **Standardized Response Envelope:** Every call returns `{ data: T, status: number, success: boolean, message?: string }`.
- **JWT Handling:** The client automatically injects the `Authorization` token from `localStorage` in browser environments.
- **Payload Handling:** Automatically handles JSON and `FormData` (with correct boundaries).

---

## 5. Data Fetching & Freshness Architecture

### 5.1 Server vs. Client Component Split
- **Server Components (Default):** Use for layouts, pages, and initial data fetching to achieve 0ms TTFB and full SEO indexing.
- **Client Components (`"use client"`):** Use only when interactivity is needed (state, event handlers, browser APIs, search/filtering).

### 5.2 Stale-While-Revalidate (Background Sync on Mount)
- **Problem:** When navigating client-side (e.g., Home → About → Home), Next.js may serve cached data. If an admin added or edited content, the user might see stale data without a hard reload.
- **Standard Pattern:**
  1. Pass server-fetched `initialData` into client components so initial paint is instant (0ms TTFB, zero CLS).
  2. In the client component, execute a quiet background sync on mount & window focus:
     ```ts
     useEffect(() => {
       let isMounted = true;
       const syncData = async () => {
         const res = await myService.getData({ revalidate: 0 });
         if (isMounted && res.data?.success) {
           setData(res.data.items);
         }
       };
       syncData();
       window.addEventListener("focus", syncData);
       return () => {
         isMounted = false;
         window.removeEventListener("focus", syncData);
       };
     }, []);
     ```
  3. **No Intrusive Spinners:** Do not replace existing content with a full-screen spinner during background sync. Update the state smoothly in place.

### 5.3 Edge Caching (ISR)
- All public pages must declare ISR revalidation intervals:
  - Home & Single Blog: `export const revalidate = 60;`
  - Explore & Courses: `export const revalidate = 300;`
- **Never** declare `dynamic = "force-dynamic"` or `revalidate = 0` on public marketing pages.

---

## 6. Shared Helpers & Utility Functions

Always import from [`@/lib/utils`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/lib/utils.ts) rather than writing ad-hoc helpers:

| Helper | Purpose | Example Usage |
| :--- | :--- | :--- |
| `cn(...inputs)` | Merges Tailwind class names safely (`clsx` + `tailwind-merge`) | `className={cn("px-4 py-2", isActive && "bg-primary")}` |
| `formatDate(date)` | Formats dates to standard `"en-IN"` style (`10 Sep 2026`) | `formatDate(blog.createdAt)` |
| `getPlainExcerpt(html, max)` | Strips HTML tags and truncates to clean text for cards/meta | `getPlainExcerpt(blog.description, 160)` |
| `calculateReadingTime(text)` | Calculates estimated reading time (200 words/min) | `calculateReadingTime(blog.description)` |
| `debounce(fn, wait)` | Delays function execution until quiet period | `debounce(handleSearch, 300)` |
| `useDebounce(val, wait)` | Hook version for state debouncing | `const debounced = useDebounce(query, 300);` |
| `sanitizeHtml(raw)` | Sanitizes HTML, wraps tables, demotes duplicate H1s | `sanitizeHtml(blog.description)` |

---

## 7. TypeScript Standards & Type Safety

### 7.1 Centralized Types
All entity interfaces and API contracts belong in [`src/types/index.ts`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/types/index.ts):
- `Blog`, `Category`, `Comment`, `SiteSettings`, `AdminProfile`
- `ApiResponse<T>`, `BlogListResponse`, `PublicDataResponse`
- `ConstructMetadataParams`, `LoginCredentials`, `AuthResponse`

### 7.2 Rules
- **No loose `any`:** Use generics (e.g. `ApiResponse<T>`) or specify explicit types.
- **Component Props:** Always define an interface above the component (e.g. `interface BlogCardProps { ... }`).
- **Async Route Params:** In Next.js 16, page params are promises:
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
Never hardcode arbitrary hex codes in Tailwind classes. Always use the predefined semantic tokens from `globals.css`:

- **Primary:** `text-primary`, `bg-primary` (`#00c950`), hover: `bg-primary-hover` (`#00b046`)
- **Background:** `bg-background` (Light `#e7e7e7` / Dark `#080e1e`)
- **Foreground / Text:** `text-foreground` (Light `#202020` / Dark `#f4f4f4`)
- **Cards & Surfaces:** `bg-card`, `bg-surface` (Light `#ffffff` / Dark `#0d162c`)
- **Muted Text & Backgrounds:** `text-muted-foreground`, `bg-muted`
- **Borders:** `border-border` (Light `#e0e0e0` / Dark `#1a2542`)

### 8.2 Typography
- Headings: `font-heading` (`--font-ibm-plex`)
- Body / Sans: `font-sans` (`--font-manrope`, `--font-inter`)

### 8.3 Sticky Navbar CSS Guard
- The sticky navbar in `navbar.tsx` morphs from full-width to a floating pill on scroll (>25px).
- **CRITICAL:** Never add global CSS transitions to `header` or `nav` in `globals.css`. Doing so breaks the smooth pill animation.

---

## 9. SEO & Social Sharing Best Practices

### 9.1 Metadata Engine
Every page must export metadata using `constructMetadata` from [`@/lib/seo/metadata.ts`](file:///c:/Users/kanan/Desktop/Traders%20Community/project/frontend-next/src/lib/seo/metadata.ts):
```ts
export const metadata = constructMetadata({
  title: "Article Title",
  description: "Summary...",
  canonicalUrl: "/blog/my-slug",
  image: blog.image,
  type: "article",
});
```

### 9.2 WhatsApp & iOS Sharing Rules
- **Clean URL in WhatsApp Share:** The share link in `social-share.tsx` must strictly use `https://wa.me/?text=${encodedUrl}`. Never prepend text before the URL (on iOS, text in front of a URL disables link preview scraping).
- **Image Compatibility:** WhatsApp iOS requires progressive JPEGs under 300KB. `constructMetadata` automatically applies ImageKit transformations (`/tr:w-1200,h-630,fo-auto,q-75,f-jpg`).
- **Single H1 Tag:** Each page must contain exactly one `<h1>`. In rich-text content, `sanitizeHtml.ts` automatically demotes any body `<h1>` to `<h2>`.

---

## 10. Backend Architecture & Database Rules (`backend/`)

1. **Mongoose `.lean()` for Read Queries:**  
   Always chain `.lean()` onto queries in Express controllers (`Blog.find(...).lean()`). This skips heavy Mongoose document hydration and reduces memory overhead.
2. **Compound & Text Indexes:**  
   Maintain indexes on `Blog` (`{ isPublished: 1, createdAt: -1 }`, `{ isPublished: 1, category: 1, createdAt: -1 }`, and text index on `{ title: "text", subTitle: "text" }`).
3. **Guarded Mutations:**  
   Never run batch write operations (e.g. automatic backfills) on read endpoints unless a document is actually missing required data.

---

## 11. Production Verification Checklist

Before deploying or finalizing any feature:

- [ ] **Type & Build Check:** `npm run build` in `frontend-next` succeeds without TypeScript or lint errors.
- [ ] **Consistent Helpers:** All date formatting uses `formatDate()`, classes use `cn()`, and API calls use `@/services`.
- [ ] **Shared Components:** Tabular data uses `<AdminDataTable />`, buttons use `<Button />`, toasts use `react-toastify`.
- [ ] **Data Freshness:** Client navigation and window focus update data smoothly without requiring hard reloads.
- [ ] **Responsive Design:** Tested on mobile (`360px`), tablet (`768px`), and desktop (`1280px+`).
- [ ] **Theme Support:** Clean appearance in both Light and Dark modes.
- [ ] **SEO & OpenGraph:** Proper page title, description, canonical link, and single `<h1>`.
