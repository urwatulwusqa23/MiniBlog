# blooom

A modern micro-blogging social platform — write anything, grow a community, connect with people.

Built with **ASP.NET Core 8** (REST API + SignalR) and **Angular 17** (standalone components, signals).

---

## Features

- **Posts** — create, read, delete tweets/posts with a 280-character limit
- **Double-click to like** — Instagram-style heart burst animation
- **Comments** — threaded comments with per-comment like counts
- **Who liked** — click the like count to see a list of everyone who liked a post
- **Follow / Unfollow** — follow other users and build your feed
- **Real-time notifications** — live alerts via SignalR WebSocket connection
- **Direct messages** — private conversations between users
- **Stories row** — scrollable avatar row of people you follow
- **Trending tags** — hashtags extracted from your feed ranked by frequency
- **People to follow** — suggested users sidebar
- **Profile pages** — public user profiles with follow toggle
- **Profile editing** — update username, bio, and profile picture
- **JWT authentication** — secure login / signup with token-based auth

## Tech Stack

### Backend — `MiniBlog/`
| Layer | Tech |
|---|---|
| Framework | ASP.NET Core 8 Web API |
| ORM | Entity Framework Core 8 |
| Database | SQL Server (LocalDB) |
| Real-time | SignalR |
| Auth | JWT Bearer tokens |
| Architecture | Clean Architecture (Core / Application / Infrastructure / Web) |

### Frontend — root `/`
| Layer | Tech |
|---|---|
| Framework | Angular 17 (standalone components) |
| State | Angular Signals (`signal`, `computed`) |
| HTTP | Angular HttpClient + JWT interceptor |
| Real-time | `@microsoft/signalr` v7 |
| Fonts | Cormorant Garamond (display) · DM Sans (body) |
| Icons | Font Awesome 6 |

---

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- SQL Server LocalDB (ships with Visual Studio) **or** any SQL Server instance

### 1 — Clone
```bash
git clone https://github.com/urwatulwusqa23/MiniBlog.git
cd MiniBlog
```

### 2 — Backend setup
```bash
cd MiniBlog/MiniBlog.web

# restore & apply migrations
dotnet restore
dotnet ef database update --project ../MiniBlog.Infrastructure

# run (HTTPS on port 7063)
dotnet run --launch-profile https
```

The API will be available at `https://localhost:7063/api`.

### 3 — Frontend setup
```bash
# from the repo root
npm install
npm start          # ng serve with proxy → http://localhost:4200
```

The Angular proxy (`proxy.conf.json`) forwards all `/api/*` and `/notificationHub` requests to the backend automatically.

### Environment / config

`MiniBlog/MiniBlog.web/appsettings.json` holds the JWT secret and connection string.  
Update `ConnectionStrings:DefaultConnection` if you're not using LocalDB.

---

## Project Structure

```
/                          ← Angular 17 frontend
├── src/
│   ├── app/
│   │   ├── core/          ← services, models, interceptors, guards
│   │   ├── features/      ← home, auth, profile, messages, notifications …
│   │   └── shared/        ← layout, sidebar, tweet-card, toast …
│   ├── assets/
│   └── styles.scss        ← global design tokens & base styles
├── proxy.conf.json        ← dev proxy → backend
└── angular.json

MiniBlog/                  ← ASP.NET Core 8 backend (Clean Architecture)
├── MiniBlog.Core/         ← entities, interfaces
├── MiniBlog.Application/  ← service implementations, DTOs
├── MiniBlog.Infrastructure/ ← EF Core, repositories, migrations
└── MiniBlog.web/          ← controllers, SignalR hubs, JWT config
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/tweets/feed` | Paginated home feed |
| POST | `/api/tweets` | Create post |
| DELETE | `/api/tweets/{id}` | Delete post |
| POST | `/api/tweets/{id}/like` | Like / unlike |
| GET | `/api/tweets/{id}/likers` | Who liked |
| GET | `/api/tweets/{id}/comments` | Comments |
| POST | `/api/tweets/{id}/comments` | Add comment |
| GET | `/api/users/{id}` | User profile |
| POST | `/api/users/{id}/follow` | Follow |
| DELETE | `/api/users/{id}/follow` | Unfollow |
| GET | `/api/users/following` | My following list |
| GET | `/api/users/followers` | My followers list |
| GET | `/api/notifications` | Notifications |
| WS | `/notificationHub` | Real-time SignalR hub |

---

## Design

The UI uses a warm earthy palette inspired by handwritten journals and botanical illustration:

- **Background** `#100c08` — deep warm brown
- **Terracotta** `#c4603a` — primary accent
- **Dusty rose** `#d4847a` — secondary
- **Sage green** `#7a8c6a` — tertiary
- **Cream** `#e8d5b0` — headings

Animated pencil-sketch botanical SVGs draw themselves into the background on load (leaves unfurl, vines grow, stars appear). Cards lift with a rose glow on hover. Hearts burst on like.

---

## License

MIT
