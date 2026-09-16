# Game Library — Architecture

## 1. Project Goal

Game Library is a self-hosted web application for managing a personal collection of games.

The application allows users to:

- create and manage games
- organize games into folders
- create nested folders
- switch between tile and list views
- search and filter games
- track the current status of each game
- assign ratings, genres and descriptions

The application is designed to run on a personal/home server without requiring a large external database service.

---

# 2. High-Level Architecture

```text
Browser
   │
   │ HTTP / JSON API
   ▼
React Frontend
   │
   │ HTTP requests
   ▼
Node.js / Fastify Backend
   │
   ▼
Storage Layer
   │
   ▼
Local JSON Files
```

The frontend is responsible for presentation and user interaction.

The backend is responsible for:

- authentication
- authorization
- validation
- game management
- folder management
- persistence

The storage layer abstracts the JSON files from the rest of the application.

---

# 3. Project Structure

```text
game-library/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── storage/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── package.json
│
├── data/
│   ├── users.json
│   ├── games.json
│   ├── folders.json
│   └── folder-games.json
│
├── backups/
│
├── docs/
│   └── ARCHITECTURE.md
│
├── .gitignore
├── README.md
└── package.json
```

---

# 4. Entities

## User

```text
User
├── id
├── username
├── passwordHash
└── createdAt
```

Passwords must never be stored as plaintext.

Passwords will be hashed using Argon2id.

---

## Game

```text
Game
├── id
├── name
├── genre[]
├── rating
├── description
├── type
├── ownerId
├── createdAt
└── updatedAt
```

A game belongs to a user through `ownerId`.

---

## Folder

```text
Folder
├── id
├── name
├── parentId
└── ownerId
```

`parentId` allows folders to contain other folders.

A root folder has:

```text
parentId = null
```

---

## FolderGame

The relationship between games and folders is stored separately.

```text
FolderGame
├── folderId
└── gameId
```

This allows the same game to potentially appear in multiple folders without duplicating the actual game record.

---

# 5. Game Status

The backend will use the following status values:

```text
ongoing
done
paused
dropped
to_be_played
platinized
```

The frontend may display these values with localized human-readable labels.

Example:

```text
ongoing      → ONGOING
done         → DONE
paused       → PAUSED
dropped      → DROPPED
to_be_played → TO BE PLAYED
platinized   → PLATINÁZVA
```

Each status will have a visual indicator.

The `platinized` status will have an additional subtle visual effect.

---

# 6. Authentication

Authentication will use:

```text
username + password
```

After successful login, the backend will create a session.

The session will be stored using a secure HTTP-only cookie.

The browser will not directly manage authentication tokens.

The backend will determine the authenticated user for each request.

---

# 7. Authorization

Every user-owned entity will contain an `ownerId`.

For example:

```json
{
  "id": "game_001",
  "ownerId": "user_001"
}
```

The backend must verify ownership before allowing access or modification.

A user must never be able to access another user's games or folders by simply changing an ID in an API request.

---

# 8. Storage

The first version will not use a traditional database.

Data will be stored in local JSON files:

```text
data/
├── users.json
├── games.json
├── folders.json
└── folder-games.json
```

The rest of the application will not directly read or write these files.

Instead:

```text
Route
  ↓
Service
  ↓
Storage Layer
  ↓
JSON file
```

This makes it possible to replace the storage implementation in the future without rewriting the application.

---

# 9. Safe JSON Writes

JSON writes should use an atomic write strategy.

Instead of directly replacing the existing file:

```text
games.json
```

the application should first write:

```text
games.json.tmp
```

and after the write succeeds, replace the original file.

This reduces the risk of corrupting the data file if the application stops during a write.

---

# 10. API

Initial API structure:

## Authentication

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Games

```text
GET    /api/games
GET    /api/games/:id
POST   /api/games
PUT    /api/games/:id
DELETE /api/games/:id
```

## Folders

```text
GET    /api/folders
GET    /api/folders/:id
POST   /api/folders
PUT    /api/folders/:id
DELETE /api/folders/:id
```

## Folder/Game relationships

```text
POST   /api/folders/:folderId/games/:gameId
DELETE /api/folders/:folderId/games/:gameId
```

The API may be expanded as the project develops.

---

# 11. Frontend

The frontend will contain the following main areas:

```text
Login
  │
  ▼
Game Library
  ├── Folder navigation
  ├── Search
  ├── Filtering
  ├── Sorting
  ├── Tile view
  └── List view
```

Main pages/components will include:

```text
Login
Library
GameDetails
GameForm
FolderTree
GameTile
GameList
StatusBadge
ViewSwitcher
SearchBar
FilterPanel
```

---

# 12. Views

## Tile View

Games will be displayed as cards.

Each card should show at minimum:

- game name
- genre
- rating
- status

The status should have a visual indicator.

Platinized games should have a subtle non-intrusive visual effect.

---

## List View

Games will be displayed in a compact table/list.

At minimum:

```text
Name
Genre
Rating
Status
```

The same status indicators used by the tile view should be available here.

---

# 13. Search and Filtering

The library should support:

- name search
- status filtering
- genre filtering
- rating filtering
- sorting by name
- sorting by rating
- sorting by creation/modification date

---

# 14. Backups

The application should support local backups of the JSON data.

Backups may be stored in:

```text
backups/
```

The backup system should make it possible to restore the application data after accidental deletion or corruption.

---

# 15. Deployment

The application is intended to run on a personal/home server.

Initial deployment target:

```text
Linux
Node.js
Local JSON storage
```

A reverse proxy such as Nginx or Caddy may be added later.

Docker is not required for the initial version.

---

# 16. Development Principles

The project should prioritize:

1. Simplicity
2. Maintainability
3. Easy local deployment
4. Safe data storage
5. Clear separation between frontend, backend and storage
6. Minimal external dependencies
7. Easy backup and migration

The system should not introduce infrastructure that is unnecessary for a small personal application.

---

# 17. Current Phase

Current phase:

```text
Phase 0 — Planning & Architecture
```

Next major phase:

```text
Phase 1 — Project Setup
```
