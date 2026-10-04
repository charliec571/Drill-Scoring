# 2026 U.S. Army JROTC National Drill Team Championship Scoring System
**Official Standard Operating Procedures (SOP V4, Feb 2026) & TC 3-21.5 Compliance**

A full-stack Web & Mobile PWA application built for field judges and tournament headquarters to score, tabulate, and publish results for the 2026 U.S. Army JROTC National Drill Team Championship.

---

## 🏆 Key Features

### 1. Mobile Judge Field Application (`/judge`)
- **Touch-Optimized Field Scoring**: Designed specifically for field tablets and mobile phones on the drill pad (no accidental zoom, high contrast for sunlight/gyms).
- **Official Movement Criteria (TC 3-21.5)**: Line-item scoring for **Unit Inspection**, **Platoon Regulation**, **Color Guard**, and **Platoon Exhibition**.
- **Head Judge Penalty Controller**:
  - Missing Cadets counter (-25 pts per cadet below standard complement)
  - Command Pause Violations counter (-5 pts per missed 5-sec mandatory pause on bold commands)
  - Boundary Violations counter (-10 pts per occurrence crossing boundary tape/cone)
  - Official Report In / Report Out Stopwatch (-1 pt/sec over/under regulation window)
  - Custom / manual deduction ledger with itemized reasons.
- **Head Judge Tie-Breaker Inputs**: Explicit fields for **Overall Knowledge Evaluation** (0-50) and **Uniform Preparation & Appearance** (0-50).
- **Digital Sign-off & Lock**: Once signed and submitted, scorecards transition to `SUBMITTED` status and lock to prevent field tampering.
- **Offline Resilient**: Local storage queue with background synchronization when connectivity fluctuates.

### 2. Admin Command Center & Tabulation Engine (`/admin`)
- **Real-Time Scorecard Feed**: Live monitoring of submitted judge scorecards with status verification (`DRAFT`, `SUBMITTED`, `VERIFIED`).
- **SOP Paragraph 5 Automated Tie-Breaking Engine**:
  - **Event Tie-Breakers**:
    1. Highest raw score recorded by Head Judge
    2. Highest raw score recorded by Judge #2
    3. Highest Head Judge score on "Overall Knowledge" (Unit Inspection)
    4. Highest Head Judge score on "Uniform Preparation and Appearance" (Unit Inspection)
  - **Overall Championship Tie-Breakers**:
    1. Most 1st place finishes
    2. Most 2nd place finishes
    3. Most 3rd place finishes
  - Automatic generation of clear tie-break audit badges.
- **Multi-Sheet Excel Export (ExcelJS)**: Single-click download of the complete 4-sheet tournament workbook:
  - **Sheet 1**: Overall Division Results (Armed & Unarmed champions, placement breakdown)
  - **Sheet 2**: Event Standings (Inspection, Regulation, Color Guard, Exhibition)
  - **Sheet 3**: Detailed Score Matrix (Raw scores per judge, sub-criteria breakdowns)
  - **Sheet 4**: Penalty Audit Log (Timestamped record of boundary, cadence pause, cadet count, and time deductions)

### 3. Stadium Scoreboard & Awards Ceremony Display (`/scoreboard`)
- Fullscreen projector view for gymnasiums and stadium screens.
- Top 3 Podium layout with gold, silver, and bronze trophies.
- Interactive **Celebrate** button with confetti animation for championship announcements.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

### Production Build
```bash
npm run build
npm run start
```

### Automated Verification Tests
```bash
npx tsx scripts/test-tabulation-and-export.ts
```

---

## 🗄️ Database & Supabase Configuration

The application is pre-seeded with sample data from 10 authentic Army JROTC brigade championship teams and works out-of-the-box locally.

To connect to a live Supabase project:
1. Create a project on [Supabase](https://supabase.com).
2. Execute the complete DDL script located at `supabase/schema.sql` in the Supabase SQL Editor. This sets up all tables, indexes, triggers, and Row Level Security (RLS) policies.
3. Create a `.env.local` file with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
4. Restart the Next.js server. The app's header status indicator will update to **Supabase Live**.
