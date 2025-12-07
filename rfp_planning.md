# AI-Powered RFP Management System - Complete Guide

## 📋 REQUIREMENTS BREAKDOWN

### Functional Requirements (Must Have)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **RFP Creation via NL** | User types natural language → AI converts to structured RFP | 🔴 Critical |
| 2 | **View RFPs** | List all RFPs, view details of each | 🔴 Critical |
| 3 | **Vendor Management** | Add, edit, delete, list vendors | 🔴 Critical |
| 4 | **Send RFP via Email** | Select vendors → Send RFP email | 🔴 Critical |
| 5 | **Receive Vendor Response** | Inbound email webhook/simulation | 🔴 Critical |
| 6 | **Parse Vendor Response** | AI extracts structured data from messy email | 🔴 Critical |
| 7 | **Compare Proposals** | Side-by-side comparison view | 🔴 Critical |
| 8 | **AI Recommendation** | AI scores and recommends best vendor | 🔴 Critical |

### Non-Functional Requirements

| Requirement | Notes |
|-------------|-------|
| Single-user | No auth needed |
| Persistent data | Must survive server restart |
| Real email integration | At least sending must work |
| Modern web stack | React + Node.js preferred |

### Out of Scope (Don't Build)

- ❌ User authentication
- ❌ Multi-tenant support
- ❌ Real-time collaboration
- ❌ Email tracking (opens/clicks)
- ❌ RFP versioning/approvals

---

## 🛠️ RECOMMENDED TECH STACK

### Frontend
```
React 18          - UI framework
TypeScript        - Type safety
Vite              - Build tool (faster than CRA)
Tailwind CSS      - Styling
shadcn/ui         - Pre-built components
React Router      - Navigation
Axios/Fetch       - API calls
React Query       - Server state management (optional)
```

### Backend
```
Node.js 18+       - Runtime
Express.js        - Web framework
TypeScript        - Type safety
Prisma            - ORM (database queries)
Zod               - Request validation
```

### Database
```
PostgreSQL        - Primary database
(or SQLite)       - Simpler alternative for demo
```

### AI Integration
```
OpenAI API        - GPT-4o-mini (cost-effective)
  OR
Anthropic API     - Claude 3.5 Sonnet
```

### Email Service
```
Resend            - For sending emails (simple, free tier)
  OR
Nodemailer        - With Gmail SMTP (free)

For Receiving:
Webhook endpoint  - To receive parsed emails
  OR
Simulation mode   - Manual paste for demo
```

### Dev Tools
```
npm/pnpm          - Package manager
ESLint + Prettier - Code formatting
dotenv            - Environment variables
```

---

## 📁 PROJECT STRUCTURE

```
rfp-management-system/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── rfp/
│   │   │   │   ├── RFPCard.tsx
│   │   │   │   ├── RFPForm.tsx
│   │   │   │   └── RFPDetail.tsx
│   │   │   ├── vendor/
│   │   │   │   ├── VendorCard.tsx
│   │   │   │   ├── VendorForm.tsx
│   │   │   │   └── VendorSelect.tsx
│   │   │   └── proposal/
│   │   │       ├── ProposalCard.tsx
│   │   │       ├── ComparisonTable.tsx
│   │   │       └── AIRecommendation.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Overview page
│   │   │   ├── RFPList.tsx         # All RFPs
│   │   │   ├── RFPCreate.tsx       # Create new RFP
│   │   │   ├── RFPDetail.tsx       # Single RFP + proposals
│   │   │   ├── Vendors.tsx         # Vendor management
│   │   │   └── Compare.tsx         # Proposal comparison
│   │   │
│   │   ├── services/
│   │   │   └── api.ts              # All API calls
│   │   │
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── rfp.controller.ts
│   │   │   ├── vendor.controller.ts
│   │   │   └── proposal.controller.ts
│   │   │
│   │   ├── services/
│   │   │   ├── ai.service.ts       # OpenAI integration
│   │   │   ├── email.service.ts    # Email sending
│   │   │   └── parser.service.ts   # Response parsing
│   │   │
│   │   ├── routes/
│   │   │   ├── rfp.routes.ts
│   │   │   ├── vendor.routes.ts
│   │   │   └── proposal.routes.ts
│   │   │
│   │   ├── prompts/
│   │   │   ├── rfp-parser.ts       # Prompt for NL → RFP
│   │   │   ├── proposal-parser.ts  # Prompt for email → proposal
│   │   │   └── comparison.ts       # Prompt for comparison
│   │   │
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   │
│   │   ├── utils/
│   │   │   └── helpers.ts
│   │   │
│   │   └── app.ts                  # Express app setup
│   │
│   ├── prisma/
│   │   ├── schema.prisma           # Database models
│   │   └── seed.ts                 # Sample data
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── README.md
├── .gitignore
└── docker-compose.yml              # Optional: PostgreSQL setup
```

---

## 📊 DATA MODELS

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // or "sqlite"
  url      = env("DATABASE_URL")
}

