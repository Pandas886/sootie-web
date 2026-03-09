# Landing Product Showcase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a persistent product screenshot showcase to the Sootie web landing page hero without changing the existing information architecture.

**Architecture:** Rework the hero section in `src/app/landing/page.tsx` from a centered single-column stack into a responsive two-column layout. Reuse an existing desktop screenshot from the repository, present it inside a styled showcase frame, and keep the rest of the landing page sections unchanged.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS 4, local CSS module-style global file at `src/app/landing/landing.css`

---

### Task 1: Add showcase asset

**Files:**
- Create: `public/landing-product-showcase.png`

**Step 1: Add the screenshot asset**

Copy the existing desktop screenshot from `../SootieAI/docs/manuals/screenshots/04-01-home-new-task.png` to `public/landing-product-showcase.png`.

**Step 2: Verify the asset is reachable**

Run: `file public/landing-product-showcase.png`
Expected: PNG image metadata is printed with no error.

### Task 2: Rebuild the hero layout

**Files:**
- Modify: `src/app/landing/page.tsx`

**Step 1: Update the hero structure**

Replace the current centered logo stack with a responsive grid:
- left column: badge, headline, description, CTA buttons, supporting metrics
- right column: product showcase card with the screenshot

**Step 2: Keep copy and CTAs stable**

Preserve the existing headline intent, download actions, and positioning of the rest of the landing page below the hero.

### Task 3: Add showcase styling

**Files:**
- Modify: `src/app/landing/landing.css`

**Step 1: Add showcase frame styles**

Define classes for:
- hero eyebrow badge
- product showcase shell
- ambient background glow
- floating capability pills

**Step 2: Keep motion restrained**

Reuse the existing float animation only where it helps the composition and avoid excessive motion on the screenshot itself.

### Task 4: Verify behavior

**Files:**
- Verify: `src/app/landing/page.tsx`
- Verify: `src/app/landing/landing.css`

**Step 1: Run lint**

Run: `npm run lint`
Expected: command exits successfully.

**Step 2: Run production build**

Run: `npm run build`
Expected: Next.js production build completes successfully.
