"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    // Fetch session to determine role
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    const staffRoles = ["SUPERADMIN", "ADMIN", "MANAGER"];
    if (staffRoles.includes(role)) {
      router.push("/dashboard");
    } else {
      router.push("/catalogue");
    }
  };

  const fillDemo = (role: "superadmin" | "admin" | "manager" | "user") => {
    const emails: Record<string, string> = {
      superadmin: "superadmin@fashionwholesale.com",
      admin: "admin@fashionwholesale.com",
      manager: "manager@fashionwholesale.com",
      user: "buyer@fashionwholesale.com",
    };
    setEmail(emails[role]);
    setPassword("demo1234");
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://picsum.photos/seed/hero/800/1000"
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
              "The future of wholesale fashion — delivered with precision."
            </blockquote>
            <p className="text-white/50 font-sans text-sm">Trusted by 200+ retailers worldwide</p>
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
              Welcome back
            </h1>
            <p className="text-[#6b7280] font-sans">Sign in to your wholesale portal</p>
          </div>

          {/* Demo shortcuts */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button type="button" onClick={() => fillDemo("superadmin")}
              className="text-xs font-sans font-medium border border-[#e5e3df] rounded-md py-2 hover:bg-purple-50 text-purple-700 transition-colors">
              Super Admin
            </button>
            <button type="button" onClick={() => fillDemo("admin")}
              className="text-xs font-sans font-medium border border-[#e5e3df] rounded-md py-2 hover:bg-blue-50 text-blue-700 transition-colors">
              Admin
            </button>
            <button type="button" onClick={() => fillDemo("manager")}
              className="text-xs font-sans font-medium border border-[#e5e3df] rounded-md py-2 hover:bg-teal-50 text-teal-700 transition-colors">
              Manager
            </button>
            <button
              type="button"
              onClick={() => fillDemo("user")}
              className="flex-1 text-xs font-sans font-medium border border-[#e5e3df] rounded-md py-2 hover:bg-gray-50 text-[#6b7280] transition-colors"
            >
              User / Buyer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="••••••••"
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
                <LogIn size={16} />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-[#e5e3df]">
            <p className="text-xs font-sans text-[#6b7280] font-semibold mb-2 uppercase tracking-wide">Demo accounts — password: demo1234</p>
            <div className="space-y-1">
              {[
                { role: "Superadmin", email: "superadmin@fashionwholesale.com", color: "text-purple-700" },
                { role: "Admin",      email: "admin@fashionwholesale.com",      color: "text-blue-700" },
                { role: "Manager",    email: "manager@fashionwholesale.com",    color: "text-teal-700" },
                { role: "User",       email: "buyer@fashionwholesale.com",      color: "text-gray-600" },
              ].map(({ role, email, color }) => (
                <div key={role} className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold font-sans w-20 ${color}`}>{role}</span>
                  <span className="text-xs font-sans text-[#6b7280]">{email}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