model Vendor {
  id            String     @id @default(uuid())
  name          String
  email         String     @unique
  contactPerson String
  phone         String?
  category      String[]
  notes         String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  proposals     Proposal[]
  rfpVendors    RFPVendor[]
}

model RFP {
  id              String      @id @default(uuid())
  title           String
  rawInput        String      // Original natural language
  status          RFPStatus   @default(DRAFT)
  
  // Structured data (JSON)
  items           Json        // Array of items with specs
  budget          Json        // { amount, currency }
  timeline        Json        // { deliveryDeadline, responseDeadline }
  terms           Json        // { paymentTerms, warranty, etc }
  requirements    String[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  vendors         RFPVendor[]
  proposals       Proposal[]
}

model RFPVendor {
  id        String   @id @default(uuid())
  rfpId     String
  vendorId  String
  sentAt    DateTime?
  
  rfp       RFP      @relation(fields: [rfpId], references: [id], onDelete: Cascade)
  vendor    Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  
  @@unique([rfpId, vendorId])
}

model Proposal {
  id              String         @id @default(uuid())
  rfpId           String
  vendorId        String
  
  // Raw email data
  rawEmail        String         // Full email content
  emailSubject    String?
  receivedAt      DateTime       @default(now())
  
  // AI-parsed structured data
  parsedData      Json?          // Extracted pricing, terms, etc
  
  // AI evaluation
  score           Float?
  evaluation      Json?          // { strengths, weaknesses, summary }
  
  status          ProposalStatus @default(RECEIVED)
  
  rfp             RFP            @relation(fields: [rfpId], references: [id], onDelete: Cascade)
  vendor          Vendor         @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

enum RFPStatus {
  DRAFT
  SENT
  EVALUATING
  AWARDED
  CLOSED
}

enum ProposalStatus {
  RECEIVED
  PARSED
  EVALUATED
  SELECTED
  REJECTED
}
```

---

## 🔌 API ENDPOINTS

### RFP APIs

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/rfps` | Create RFP from natural language | `{ input: string }` |
| `GET` | `/api/rfps` | List all RFPs | - |
| `GET` | `/api/rfps/:id` | Get RFP with proposals | - |
| `PUT` | `/api/rfps/:id` | Update RFP | `{ title?, status?, ... }` |
| `DELETE` | `/api/rfps/:id` | Delete RFP | - |
| `POST` | `/api/rfps/:id/send` | Send RFP to vendors | `{ vendorIds: string[] }` |
| `POST` | `/api/rfps/:id/compare` | Compare proposals | - |

### Vendor APIs

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/vendors` | Create vendor | `{ name, email, ... }` |
| `GET` | `/api/vendors` | List all vendors | - |
| `GET` | `/api/vendors/:id` | Get vendor | - |
| `PUT` | `/api/vendors/:id` | Update vendor | `{ name?, email?, ... }` |
| `DELETE` | `/api/vendors/:id` | Delete vendor | - |

### Proposal APIs

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/proposals/inbound` | Receive vendor email | `{ rfpId, vendorId, email }` |
| `GET` | `/api/rfps/:id/proposals` | Get proposals for RFP | - |
| `POST` | `/api/proposals/:id/parse` | Re-parse proposal | - |
| `PUT` | `/api/proposals/:id` | Update proposal status | `{ status }` |

---

## 🤖 AI PROMPTS (Core Logic)

### 1. Natural Language → Structured RFP

```typescript
// backend/src/prompts/rfp-parser.ts

export const RFP_PARSER_PROMPT = `
You are an AI assistant that converts natural language procurement requests into structured RFP data.

Given a user's description of what they want to procure, extract the following information:

1. title: A short title for the RFP
2. items: Array of items with name, quantity, and specifications
3. budget: Total budget amount and currency
4. timeline: Delivery deadline, response deadline
5. terms: Payment terms, warranty requirements
6. requirements: Any additional requirements

Respond ONLY with valid JSON in this exact format:
{
  "title": "string",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "specifications": { "key": "value" }
    }
  ],
  "budget": {
    "amount": number,
    "currency": "USD"
  },
  "timeline": {
    "deliveryDeadline": "YYYY-MM-DD",
    "responseDeadline": "YYYY-MM-DD"
  },
  "terms": {
    "paymentTerms": "string",
    "warranty": "string"
  },
  "requirements": ["string"]
}

If any field is not mentioned, use reasonable defaults or null.
`;
```

### 2. Vendor Email → Structured Proposal

```typescript
// backend/src/prompts/proposal-parser.ts

export const PROPOSAL_PARSER_PROMPT = `
You are an AI that extracts structured data from vendor proposal emails.

Given an RFP context and a vendor's email response, extract:

1. items: What they're offering (name, quantity, unit price, total)
2. totalPrice: Total quoted price
3. deliveryTime: When they can deliver
4. paymentTerms: Their payment terms
5. warranty: Warranty offered
6. additionalNotes: Any other important terms

RFP Context:
{rfpContext}

Vendor Email:
{vendorEmail}

