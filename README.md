# Ripple Real-Time Chat Application

Ripple is a full-stack real-time chat application built as a technical assignment using Next.js, NestJS, TypeScript, MongoDB, Mongoose, and Socket.IO.

The application allows authenticated users to:

- Register and log in
- Manage their profile
- Upload a profile picture
- Search for other users
- Start one-to-one conversations
- Send and receive messages in real time
- See typing indicators
- See online and offline events
- Track unread messages
- Mark messages as read
- See delivered and seen message states
- Load older message history with pagination

## Project goals

The project is designed around the requirements of a production-oriented chat application:

- Clear separation between frontend, backend, and persistence
- JWT-protected REST APIs
- Authenticated WebSocket communication
- MongoDB document modeling with references
- Server-side conversation authorization
- Validated REST and Socket.IO payloads
- Paginated message history
- Immediate conversation-list updates
- A responsive, modern chat interface

## Technology stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React icons
- Socket.IO Client
- Cloudinary unsigned image uploads

### Backend

- Node.js
- NestJS
- TypeScript
- MongoDB
- Mongoose
- Passport JWT
- Socket.IO
- class-validator

### Optional infrastructure

The current implementation does not require Redis or Docker. Redis would be a suitable next step for distributed token revocation, presence, and Socket.IO scaling.

## Repository structure

```text
chat-app/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── conversation/
│   │   ├── message/
│   │   ├── schemas/
│   │   ├── user/
│   │   └── main.ts
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── README.md
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas or a local MongoDB server
- A Cloudinary account if profile-picture uploads are required

## Environment configuration

### Backend

Create `backend/.env` from `backend/.env.example`:

```env
DB_NAME=chatApp
MONGODB_URI=mongodb://127.0.0.1:27017
SALT=replace-with-your-password-salt
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
```

Do not commit real credentials or secrets.

### Frontend

Create `frontend/.env.local` from `frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

The REST URL includes `/api`, while the Socket.IO URL points to the backend origin.

## Starting the application

Open two terminals.

### Terminal 1: backend

```bash
cd backend
npm install
npm run start:dev
```

The backend runs on:

```text
http://localhost:3000
```

REST APIs use:

```text
http://localhost:3000/api
```

Socket.IO uses the same backend origin and port.

### Terminal 2: frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:8000
```

The final local architecture is:

```text
Browser
  ├── Next.js frontend: http://localhost:8000
  ├── REST requests:    http://localhost:3000/api
  └── Socket.IO:        http://localhost:3000
```

## Application workflow

### Authentication workflow

1. A user opens `/login` or `/signup`.
2. The frontend submits credentials to the backend.
3. Signup validates the display name, email, and password.
4. Login validates the email and password.
5. Passwords are hashed before being saved.
6. The backend returns a JWT access token.
7. The frontend stores the access token locally.
8. REST requests include `Authorization: Bearer <token>`.
9. Socket.IO sends the token in the connection handshake.
10. The backend validates both REST and WebSocket authentication.
11. Logout revokes the token and clears the frontend session.

JWTs receive a unique token identifier. The current implementation stores revoked token identifiers in memory until they expire. Redis would be preferred for a distributed production deployment.

### User and profile workflow

Users can:

- View their profile
- Update profile data
- Upload a profile picture
- Search for users from the chat sidebar

Profile pictures are uploaded directly from the browser to Cloudinary using an unsigned upload preset. Cloudinary returns a `secure_url`, which is then sent to the backend and stored on the user document.

Only public Cloudinary configuration belongs in the frontend. Cloudinary API secrets must never be exposed there.

### Conversation workflow

1. An authenticated user searches for another user.
2. The user selects a search result.
3. The frontend calls `POST /api/conversation`.
4. The backend verifies that the recipient exists.
5. Self-conversations are rejected.
6. Existing one-to-one conversations are reused.
7. The conversation is immediately added to the sidebar.
8. The chat panel opens without a page refresh.

Conversation access is validated on the backend for message history, sending, typing, and read events.

### Message workflow

1. The frontend emits `message:send`.
2. The gateway gets the sender ID from the authenticated socket.
3. The backend validates message content.
4. The backend verifies conversation membership.
5. The message is stored in MongoDB.
6. The conversation's `lastMessageId` is updated.
7. The backend emits `message:new` to both participants.
8. Both clients update the active chat and conversation preview.
9. If the recipient did not previously have the conversation in the sidebar, the frontend refreshes the conversation list through the existing authenticated API and adds it immediately.

### Typing workflow

Typing events are not stored in MongoDB:

```text
Client → conversation:typing
Server → conversation:typing
Recipient → shows or hides typing indicator
```

The server first verifies that the socket user belongs to the conversation.

### Read and unread workflow

- Messages from the other participant with `readAt: null` are unread.
- The backend calculates `unreadCount` for each conversation.
- The frontend displays an unread badge in the sidebar.
- Opening a conversation emits `conversation:read`.
- The backend marks incoming messages as read.
- The sender receives a read event.
- The frontend updates the sender's message from `Delivered` to `Seen`.
- Opening a chat clears its local unread badge without a refresh.

### Presence workflow

The gateway emits:

```text
user:online
user:offline
```

The frontend uses these events to display online indicators. This is intentionally a simple single-server presence implementation.

## REST API

All routes use the `/api` prefix. Protected routes require:

```http
Authorization: Bearer ACCESS_TOKEN
```

### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
```

