# AZ-900 Personal Study Planner - Backend Guide & API Documentation

## 🚀 Architecture Overview

This backend architecture powers the **AZ-900 Vibe Planner**, an AI-driven personal revision scheduler designed to help certification candidates pass the Microsoft Azure Fundamentals (AZ-900) exam.

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                    │
│      Onboarding Wizard  •  Dashboard  •  Re-balancer CTA    │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                  Next.js App Router Backend                 │
│                                                             │
│  /api/generate-plan  /api/rebalance  /api/tasks/[id]        │
│  /api/plans/[id]     /api/health                            │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     AI Generation Engine    ││      Supabase PostgreSQL     │
│  • Google Gemini SDK        ││  • study_plans table         │
│  • OpenAI SDK (optional)    ││  • study_tasks table         │
│  • Resilient Fallback Engine││  • Row Level Security (RLS)  │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 🗄️ Database Setup (Supabase)

The complete SQL migration script is located at:
📁 **[`supabase/schema.sql`](file:///C:/Users/denis/Desktop/Study-planner-/supabase/schema.sql)**

### How to apply in Supabase:
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and select **SQL Editor** from the left navigation.
3. Click **New Query**, paste the contents of `supabase/schema.sql`, and click **Run**.
4. Both `study_plans` and `study_tasks` tables will be created along with performance indexes and demo-ready Row Level Security (RLS) policies.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the project root with your credentials:

```bash
# 1. AI Engine (Google Gemini recommended)
GEMINI_API_KEY=your_gemini_api_key_here
# Optional fallback
OPENAI_API_KEY=your_openai_api_key_here

# 2. Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> **Note on Hackathon Resilience:** If neither API key nor Supabase keys are provided during a live evaluation, the system automatically runs in **Resilient Demo Mode** using its built-in expert AZ-900 curriculum engine, guaranteeing zero crashes for judges!

---

## 📡 API Endpoints Reference

### 1. Generate Adaptive Study Plan
- **Route:** `POST /api/generate-plan`
- **Description:** Calculates exact days remaining, balances official AZ-900 domain weights and user confidence levels, produces daily micro-learning tasks, and persists them into Supabase.

**Request Body:**
```json
{
  "examDate": "2026-10-30",
  "dailyMinutes": 30,
  "confidenceScores": {
    "cloud_concepts": 3,
    "architecture_services": 1,
    "management_governance": 2
  },
  "weekendMultiplier": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "planId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "daysRemaining": 8,
  "source": "gemini",
  "persistedInSupabase": true,
  "days": [
    {
      "id": "c1f7a0b3-...",
      "dayNumber": 1,
      "scheduledDate": "2026-10-23",
      "domain": "cloud-concepts",
      "domainWeight": "25–30%",
      "topicTitle": "Cloud Computing Models & Shared Responsibility",
      "estimatedMinutes": 30,
      "status": "up-next",
      "learningBlock": {
        "title": "Cloud Computing Models & Shared Responsibility",
        "durationMins": 30,
        "objective": "Read the Microsoft Learn guide on IaaS, PaaS, SaaS...",
        "msLearnSearchTerm": "AZ-900 Describe cloud concepts shared responsibility",
        "sandboxExercise": {
          "title": "Hands-On Sandbox",
          "description": "Compare Azure VM (IaaS) vs Azure App Service (PaaS)...",
          "steps": ["..."]
        },
        "activeRecall": {
          "question": "Under the Shared Responsibility Model, which party is always responsible for data?",
          "explanation": "The customer is always responsible for data...",
          "keyTakeaway": "Customer ALWAYS owns data and identity."
        }
      }
    }
  ],
  "summary": "Successfully generated adaptive 8-day AZ-900 roadmap using gemini."
}
```

---

### 2. "Life Happens" Schedule Re-balancer
- **Route:** `POST /api/rebalance`
- **Description:** The judge-pleasing feature that redistributes missed or skipped topics across remaining days before the exam deadline without overwhelming daily capacity.

**Request Body:**
```json
{
  "planId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "days": [ ...currentDaysArray... ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "planId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "rebalancedDayNumber": 1,
  "days": [ ...updatedDaysWithCatchUpWorkload... ],
  "message": "⚡ Life Happens: Schedule re-balanced! Missed session redistributed smoothly without moving your exam date."
}
```

---

### 3. Update Daily Task Status & Active Recall
- **Route:** `PATCH /api/tasks/[id]`
- **Description:** Updates status (`completed`, `pending`, `skipped`), active recall answers, or reveal states.

**Request Body:**
```json
{
  "status": "completed",
  "userAnswer": "The customer always manages data and identity.",
  "isAnswerRevealed": true,
  "completedAt": "2026-10-22T22:30:00.000Z"
}
```

---

### 4. Fetch Saved Plan
- **Route:** `GET /api/plans/[id]`
- **Description:** Retrieves a saved study plan and its ordered daily tasks from Supabase.

---

### 5. Backend Health Check
- **Route:** `GET /api/health`
- **Description:** Diagnostic endpoint to verify Gemini API key presence and Supabase database connection.

---

## 🧠 AI Syllabus Balancing Logic

1. **Domain Weight Alignment:**
   - **Cloud Concepts:** 25–30% exam weight
   - **Azure Architecture & Services:** 35–40% exam weight *(Prioritized by the AI)*
   - **Azure Management & Governance:** 30–35% exam weight
2. **Confidence-Adaptive Scaling:**
   - If user sets Architecture confidence to `1` or `2`, the AI allocates extra sessions and deep-dive drills to that domain.
3. **Dedicated Review Days:**
   - The final 1 to 2 days are strictly reserved for full-length timed practice exams (45 questions, 700/1000 passing threshold) and SLA composite availability review.
