# RagFloe Phase 3A — Knowledge & Connectors

## Goal

Build the Knowledge management section inside the existing RagFloe Project Workspace.

The purpose is to allow developers to connect external data sources, browse/select data, and prepare it for ingestion into RagFloe.

Existing Phase 1 and Phase 2 functionality is working end-to-end. DO NOT rewrite authentication, organizations, members, roles, projects, RLS, or existing workspace UI.

---

## Product Structure

Inside a Project:

```text
Project
├── Overview
├── Knowledge
│   ├── Overview
│   ├── Connectors
│   ├── Documents
│   └── Settings
├── RAG
├── Prompts
├── Playground
├── Evaluation
└── API
````

Knowledge is the parent module.

Connectors are responsible for connecting external data sources.

Documents represent data that has been imported into RagFloe.

---

## Connectors — V1

Implement these four connectors:

1. Google Drive
2. Notion
3. GitHub
4. File Upload

Do NOT implement Slack, Jira, Dropbox, OneDrive, databases, REST APIs, webhooks, etc. yet.

The architecture must allow additional connectors later.

---

# Knowledge Overview

Route:

```text
/projects/{project_id}/knowledge
```

Create a clean developer-focused dashboard.

Display:

```text
Knowledge

Manage the data sources that power this project.

[ Add Connector ]

Sources
────────────────────────────────────

Google Drive       Connected
Notion             Connected
GitHub             Not Connected
File Upload        Available

Documents          24
Processing          3
Failed              1
```

Include useful empty/loading/error states.

Do not use fake production data once backend integration begins.

---

# Connectors Page

Route:

```text
/projects/{project_id}/knowledge/connectors
```

Display connector cards.

Each card contains:

* Icon
* Connector name
* Description
* Connection status
* Connect / Manage button

Connectors:

### Google Drive

Description:
"Import documents and files from Google Drive."

### Notion

Description:
"Import pages and knowledge from your Notion workspace."

### GitHub

Description:
"Import repositories, documentation, Markdown, and source files."

### File Upload

Description:
"Upload documents directly from your computer."

UI states:

```text
Not Connected
Connecting
Connected
Error
```

---

# Connector Flow

Every external connector must follow this conceptual flow:

```text
Connect Account
      ↓
OAuth / Authorization
      ↓
Connected Account
      ↓
Browse Source
      ↓
Select Data
      ↓
Import Selected
      ↓
RagFloe Ingestion Pipeline
```

Do NOT implement provider-specific ingestion logic directly inside UI components.

Create a reusable connector abstraction.

Example:

```text
Connector
├── id
├── provider
├── name
├── description
├── status
├── account
└── capabilities
```

---

# Google Drive UX

Route:

```text
/projects/{project_id}/knowledge/connectors/google-drive
```

Initial state:

```text
Google Drive

Connect your Google Drive account to import knowledge.

[ Connect Google Drive ]
```

After connection:

```text
Google Drive
Connected ✓
Account: user@example.com

Search files...

Folders
📁 Engineering
📁 Product
📁 Documentation

Files
☐ API Documentation.pdf
☐ Architecture.docx
☐ Product Requirements.docx

[ Import Selected ]
```

Users must be able to select specific files/folders.

Do not automatically import the entire Drive.

---

# Notion UX

Route:

```text
/projects/{project_id}/knowledge/connectors/notion
```

Initial:

```text
Notion

Connect your Notion workspace.

[ Connect Notion ]
```

After connection:

```text
Notion
Connected ✓

Workspace: My Workspace

Pages
☐ Documentation
☐ API Reference
☐ Product Knowledge
☐ Engineering

[ Import Selected ]
```

Users select the pages/data they want.

---

# GitHub UX

Route:

```text
/projects/{project_id}/knowledge/connectors/github
```

Initial:

```text
GitHub

Connect GitHub to import repository knowledge.

[ Connect GitHub ]
```

After connection:

```text
GitHub
Connected ✓

Repositories

☐ company/docs
☐ company/backend
☐ company/frontend

Repository configuration:

Branch: main

Include:
☑ README
☑ Markdown
☑ Documentation
☐ Source Code

[ Import Selected ]
```

Do not automatically import every repository.

---

# File Upload UX

Route:

```text
/projects/{project_id}/knowledge/connectors/files
```

Provide:

```text
Upload Files

Drag and drop files here

or

[ Browse Files ]

Supported:
PDF
DOCX
TXT
JSON
CSV
```

Display selected files before upload.

Each file should show:

```text
filename
size
type
remove
```

Then:

```text
[ Upload & Import ]
```

---

# Documents

Route:

```text
/projects/{project_id}/knowledge/documents
```

Display all imported documents regardless of source.

Table:

```text
Document
Source
Type
Status
Updated
Actions
```

Example:

```text
API Documentation.pdf
Google Drive
PDF
Ready
Aug 11