Signup body:

```json
{
  "displayName": "Ahmed",
  "email": "ahmed@example.com",
  "password": "Password123"
}
```

Login body:

```json
{
  "email": "ahmed@example.com",
  "password": "Password123"
}
```

### Users

```http
GET /api/user
GET /api/user/profile
GET /api/user/:id
PATCH /api/user/:id
DELETE /api/user/:id
```

### Conversations

```http
GET /api/conversation
POST /api/conversation
GET /api/conversation/:recipientId
```

Create conversation:

```json
{
  "recipientId": "MONGODB_USER_ID"
}
```

### Messages

```http
GET /api/conversation/:conversationId/messages?page=1&limit=50
POST /api/conversation/:conversationId/messages/read
```

Message creation is handled through Socket.IO so that persistence and delivery happen in one real-time flow.

Message history returns:

```json
{
  "messages": [],
  "page": 1,
  "limit": 50,
  "total": 0,
  "hasNextPage": false
}
```

## Socket.IO API

Connect with:

```ts
const socket = io("http://localhost:3000", {
  auth: {
    token: accessToken,
  },
});
```

### Client events

```ts
socket.emit("message:send", {
  conversationId: "CONVERSATION_ID",
  content: "Hello",
});

socket.emit("conversation:typing", {
  conversationId: "CONVERSATION_ID",
  isTyping: true,
});

socket.emit("conversation:read", {
  conversationId: "CONVERSATION_ID",
});
```

### Server events

```text
message:new
conversation:typing
conversation:read
user:online
user:offline
```

## Database strategy

### Users collection

Stores:

- Display name
- Lowercase unique email
- Hashed password
- Profile picture URL
- Online state
- Created and updated timestamps

The password is excluded from ordinary user queries.

### Conversations collection

Stores:

- Exactly two participant IDs
- Latest message ID
- Created and updated timestamps

Participants are references to the Users collection.

### Messages collection

Stores:

- Conversation ID
- Sender ID
- Text content
- `createdAt`
- `readAt`

Messages use a compound index on:

```text
conversationId + createdAt
```

This supports chronological conversation history queries.

## Validation and security strategy

- DTO validation is enabled globally.
- Unknown request fields are rejected.
- Invalid MongoDB IDs are rejected.
- Message content must be non-empty and is capped at 5000 characters.
- Pagination values are constrained between valid limits.
- WebSocket payloads use DTO validation.
- REST routes are protected by a global JWT guard.
- WebSocket connections validate JWTs during handshake.
- Conversation membership is checked server-side.
- Passwords are hashed and never returned as normal user data.
- Secrets are loaded from environment variables.
- CORS is enabled for frontend development.

## Pagination strategy

Message history uses page-based pagination:

```http
GET /api/conversation/:conversationId/messages?page=1&limit=50
```

The frontend initially loads the newest available page and provides `Load older messages` behavior. Older pages are prepended while preserving the user's scroll position.

Cursor-based pagination would be a stronger choice for very high-volume conversations, but page-based pagination is adequate for the current assignment scope.

## Profile picture strategy

The browser uploads images directly to Cloudinary through an unsigned preset:

1. User selects a local image.
2. Frontend sends the file to Cloudinary.
3. Cloudinary returns a secure URL.
4. Frontend sends the URL to the backend profile endpoint.
5. Backend stores the URL on the user document.

This avoids routing large image files through the NestJS server.

## Testing and quality commands

### Backend

```bash
cd backend
npm run build
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Manual end-to-end test

1. Start MongoDB.
2. Start the backend on port `3000`.
3. Start the frontend on port `8000`.
4. Create two accounts.
5. Log in as each user in separate browser windows.
6. Search for the other user.
7. Start a conversation.
8. Send a message.
9. Confirm the recipient sees the conversation without refreshing.
10. Confirm typing events appear.
11. Confirm unread count appears.
12. Open the conversation and confirm the unread count clears.
13. Confirm the sender sees `Seen`.
14. Send more than 50 messages.
15. Use `Load older messages` and confirm the scroll position is preserved.
16. Upload a profile picture after configuring Cloudinary.
17. Log out and confirm protected routes are no longer accessible.

## Current trade-offs and future improvements

- Move token revocation from memory to Redis.
- Persist presence with multi-socket tracking.
- Add a dedicated paginated user-search endpoint instead of loading all users.
- Add stronger profile ownership checks for update and delete routes.
- Add delivery acknowledgements separate from message persistence.
- Add automated integration and WebSocket tests.
- Add cursor-based message pagination for very large histories.
- Add Docker Compose for MongoDB, Redis, backend, and frontend.

## Additional documentation

Detailed subsystem documentation is also available in:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

