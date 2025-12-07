# AI-Powered RFP Management System

A full-stack web application that streamlines the procurement RFP (Request for Proposal) workflow using AI. The system allows procurement managers to create RFPs from natural language, send them to vendors, automatically parse vendor responses, and get AI-powered recommendations.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![Prisma](https://img.shields.io/badge/Prisma-6.19-purple)

---

## 🎯 Features

### Core Functionality
- ✅ **Natural Language RFP Creation**: Describe what you need in plain English, AI structures it automatically
- ✅ **Vendor Management**: Maintain a database of vendors with contact information
- ✅ **Email Integration**: Send RFPs to vendors via email with professional HTML templates
- ✅ **AI-Powered Proposal Parsing**: Automatically extract structured data from messy email responses
- ✅ **Smart Comparison**: AI compares proposals and provides recommendations with detailed scoring
- ✅ **Dashboard & Analytics**: Overview of all RFPs, vendors, and proposals with key metrics

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js 18+** with Express
- **TypeScript** for type safety
- **Prisma ORM** with SQLite (PostgreSQL optional)
- **Zod** for request validation
- **Nodemailer** for email sending

### AI & Services
- **Google Gemini 2.0 Flash** for:
  - Natural language to structured RFP parsing
  - Vendor proposal parsing from emails
  - Proposal comparison and recommendations

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Google Gemini API Key** - Get it from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Email SMTP Access** - Gmail or any SMTP server (for sending RFPs)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Ghingalala
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the template below and create .env file in backend/ directory
```

**Create `backend/.env` file with the following content:**

```env
# Database Configuration
# For SQLite (default - works out of the box):
DATABASE_URL="file:./prisma/dev.db"

# For PostgreSQL (optional):
# DATABASE_URL="postgresql://username:password@localhost:5432/rfp_db"

# AI Service Configuration
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key-here"

# Email Configuration (SMTP)
# For Gmail, you need to generate an App Password:
# 1. Enable 2-Factor Authentication on your Gmail account
# 2. Go to: https://myaccount.google.com/apppasswords
# 3. Generate app password for "Mail"
# 4. Use that 16-character password (NOT your regular Gmail password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password-here"
FROM_EMAIL="your-email@gmail.com"

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

**Setup Database:**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
# Create .env file in frontend/ directory
```

**Create `frontend/.env` file with the following content:**

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
```

### Step 4: Running the Application

**Terminal 1 - Start Backend:**

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server is running on http://localhost:3001
📝 API docs available at http://localhost:3001/health
🌍 CORS enabled for: http://localhost:5173
```

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

**Open your browser:**
Navigate to [http://localhost:5173](http://localhost:5173)

---

## 📖 Usage Guide

### 1. Create an RFP

1. Go to **Dashboard** or **RFPs** page
2. Click "**Create RFP**" button
3. Describe your requirements in natural language. Example:
   ```
   I need to procure laptops and monitors for our new office.
   Budget is $50,000 total. Need delivery within 30 days.
   We need 20 laptops with 16GB RAM and 15 monitors 27-inch.
   Payment terms should be net 30, and we need at least 1 year warranty.
   ```
4. Click "**Generate RFP with AI**"
5. Review the structured RFP created by AI (items, budget, timeline, terms)
6. Click "**Confirm & Create RFP**"

### 2. Manage Vendors

1. Go to **Vendors** page
2. Click "**Add Vendor**" button
3. Fill in vendor details:
   - Company Name (required)
   - Email (required)
   - Contact Person (required)
   - Phone (optional)
   - Categories (optional, comma-separated)
   - Notes (optional)
4. Click "**Add Vendor**"

### 3. Send RFP to Vendors

1. Open an RFP from the RFPs list
2. Click "**Send to Vendors**" button
3. Select vendors from the modal
4. Click "**Send to X Vendor(s)**"
5. RFP will be emailed to selected vendors (requires SMTP configuration)

### 4. Receive Vendor Proposals

Since this is a demo system, you can simulate receiving proposals:

1. Open an RFP detail page
2. Click "**Receive Proposal**" button
3. Select the vendor from dropdown
4. Paste their proposal email content. Example:
   ```
   Subject: Re: RFP: Office Equipment Procurement

   Dear Procurement Team,

   Thank you for the opportunity. We can provide:

   - 20 Laptops with 16GB RAM at $1,200 each = $24,000
   - 15 Monitors 27-inch at $350 each = $5,250

   Total: $29,250 USD

   Delivery: 20 business days
   Payment Terms: Net 30
   Warranty: 3 years comprehensive warranty

   Best regards,
   Tech Solutions Inc.
   ```
5. Click "**Receive & Parse Proposal**"
6. AI will automatically extract structured data (pricing, delivery, warranty, etc.)

### 5. Compare Proposals

1. After receiving multiple proposals for an RFP, click "**Compare Proposals**" button
2. AI will analyze all proposals based on:
   - Price competitiveness (30%)
   - Delivery timeline (20%)
   - Specification compliance (25%)
   - Terms and warranty (15%)
   - Overall value (10%)
3. View ranked vendors with scores (0-100) and AI recommendation
4. See detailed strengths and weaknesses for each proposal

---

## 🔌 API Endpoints

### RFPs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rfps` | Create RFP from natural language |
| `GET` | `/api/rfps` | List all RFPs |
| `GET` | `/api/rfps/:id` | Get RFP details with proposals |
| `PUT` | `/api/rfps/:id` | Update RFP |
| `DELETE` | `/api/rfps/:id` | Delete RFP |
| `POST` | `/api/rfps/:id/send` | Send RFP to vendors via email |
| `POST` | `/api/rfps/:id/compare` | Compare proposals with AI |

### Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/vendors` | Create vendor |
| `GET` | `/api/vendors` | List all vendors |
| `GET` | `/api/vendors/:id` | Get vendor details |
| `PUT` | `/api/vendors/:id` | Update vendor |
| `DELETE` | `/api/vendors/:id` | Delete vendor |

### Proposals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/proposals/inbound` | Receive vendor proposal |
| `GET` | `/api/proposals/rfp/:rfpId` | Get proposals for RFP |
| `GET` | `/api/proposals/:id` | Get proposal details |
| `POST` | `/api/proposals/:id/reparse` | Re-parse proposal with AI |
| `PUT` | `/api/proposals/:id/status` | Update proposal status |
| `DELETE` | `/api/proposals/:id` | Delete proposal |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health status |
| `GET` | `/api/email/test` | Test email configuration |

---

## 🏗️ Project Structure

```
Ghingalala/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── rfp.controller.ts
│   │   │   ├── vendor.controller.ts
│   │   │   └── proposal.controller.ts
│   │   ├── services/         # Business logic
│   │   │   ├── ai.service.ts      # AI integration (Gemini)
│   │   │   └── email.service.ts    # Email sending (Nodemailer)
│   │   ├── routes/           # API route definitions
│   │   │   ├── rfp.routes.ts
│   │   │   ├── vendor.routes.ts
│   │   │   └── proposal.routes.ts
│   │   ├── utils/            # Helper functions
│   │   │   └── db-helpers.ts
│   │   └── app.ts            # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Database migrations
│   │   └── dev.db            # SQLite database (if using SQLite)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # Base UI components (Button, Card)
│   │   │   ├── layout/       # Layout components
│   │   │   ├── rfp/          # RFP-specific components
│   │   │   ├── vendor/       # Vendor-specific components
│   │   │   └── proposal/     # Proposal-specific components
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RFPList.tsx
│   │   │   ├── RFPCreate.tsx
│   │   │   ├── RFPDetail.tsx
│   │   │   └── Vendors.tsx
│   │   ├── services/         # API client
│   │   │   └── api.ts
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   ├── lib/              # Utility functions
│   │   │   └── utils.ts
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── README.md                 # This file
├── rfp_planning.md           # Planning document (reference)
└── .gitignore
```

---

## 🎯 Key Features Explained

### 1. Natural Language RFP Creation

The system uses Google Gemini AI to convert natural language descriptions into structured RFP data:

- **Input**: Plain English description of procurement needs
- **Output**: Structured JSON with:
  - Title
  - Items (name, quantity, specifications)
  - Budget (amount, currency)
  - Timeline (delivery deadline, response deadline)
  - Terms (payment terms, warranty)
  - Requirements (additional requirements)

### 2. AI-Powered Proposal Parsing

When vendors send proposal emails, the AI automatically extracts:

- Item-wise pricing
- Total cost
- Delivery timeline
- Payment terms
- Warranty details
- Additional notes
- Confidence score

### 3. Smart Proposal Comparison

The AI compares multiple proposals and provides:

- **Scoring** (0-100) based on:
  - Price competitiveness (30%)
  - Delivery timeline (20%)
  - Specification compliance (25%)
  - Terms and warranty (15%)
  - Overall value (10%)
- **Rankings** with detailed breakdown
- **AI Recommendation** with reasoning
- **Strengths and Weaknesses** for each proposal

---

## 🔒 Security Considerations

- ✅ **Input validation** with Zod on all endpoints
- ✅ **SQL injection prevention** via Prisma ORM
- ✅ **CORS** configured for frontend origin only
- ⚠️ **No authentication** (single-user demo system)
- ⚠️ **Email credentials** stored in `.env` (use app passwords, not real passwords)
- ⚠️ **API keys** stored in `.env` (never commit to version control)

---

## 🚧 Known Limitations

1. **No user authentication** - Single-user system (as per requirements)
2. **Email receiving** - Manual simulation mode (production would use webhooks)
3. **No file attachments** - Proposals must be text-based
4. **No real-time updates** - Manual refresh needed
5. **Basic error handling** - Production would need comprehensive error tracking

---

## 🧪 Testing

### Manual Testing Workflow

1. **Create RFP**: Test natural language parsing with various inputs
2. **Add Vendors**: Create 3-5 test vendors with different details
3. **Send RFP**: Verify email delivery (if SMTP configured)
4. **Receive Proposals**: Submit 2-3 sample proposals with different formats
5. **Compare**: Test AI comparison and recommendation

### Sample Proposal Text

Use this sample text to test proposal parsing:

```
Subject: Re: RFP: Office Equipment Procurement

Dear Procurement Team,

Thank you for the opportunity. We can provide:

- 20 Laptops with 16GB RAM at $1,200 each = $24,000
- 15 Monitors 27-inch at $350 each = $5,250

Total: $29,250 USD

Delivery: 20 business days
Payment Terms: Net 30
Warranty: 3 years comprehensive warranty

Best regards,
Tech Solutions Inc.
```

---

## 🎨 UI Theme

The application features a modern, professional UI inspired by Aerchain's design:

- **Color Scheme**: Indigo/Purple gradient theme
- **Design**: Clean, modern cards with subtle shadows
- **Responsive**: Works on desktop and tablet devices
- **Components**: Custom UI components with consistent styling

---

## 🔧 Troubleshooting

### Database Connection Error

**SQLite:**
- Ensure `prisma/dev.db` file exists
- Run `npx prisma generate` and `npx prisma migrate dev`

**PostgreSQL:**
- Verify PostgreSQL is running: `pg_isready`
- Check connection string in `.env`
- Create database if needed: `createdb rfp_db`

### AI API Error

- Verify `GEMINI_API_KEY` is correct in `.env`
- Check your Google AI Studio account has credits
- Ensure no extra spaces in the API key

### Email Sending Fails

- Verify SMTP credentials in `.env`
- For Gmail: Use App Password (not regular password)
- Test email config: Visit `http://localhost:3001/api/email/test`
- Check backend console for specific error messages

### Frontend Can't Connect to Backend

- Verify backend is running on port 3001
- Check `VITE_API_URL` in `frontend/.env`
- Verify CORS settings in `backend/src/app.ts`
- Check browser console for errors

---

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./prisma/dev.db` (SQLite) |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password/app password | `xxxx xxxx xxxx xxxx` |
| `FROM_EMAIL` | Email sender address | `your-email@gmail.com` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api` |

---

## 🎯 Key Design Decisions

### 1. Database Schema
- **RFP** stores both raw input and structured JSON data
- **RFPVendor** junction table tracks which vendors received which RFPs
- **Proposal** stores raw email and AI-parsed structured data
- **SQLite** chosen for simplicity (PostgreSQL optional for production)

### 2. AI Integration
- **Google Gemini 2.0 Flash** chosen for cost-effectiveness and reliability
- Structured JSON output enforced via `responseMimeType: 'application/json'`
- Three specialized prompts for different tasks:
  1. Natural language → Structured RFP
  2. Email → Structured Proposal
  3. Proposal Comparison
- Confidence scores included in parsing results

### 3. Email Handling
- **Nodemailer** for sending (works with any SMTP)
- HTML email templates for professional RFP delivery
- Manual paste interface for receiving (simulates email receipt)
- Production would use webhook integration (SendGrid, Mailgun, etc.)

### 4. Frontend Architecture
- Component-based React architecture
- Tailwind CSS for rapid UI development
- Custom UI components (Button, Card) for consistency
- TypeScript for type safety

---

## 🔮 Future Enhancements

- [ ] User authentication and multi-tenancy
- [ ] Real email webhook integration (SendGrid, Mailgun)
- [ ] PDF attachment parsing with AI vision
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced analytics and reporting
- [ ] RFP templates library
- [ ] Approval workflows
- [ ] Audit logs
- [ ] Export to Excel/PDF
- [ ] Mobile app support

---

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 📝 License

MIT License - Feel free to use this project for learning and evaluation.

---

## 👨‍💻 Author

SDE Assignment Submission

---

## 🎬 Demo Video

A video demonstration covering:
1. Creating an RFP from natural language
2. Managing vendors
3. Sending RFP via email
4. Receiving and parsing vendor proposal
5. Comparing proposals with AI recommendation
6. Code walkthrough

**[Demo Video Link](YOUR_VIDEO_LINK_HERE)**

---

## 📞 Support

For questions or issues:
1. Check this README
2. Review the code comments
3. Check the browser console for errors
4. Verify environment variables are set correctly
5. Test backend health: `http://localhost:3001/health`
6. Test email config: `http://localhost:3001/api/email/test`

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**
