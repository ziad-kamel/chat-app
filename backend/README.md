# Ripple Chat Backend

NestJS backend for Ripple, a real-time one-to-one chat application. The backend provides JWT-authenticated REST APIs, MongoDB persistence through Mongoose, and an authenticated Socket.IO gateway for real-time chat events.

## Stack

- Node.js
- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT and Passport
- Socket.IO
- class-validator

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas or a local MongoDB server

## Installation

```bash
cd backend
npm install
```

Create a local environment file:

```bash
copy .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Configure the values before starting the server.

## Environment variables

```env
DB_NAME=chatApp
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=replace-with-a-long-random-secret
SALT=replace-with-your-password-salt
PORT=3000
```

Do not commit `.env` or real credentials. The backend reads the MongoDB database name and connection URI through `ConfigService`.

## Running the backend

Development with file watching:

```bash
npm run start:dev
```

Development without watch mode:

```bash
npm run start
```

Production:

```bash
npm run build
npm run start:prod
```

The backend listens on:

```text
http://localhost:3000
```

All REST routes use the `/api` prefix:

```text
http://localhost:3000/api
```

Socket.IO uses the same server and port:

```text
http://localhost:3000
```

## Application workflow

### Authentication flow

1. A user signs up with a display name, email, and password.
2. The password is hashed before it is stored.
3. The backend returns a JWT access token.
4. The frontend sends the token as `Authorization: Bearer <token>` for REST requests.
5. The frontend sends the token in the Socket.IO handshake auth object.
6. The JWT strategy validates protected REST requests.
7. The WebSocket gateway validates the Socket.IO token before accepting the connection.
8. Logout revokes the token until its expiration time.

### Conversation flow

1. An authenticated user creates a conversation with another user.
2. The backend rejects self-conversations.
3. The backend verifies that the recipient exists.
4. Existing one-to-one conversations are returned instead of creating another one.
5. Conversation access is checked before reading or sending messages.

### Message flow

1. The client emits `message:send` through Socket.IO.
2. The gateway identifies the sender from the authenticated socket.
3. The service validates conversation membership.
4. The message is saved in MongoDB.
5. The conversation's `lastMessageId` is updated.
6. `message:new` is emitted to both participants.
7. The recipient can emit `conversation:read`.
8. Incoming messages are marked with `readAt`.
9. The sender receives `conversation:read` and can display a seen state.

## REST API

All routes require a bearer token unless stated otherwise.

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

Logout requires:

```http
Authorization: Bearer ACCESS_TOKEN
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

Create conversation body:

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

Message creation is intentionally handled through Socket.IO.

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

Send a message:

```ts
socket.emit("message:send", {
  conversationId: "CONVERSATION_ID",
  content: "Hello",
});
```

Typing:

```ts
socket.emit("conversation:typing", {
  conversationId: "CONVERSATION_ID",
  isTyping: true,
});
```

Stop typing by sending `isTyping: false`.

Mark messages as read:

```ts
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

## Database design

### Users

Stores:

- Display name
- Lowercase unique email
- Hashed password
- Profile picture URL
- Online status
- Timestamps

The password field is excluded from normal queries.

### Conversations

Stores:

- Exactly two participant user IDs
- The latest message ID
- Timestamps

Participant IDs are references to the Users collection.

### Messages

Stores:

- Conversation ID
- Sender ID
- Text content
- `createdAt`
- `readAt`

Messages use the compound index:

```text
conversationId + createdAt
```

This supports conversation history queries sorted by creation time.

## Validation and authorization

- Global `ValidationPipe` removes unknown fields and rejects unexpected fields.
- DTOs validate authentication, conversations, message content, pagination, and Socket.IO payloads.
- MongoDB IDs are validated before database access.
- Users must be conversation participants to retrieve history, send messages, mark messages read, or emit typing events.
- Passwords are hashed and never returned as normal user data.
- JWT secrets are loaded from environment variables.
- CORS is enabled for the Next.js frontend.

## Testing and quality commands

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

## Current trade-offs

- The token blacklist is stored in process memory. This is suitable for a single-server assignment deployment, but Redis should be used for persistent revocation and multiple backend instances.
- Presence is implemented through Socket.IO online/offline events and is intentionally simple.
- Message history currently uses page-based pagination. Cursor pagination would be preferable for very large conversations.