README.md
GitHub
Markdown
Processing
Aug 11

Product Knowledge
Notion
Page
Ready
Aug 10
```

Statuses:

```text
Queued
Processing
Ready
Failed
```

Filters:

```text
All
Google Drive
Notion
GitHub
Files
```

---

# Important Architecture

The UI must treat every source as a connector.

```text
Google Drive ──┐
Notion ────────┤
GitHub ────────┤
File Upload ───┘
       ↓
     Source
       ↓
    Document
       ↓
   Processing
       ↓
    Chunking
       ↓
   Embeddings
       ↓
     Qdrant
```

The connector only answers:

> "How do we get the user's data?"

The ingestion pipeline answers:

> "How do we transform that data into RagFloe knowledge?"

Keep these responsibilities separate.

---

# Backend Preparation

Do not implement the complete ingestion pipeline in this task.

Prepare the architecture for future backend integration.

Suggested models:

```text
ConnectorAccount
KnowledgeSource
Document
```

Conceptually:

```text
Project
  ↓
ConnectorAccount
  ↓
KnowledgeSource
  ↓
Document
```

Every record must belong to the correct project/organization.

Never trust project IDs supplied by the frontend without backend authorization.

---

# Security

External OAuth credentials/tokens must NEVER be exposed to the frontend unnecessarily.

Do not store provider access tokens in localStorage.

Do not expose:

* Supabase service-role key
* database credentials
* GitHub client secrets
* Google client secrets
* Notion secrets

The frontend communicates with the backend using the existing:

```text
Authorization: Bearer <Supabase JWT>
```

Reuse the existing Phase 1 authentication.

Reuse Phase 2 project authorization/RLS.

---

# Frontend Architecture

Use the existing frontend stack and design system.

Do not introduce another UI framework.

Create reusable components:

```text
components/knowledge/
├── knowledge-overview
├── connector-card
├── connector-grid
├── connector-status
├── source-browser
├── document-table
├── document-status
└── empty-state
```

Keep provider-specific UI isolated.

Do not duplicate connector-card logic.

---

# Design Requirements

The interface should feel similar to:

* Supabase
* Vercel
* Linear

Use the existing RagFloe theme.

Prioritize:

* clean developer dashboard
* compact navigation
* clear hierarchy
* subtle borders
* consistent spacing
* clear status indicators
* keyboard accessibility
* responsive design
* loading states
* empty states
* error states

Do NOT copy proprietary UI code or assets.

---

# Navigation

Inside the Project Workspace:

```text
Knowledge
  Overview
  Connectors
  Documents
  Settings
```

The user should always know:

```text
Current Organization
    ↓
Current Project
    ↓
Knowledge
    ↓
Current Connector
```

---

# API Preparation

Prepare frontend API functions for future backend integration:

```text
GET    /api/v1/projects/{project_id}/knowledge
GET    /api/v1/projects/{project_id}/connectors
GET    /api/v1/projects/{project_id}/documents

POST   /api/v1/projects/{project_id}/connectors/{provider}/connect
POST   /api/v1/projects/{project_id}/sources/import

DELETE /api/v1/projects/{project_id}/connectors/{provider}
DELETE /api/v1/documents/{document_id}
```

Do not invent backend behavior that does not exist.

If the backend endpoints are not implemented yet, isolate mock/adaptor logic so replacing it later is easy.

---

# Agent Guardrails

1. Inspect the existing Phase 1 and Phase 2 implementation first.
2. Do not rewrite authentication.
3. Do not rewrite organizations/projects.
4. Do not change existing RLS.
5. Preserve the current project workspace design.
6. Reuse existing components and design tokens.
7. Do not add unnecessary dependencies.
8. Do not implement embeddings yet.
9. Do not implement Qdrant yet.
10. Do not implement chunking yet.
11. Do not implement RAG yet.
12. Do not implement prompts yet.
13. Do not implement evaluation yet.
14. Do not expose OAuth secrets.
15. Keep connector architecture extensible.
16. Run TypeScript, lint, and existing tests.

---

# Definition of Done

The user can:

```text
Open Project
    ↓
Open Knowledge
    ↓
Open Connectors
    ↓
See:
    Google Drive
    Notion
    GitHub
    File Upload
    ↓
Connect an account / upload files
    ↓
Browse available data
    ↓
Select required data
    ↓
Click Import
    ↓
See imported documents under Documents
```

For this phase, the UI and architecture must be production-quality.

Actual provider OAuth + data ingestion can be implemented as the next backend/integration step.

# Final Output

After implementation, report:

* Files created
* Files modified
* Routes created
* Components created
* API functions created
* Database changes, if any
* Mock data used, if any
* Remaining connector backend work
* Tests performed
* Any issues discovered

```
```