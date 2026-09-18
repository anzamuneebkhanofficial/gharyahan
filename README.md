# GharYahan - Hyperlocal Rental Marketplace in Pakistan 🏡🇵🇰

Welcome to **GharYahan**, a modern, high-performance web application designed for browsing and reserving curated rental spaces in Pakistan. Built with cutting-edge technologies to provide a seamless and premium user experience.

## ✨ Features

- **Hyperlocal Focus**: Tailored specifically for the Pakistani rental market (e.g., Lahore).
- **Premium UI/UX**: Designed with modern aesthetics, vibrant colors, and dynamic micro-animations.
- **Fast & Responsive**: Built on Next.js App Router for optimal performance across all devices.
- **Secure Authentication**: Integrated with Supabase for robust user management.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS (v4), Vanilla CSS
- **State Management**: Zustand
- **Form Handling & Validation**: React Hook Form, Yup
- **Backend/BaaS**: Supabase
- **Testing**: Playwright

## 🛠️ Local Development

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anzamuneebkhanofficial/gharyahan.git
   cd gharyahan
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Copy the provided example environment file to create your local environment:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Fill in the required Supabase credentials in your `.env.local`.*

4. **Start the Development Server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## 🌍 Production Deployment

When deploying (e.g., on Vercel), ensure you configure the following environment variables in your hosting dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (Set to your live domain, e.g., `https://www.gharyahan.pk`)
- `ADMIN_EMAIL` & `ADMIN_PASSWORD` (Server-only secrets)

*Important: Do not forget to configure the Site URL and Redirect URLs in your Supabase Dashboard under Authentication settings.*

## 📄 License

This project is proprietary and confidential. All rights reserved.
