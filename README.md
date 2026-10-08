# VitAura — SheharSudhar

VitAura is a civic issue reporting project. Its citizen-facing interface lets people describe a local problem, provide its location and contact number, and attach a photo. The backend is intended to store the report and use AI to suggest a severity, priority, and responsible municipal corporation.

> **Current project status:** This repository contains an early-stage prototype. The upload and AI triage flow is implemented in the Express backend, but the frontend currently mixes that API with browser-only demo data. Authentication screens also call endpoints that are not implemented in this repository. Read [Known limitations](#known-limitations) before treating it as a complete reporting service.

## What it does

- Presents a landing page for reporting city issues.
- Provides issue reporting fields for an issue title, description, location, phone number, and an image.
- Exposes an Express `POST /api/upload` endpoint that accepts multipart form data.
- Uploads submitted images to Cloudinary.
- Sends the first uploaded image and issue text to Google Gemini (`gemini-2.5-flash`) to classify severity, priority, and a corporation (`Electrical`, `Sanitation`, `Civil`, `Disaster`, or `Maintenance`).
- Saves an issue record and the first image URL in PostgreSQL through Prisma.
- Includes dashboard and admin dashboard UI concepts for viewing issue status.

## Why it exists

City problems often reach the wrong municipal team or arrive without enough context to assess them. VitAura explores a simple intake flow with a photo and location, then uses AI as a triage aid to help route a report. The intended benefit is clearer reports and faster assignment. AI output is only a suggestion and should be reviewed by a person before operational decisions are made.

## How the pieces fit together

```text
Browser (Next.js) -- multipart POST --> Express API
                                          |-- image --> Cloudinary
                                          |-- image + text --> Google Gemini
                                          |-- issue metadata --> PostgreSQL (Prisma)
```

The backend route is mounted at `/api/upload`. Its request field names are `images` (file field; the backend accepts multiple files), `issue`, `location`, `description`, and `mobileNo`. The form in the current frontend submits one file under `images` to `http://localhost:3000/api/upload`.

## Technology

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI components.
- **Backend:** Node.js, Express 5, TypeScript, Multer.
- **Data:** PostgreSQL 16, Prisma.
- **Image storage:** Cloudinary.
- **Issue classification:** Google Gemini API (`gemini-2.5-flash`).
- **Local database helper:** Docker Compose starts PostgreSQL and Adminer.

## Prerequisites

Install the following before starting:

- Node.js compatible with the versions declared by Next.js 16 and the installed packages (use a current Node.js LTS release).
- npm (lockfiles are provided for both apps; use `npm` for the commands below).
- Docker Desktop or Docker Engine with the Compose plugin, if using the supplied local PostgreSQL service.
- API credentials for Cloudinary and Google Gemini to run image upload and AI classification.

## Run locally

Open three terminals from the repository root.

### 1. Start PostgreSQL

```bash
docker compose -f backend/docker-compose.yml up -d postgres_db
```

The Compose file creates a local database named `db` with username `user` and password `pass`, exposed on port `5432`. These are development-only credentials; change them before exposing the database beyond your machine. Adminer is available at <http://localhost:8080> if you start the full Compose stack:

```bash
docker compose -f backend/docker-compose.yml up -d
```

Adminer connection values: system `PostgreSQL`, server `postgres_db` (from the Compose network; use `localhost` from a host browser if needed), username `user`, password `pass`, database `db`.

### 2. Configure and start the backend

Create `backend/.env` (this file is ignored by Git) with your own values:

```dotenv
PORT=3000
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_API_KEY=your_google_gemini_api_key
```

Then install dependencies, apply the checked-in Prisma migrations, generate the Prisma client, and start the API:

```bash
cd backend
npm ci
npx prisma migrate deploy
npx prisma generate
npm run dev
```

The backend listens on the `PORT` from `.env`; the upload endpoint is `POST http://localhost:3000/api/upload`.

### 3. Start the frontend

In another terminal, from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open <http://localhost:3000> for Next.js. **Port conflict:** the frontend and backend both default/use port `3000` in the current source. Run one on another port, for example start the backend with `PORT=3001` (PowerShell: `$env:PORT="3001"; npm run dev`; macOS/Linux: `PORT=3001 npm run dev`) and update the frontend API URL in `frontend/app/dashboard/report/page.tsx` to `http://localhost:3001/api/upload`. The frontend currently hard-codes the API URL, so the backend port cannot yet be configured through a frontend environment variable.

## Submit an issue directly to the API

The backend expects multipart form data. For example, with `curl`:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "images=@./issue-photo.jpg" \
  -F "issue=Pothole near the bus stop" \
  -F "description=Large pothole in the left lane, causing vehicles to swerve" \
  -F "location=Main Road, near the central bus stop" \
  -F "mobileNo=9876543210"
```

A successful request returns HTTP `201` and JSON containing `success`, `message`, and the created database record in `data`. Missing `issue`, `location`, or `mobileNo` returns HTTP `400`. Upload, AI, or database failures return HTTP `500`. The route uses the first uploaded image for AI analysis and stores that image URL on the issue record.

## Repository layout

```text
.
├── backend/
│   ├── src/index.ts                 # Express app and route mounting
│   ├── src/controllers/upload.ts    # Upload, triage, and issue persistence
│   ├── src/helpers/gemini_judge.ts  # Gemini classification prompt and parsing
│   ├── prisma/schema.prisma         # User and Issue data models
│   ├── prisma/migrations/           # Database migrations
│   └── docker-compose.yml           # PostgreSQL and Adminer for local use
└── frontend/
    ├── app/                         # Next.js pages and routes
    ├── components/ui/               # Reusable UI components
    ├── lib/mock-db.ts               # In-memory mock data helper
    └── public/                      # Static assets
```

## Data model

The Prisma schema defines:

- `User`: numeric ID, username, and email.
- `Issue`: numeric ID, image URL, issue text, location, description, mobile number, AI-assigned severity, priority, and corporation, a `resolved` flag, and timestamps.

The current report endpoint writes issue records. It does not currently associate them with a `User` record or expose API routes to list, update, or delete persisted issues.

## Known limitations

These details are important when running or extending this prototype:

1. **Frontend/backend port overlap:** both development apps use port `3000` by default, and the report page hard-codes that address. Run one on a different port and adjust the URL as described above.
2. **Frontend response parsing does not match the backend:** the backend returns the record under `result.data`; the report page currently expects a Gemini-shaped `result.candidates` response. As written, that page will report a parsing error after the backend successfully stores an issue. The backend can be exercised independently with the `curl` example.
3. **Dashboard data is local demo data:** the citizen dashboard seeds and stores sample issues in browser `localStorage`; it does not load issues from PostgreSQL. The admin UI also uses browser-side data. Clearing browser storage removes this demo state.
4. **Authentication is incomplete:** the landing layout includes Clerk UI, but no Clerk environment setup is documented in the repository; the separate login and signup forms call `/api/auth/login` and `/api/auth/signup`, and those API routes are not present. Do not rely on these screens for real authentication or access control.
5. **Backend error cases need hardening:** the upload controller expects at least one image but does not validate this before accessing the first uploaded image. It also uploads all received images but stores only the first URL. Add file count/type/size validation and robust Gemini output validation before production use.
6. **Development-only service credentials:** the checked-in Compose file uses simple local database credentials. Replace them and use managed secrets for any shared or deployed environment.
7. **AI classification is not guaranteed:** Gemini may return invalid or unsuitable classifications; results need validation and human review.

## Development commands

Run from the relevant app directory:

| App | Command | Purpose |
| --- | --- | --- |
| `frontend` | `npm run dev` | Start Next.js development server |
| `frontend` | `npm run build` | Build the frontend for production |
| `frontend` | `npm run start` | Serve a previously built frontend |
| `frontend` | `npm run lint` | Run ESLint |
| `backend` | `npm run dev` | Start backend with nodemon |
| `backend` | `npm run build` | Compile backend TypeScript |
| `backend` | `npm start` | Start the compiled backend |

## Configuration and secrets

Keep `.env` files and API credentials out of version control. The repository's `.gitignore` excludes environment files. Never put Cloudinary secrets, Gemini keys, database passwords, or production credentials in frontend code: values exposed to a browser are public. Rotate any credential that has been committed or shared accidentally.

## Contributing

1. Create a branch for your change.
2. Keep frontend and backend setup instructions in sync with their package scripts and environment variables.
3. Verify any API contract changes in both the backend and frontend.
4. Do not commit `.env` files, generated secrets, or real user data.

## License

No project license is currently declared. Contact the repository maintainers before reusing or distributing this code.
