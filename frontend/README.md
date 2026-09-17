# Ripple Chat Frontend

Next.js frontend for Ripple, a real-time one-to-one chat application connected to the NestJS backend.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- Socket.IO Client
- Cloudinary unsigned image uploads

## Requirements

- Node.js 20 or newer
- npm
- The Ripple backend running on port `3000`

## Installation

```bash
cd frontend
npm install
```

Create the local environment file:

```bash
copy .env.example .env.local
```

Linux/macOS:

```bash
cp .env.example .env.local
```

Use the following configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

The REST URL includes `/api`. The Socket.IO URL points to the backend origin and does not include `/api`.

## Running the frontend

Development:

```bash
npm run dev
```

The development server runs on:

```text
http://localhost:8000
```

Production:

```bash
npm run build
npm run start
```

The `dev` and `start` scripts are configured to use port `8000`.

## Application workflow

### Authentication

1. The user opens `/login` or `/signup`.
2. The form sends credentials to the backend.
3. The returned access token is stored in browser local storage.
4. REST requests automatically include the bearer token.
5. The Socket.IO client sends the same token during its handshake.
6. Users without a token are redirected to `/login`.
7. Logout calls the backend, closes the socket, removes the token, and redirects to `/login`.

### Chat workspace

The main page contains:

- Conversation list on the left
- User search
- Active chat on the right
- Message history
- Message composer
- Typing indicator
- Online/offline status
- Unread count badges
- Delivered and seen labels
- Profile settings and avatar upload

### Starting a conversation

1. Search for a registered user.
2. Select the user.
3. The frontend calls `POST /api/conversation`.
4. The returned conversation is immediately added to the sidebar.
5. The chat opens without a refresh.

### Real-time messages

1. The sender emits `message:send`.
2. The backend validates the socket and conversation membership.
3. The backend persists the message.
4. The backend emits `message:new` to both participants.
5. Both clients update their message list and latest-message preview.
6. A conversation received for the first time is added to the recipient's sidebar automatically.

### Read and unread state

- The backend returns `unreadCount` for every conversation.
- A new message increments the recipient's local unread badge.
- Opening a conversation emits `conversation:read`.
- The backend updates `readAt` for messages sent by the other participant.
- The sender receives the read event and displays `Seen`.
- Opening a conversation clears its sidebar unread badge.

### Message pagination

The first page loads with:

```text
GET /api/conversation/:conversationId/messages?page=1&limit=50
```

When the user reaches the top or clicks `Load older messages`, the next page is requested. Older messages are prepended and the scroll position is preserved.

## Socket.IO events

The frontend connects to:

```ts
io(process.env.NEXT_PUBLIC_WS_URL, {
  auth: {
    token: accessToken,
  },
});
```

Client emits:

```text
message:send
conversation:typing
conversation:read
```

Server listeners:

```text
message:new
conversation:typing
conversation:read
user:online
user:offline
```

## Profile picture uploads

Profile images use Cloudinary unsigned uploads:

1. The user selects an image from the profile modal.
2. The browser uploads the file directly to Cloudinary.
3. Cloudinary returns a `secure_url`.
4. The frontend sends that URL to the backend profile endpoint.

Configure:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

To create the upload preset:

1. Create a Cloudinary account.
2. Open Upload Settings.
3. Create an unsigned upload preset.
4. Copy the cloud name and preset name into `.env.local`.

Do not put Cloudinary API secrets in the frontend. Only the public cloud name and unsigned preset are used in the browser.

## Frontend structure

```text
app/
  page.tsx              Main authenticated chat workspace
  login/page.tsx        Login screen
  signup/page.tsx       Signup screen
  globals.css           Global design utilities
components/
  auth-form.tsx         Shared login/signup form
  avatar.tsx            Avatar and online indicator
lib/
  api.ts                REST client and shared API types
  socket.ts             Socket.IO connection lifecycle
```

## API configuration

The frontend expects the backend to run at:

```text
REST:     http://localhost:3000/api
Socket:   http://localhost:3000
Frontend: http://localhost:8000
```

If the backend host or port changes, update `.env.local` and restart Next.js.

## Quality commands

```bash
npm run lint
npm run build
```

## Troubleshooting

### Login fails with an unexpected `displayName` error

Login sends only:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Signup sends `displayName`, `email`, and `password`.

### Messages are not real-time

Check:

1. The backend is running on port `3000`.
2. `NEXT_PUBLIC_WS_URL=http://localhost:3000`.
3. The browser has a valid access token.
4. The browser console does not show a Socket.IO connection error.
5. Both users are members of the same conversation.

### Profile pictures do not upload

Check that the Cloudinary cloud name and unsigned upload preset are configured in `.env.local`, then restart the frontend development server.

