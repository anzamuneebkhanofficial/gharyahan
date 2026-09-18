# Rent_App - Agent Guidelines

## Overview
Rent_App is a modern, high-performance web application for browsing and reserving curated rental spaces.

## Tech Stack
- Frontend: Nextjs16 app router latest
- Design System: 
- Testing: Playwright (via webapp-testing skill)

## Commands
- Start dev server: ``
- Run tests: `

## Strict Project Rules (Guardrails)
1. Do not use generic AI color palettes (no warm cream #F4F1EA or acid green). Follow the `frontend-design` guidelines.
2. Maintain responsive layouts down to mobile (375px width).
3. Do not add heavy external CSS libraries (e.g. Bootstrap/Tailwind) unless explicitly asked.
4. Keep all business logic separated from UI rendering.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
