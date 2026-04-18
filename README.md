<div align="center">
  <h1>Loopin</h1>
  <p><em>Full-Stack Social Networking Platform</em></p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Inngest](https://img.shields.io/badge/Inngest-24243E?style=flat&logo=inngest&logoColor=white)](https://www.inngest.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

  <br />
  <a href="https://loopin-flax.vercel.app/"><strong>🔗 Live Demo</strong></a>
  </div>

---

## 🌐 About

Loopin is a full-stack social networking platform built with modern web technologies. It features real-time communication, event-driven background automation, and secure authentication—designed to be lightweight yet production-ready.

---

## ✨ Key Features

### 🔐 Authentication
- JWT-based auth with **dual-token rotation** (7-day access + 30-day refresh tokens)
- **OAuth 2.0** Google sign-in via Passport.js
- Tokens stored in **httpOnly cookies** with `sameSite` and `secure` flags

### ⚡ Real-Time Messaging
- **Server-Sent Events (SSE)** for instant message delivery—lighter than WebSockets
- **Seen/unseen tracking** with persistent read state
- **Daily email digests** for unread messages.

### 🤖 Background Automation (Inngest)
| Job | Trigger | Behavior |
|-----|---------|----------|
| Connection Request Reminders | `app/connection-request` | Immediate email + 2-hour follow-up if pending |
| Story Auto-Expiry | `app/story-created` | Deletes story exactly 24 hours after creation |
| Unread Message Digest | Cron (9 AM daily) | Emails users with unseen message count |
| User Lifecycle Sync | `user.created` / `user.updated` / `user.deleted` | Keeps user data consistent across services |

### 📱 Core Social Features
- **Feed** — Posts from connections with likes, comments, and shares
- **Stories** — Ephemeral content that auto-expires after 24 hours
- **Connections** — Follow/unfollow with request/accept workflow
- **Discover** — Find and connect with new users
- **Dark Mode** — Persistent theme preference via localStorage

### 📸 Media Handling
- **Multi-image uploads** — Up to 4 images per post using Multer
- **Profile customization** — Separate uploads for profile picture and cover photo
- **Image optimization** — Integrated with ImageKit CDN

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Redux Toolkit, Tailwind CSS, Vite, React Router v7 |
| **Backend** | Node.js, Express 5, TypeScript, JWT, Passport.js, Multer, Bcrypt |
| **Database** | MongoDB, Mongoose ODM |
| **Services** | Inngest (background jobs), Vercel (hosting), ImageKit (CDN), Nodemailer (email) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Backend Setup
```bash
cd Server
npm install
npm run dev   # Starts server on port 8000
```
### Frontend Setup
```bash
cd client
npm install
npm run dev   # Starts client on port 5173
```
