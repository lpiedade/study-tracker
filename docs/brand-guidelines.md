# Brand Guidelines

This document defines the Study Tracker brand baseline for product UI, content, and assets.

## Brand Foundation

- Product name: `Study Tracker` (preferred) or `StudyTracker` (UI title where compact display is needed).
- Positioning: local-first study planning and progress tracking for students.
- Brand attributes:
  - Clear
  - Focused
  - Reliable
  - Encouraging

## Voice and Tone

- Use direct, practical language.
- Prefer action-first wording in UI labels and buttons.
- Keep copy short and specific (especially in forms and empty states).
- Avoid playful or informal phrasing that weakens clarity.

Examples:
- Preferred: `Add Course`, `No lessons planned.`, `Log Session`
- Avoid: `Let's get learning!`, `Oopsie, nothing here!`

## Naming Rules

- Use title case for page names and major navigation labels.
- Use sentence case for helper text and descriptions.
- Keep learning domain terms consistent:
  - `Course` -> parent grouping
  - `Subject` -> belongs to a course
  - `Lesson` -> planned study unit
  - `Session` -> logged study activity

## Visual Identity

### Logo and Mark

- Primary app heading combines `GraduationCap` icon + `StudyTracker` wordmark.
- Keep icon and wordmark together in navigation headers unless space is constrained.
- Minimum clear space: at least the icon width on all sides.
- Do not stretch, recolor per screen, or apply glow/shadow effects to the mark in product UI.

### Color System

Use Tailwind tokens consistently:

| Role | Light | Dark | Notes |
| --- | --- | --- | --- |
| Background (app) | `gray-50` `#f9fafb` | `slate-950` `#020617` | Main canvas |
| Surface (cards/sidebar) | `white` `#ffffff` | `slate-900` `#0f172a` | Panels and containers |
| Border | `gray-200` `#e5e7eb` | `slate-800` `#1e293b` | Dividers and outlines |
| Primary text | `gray-900` `#111827` | `slate-100` `#f1f5f9` | High emphasis text |
| Secondary text | `gray-500` `#6b7280` | `slate-400` `#94a3b8` | Supporting content |
| Brand accent | `indigo-600` `#4f46e5` | `indigo-400` `#818cf8` | Navigation, primary action |
| Brand accent hover | `indigo-700` `#4338ca` | `indigo-300` `#a5b4fc` | Hover/focus states |
| Success | `green-500` `#22c55e` | `green-400` `#4ade80` | Completed states |
| Warning | `yellow-500` `#eab308` | `yellow-400` `#facc15` | Cautionary indicators |
| Error | `red-500` `#ef4444` | `red-400` `#f87171` | Validation and destructive actions |

Guidelines:
- Indigo is the only primary brand accent.
- Do not introduce additional “brand” colors without updating this file first.
- Reserve red for destructive/error contexts only.

### Typography

- Base family: Tailwind default sans stack.
- Page titles: `text-3xl font-bold`
- Section headings: `text-lg font-semibold`
- Body copy: `text-sm` or `text-base` depending on density
- Data labels and metadata: `text-xs` with reduced emphasis

### Shape, Spacing, and Elevation

- Preferred corner radius:
  - cards/forms: `rounded-xl`
  - controls/buttons: `rounded-lg`
  - pills/badges: `rounded` or `rounded-full` where meaningful
- Spacing baseline:
  - use Tailwind spacing scale in `4px` increments
  - prefer `p-6` for card content
- Elevation:
  - default: `shadow-sm`
  - interactive emphasis: `hover:shadow-md`

## Component Usage

- Primary action buttons: `bg-indigo-600 text-white hover:bg-indigo-700`
- Neutral controls: gray/slate surfaces with clear hover contrast.
- Empty states: short factual message + immediate next action.
- Tables/lists: consistent border and divider tokens from the color system.

## Accessibility Standards

- Meet WCAG 2.1 AA contrast for text and interactive controls.
- Provide visible focus states for keyboard navigation.
- Do not use color as the only signal; pair with text or icon.
- Ensure interactive targets are at least `40x40` CSS pixels.
- Keep motion subtle and avoid non-essential continuous animation.

## Assets and File Management

- Store brand imagery in `docs/assets/branding/` (create when first asset is added).
- Name assets with lowercase kebab-case (example: `study-tracker-wordmark.svg`).
- Prefer SVG for logos/icons and PNG only when raster is required.

## Governance

- Any change to core brand tokens (name, accent color, logo rules, typography baseline) must update this document.
- UI changes should align with this guideline and related docs:
  - `docs/conventions.md`
  - `docs/architecture.md`
