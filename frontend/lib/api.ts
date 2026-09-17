export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export type User = {
  _id: string;
  displayName: string;
  email?: string;
  profilePictureURL?: string | null;
  isOnline?: boolean;
  createdAt?: string;
};

export type Conversation = {
  _id: string;
  participantsIds: (User | string)[];
  lastMessageId?: {
    content: string;
    senderId: string | User;
    createdAt: string;
    readAt?: string | null;
  } | null;
  updatedAt?: string;
  unreadCount?: number;
};

export type Message = {
  _id: string;
  conversationId: string;
  senderId: string | User;
  content: string;
  createdAt: string;
  readAt?: string | null;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
    throw new Error(message || "Something went wrong");
  }
  return data as T;
}

export async function uploadAvatar(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset || cloudName === "your_cloud_name") {
    throw new Error("Configure Cloudinary in .env.local before uploading a profile picture");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error("Profile picture upload failed");
  const data = await response.json();
  return data.secure_url as string;
}
