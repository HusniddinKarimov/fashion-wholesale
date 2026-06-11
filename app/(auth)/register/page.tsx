"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create your account. Please try again.");
      setLoading(false);
      return;
    }

    // Account created — sign in automatically and head to the catalogue.
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      // Account exists but sign-in failed — fall back to the login page.
      router.push("/login");
      return;
    }

    router.push("/catalogue");
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=1000"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div>
            <span className="font-display text-2xl font-semibold text-white">
              FashionWholesale <span className="text-[#c9a84c]">Corp</span>
            </span>
          </div>
          <div>
            <blockquote className="font-display text-3xl font-light text-white leading-relaxed mb-4">
              "Join 200+ retailers sourcing smarter, every season."
            </blockquote>
            <p className="text-white/50 font-sans text-sm">Wholesale pricing. Low minimums. Fast fulfilment.</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-2">
              Create your account
            </h1>
            <p className="text-[#6b7280] font-sans">Open a wholesale buyer account in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] font-sans mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="w-full h-11 border border-[#e5e3df] rounded-md px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] font-sans mb-1.5">
                Company <span className="text-[#9ca3af] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your boutique or store"
                className="w-full h-11 border border-[#e5e3df] rounded-md px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] font-sans mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full h-11 border border-[#e5e3df] rounded-md px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] font-sans mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full h-11 border border-[#e5e3df] rounded-md px-3 pr-10 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans rounded-md px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2d4a7a] text-white font-sans font-medium rounded-md flex items-center justify-center gap-2 hover:bg-[#1e3459] transition-colors disabled:opacity-60"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-sans text-[#6b7280]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#2d4a7a] hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
