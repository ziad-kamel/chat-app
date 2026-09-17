"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Settings,
  Smile,
  UserPlus,
  X,
  LogOut,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import {
  apiRequest,
  Conversation,
  Message,
  User,
  uploadAvatar,
} from "@/lib/api";
import { closeSocket, getSocket } from "@/lib/socket";

function participant(conversation: Conversation, userId: string) {
  return conversation.participantsIds.find(
    (item) => typeof item !== "string" && item._id !== userId,
  ) as User | undefined;
}

function time(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [typing, setTyping] = useState(false);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof getSocket>>(null);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter(
      (item) =>
        item._id !== user?._id &&
        (!query ||
          item.displayName.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query)),
    );
  }, [search, user, users]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    async function load() {
      try {
        const current = await apiRequest<User>("/user/profile");
        const list = await apiRequest<Conversation[]>("/conversation");
        const allUsers = await apiRequest<User[]>("/user");
        setUser(current);
        setConversations(list);
        setUsers(allUsers);
        if (list[0]) setActive(list[0]);
        socketRef.current = getSocket();
      } catch {
        localStorage.removeItem("accessToken");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onMessage = (message: Message) => {
      setMessages((current) =>
        message.conversationId === active?._id &&
        !current.some((item) => item._id === message._id)
          ? [...current, message]
          : current,
      );
      setConversations((current) =>
        current.map((item) =>
          item._id === message.conversationId
            ? { ...item, lastMessageId: message }
            : item,
        ),
      );
    };
    const onTyping = (event: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (event.conversationId === active?._id && event.userId !== user?._id)
        setTyping(event.isTyping);
    };
    const online = ({ userId }: { userId: string }) =>
      setOnlineIds((current) => [...new Set([...current, userId])]);
    const offline = ({ userId }: { userId: string }) =>
      setOnlineIds((current) => current.filter((id) => id !== userId));
    socket
      .on("message:new", onMessage)
      .on("conversation:typing", onTyping)
      .on("user:online", online)
      .on("user:offline", offline);
    return () => {
      socket
        .off("message:new", onMessage)
        .off("conversation:typing", onTyping)
        .off("user:online", online)
        .off("user:offline", offline);
    };
  }, [active?._id, user?._id]);

  useEffect(() => {
    if (!active || !user) return;
    apiRequest<{ messages: Message[] }>(
      `/conversation/${active._id}/messages?page=1&limit=50`,
    )
      .then((data) => setMessages(data.messages))
      .catch(() => setMessages([]));
    socketRef.current?.emit("conversation:read", {
      conversationId: active._id,
    });
  }, [active, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function createConversation(recipientId: string) {
    const conversation = await apiRequest<Conversation>("/conversation", {
      method: "POST",
      body: JSON.stringify({ recipientId }),
    });
    setConversations((current) =>
      current.some((item) => item._id === conversation._id)
        ? current
        : [conversation, ...current],
    );
    setActive(conversation);
    setSearch("");
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !active || !socketRef.current) return;
    setNewMessage("");
    socketRef.current.emit("conversation:typing", {
      conversationId: active._id,
      isTyping: false,
    });
    const message = (await socketRef.current.emitWithAck("message:send", {
      conversationId: active._id,
      content,
    })) as Message;
    setMessages((current) =>
      current.some((item) => item._id === message._id)
        ? current
        : [...current, message],
    );
  }

  function handleTyping(value: string) {
    setNewMessage(value);
    if (active)
      socketRef.current?.emit("conversation:typing", {
        conversationId: active._id,
        isTyping: value.length > 0,
      });
  }

  async function logout() {
    await apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
    closeSocket();
    localStorage.removeItem("accessToken");
    router.replace("/login");
  }

  async function changeAvatar(file?: File) {
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      const updated = await apiRequest<User>(`/user/${user._id}`, {
        method: "PATCH",
        body: JSON.stringify({ profilePictureURL: url }),
      });
      setUser(updated);
    } finally {
      setUploading(false);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">
        Loading your conversations...
      </div>
    );
  const activeUser = active && user ? participant(active, user._id) : undefined;

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-0 text-slate-900 md:p-5">
      <div className="mx-auto flex h-screen max-w-[1500px] overflow-hidden bg-white shadow-2xl shadow-slate-200/50 md:h-[calc(100vh-2.5rem)] md:rounded-[2rem]">
        <aside className="flex w-full max-w-[370px] flex-col border-r border-slate-100 bg-[#fbfcff]">
          <header className="border-b border-slate-100 p-6">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h1 className="font-semibold">Ripple</h1>
                  <p className="text-xs text-slate-400">Your conversations</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfile(true)}
                className="rounded-full transition hover:opacity-80"
              >
                <Avatar
                  name={user?.displayName ?? "U"}
                  image={user?.profilePictureURL}
                  size="sm"
                />
              </button>
            </div>
            <div className="input-wrap">
              <Search />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people or conversations"
              />
            </div>
          </header>
          {search && (
            <div className="border-b border-slate-100 p-3">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Start a conversation
              </p>
              {visibleUsers.slice(0, 5).map((item) => (
                <button
                  key={item._id}
                  onClick={() => void createConversation(item._id)}
                  className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-indigo-50"
                >
                  <Avatar
                    name={item.displayName}
                    image={item.profilePictureURL}
                  />
                  <span className="text-sm font-medium">
                    {item.displayName}
                  </span>
                  <UserPlus className="ml-auto text-indigo-500" size={16} />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Messages
            </p>
            {conversations.map((conversation) => {
              const person = user && participant(conversation, user._id);
              if (!person) return null;
              return (
                <button
                  key={conversation._id}
                  onClick={() => setActive(conversation)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${active?._id === conversation._id ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                >
                  <Avatar
                    name={person.displayName}
                    image={person.profilePictureURL}
                    online={onlineIds.includes(person._id) || person.isOnline}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {person.displayName}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {conversation.lastMessageId?.content ?? "Start chatting"}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {time(conversation.lastMessageId?.createdAt)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 border-t border-slate-100 p-4">
            <Avatar
              name={user?.displayName ?? "U"}
              image={user?.profilePictureURL}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.displayName}
              </p>
              <p className="text-xs text-emerald-500">Online now</p>
            </div>
            <button
              onClick={() => setShowProfile(true)}
              className="icon-button"
            >
              <Settings size={17} />
            </button>
          </div>
        </aside>
        <section className="hidden min-w-0 flex-1 flex-col md:flex">
          {activeUser ? (
            <>
              <header className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={activeUser.displayName}
                    image={activeUser.profilePictureURL}
                    online={
                      onlineIds.includes(activeUser._id) || activeUser.isOnline
                    }
                  />
                  <div>
                    <h2 className="font-semibold">{activeUser.displayName}</h2>
                    <p className="text-xs text-slate-400">
                      {typing
                        ? "typing..."
                        : onlineIds.includes(activeUser._id)
                          ? "Online"
                          : "Usually replies quickly"}
                    </p>
                  </div>
                </div>
                <button className="icon-button">
                  <MoreHorizontal />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto bg-[#fcfdff] px-8 py-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-3">
                  {messages.map((message) => {
                    const mine =
                      (typeof message.senderId === "string"
                        ? message.senderId
                        : message.senderId._id) === user?._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-3xl px-4 py-3 text-sm ${mine ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"}`}
                        >
                          <p>{message.content}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-indigo-200" : "text-slate-400"}`}
                          >
                            <span>{time(message.createdAt)}</span>
                            {mine && (
                              <span>
                                {message.readAt ? "✓✓ Seen" : "✓ Delivered"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {typing && (
                    <p className="text-xs text-slate-400">
                      {activeUser.displayName} is typing...
                    </p>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-3 border-t border-slate-100 bg-white p-5"
              >
                <button type="button" className="icon-button">
                  <Paperclip size={19} />
                </button>
                <input
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button type="button" className="icon-button">
                  <Smile size={19} />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white transition hover:bg-indigo-700">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                <MessageCircle size={34} />
              </div>
              <h2 className="text-xl font-semibold">Your inbox is quiet</h2>
              <p className="mt-2 max-w-xs text-sm text-slate-400">
                Search for someone on the left to start a new conversation.
              </p>
            </div>
          )}
        </section>
      </div>
      {showProfile && user && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your profile</h2>
              <button
                className="icon-button"
                onClick={() => setShowProfile(false)}
              >
                <X />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <label className="group relative cursor-pointer">
                <Avatar
                  name={user.displayName}
                  image={user.profilePictureURL}
                  size="lg"
                />
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/50 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  {uploading ? "Uploading" : "Change"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void changeAvatar(e.target.files?.[0])}
                />
              </label>
              <h3 className="mt-4 font-semibold">{user.displayName}</h3>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              <LogOut size={17} /> Sign out
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