Respond ONLY with valid JSON:
{
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number,
      "meetsSpecs": true/false
    }
  ],
  "totalPrice": number,
  "currency": "USD",
  "deliveryTime": "string",
  "paymentTerms": "string",
  "warranty": "string",
  "additionalNotes": ["string"],
  "confidence": 0.0-1.0
}
`;
```

### 3. Proposal Comparison

```typescript
// backend/src/prompts/comparison.ts

export const COMPARISON_PROMPT = `
You are a procurement analyst AI. Compare vendor proposals for an RFP.

RFP Requirements:
{rfpData}

Proposals:
{proposals}

Analyze and score each proposal (0-100) based on:
- Price competitiveness (30%)
- Delivery timeline (20%)
- Specification compliance (25%)
- Terms and warranty (15%)
- Overall value (10%)

Respond with JSON:
{
  "rankings": [
    {
      "vendorId": "string",
      "vendorName": "string",
      "score": number,
      "priceScore": number,
      "deliveryScore": number,
      "complianceScore": number,
      "termsScore": number,
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  ],
  "recommendation": {
    "vendorId": "string",
    "vendorName": "string",
    "reasoning": "string"
  },
  "summary": "string"
}
`;
```

---

## 📝 IMPLEMENTATION STEPS

### Phase 1: Project Setup (2-3 hours)

```bash
# Step 1.1: Create project structure
mkdir rfp-management-system
cd rfp-management-system

# Step 1.2: Initialize backend
mkdir backend && cd backend
npm init -y
npm install express cors dotenv prisma @prisma/client openai zod
npm install -D typescript ts-node @types/node @types/express @types/cors nodemon
npx tsc --init
npx prisma init

# Step 1.3: Initialize frontend
cd .. && npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Step 1.4: Setup shadcn/ui
npx shadcn@latest init
```

### Phase 2: Database & Models (1-2 hours)

```bash
# Step 2.1: Setup PostgreSQL (Docker)
docker run --name rfp-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Step 2.2: Configure Prisma
# Edit prisma/schema.prisma (add models from above)

# Step 2.3: Run migrations
npx prisma migrate dev --name init
npx prisma generate

# Step 2.4: Create seed data
npx prisma db seed
```

### Phase 3: Backend Core (3-4 hours)

1. Setup Express app with middleware
2. Create Vendor CRUD endpoints
3. Create RFP CRUD endpoints
4. Test with Postman/Thunder Client

### Phase 4: AI Integration (3-4 hours)

1. Setup OpenAI client
2. Implement RFP parser (NL → Structured)
3. Implement Proposal parser (Email → Structured)
4. Implement Comparison logic
5. Test each AI function independently

### Phase 5: Email Integration (2-3 hours)

1. Setup Resend/Nodemailer
2. Create email templates for RFP
3. Implement send function
4. Create inbound webhook endpoint
5. Test email flow

### Phase 6: Frontend Development (4-5 hours)

1. Setup routing and layout
2. Build Dashboard page
3. Build Vendor management
4. Build RFP creation (with chat input)
5. Build RFP detail view
6. Build Proposal comparison view

### Phase 7: Integration & Testing (2-3 hours)

1. Connect frontend to backend
2. Test full workflow end-to-end
3. Fix bugs and edge cases
4. Add loading states and error handling

### Phase 8: Documentation & Demo (2-3 hours)

1. Write README with setup instructions
2. Document API endpoints
3. Record demo video
4. Final polish

---

## ⚙️ ENVIRONMENT VARIABLES

```env
# backend/.env.example

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rfp_db"

# OpenAI
OPENAI_API_KEY="sk-..."

# Email (Resend)
RESEND_API_KEY="re_..."
FROM_EMAIL="rfp@yourdomain.com"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

```env
# frontend/.env.example

VITE_API_URL="http://localhost:3001/api"
```

---

## 🎬 DEMO VIDEO CHECKLIST

Your 5-10 minute video must show:

- [ ] **1. RFP Creation** - Type natural language, show structured output
- [ ] **2. Vendor Management** - Add vendors, show list
- [ ] **3. Send RFP** - Select vendors, send email (show email received)
- [ ] **4. Receive Response** - Show vendor response being parsed
- [ ] **5. Compare Proposals** - Show comparison view with AI recommendation
- [ ] **6. Code Walkthrough** - Quick tour of structure, AI prompts, key decisions

---

## ✅ QUICK DECISIONS (Recommended)

| Decision | Recommendation | Why |
|----------|----------------|-----|
| Database | PostgreSQL + Prisma | Type-safe, industry standard |
| AI | OpenAI GPT-4o-mini | Cost-effective, reliable |
| Email Send | Resend | Simple API, free tier |
| Email Receive | Webhook + Simulation | Practical for demo |
| UI | Tailwind + shadcn | Fast to build, looks good |
| State | React Query | Caching, loading states |

---

## 🚀 READY TO START?

Once you confirm:
1. Which AI provider (OpenAI/Anthropic)?
2. Do you have API keys?
3. How many days for completion?
4. PostgreSQL or SQLite?

