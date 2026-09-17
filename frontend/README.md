# Ripple frontend

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set these values in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

The API URL includes the backend `/api` prefix. The Socket.IO URL does not.

## Features

- Login and signup
- Conversation list and user search
- Paginated conversation history
- Socket.IO real-time messages
- Typing indicators
- Delivered and seen message labels
- Online and offline events
- Profile picture uploads through Cloudinary unsigned uploads
- Logout and protected application access

Create an unsigned upload preset in Cloudinary and place its cloud name and preset name in `.env.local`. The frontend sends the resulting `secure_url` to the backend profile endpoint.
