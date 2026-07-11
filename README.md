# AI CRM Importer

An AI-powered CSV importer that intelligently extracts CRM lead information from any CSV format — regardless of column names, layout, or structure — and maps it into GrowEasy's fixed CRM schema.

Built for the GrowEasy Software Developer Intern assignment.

## Live links

- **Application:** https://ai-crm-importer-phi.vercel.app
- **Backend API:** https://ai-crm-importer-qipa.onrender.com
- **Repository:** https://github.com/sonichanchal702/AI-CRM-Importer

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30–60 seconds to respond — this is expected, not a bug.

## Position applied for

Software Developer Intern

## The problem this solves

Different CRM exports (Facebook Lead Ads, Google Ads, real estate CRMs, manually created spreadsheets) all use different column names for the same underlying data — "Full Name" vs "name" vs "Client Name," "Contact No." vs "Phone Number" vs "mobile_without_country_code." Instead of writing brittle column-name matching rules, this project sends parsed CSV rows to Gemini in batches and lets the model intelligently map arbitrary columns to a fixed CRM schema, while a validation layer enforces the business rules (allowed status values, allowed data sources, required contact info) in code rather than trusting the AI to always get them right.

## Tech stack

**Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, react-dropzone, PapaParse, TanStack Table, Axios

**Backend:** Node.js, Express, TypeScript, Multer, csv-parser, Zod, Google Gemini API (gemini-2.5-flash), dotenv, cors

## How it works

1. **Upload** — user uploads a CSV via drag-and-drop or file picker (modal UI)
2. **Preview** — CSV is parsed client-side (PapaParse) and shown in a scrollable table with sticky headers. No AI call happens at this stage.
3. **Confirm Import** — only on explicit confirmation does the frontend call the backend
4. **Backend processing:**
   - Multer accepts the uploaded file in memory
   - csv-parser converts it into row objects
   - Rows are split into batches of 25
   - Each batch is sent to Gemini with a structured prompt describing the target CRM schema and business rules
   - Gemini's response is parsed as JSON and validated per-record with Zod (enforces allowed `crm_status`/`data_source` enum values, and that every record has an email or mobile number)
   - Failed batches are retried up to 2 times with exponential backoff before being marked as skipped
5. **Results** — frontend shows total rows, imported count, skipped count (mathematically reconciled: `skipped = totalRows - imported`), an expandable list of skipped records with reasons, and the full extracted CRM table

## AI prompt strategy

The extraction prompt explicitly encodes every business rule from the assignment brief as a numbered instruction (allowed enum values, multi-email/multi-phone handling — first value used, remainder appended to `crm_note` — and the exclusion rule for records with no contact info) rather than relying on the model to infer them from examples alone. The model is instructed to return only a raw JSON array, and the backend still defensively strips markdown code fences before parsing, since LLM output formatting can be inconsistent between calls.

**Reconciliation safeguard:** the backend doesn't just trust Gemini's returned array length — it explicitly checks `batch.length` against the count of records Gemini actually returned, and logs any silently-dropped rows as skipped with a reason, so the imported/skipped counts always add up to the total row count.

## Tested against

- Facebook Lead Ads–style export (mismatched column names, missing fields, multiple emails/phones in a single cell)
- Real estate CRM–style export (composite location fields, different status vocabulary)
- Both correctly mapped ambiguous columns, applied the skip rule for contact-less records, and appended overflow contact info to `crm_note`.

## Local setup

### Prerequisites
- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```
PORT=5000
GEMINI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000
```
Run:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`.

### Frontend
```bash
cd frontend
npm install
```
Create a `.env.local` file in `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Run:
```bash
npm run dev
```
Frontend runs at `http://localhost:3000`.

## API

**POST `/api/import`**
`multipart/form-data` with a `file` field containing the CSV.

Response:
```json
{
  "totalRows": 10,
  "imported": 9,
  "skipped": 1,
  "records": [ { "created_at": "...", "name": "...", "email": "...", "...": "..." } ],
  "skippedRecords": [ { "record": { "...": "..." }, "reason": "Missing email and mobile number" } ]
}
```

**GET `/health`**
Returns `{ "status": "ok" }` — used to verify the backend is reachable.

## Known limitations / not implemented

Given the assignment timeline, the following bonus items were intentionally not pursued to prioritize the core required functionality (working end-to-end pipeline, deployment, and this documentation): virtualized tables for very large CSVs, a dark mode toggle, unit tests, and a Docker setup. Retry-on-failure for AI batches, drag-and-drop upload, and progress indicators during processing are implemented.

## Folder structure

```
AI-CRM-Importer/
├── frontend/          # Next.js app
│   └── src/
│       ├── app/               # page.tsx, layout.tsx
│       └── components/        # upload-modal, csv-preview-table, results-table
├── backend/           # Express API
│   └── src/
│       ├── server.ts
│       ├── routes/upload.ts
│       ├── services/gemini.service.ts
│       └── schemas/crm.schema.ts
├── sample-data/        # Test CSVs used to validate field mapping
└── docs/                # Architecture notes
```