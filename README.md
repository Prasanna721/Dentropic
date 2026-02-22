# Dentropic

End-to-end Open Dental automation MCP app powered by CUA.

## Problem
Open Dental runs on Windows, and thousands of dental clinics still use it. Onboarding teams and staff takes time, and day-to-day use can be operationally heavy.

<img width="511" height="385" alt="Screenshot 2026-02-21 at 4 48 43 PM" src="https://github.com/user-attachments/assets/bc9536c9-18df-41f8-9e90-77a56c9ff197" />

## UVP
Dentropic is built on top of Open Dental and uses MCP deployed on Manufact to make Open Dental workflows easier, faster, and more accessible through AI-driven automation.


## Running MCP
1. get-patient-list
 <img width="1238" height="769" alt="Screenshot 2026-02-21 at 4 45 47 PM" src="https://github.com/user-attachments/assets/5131c1be-3c32-4223-bddd-3af17777ce7f" />

2. get-patient-chart
<img width="1234" height="771" alt="Screenshot 2026-02-21 at 4 45 04 PM" src="https://github.com/user-attachments/assets/03b8364d-45ea-4e50-b20b-d9b5c6501d20" />
<img width="1228" height="768" alt="Screenshot 2026-02-21 at 4 47 00 PM" src="https://github.com/user-attachments/assets/3094bd8e-8c5a-461d-a301-5c6935761f84" />
<img width="1244" height="770" alt="Screenshot 2026-02-21 at 4 47 16 PM" src="https://github.com/user-attachments/assets/3042c497-834e-45e9-af0d-78f81852752c" />



## Monorepo layout

- `backend/` — Python API + CUA agent orchestration
- `mcp-app/` — MCP server + widgets
- `deployed.md` — current deployed URLs

## Prerequisites

- Python 3.13+
- Node.js 20+
- npm
- CUA API key + sandbox access
- OpenAI API key
- Anthropic API key (still required for screenshot extraction code paths)

## 1) Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
CUA_API_KEY=your_cua_api_key
CUA_SANDBOX_NAME=windows-opendental
CUA_MODEL=cua/openai/gpt-5
```

Run backend:

```bash
./.venv/bin/uvicorn app.main:app --port 8000
```

Quick check:

```bash
curl http://127.0.0.1:8000/health
```

## 2) MCP app setup

In a separate terminal:

```bash
cd mcp-app
npm install
```

Create `mcp-app/.env` (optional for local defaults):

```env
OPENDENTAL_API_URL=http://localhost:8000
MCP_URL=http://localhost:3000
PORT=3000
```

Run MCP app:

```bash
npm run dev
```

## 3) Local development flow

Run both services concurrently:

1. `backend` on `http://127.0.0.1:8000`
2. `mcp-app` on `http://localhost:3000`

Then test through the MCP inspector/UI.

## Common issues

### `qwen-agent not installed`

If this appears during agent execution, ensure you are using the backend virtualenv when running uvicorn:

```bash
cd backend
which python
which uvicorn
python -c "import qwen_agent; print('ok')"
```

Expected executables should be from `backend/.venv/bin/...`.

### `BodyTimeoutError` in `mcp-app`

Backend CUA tasks can be long-running. Ensure backend is running and reachable at `OPENDENTAL_API_URL`, and keep the per-tool long timeout configuration in `mcp-app/index.ts`.

## Deployment

See `deployed.md` for current backend and MCP URLs.


# Open Dental Market & Revenue Snapshot

## Revenue (Estimated)

- **Estimated annual revenue:** **~$40–60 million USD**
- **Revenue model:** Primarily subscription-based dental practice management software
- **Customer profile:** Independent dental practices and DSOs (Dental Service Organizations)

## Users / Market Presence

- **Estimated practices served:** **20,000+ dental practices**
- **Estimated end users:** **60,000–100,000+** (dentists, hygienists, office staff)
- **Primary markets:** United States and Canada

## Company Context

- **Founded:** 2003
- **Headquarters:** Oregon, USA
- **Company type:** Privately held dental practice management software company

## Competitive Landscape

Open Dental competes with:

- Dentrix
- Eaglesoft
- Curve Dental

## Optional Follow-ups

If needed, additional analysis can include:

1. Market share comparison vs Dentrix/Eaglesoft
2. Growth trends over time
3. Valuation estimates
4. Regional breakdown


## Module-specific docs

- Backend details: `backend/README.md`
