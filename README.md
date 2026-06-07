# Team14 – MindWell (Frontend)

**Module:** CT071-3-3-DDAC  
**GitHub:** [Team14_Mental_Health](https://github.com/PandeyKiran7/Team14_Mental_Health)

## Project layout

```text
team14-mental_health/
├── src/
│   ├── app/              ← pages (public, auth, patient, doctor, admin)
│   ├── components/
│   ├── helper/           ← apiList.ts + apiService.ts
│   └── constants/
├── public/
├── .env.local           
└── package.json
```

## Connect to backend

Backend repo: `E:\6 SEM\team-14-backend\Diabetes_Health_Application_Group14`

| Frontend env | Backend setting |
|---|---|
| `NEXT_PUBLIC_API_URL=http://localhost:4000` | `SERVER_PORT=4000` in backend `.env` |

API base path on backend: `/api/v1/` (e.g. login → `POST /api/v1/login`).

## Run

**1. Backend** (separate terminal):

```bash
cd "E:\6 SEM\team-14-backend\Diabetes_Health_Application_Group14"
copy .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```

**2. Frontend**:

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — use **Login** page → **Test backend connection** to verify.

