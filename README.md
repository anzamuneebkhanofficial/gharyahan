# GharYahan (گھر یہاں) — Hyperlocal Rental Marketplace in Pakistan 🏡🇵🇰

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Turbopack](https://img.shields.io/badge/Bundler-Turbopack-0070F3)](https://turbo.build/)

> **GharYahan** is a modern, high-performance web platform designed to solve the rental search crisis in Pakistan (starting with Lahore). It connects verified landlords directly with families and working professionals—eliminating street brokers, one-month commission fees, and hidden utility surprises.

---

## 🌟 Key Features

- **Direct WhatsApp & Phone Contact**: Reach property owners directly with a single click. Zero broker commission or agency middleman charges.
- **Utility Transparency Checklist**: Every listing clearly displays independent electricity meters, gas connections, water supply, and drainage status.
- **Real-Time Deal Status**: Listings update dynamically from `Available` ➔ `In Deal` ➔ `Sealed` to prevent unnecessary inquiries on occupied homes.
- **Hyperlocal Neighborhood Filters**: Search by specific areas, portions (upper/lower), houses, flats, and bachelor/family rooms across Lahore (Gulberg, DHA, Johar Town, Model Town, Singhpura, etc.).
- **Interactive Rent Affordability Calculator**: Helps tenants calculate recommended rent brackets based on their monthly household income.
- **Landlord Listing Portal**: Landlords can list properties, manage multi-photo galleries, set vacancy dates, and draft lightweight tenancy agreements.
- **Tenant Saved Favorites**: Instant one-click saving with optimistic UI updates.
- **Master Platform Admin Dashboard**: Centralized oversight of users, listings, inquiries, and platform metrics.
- **Strict Row Level Security (RLS)**: 100% of database tables are protected with granular PostgreSQL access policies.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Modern CSS Tokens |
| **Backend & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + PostgREST + Auth + Storage) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Form Handling** | [React Hook Form](https://react-hook-form.com/) + [Yup](https://github.com/jquense/yup) |
| **Icons & Media** | [Lucide React](https://lucide.dev/), Swiper, Video.js |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |

---

## 📁 Project Structure

```text
Rent_App/
├── public/                 # Static assets, logos, and placeholders
├── src/
│   ├── app/                # Next.js 16 App Router pages & API routes
│   │   ├── (auth)/         # login, signup, forgot-password, reset-password
│   │   ├── admin/          # Platform administrator dashboard & profile
│   │   ├── api/            # Server-side API handlers (admin-login, geocode)
│   │   ├── auth/callback/  # Supabase email verification code exchange
│   │   ├── dashboard/      # Landlord portal (listings, new listing, edit)
│   │   ├── favorites/      # Tenant saved properties page
│   │   ├── listing/[id]/   # Dynamic property detail page
│   │   ├── profile/        # User profile settings
│   │   ├── search/         # Filterable property search page
│   │   ├── tenant/         # Tenant dashboard & agreements
│   │   ├── layout.jsx      # Root layout with SEO metadata & schema
│   │   ├── page.jsx        # Landing homepage with dynamic listings
│   │   ├── robots.js       # Search engine & AI crawler policies
│   │   └── sitemap.js      # Dynamic XML sitemap
│   ├── components/         # Reusable UI & section components
│   │   ├── landing/        # Hero, Neighborhoods, Trust, Reviews, Calculator
│   │   ├── listings/       # PropertyCard, filter widgets, skeletons
│   │   ├── shared/         # Navbar, Footer, LocationPickerModal
│   │   └── ui/             # Buttons, inputs, modals, form skeletons
│   ├── lib/                # Utility helpers & Supabase client/server singletons
│   └── stores/             # Zustand stores (properties, auth, favorites)
├── supabase/
│   └── migrations/         # PostgreSQL schema, triggers, and RLS policies
├── .env.example            # Environment variable template
└── package.json            # Project manifest & dependency locks
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `pnpm -v` (version 9 or 10 recommended)
- A free **Supabase** account

### 2. Clone the Repository
```bash
git clone https://github.com/anzamuneebkhanofficial/gharyahan.git
cd gharyahan
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Configure Environment Variables
Copy the `.env.example` file to create your local `.env.local`:
```bash
cp .env.example .env.local
```
Open `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

ADMIN_EMAIL=admin@gharyahan.pk
ADMIN_PASSWORD=YourSecureAdminPassword123!
ADMIN_ROLE=admin
```

### 5. Set Up Database Schema
1. Open your **Supabase Dashboard** ➔ **SQL Editor**.
2. Run the migration script in `supabase/migrations/001_initial_schema.sql`.
   * This creates all tables (`profiles`, `locations`, `properties`, `property_images`, `favorites`, `agreements`), spatial extensions, and Row Level Security policies.
3. In **Supabase ➔ Storage**, ensure a public bucket named **`avatars`** exists.

### 6. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploying to Vercel (Production)

Deploying GharYahan on Vercel takes less than 3 minutes:

### 1. Connect GitHub Repository to Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New..." ➔ "Project"**.
2. Import your GitHub repository (`gharyahan`).
3. Framework Preset will be automatically detected as **Next.js**.

### 2. Add Environment Variables in Vercel
Before clicking Deploy, expand **Environment Variables** and enter:

| Variable | Recommended Production Value |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon/Public API Key |
| `NEXT_PUBLIC_APP_URL` | Your production Vercel domain (`https://gharyahan.vercel.app` or custom domain) |
| `ADMIN_EMAIL` | `admin@gharyahan.pk` (Server secret for admin login) |
| `ADMIN_PASSWORD` | Strong password for admin login |
| `ADMIN_ROLE` | `admin` |

### 3. Configure Supabase Dashboard for Production
1. In your **Supabase Dashboard**, navigate to **Authentication ➔ URL Configuration**.
2. Set **Site URL** to your Vercel URL (`https://your-project.vercel.app`).
3. Under **Redirect URLs**, add:
   - `https://*.vercel.app/**`
   - `https://your-custom-domain.com/**`
   - `http://localhost:3000/**`
4. Click **Save**.

---

## 🔒 Security & Guardrails

- **Zero Client Secrets**: Service role keys are never included in the client bundle. Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed.
- **Row Level Security (RLS)**: Enforced across all tables. Users can only edit or delete their own listings, favorites, or profile data.
- **Input Validation**: Client and server validation powered by Yup schemas to prevent malformed submissions.
- **HTTP-Only Cookies**: Protected admin sessions leverage `SameSite=lax` secure HTTP-only cookies.

---

## 📄 License & Attribution

This project was built for the Pakistani rental market.  
Developed by **Muhammad Anza Muneeb Khan** & GharYahan Team. All rights reserved.
