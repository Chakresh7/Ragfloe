# RagFloe Phase 2 — Organization, Projects & Workspace UI

## Goal
Build ONLY the frontend UI for:
1. Organizations
2. Projects
3. Project Workspace

Use Supabase as the primary UI inspiration: clean, dense, developer-focused, sidebar navigation, subtle borders, compact controls. Do not copy branding or exact proprietary layouts.

## 1. Organizations Page

Route: `/organizations`

Layout:
- Minimal top navigation
- RagFloe logo/name
- Search organizations
- `+ New organization` button
- Responsive organization card/grid list

Each organization card shows:
- Organization name
- Plan/status
- Project count
- Organization icon/avatar

Interactions:
- Search
- Select organization
- Create organization
- Empty state

Example:

Your Organizations
[ Search organizations ]              [ + New organization ]

[ Acme AI — 3 projects ] [ Research Lab — 2 projects ]
[ Chakri's Org — 5 projects ]

## 2. Projects Page

Route: `/organizations/[organizationId]/projects`

Top context:
- RagFloe
- Organization switcher
- Organization name
- User menu

Page:
- `Projects` heading
- Search
- Status filter
- Sort control
- Grid/list toggle
- `+ New project`

Project cards show:
- Project name
- Short description
- Status
- Last updated
- Project icon
- Overflow menu

Interactions:
- Search
- Filter
- Sort
- Create project
- Open project
- Archive/delete UI placeholder

Example:

Acme AI

Projects
[ Search ] [ Status ] [ Sort ] [ Grid/List ] [ + New project ]

[ Legal AI ]       [ HR Assistant ]       [ Research AI ]

## 3. Project Workspace

Route: `/organizations/[organizationId]/projects/[projectId]`

This is the main RagFloe application shell.

Use a Supabase-style developer dashboard structure:

Sidebar:
- Overview
- Knowledge
- RAG Architecture
- Retrieval
- Prompts
- Playground
- Evaluation
- API
- Usage
- Settings

Top bar:
- Organization switcher
- Project switcher/name
- Breadcrumb/context
- Search/command button
- User menu

For now, only build the workspace shell and Overview page.

## Workspace Overview

Show:
- Project name
- Project description
- Project status
- Knowledge/document count placeholder
- Queries placeholder
- Usage placeholder
- Recent activity placeholder
- Quick actions

Quick actions:
- Add Knowledge
- Configure RAG
- Open Playground
- View API

Future modules must NOT be implemented yet.

## Design Rules

- Match the existing RagFloe login page style.
- Clean white/dark theme.
- Subtle 1px borders.
- Compact spacing.
- Minimal shadows.
- 6–10px radius.
- Geist/Inter typography.
- Geist Mono/JetBrains Mono for technical values.
- Lucide icons.
- Use shadcn/ui where appropriate.
- Consistent buttons, inputs, cards, badges, tables and dropdowns.
- No excessive gradients or animations.
- Desktop-first, responsive where practical.

## Scope Guardrails

DO NOT implement:
- Organization backend/API
- Members backend
- Roles backend
- Projects backend
- RLS
- Documents
- Embeddings
- Qdrant
- RAG pipelines
- Prompt generation
- Evaluation logic
- API key functionality

Use realistic mock/local data for the UI until Phase 2 backend integration begins.

## Agent Instructions

1. Inspect the existing frontend first.
2. Preserve working Google/GitHub authentication.
3. Reuse the existing design system/components.
4. Do not rewrite unrelated pages.
5. Build the three UI levels in order:
   Organizations → Projects → Workspace.
6. Make navigation between the three levels work with mock data.
7. Keep future navigation items visible but clearly non-functional/placeholder where necessary.
8. Run lint and TypeScript checks.
9. Report changed files and remaining backend work.

## Definition of Done

Organizations UI works → Projects UI works → Project Workspace opens → Sidebar/topbar work → visual system is consistent → authentication remains functional.
