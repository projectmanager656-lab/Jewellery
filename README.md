# Shree Jewellers

A React and TypeScript jewellery catalogue and enquiry website. Customers browse products and contact the showroom directly. There is no cart, checkout, online ordering, or payment flow.

## Local development

```sh
npm install
cp .env.server.example .env.server
```

Fill the backend-only settings described below, then run the API and website in separate terminals:

```sh
npm run server:dev
npm run dev
```

Vite proxies `/api` to the Express server at `http://localhost:4000`. The React app uses only this API for catalogue data and admin authentication/management. It contains no MongoDB URI, JWT secret, or Cloudinary credentials.

## Temporary static demo

Build the website with the self-contained illustrative catalogue, without starting Express or connecting to MongoDB:

```sh
npm run build:demo
npm run preview -- --host 0.0.0.0
```

For static hosting, set the provider's build command to `npm run build:demo` and publish `dist/`. Do not use the regular `npm run build` command for this demo deployment: it intentionally leaves demo mode off and builds the MongoDB-backed production storefront. The Match Finder and every other customer catalogue page share the catalogue hook, so a bundle built in regular mode will request the API on any of those pages.

Deploy the generated `dist/` folder to any static host. The committed `.env.demo` contains only the public `VITE_DEMO_MODE=true` switch. Demo products are sourced from `src/data/products.ts` through `src/data/demo-catalogue.ts`; they are shown with a persistent notice that their product details and prices are illustrative and unverified. The static demo intentionally does not offer Admin login; admin authentication remains available only through the separately configured MongoDB backend. The project currently has no local product image files, so the illustrative catalogue uses its existing remote Unsplash image URLs.

Set the approved showroom phone and WhatsApp numbers in `src/config.ts` before deployment if those direct contact links should be active. No contact details are fabricated.

## MongoDB Atlas setup

1. Create an Atlas cluster and a database user with read/write access only to the intended database. Add the development machine's current public IP under **Network Access**.
2. Copy `.env.server.example` to `.env.server`. Set `MONGODB_URI` to Atlas's driver connection string and `MONGODB_DB_NAME` to the database name. URL-encode special characters in the database user's password.
3. Generate a unique `JWT_SECRET` of at least 32 characters (for example, `openssl rand -base64 48`). Keep all values in `.env.server`; never put them in a `VITE_` variable.
4. Set `CLIENT_ORIGIN` to the exact website origin. The default is `http://localhost:5173`.
5. Optional but required for admin image uploads: create a Cloudinary account and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env.server`. The backend stores authenticated images and signed delivery URLs. Do not put Cloudinary credentials in the frontend.
6. Create the first admin after the API environment and Atlas access are configured: `npm run admin:create`. Run it from an interactive terminal; it asks for an email and twice-entered password without echoing the password. Passwords are hashed with bcrypt; there is no public registration route.

The API refuses to start without `MONGODB_URI` and a sufficiently long `JWT_SECRET`. It connects to Atlas before listening. `/api/health` is available after startup. A real connection and catalogue query have not been verified in this workspace because `.env.server` and Atlas credentials are not configured here.

## Catalogue data

Existing entries in `src/data/products.ts` are illustrative samples with example names, specifications, Unsplash photography, and prices. They are not verified inventory or current prices. To prepare them for review in MongoDB, run the safe importer:

```sh
npm run catalogue:import-samples
```

This is a dry run and makes no database connection or writes. It reports the number of existing sample entries. To import them after Atlas is configured, explicitly run:

```sh
npm run catalogue:import-samples -- --apply
```

The importer creates unpublished drafts only, preserves any existing product with the same code, and tags Unsplash images as external references so deletion never calls Cloudinary for those URLs. Review product details, replace sample photos with approved business images, and verify each price and availability in Admin before publishing. No sample entries are imported or published automatically.

Products, categories, and image metadata use the Mongoose models under `server/models`. Public routes expose published products and categories. Product listing supports search, category, price, featured/new/bestseller filters, sorting, and pagination. The customer app retains its existing category, search, price, and sorting controls. Admin routes use an HttpOnly session cookie, hashed passwords, origin checks, rate-limited login, server-side authorization, and field validation.

## Business and customer features

Set business contact details and currency in `src/config.ts`. Phone, WhatsApp, address, opening hours, and social links remain blank until supplied. The About page and enquiry text should be reviewed against approved business information before launch. Wishlist and recently viewed IDs remain in browser `localStorage`; comparison and Match Finder continue to use the loaded MongoDB catalogue.

The appointment and custom-design forms currently prepare a message for WhatsApp or copying; they do not persist submissions. The custom design reference image is not uploaded automatically.

## Checks

```sh
npm run typecheck
npm run test:backend
npm run build
```

Backend tests use model stubs and do not connect to Atlas. A passing test suite does not establish that a real Atlas cluster or Cloudinary account is configured.

## Legacy Supabase artifacts

Supabase is no longer used by the active frontend or Admin Panel. Any existing `.env.local` values and local Supabase migration files are left untouched; no remote Supabase data, credentials, or settings were accessed or changed. The historical migration has not been applied as part of this MongoDB integration.
