"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const data = await apiRequest<{
        token?: { accessToken: string };
        accessToken?: string;
      }>(mode === "login" ? "/auth/login" : "/auth/signup", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const token = data.accessToken ?? data.token?.accessToken;
      if (!token) throw new Error("No access token was returned");
      localStorage.setItem("accessToken", token);
      router.push("/");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to authenticate",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">
        <div className="hidden bg-indigo-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <MessageCircle /> Ripple
          </div>
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-indigo-200">
              Private conversations
            </p>
            <h1 className="text-5xl font-semibold leading-tight">
              Make space for better conversations.
            </h1>
          </div>
          <p className="text-sm text-indigo-200">
            A calm, fast place for the people you care about.
          </p>
        </div>
        <div className="p-8 sm:p-12">
          <div className="mb-10 flex items-center gap-3 text-lg font-semibold text-slate-900 lg:hidden">
            <MessageCircle className="text-indigo-600" /> Ripple
          </div>
          <p className="mb-2 text-sm font-medium text-indigo-600">
            {mode === "login" ? "Welcome back" : "Get started"}
          </p>
          <h2 className="mb-2 text-3xl font-semibold text-slate-950">
            {mode === "login" ? "Sign in to Ripple" : "Create your account"}
          </h2>
          <p className="mb-8 text-sm text-slate-500">
            {mode === "login"
              ? "Pick up where you left off."
              : "Start meaningful conversations today."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <label className="input-wrap">
                <UserRound />
                <input
                  required
                  placeholder="Display name"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                />
              </label>
            )}
            <label className="input-wrap">
              <Mail />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="input-wrap">
              <LockKeyhole />
              <input
                required
                minLength={8}
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <button disabled={loading} className="button-primary w-full">
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}{" "}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500">
            {mode === "login" ? "New to Ripple?" : "Already have an account?"}{" "}
            <Link
              className="font-semibold text-indigo-600"
              href={mode === "login" ? "/signup" : "/login"}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
