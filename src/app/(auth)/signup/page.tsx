"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const supabase = createClient();
      const appUrl = typeof window !== "undefined" 
        ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
        : process.env.NEXT_PUBLIC_APP_URL;
      const redirectTo = appUrl ? `${appUrl.replace(/\/$/, "")}/auth/callback` : undefined;
      const { error } = await supabase.auth.signUp(
        { email, password },
        { emailRedirectTo: redirectTo }
      );
      if (error) throw error;
      setMessage("Check your email to confirm your account.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 liquid-bg relative">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-white/10 relative z-20 pointer-events-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Trade<span className="text-brand-orange">Rush</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              placeholder="Min 6 characters"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-orange text-black font-bold rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-orange hover:underline cursor-pointer">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
