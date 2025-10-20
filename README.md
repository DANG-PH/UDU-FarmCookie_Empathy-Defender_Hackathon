# 💖 Empathy Defender — UDU FarmCookie Hackathon Project

*Empathy Defender* is an AI-powered educational web game that challenges players to recognize, classify, and transform harmful online comments into positive, empathetic language.  
Developed for *Challenge 3 — Vibe Coding: Play to Impact (15%)*, this project promotes digital empathy through gameplay and AI assistance.  
Repository: [DANG-PH/UDU-FarmCookie_Empathy-Defender_Hackathon](https://github.com/DANG-PH/UDU-FarmCookie_Empathy-Defender_Hackathon)

---

## 📜 Table of Contents

1. [Overview](#overview)  
2. [Purpose & Educational Impact](#purpose--educational-impact)  
3. [Core Features](#core-features)  
4. [Tech Stack](#tech-stack)  
5. [Project Architecture](#project-architecture)  
6. [Local Setup](#local-setup)  
7. [Deployment](#deployment)  
8. [Gameplay & Scoring](#gameplay--scoring)  
9. [Design Decisions](#design-decisions)  
10. [Testing & Debugging](#testing--debugging)  
11. [Contributing](#contributing)  
12. [License](#license)  
13. [Credits](#credits)

---

## 🌍 Overview

*Empathy Defender* is a browser-based game built with *Next.js* and *OpenAI GPT*.  
It simulates real social media comments — both positive and negative — and lets players decide whether the tone is *empathetic or harmful*. If a comment is negative, players can *rewrite it into a positive message* to "heal" the internet.

The goal is simple yet impactful: *teach emotional intelligence and empathy through play*.

---

## 🎯 Purpose & Educational Impact

The game addresses the growing issue of *cyberbullying and toxic language* online.  
It helps players:

- Identify negative or harmful digital communication  
- Learn how to respond with empathy and compassion  
- Practice transforming negative phrases into encouraging, kind messages  
- Understand how AI can be used *ethically* to promote positive behavior

Perfect for use in classrooms, digital ethics workshops, or youth awareness campaigns.

---

## 🧩 Core Features

- 🎮 *10-Round Gameplay* — Identify and heal AI-generated comments.  
- 🤖 *OpenAI Integration* — Uses GPT-3.5 to generate and classify comments.  
- ✍️ *Healing Mechanic* — Rewrite harmful messages into kind, supportive ones.  
- 🔥 *Scoring & Streak System* — Reward for accuracy and empathy consistency.  
- 💬 *Interactive Feedback* — Animated UI with emotional feedback for responses.  
- 🔐 *API Key Input* — Player-provided OpenAI key stored locally for privacy.  

---

## ⚙️ Tech Stack

| Technology | Purpose |
|-------------|----------|
| *Next.js (React + TypeScript)* | Frontend framework |
| *Tailwind CSS* | Responsive styling |
| *Lucide React Icons* | Icon set |
| *OpenAI GPT-3.5 Turbo* | Text generation and sentiment classification |
| *Node / npm* | Build and runtime environment |

(Languages shown in the repo include TypeScript, CSS, and JavaScript.)

### Runtime Flow

1. Player opens the app → shows *Setup* (API key) or *Menu* screen.  
2. Game starts → client calls generateMessageWithAI() → AI creates a comment.  
3. Player chooses *Positive 💚* or *Negative 💔*.  
4. If negative → player rewrites it → validated by analyzeEmotionWithAI().  
5. Points and streaks update → next round → final *Result* screen after 10 rounds.

---

## 💻 Local Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/DANG-PH/UDU-FarmCookie_Empathy-Defender_Hackathon.git
cd UDU-FarmCookie_Empathy-Defender_Hackathon
npm install
# or
yarn install
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key

npm run dev
# or
yarn dev
Then visit:
👉 http://localhost:3000
