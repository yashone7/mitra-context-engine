# mitra-context-engine

Mitra is a calm, consent-based context engine.

It helps you externalize thinking, hold responsibility safely, and surface **one stabilizing action at a time** — without pressure, urgency, or judgment.

This is **not** a task manager, planner, or productivity tool.  
It is personal cognitive infrastructure.

---

## Why Mitra exists

Modern work creates:
- fragmented conversations
- overlapping responsibilities
- open loops that live in your head

For people in leadership roles — especially those who are neurodivergent — this results in constant background cognitive load.

Mitra exists to answer a single question:

> **“Given everything I’ve already accepted as real, what is the one thing I should do now?”**

No dashboards.  
No priorities.  
No reminders.

Just clarity.

---

## Core principles

Mitra is built on a few non-negotiable ideas:

### 1. State over chat  
Mitra stores structured state, not conversations.  
It remembers context so you don’t have to.

### 2. Consent over automation  
Nothing becomes a real commitment without explicit confirmation.  
The system may suggest — it never decides for you.

### 3. Deterministic over intelligent  
AI is used only to translate language into structure.  
All decisions are deterministic and explainable.

### 4. One action at a time  
Mitra never shows lists of work.  
Decision fatigue is treated as a design bug.

### 5. Calm by design  
If a feature increases cognitive load, it does not ship.

---

## How Mitra works

The entire system revolves around a simple loop:

dump → confirm → now → done


### Dump
You unload unstructured thoughts — no formatting required.

### Confirm
Mitra suggests atomic commitments.
You explicitly confirm or dismiss each one.

### Now
Mitra surfaces **exactly one** stabilizing action based on:
- who it involves
- type of work
- mental energy required

### Done
You explicitly close the loop.

Nothing happens silently.

---

## Domain concepts

### Commitment
An atomic obligation — something that, if not done, you would later think:

> “I still owe this.”

### Lifecycle
unconfirmed → open → done | dismissed


### Work streams
- `planning`
- `delivery`
- `ops`

### Energy levels
- `light`
- `medium`
- `heavy`

Energy is respected, never optimized against.

---

## Architecture overview

Mitra is a monorepo built on the Cloudflare stack.

apps/
api/ # Cloudflare Workers (Hono)
web/ # Minimal single-page UI
packages/
types/ # Shared domain types (optional)


### Backend
- Cloudflare Workers
- Hono
- Cloudflare D1 (SQLite)
- Drizzle ORM

### Frontend
- Minimal single-page UI
- No routing
- No dashboards
- One actionable item visible at a time

### AI (Gemini)
- Used only for language → structure decomposition
- Never prioritizes, orders, or confirms work
- Fully optional (system works without it)

---

## API endpoints

### `POST /dump`
Accepts unstructured text and returns **unconfirmed** commitments.

### `POST /confirm`
Explicitly accepts or dismisses a suggested commitment.

### `GET /now`
Returns **exactly one** actionable commitment.

### `POST /done`
Closes an open commitment.

All endpoints are deterministic and side-effect safe.

---

## What Mitra intentionally does NOT do

Mitra avoids:
- task lists
- priorities
- reminders
- notifications
- dashboards
- analytics
- gamification
- urgency signaling

Those features increase pressure.  
Mitra is designed to reduce it.

---

## Who this is for

- Tech leads, EMs, founders
- People with heavy context switching
- Neurodivergent thinkers
- Anyone who wants **support**, not management

Mitra is built **for personal use first**.

---

## Project status

The core loop is complete and intentionally small:

- dump
- confirm
- now
- done

Future work, if any, will focus on:
- trust
- calmness
- clarity

Not scale.

---

## Philosophy

> Thinking, deciding, and acting are different things.  
> Most software collapses them.  
> Mitra does not.

---

## License

Choose deliberately.

This is personal infrastructure.
MIT or Apache-2.0 are reasonable defaults.