"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Package, Zap, BarChart3, ArrowRight, Globe } from "lucide-react";

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= target) {
          clearInterval(timer);
          return target;
        }
        return Math.min(prev + step, target);
      });
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return Math.floor(count);
}

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const count = useCounter(value);
  return (
    <div className="text-center">
      <div className="font-display text-5xl font-semibold text-white">
        {count}{suffix}
      </div>
      <div className="text-white/70 font-sans text-sm mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf9]/90 backdrop-blur border-b border-[#e5e3df]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-[#1a1a2e]">
            FashionWholesale <span className="text-[#c9a84c]">Corp</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#1a1a2e] text-sm font-sans font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#2d4a7a] text-white text-sm font-sans font-medium px-4 py-2 rounded-md hover:bg-[#1e3459] transition-colors"
            >
              Register <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 text-[#c9a84c] text-xs font-sans font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 border border-[#c9a84c]/20">
              <Globe size={12} />
              B2B Wholesale Portal
            </div>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-light text-[#1a1a2e] leading-tight tracking-tight mb-6">
              Golden PDP Fashion,
              <br />
              <span className="text-[#c9a84c]">Wholesale Scale</span>
            </h1>
            <p className="text-[#6b7280] font-sans text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              The unified B2B portal for wholesale clothing buyers. Browse thousands of premium styles, place bulk orders, and track every shipment in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#2d4a7a] text-white font-sans font-medium px-8 py-3.5 rounded-md hover:bg-[#1e3459] transition-all hover:shadow-lg text-base"
              >
                Access Portal <ArrowRight size={16} />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 border border-[#e5e3df] text-[#1a1a2e] font-sans font-medium px-8 py-3.5 rounded-md hover:bg-gray-50 transition-colors text-base"
              >
                Create Account
              </Link>
            </div>
          </motion.div>

          {/* Hero image strip */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-20 grid grid-cols-4 gap-3 rounded-2xl overflow-hidden max-w-4xl mx-auto"
          >
            {[101, 200, 301, 400].map((seed) => (
              <div key={seed} className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${seed}/300/400`}
                  alt="Fashion product"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white border-y border-[#e5e3df]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-light text-[#1a1a2e] mb-4">
              Everything you need to buy at scale
            </h2>
            <p className="text-[#6b7280] font-sans max-w-xl mx-auto">
              From catalogue browsing to order tracking — our portal streamlines the entire wholesale process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: "Wide Catalogue",
                desc: "500+ premium clothing styles across Men, Women, Kids & Accessories. New arrivals every season.",
                color: "bg-blue-50 text-[#2d4a7a]",
              },
              {
                icon: Zap,
                title: "Fast Fulfilment",
                desc: "Same-day order processing. Real-time stock levels so you always know what's available.",
                color: "bg-amber-50 text-[#c9a84c]",
              },
              {
                icon: BarChart3,
                title: "Real-time Tracking",
                desc: "Full shipment visibility from warehouse to your door. Live order status and delivery updates.",
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-[#fafaf9] rounded-xl p-8 border border-[#e5e3df] hover:shadow-card-hover transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-lg ${color} mb-5`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-2xl font-medium text-[#1a1a2e] mb-3">{title}</h3>
                <p className="text-[#6b7280] font-sans leading-relaxed text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 bg-[#1a1a2e]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatCard value={500} suffix="+" label="Products" />
          <StatCard value={200} suffix="+" label="Active Buyers" />
          <StatCard value={98} suffix="%" label="On-time Delivery" />
          <StatCard value={15} suffix="" label="Countries Served" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-5xl font-light text-[#1a1a2e] mb-6">
            Ready to get started?
          </h2>
          <p className="text-[#6b7280] font-sans mb-8">
            Join hundreds of retailers already sourcing from FashionWholesale Corp.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#c9a84c] text-white font-sans font-medium px-8 py-3.5 rounded-md hover:bg-amber-600 transition-colors text-base"
          >
            Access the Portal <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e3df] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg text-[#1a1a2e]">
            FashionWholesale <span className="text-[#c9a84c]">Corp</span>
          </span>
          <p className="text-[#6b7280] font-sans text-sm">
            © {new Date().getFullYear()} FashionWholesale Corp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
