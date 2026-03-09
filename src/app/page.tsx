"use client";

import Link from "next/link";
import {
  Play,
  FileCode,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  Settings,
  Crosshair,
  BarChart3,
  Radio,
  Wallet,
  Menu,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[#050505] tech-grid" />
      <div className="page-scanline" />

      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-900/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-900/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="grain-overlay" />

      <nav className="fixed z-50 md:px-12 flex w-full pt-6 pr-6 pb-6 pl-6 top-0 items-center justify-between border-b border-white/5 backdrop-blur-md bg-[#050505]/70">
        <div className="hidden md:flex flex-col items-start gap-1">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange shadow-[0_0_10px_#ff4d00]" />
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-brand-orange font-mono font-bold">
              Signals Active
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono pl-5 tracking-wide">
            TRACKING: 1,000+ COINS
          </span>
        </div>

        <div className="hidden md:flex flex-col items-center">
          <span className="text-xs text-brand-orange/90 font-mono tracking-widest border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 rounded-sm">
            COINGECKO • TELEGRAM
          </span>
        </div>

        <button className="md:hidden text-white">
          <Menu className="w-6 h-6" />
        </button>

        <Link
          href="/dashboard"
          className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full border border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 hover:border-brand-orange/50 transition-all duration-300 group backdrop-blur-sm"
        >
          <Wallet className="w-3 h-3 text-brand-orange" />
          <span className="text-xs uppercase tracking-widest font-medium text-white">
            Launch Dashboard
          </span>
          <ChevronRight className="w-3 h-3 text-neutral-500 group-hover:text-brand-orange transition-colors" />
        </Link>
      </nav>

      <main className="min-h-screen flex flex-col w-full z-10 pt-28 pb-8 relative justify-between">
        <div className="container md:px-12 flex flex-col flex-grow h-full mr-auto ml-auto pr-6 pl-6 relative justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-8 md:mt-16">
            <div className="md:col-span-8 relative z-20">
              <div className="flex flex-col select-none glitch-wrapper cursor-default">
                <h1 className="font-display text-[10vw] leading-[0.85] font-black tracking-tight text-white uppercase relative z-20">
                  <span className="glitch-text block md:inline">TRADE</span>
                  <span className="text-hollow md:ml-4 block md:inline glitch-text-hollow">
                    RUSH
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-4 mt-8 ml-2">
                <span className="text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase text-brand-orange border border-brand-orange/30 px-3 py-1.5 rounded bg-brand-orange/10 backdrop-blur-sm">
                  Momentum + News
                </span>
                <div className="h-[1px] w-24 bg-gradient-to-r from-brand-orange/50 to-transparent" />
              </div>
            </div>

            <div className="md:col-span-4 h-[300px] md:h-[400px] relative flex items-center justify-center">
              <div className="sphere-wrapper flex items-center justify-center">
                <div className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] wireframe-sphere flex items-center justify-center">
                  <div className="absolute inset-0 bg-brand-orange/5 rounded-full blur-3xl" />
                  <span className="font-mono text-[10px] text-brand-orange tracking-widest opacity-80 animate-pulse bg-black/50 px-2 py-1">
                    MOMENTUM_ENGINE
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 w-full pb-8 gap-x-8 gap-y-12 items-end mt-12 md:mt-0">
            <div className="md:col-span-6 relative">
              <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-brand-orange/50 via-brand-orange/20 to-transparent hidden md:block" />

              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight mb-1 flex items-center gap-3">
                  System Status:{" "}
                  <span className="text-brand-orange text-glow-orange">NORMAL</span>
                </h2>
                <p className="font-mono text-sm text-neutral-500 tracking-wide">
                  Signal Engine: <span className="text-white">Active</span>
                </p>
              </div>

              <div className="relative group p-2 mb-8">
                <div className="corner-bracket cb-tl" />
                <div className="corner-bracket cb-tr" />
                <div className="corner-bracket cb-bl" />
                <div className="corner-bracket cb-br" />

                <div className="bg-[#0A0A0A] border border-white/5 rounded-sm p-1 grid grid-cols-1 gap-[1px] backdrop-blur-sm relative z-10">
                  <div className="bg-[#080808] p-4 flex justify-between items-center hover:bg-[#0c0c0c] transition-colors border-b border-white/5">
                    <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                      Momentum Threshold
                    </span>
                    <span className="font-mono text-brand-orange font-bold text-lg">
                      5%
                    </span>
                  </div>
                  <div className="bg-[#080808] p-4 flex justify-between items-center hover:bg-[#0c0c0c] transition-colors border-b border-white/5">
                    <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                      Coins Tracked
                    </span>
                    <span className="font-mono text-white">1,000+</span>
                  </div>
                  <div className="bg-[#080808] p-4 flex justify-between items-center hover:bg-[#0c0c0c] transition-colors">
                    <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                      Data Source
                    </span>
                    <span className="font-mono text-white">CoinGecko</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex justify-center items-center gap-2 px-8 py-3 bg-brand-orange/10 border border-brand-orange/50 text-brand-orange hover:bg-brand-orange hover:text-black rounded-sm text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(255,77,0,0.1)] hover:shadow-[0_0_20px_rgba(255,77,0,0.4)]"
                >
                  <Play className="w-3 h-3" />
                  Launch Dashboard
                </Link>
                <Link
                  href="/config"
                  className="inline-flex justify-center items-center gap-2 px-8 py-3 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-sm text-xs font-mono font-bold uppercase tracking-widest transition-colors"
                >
                  <FileCode className="w-3 h-3" />
                  View Config
                </Link>
              </div>
            </div>

            <div className="hidden md:block md:col-span-2" />

            <div className="md:col-span-4 flex flex-col justify-end">
              <div className="border-t border-neutral-800 pt-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-orange dot-seq d1" />
                    <div className="w-2 h-2 rounded-full bg-brand-orange dot-seq d2" />
                    <div className="w-2 h-2 rounded-full bg-brand-orange dot-seq d3" />
                    <div className="w-2 h-2 rounded-full bg-brand-orange dot-seq d4" />
                    <div className="w-2 h-2 rounded-full bg-brand-orange dot-seq d5" />
                    <div className="w-2 h-2 rounded-full bg-brand-orange dot-seq d6" />
                  </div>
                  <span className="font-mono text-xs text-white">
                    Active Channels: Telegram + CoinGecko
                  </span>
                </div>
                <span className="text-[10px] text-neutral-600 font-mono uppercase tracking-[0.2em]">
                  Data Sources
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 w-full px-6 md:px-12 flex justify-between pointer-events-none mix-blend-overlay">
          <span className="font-mono text-[9px] text-neutral-600 tracking-[0.5em] uppercase">
            SYS.V.4.2
          </span>
          <span className="font-mono text-[9px] text-neutral-600 tracking-[0.5em] uppercase">
            SUPABASE + VERCEL
          </span>
        </div>
      </main>

      <section className="py-24 relative z-10 border-t border-white/5 bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-mono text-brand-orange mb-6 block tracking-widest uppercase">
              System Diagnostics
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight mb-6">
              Autonomous Signals <br />{" "}
              <span className="text-neutral-600">In a Volatile Market.</span>
            </h2>
            <h3 className="text-lg text-neutral-400 font-light mb-12 font-mono">
              News + momentum validation executing in real time.
            </h3>

            <div className="grid md:grid-cols-2 gap-8 text-left mt-16 max-w-4xl mx-auto bg-neutral-900/20 p-1 rounded-sm border border-white/5 backdrop-blur-sm">
              <div className="bg-[#080808] p-8 border border-white/5 hover:border-red-500/30 transition-colors group">
                <div className="flex items-center gap-3 mb-4 text-red-500/80">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Momentum Threshold
                  </span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-sm font-mono">
                  &gt; MONITORING PRICE CHANGES<br />
                  &gt; IF MOMENTUM &lt; 5% THEN<br />
                  &gt; EXECUTE: SKIP_SIGNAL<br />
                  &gt; STATUS: <span className="text-red-500">INACTIVE</span>
                </p>
              </div>
              <div className="bg-[#080808] p-8 border border-white/5 hover:border-brand-orange/30 transition-colors group">
                <div className="flex items-center gap-3 mb-4 text-brand-orange/80">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Signal Protocol
                  </span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-sm font-mono">
                  &gt; TELEGRAM ANNOUNCEMENT DETECTED<br />
                  &gt; COINGECKO PRICE CHECK: PASS<br />
                  &gt; MOMENTUM VALIDATION: SYNCED<br />
                  &gt; STATUS: <span className="text-brand-orange">OPERATIONAL</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative z-10 bg-neutral-900/5 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 md:mb-24 max-w-2xl">
            <span className="text-xs font-mono text-brand-orange mb-4 block tracking-widest uppercase">
              Protocol Architecture
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-white mb-4">
              Core Mechanism.
            </h2>
            <p className="text-lg font-light text-neutral-500 font-mono">
              Telegram meets CoinGecko. News meets momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-sm border border-neutral-800 bg-[#080808] hover:border-brand-orange/30 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-orange/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 text-brand-orange group-hover:text-white transition-colors">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-tight font-display">
                CoinGecko Integration
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-mono">
                Top 1,000+ coins. Real-time prices. Market cap data. Automatic refresh via cron.
              </p>
            </div>

            <div className="group relative p-8 rounded-sm border border-neutral-800 bg-[#080808] hover:border-brand-orange/30 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-orange/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 text-brand-orange group-hover:text-white transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-tight font-display">
                Telegram Monitor
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-mono">
                Official channels via Telethon. Announcement detection. Keyword extraction for signal generation.
              </p>
            </div>

            <div className="group relative p-8 rounded-sm border border-neutral-800 bg-[#080808] hover:border-brand-orange/30 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-orange/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 text-brand-orange group-hover:text-white transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-tight font-display">
                Signal Engine
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-mono">
                News + momentum validation. strong_buy / buy / watch signals. Supabase-backed persistence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#030303] z-10 pt-24 pb-24 relative border-t border-white/5">
        <div className="container md:px-12 mr-auto ml-auto pr-6 pl-6">
          <div className="mb-12 flex flex-col md:flex-row justify-between items-end">
            <div>
              <span className="text-xs font-mono text-brand-orange mb-4 block tracking-widest uppercase">
                Live Feed
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white font-display">
                Signal Types.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mt-4 md:mt-0">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              MOMENTUM ENGINE
            </div>
          </div>

          <div className="w-full bg-[#080808] border border-neutral-800 rounded-sm overflow-hidden font-mono text-xs md:text-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="bg-neutral-900/50 border-b border-neutral-800 p-3 flex gap-4 text-neutral-500 uppercase tracking-widest text-[10px]">
              <span className="w-24">Type</span>
              <span className="w-24">Threshold</span>
              <span className="flex-grow">Description</span>
              <span className="w-24 text-right">Action</span>
            </div>

            <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-2 md:gap-4 hover:bg-brand-orange/5 transition-colors cursor-pointer group">
              <span className="text-brand-orange w-24 font-bold">STRONG_BUY</span>
              <span className="text-white w-24">≥10%</span>
              <span className="text-neutral-300 flex-grow">
                High momentum + news confirmation
              </span>
              <span className="text-neutral-500 w-24 text-right">Primary alert</span>
            </div>

            <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-2 md:gap-4 hover:bg-brand-orange/5 transition-colors cursor-pointer group">
              <span className="text-yellow-500 w-24">BUY</span>
              <span className="text-white w-24">≥5%</span>
              <span className="text-neutral-300 flex-grow">
                Moderate momentum + news
              </span>
              <span className="text-neutral-500 w-24 text-right">Secondary</span>
            </div>

            <div className="p-4 flex flex-col md:flex-row gap-2 md:gap-4 hover:bg-brand-orange/5 transition-colors cursor-pointer group">
              <span className="text-neutral-400 w-24">WATCH</span>
              <span className="text-white w-24">&lt;5%</span>
              <span className="text-neutral-300 flex-grow">
                Low momentum, monitor for changes
              </span>
              <span className="text-neutral-500 w-24 text-right">Track</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-900/30 border border-neutral-800 p-4 rounded-sm">
              <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1">
                Coins Tracked
              </div>
              <div className="text-lg text-white font-mono">1,000+</div>
            </div>
            <div className="bg-neutral-900/30 border border-neutral-800 p-4 rounded-sm">
              <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1">
                Data Source
              </div>
              <div className="text-lg text-brand-orange font-mono">CoinGecko</div>
            </div>
            <div className="bg-neutral-900/30 border border-neutral-800 p-4 rounded-sm">
              <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1">
                News Source
              </div>
              <div className="text-lg text-white font-mono">Telegram</div>
            </div>
            <div className="bg-neutral-900/30 border border-neutral-800 p-4 rounded-sm">
              <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1">
                Stack
              </div>
              <div className="text-lg text-brand-orange font-mono">Supabase + Vercel</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative z-10 border-t border-white/5">
        <div className="container md:px-12 mr-auto ml-auto pr-6 pl-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-brand-orange mb-4 block tracking-widest uppercase">
              Protocol Parameters
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4 font-display">
              Scanner Settings.
            </h2>
            <p className="text-neutral-400 font-light text-lg font-mono text-sm">
              Configurable thresholds for signal generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="p-8 rounded-sm border border-neutral-800 bg-[#080808] hover:border-neutral-700 transition-colors relative">
              <div className="absolute top-0 right-0 p-4 text-neutral-700">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold font-mono text-white mb-2 uppercase">
                Momentum Threshold
              </h3>
              <p className="text-xs text-neutral-500 mb-6 font-mono">
                Minimum % for signal generation.
              </p>
              <div className="mb-8 font-mono text-3xl text-white">5%</div>
              <ul className="space-y-3 text-xs text-neutral-400 font-mono border-t border-neutral-800 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-brand-orange" /> Triggers buy signal
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-brand-orange" /> News must confirm
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-sm border border-brand-orange/40 bg-[#080808] shadow-[0_0_30px_-10px_rgba(255,77,0,0.1)] relative">
              <div className="absolute top-0 right-0 p-4 text-brand-orange">
                <Crosshair className="w-5 h-5" />
              </div>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-orange/50" />
              <h3 className="text-md font-bold font-mono text-brand-orange mb-2 uppercase text-glow-orange">
                Monitor Window
              </h3>
              <p className="text-xs text-neutral-400 mb-6 font-mono">
                Time window for momentum check.
              </p>
              <div className="mb-8 font-mono text-3xl text-white">24h</div>
              <ul className="space-y-3 text-xs text-neutral-300 font-mono border-t border-brand-orange/20 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-brand-orange" /> Configurable per coin
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-brand-orange" /> Aligns with news timing
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-sm border border-neutral-800 bg-[#080808] hover:border-neutral-700 transition-colors relative">
              <div className="absolute top-0 right-0 p-4 text-neutral-700">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold font-mono text-white mb-2 uppercase">
                Coins with Telegram
              </h3>
              <p className="text-xs text-neutral-500 mb-6 font-mono">
                Official channels linked.
              </p>
              <div className="mb-8 font-mono text-3xl text-white">Config</div>
              <ul className="space-y-3 text-xs text-neutral-400 font-mono border-t border-neutral-800 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-brand-orange" /> Per-coin channel
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-brand-orange" /> Keyword detection
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 pt-24 pb-12 bg-[#020202] border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <div className="inline-block mb-6 p-4 border border-brand-orange/20 rounded-full bg-brand-orange/5">
            <Radio className="w-8 h-8 text-brand-orange animate-pulse" />
          </div>

          <h2 className="md:text-5xl text-3xl font-bold font-display text-white tracking-tight mb-6">
            Momentum is Non-Negotiable.
          </h2>
          <p className="text-sm md:text-base text-neutral-500 font-mono mb-12">
            TradeRush provides the signals. The market provides the opportunity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
            <Link
              href="/dashboard"
              className="inline-flex justify-center items-center gap-2 px-10 py-4 bg-brand-orange text-black rounded-sm text-sm font-bold font-mono tracking-widest hover:bg-brand-glow transition-colors shadow-[0_0_20px_rgba(255,77,0,0.3)]"
            >
              LAUNCH DASHBOARD
            </Link>
            <Link
              href="/signals"
              className="inline-flex justify-center items-center gap-2 px-10 py-4 border border-neutral-700 text-white rounded-sm text-sm font-bold font-mono tracking-widest hover:bg-neutral-800 transition-colors"
            >
              VIEW SIGNALS
            </Link>
          </div>

          <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 font-mono gap-4 uppercase tracking-widest">
            <div className="flex gap-6">
              <Link href="/dashboard" className="hover:text-brand-orange transition-colors">
                Dashboard
              </Link>
              <Link href="/signals" className="hover:text-brand-orange transition-colors">
                Signals
              </Link>
              <Link href="/positions" className="hover:text-brand-orange transition-colors">
                Positions
              </Link>
              <Link href="/config" className="hover:text-brand-orange transition-colors">
                Config
              </Link>
            </div>
            <div>© 2025 TradeRush. Momentum Signal Agent.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
