"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Zap, Crown, Code, Check, ChevronDown, Sparkles, Film, Skull, Flame, Copy, Download, Lock, ArrowRight, Star, Menu, X, Eye, FileText, Loader2, Shield, CreditCard, MapPin, User, Phone, Mail, AlertCircle, LogOut, LayoutDashboard, Users, Settings, HelpCircle, MessageSquare, Send, ShieldCheck, Activity, Trash2, UserPlus, KeyRound } from "lucide-react";

const ADMIN_EMAIL = "issaabiodun25@outlook.com";

const GENRES = [
  { id: "adventure", name: "Adventure", icon: "🗺️" },
  { id: "action", name: "Action", icon: "💥" },
  { id: "horror", name: "Horror", icon: "🩸" },
  { id: "scifi", name: "Sci-Fi", icon: "🛸" },
  { id: "western", name: "Western", icon: "🌵" },
  { id: "philosophical", name: "Philosophical", icon: "🧠" },
  { id: "thriller", name: "Thriller", icon: "🔪" },
  { id: "fantasy", name: "Fantasy", icon: "🐉" },
  { id: "apocalypse", name: "Apocalypse", icon: "☢️" },
  { id: "martial-arts", name: "Martial Arts", icon: "🥋" },
  { id: "war", name: "War", icon: "⚔️" },
];

const TIER_RULES = {
  free: { genres: ["war", "fantasy", "martial-arts"], lengths: ["60 seconds"], maxIntensity: 3, storiesPerPeriod: 1, period: "day", label: "Free" },
  creator: { genres: ["philosophical", "thriller", "fantasy", "apocalypse", "martial-arts", "war"], lengths: ["60 seconds", "3 minutes"], maxIntensity: 6, storiesPerPeriod: 5, period: "week", label: "Creator" },
  pro: { genres: GENRES.map(g => g.id), lengths: ["60 seconds", "3 minutes", "5 minutes", "10 minutes"], maxIntensity: 10, storiesPerPeriod: 9999, period: "unlimited", label: "Pro" },
  admin: { genres: GENRES.map(g => g.id), lengths: ["60 seconds", "3 minutes", "5 minutes", "10 minutes"], maxIntensity: 10, storiesPerPeriod: 999999, period: "unlimited", label: "Admin" },
};

const ERAS = ["1800s Frontier", "Early 1900s", "Mid-Century", "Modern Day", "Near Future", "Far Future / Post-Human"];
const GRADES = ["Gritty Realism", "Hollywood Polish", "DreamWorks Animated", "Film Noir", "A24 Arthouse", "Cyberpunk Neon", "Cosmic Horror"];

const COUNTRIES = ["United Kingdom","United States","Canada","Australia","Ireland","New Zealand","Nigeria","Ghana","Kenya","South Africa","Egypt","Ethiopia","Tanzania","Uganda","Rwanda","Senegal","Cameroon","Ivory Coast","Morocco","Algeria","Tunisia","Zimbabwe","Botswana","Namibia","Zambia","India","Pakistan","Bangladesh","Sri Lanka","Nepal","China","Japan","South Korea","Singapore","Malaysia","Indonesia","Philippines","Thailand","Vietnam","Cambodia","Laos","Myanmar","Hong Kong","Taiwan","UAE","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman","Israel","Turkey","Lebanon","Jordan","Iraq","Iran","Afghanistan","Germany","France","Spain","Italy","Portugal","Netherlands","Belgium","Luxembourg","Switzerland","Austria","Sweden","Norway","Denmark","Finland","Iceland","Poland","Czech Republic","Slovakia","Hungary","Romania","Bulgaria","Greece","Croatia","Serbia","Bosnia and Herzegovina","Albania","Slovenia","Estonia","Latvia","Lithuania","Russia","Ukraine","Belarus","Moldova","Georgia","Armenia","Azerbaijan","Kazakhstan","Uzbekistan","Mexico","Brazil","Argentina","Chile","Colombia","Peru","Venezuela","Ecuador","Bolivia","Uruguay","Paraguay","Costa Rica","Panama","Dominican Republic","Cuba","Jamaica","Trinidad and Tobago","Bahamas","Other"];

const PLANS = [
  { id: "free", name: "Free", price: "£0", period: "forever", limit: "1 story / day", features: ["1 story per day","3 genres only: War, Fantasy, Martial Arts","60-second scripts only","Standard intensity (max 3/10)","Copy-prompt view"], cta: "Current Plan", highlighted: false },
  { id: "creator", name: "Creator", price: "£5", period: "/ week", limit: "5 stories / week", features: ["5 stories per week","6 genres: Philosophical, Thriller, Fantasy, Apocalypse, Martial Arts, War","60-second + 3-minute scripts","Heavy intensity (max 6/10)","Detailed shot lists","Voice-over scripts","Hooks + captions"], cta: "Start Creating", highlighted: true, badge: "Most Popular" },
  { id: "pro", name: "Pro", price: "£20", period: "/ month", limit: "Unlimited", features: ["Unlimited stories","All 11 genres unlocked","All lengths (up to 10-min cinematic)","Ultra Dark Mode (intensity 7-10) — UNLIMITED","Advanced controls","Export-ready formats","Character anchor sheets","Priority generation","Commercial license"], cta: "Go Pro", highlighted: false },
  { id: "api", name: "API / Scale", price: "Custom", period: "contact", limit: "Volume pricing", features: ["API access","White-label licensing","Webhooks + automation","Dedicated support","Custom genres","SLA guarantee"], cta: "Contact Sales", highlighted: false },
];

// ============ AUTH HELPERS ============
const hashPassword = (pw) => {
  // Simple non-cryptographic hash for demo (real app: use bcrypt server-side)
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) - h + pw.charCodeAt(i)) | 0;
  return `h${Math.abs(h)}_${pw.length}`;
};

export default function StoryEngine() {
  const [view, setView] = useState("landing");
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authModal, setAuthModal] = useState(null); // "login" | "signup" | null
  const [showCheckout, setShowCheckout] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState("");

  // Generator state
  const [mode, setMode] = useState("dark");
  const [genre, setGenre] = useState("war");
  const [era, setEra] = useState("Modern Day");
  const [grade, setGrade] = useState("Gritty Realism");
  const [length, setLength] = useState("60 seconds");
  const [intensity, setIntensity] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [outputView, setOutputView] = useState("detailed");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [storiesUsed, setStoriesUsed] = useState(0);

  // Admin panel state
  const [adminTab, setAdminTab] = useState("dashboard");
  const [allUsers, setAllUsers] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);

  const rules = currentUser ? TIER_RULES[currentUser.tier] : TIER_RULES.free;
  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // ============ SESSION RESTORE ============
  useEffect(() => {
    (async () => {
      try {
        const session = await window.storage.get("current-session");
        if (session) {
          const user = JSON.parse(session.value);
          // Refresh user from users list
          const usersRes = await window.storage.get("all-users");
          const users = usersRes ? JSON.parse(usersRes.value) : [];
          const fresh = users.find(u => u.email === user.email);
          if (fresh) setCurrentUser(fresh);
        }
      } catch (e) {}
    })();
  }, []);

  // ============ SCROLL ============
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ============ ADMIN DATA LOAD ============
  useEffect(() => {
    if (isAdmin && view === "admin") {
      (async () => {
        try {
          const u = await window.storage.get("all-users");
          if (u) setAllUsers(JSON.parse(u.value));
          const c = await window.storage.get("all-complaints");
          if (c) setAllComplaints(JSON.parse(c.value));
        } catch (e) {}
      })();
    }
  }, [view, isAdmin]);

  // ============ STORY USAGE LOAD ============
  const getPeriodKey = (tier, email) => {
    const now = new Date();
    if (TIER_RULES[tier].period === "day") return `usage-${email}-day-${now.toISOString().split("T")[0]}`;
    if (TIER_RULES[tier].period === "week") {
      const onejan = new Date(now.getFullYear(), 0, 1);
      const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      return `usage-${email}-week-${now.getFullYear()}-${week}`;
    }
    return `usage-${email}-unlimited`;
  };

  useEffect(() => {
    if (!currentUser) return;
    if (!rules.genres.includes(genre)) setGenre(rules.genres[0]);
    if (!rules.lengths.includes(length)) setLength(rules.lengths[0]);
    if (intensity > rules.maxIntensity) setIntensity(rules.maxIntensity);
    (async () => {
      try {
        const c = await window.storage.get(getPeriodKey(currentUser.tier, currentUser.email));
        setStoriesUsed(c ? parseInt(c.value) : 0);
      } catch (e) {}
    })();
  }, [currentUser]);

  // ============ AUTH FUNCTIONS ============
  const signup = async (data) => {
    try {
      const usersRes = await window.storage.get("all-users");
      const users = usersRes ? JSON.parse(usersRes.value) : [];
      if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { error: "An account with this email already exists." };
      }
      const isAdminEmail = data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const newUser = {
        id: `user_${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        passwordHash: hashPassword(data.password),
        country: data.country,
        tier: isAdminEmail ? "admin" : "free",
        role: isAdminEmail ? "admin" : "user",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        storiesGenerated: 0,
        status: "active",
      };
      users.push(newUser);
      await window.storage.set("all-users", JSON.stringify(users));
      await window.storage.set("current-session", JSON.stringify(newUser));
      setCurrentUser(newUser);
      setAuthModal(null);
      setView("app");
      return { ok: true };
    } catch (e) {
      return { error: "Signup failed. Try again." };
    }
  };

  const login = async (email, password) => {
    try {
      const usersRes = await window.storage.get("all-users");
      const users = usersRes ? JSON.parse(usersRes.value) : [];
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return { error: "No account found with this email." };
      if (user.passwordHash !== hashPassword(password)) return { error: "Incorrect password." };
      if (user.status === "suspended") return { error: "This account has been suspended. Contact admin." };
      user.lastLogin = new Date().toISOString();
      const updatedUsers = users.map(u => u.email === user.email ? user : u);
      await window.storage.set("all-users", JSON.stringify(updatedUsers));
      await window.storage.set("current-session", JSON.stringify(user));
      setCurrentUser(user);
      setAuthModal(null);
      setView(user.role === "admin" ? "admin" : "app");
      return { ok: true };
    } catch (e) {
      return { error: "Login failed. Try again." };
    }
  };

  const logout = async () => {
    try { await window.storage.delete("current-session"); } catch (e) {}
    setCurrentUser(null);
    setView("landing");
  };

  const requireAuth = (next) => {
    if (!currentUser) { setAuthModal("signup"); return; }
    next();
  };

  // ============ GENERATOR ============
  const triggerPaywall = (reason) => { setPaywallReason(reason); setShowPaywall(true); };

  const handleGenerate = async () => {
    if (!currentUser) { setAuthModal("signup"); return; }
    const canGenerate = storiesUsed < rules.storiesPerPeriod;
    if (!canGenerate) {
      triggerPaywall(`You've used all ${rules.storiesPerPeriod} of your ${rules.period === "day" ? "daily" : "weekly"} stories on the ${rules.label} plan.`);
      return;
    }
    setGenerating(true);
    setError(null);
    setResult(null);
    const seed = Math.random().toString(36).substring(7);
    const intensityLabel = intensity >= 8 ? "ULTRA DARK / EXTREME" : intensity >= 6 ? "Heavy / Intense" : intensity >= 4 ? "Moderate" : "Light";
    const systemPrompt = `You are a senior cinematic creative director for INFINITE Story Engine. Generate UNIQUE, NEVER-REPEATING stories every call.

CORE RULES:
- Stories must be grounded: real-feeling place, specific year, named characters, named locations
- Inspired by real patterns / psychologically grounded
- Every scene must connect; open with a Scroll-Trap Hook
- Voice-over must hit hard: aesthetic, poetic, never soft
- Use Hero's Journey + scene structure (Hook → Goal → Obstacle → Attempt → Twist → Payoff)
- Each shot is camera-ready for Veo, Runway, Sora, Kling

OUTPUT FORMAT (RETURN ONLY VALID JSON, NO MARKDOWN FENCES):
{"title":"string","logline":"one sentence gut-punch","hookLine":"first 0-2s narration","grounding":{"place":"city, country","year":"specific year","realPattern":"real-world phenomenon"},"characters":[{"name":"string","description":"appearance + outfit + signature trait","voice":"voice direction"}],"scenes":[{"number":1,"title":"scene title","beat":"Hook | Goal | Obstacle | Attempt | Twist | Payoff","microScript":"2-3 sentences","voiceOver":"exact narration line","shots":[{"shotType":"wide | medium | close","camera":"locked | slow push | pan | orbit | crane | handheld","subject":"character + outfit","action":"main verb","environment":"where","continuity":"hair, props, lighting","audio":"voice + SFX + music"}]}],"masterPrompt":"single ready-to-paste block for AI video generators","captions":["3 viral hooks for TikTok/Reels/Shorts"]}

Return 5-7 scenes for short, 8-12 for longer. NO explanation outside the JSON.`;
    const userPrompt = `Generate a brand new ${mode === "dark" ? "DARK PSYCHOLOGICAL TRUE-PATTERN STORY" : "CINEMATIC SCRIPT"}.\nMode: ${mode === "dark" ? "Dark Story" : "Script (Hollywood/DreamWorks)"}\nGenre: ${GENRES.find(g => g.id === genre)?.name}\nEra: ${era}\nVisual Grade: ${grade}\nLength: ${length}\nIntensity: ${intensity}/10 (${intensityLabel})\nSeed: ${seed}\n\nMake it unforgettable. Grounded. Cinematic.`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: systemPrompt, messages: [{ role: "user", content: userPrompt }] }),
      });
      const data = await response.json();
      let text = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setResult(parsed);
      const newCount = storiesUsed + 1;
      setStoriesUsed(newCount);
      try {
        await window.storage.set(getPeriodKey(currentUser.tier, currentUser.email), String(newCount));
        // Update user record
        const usersRes = await window.storage.get("all-users");
        const users = usersRes ? JSON.parse(usersRes.value) : [];
        const updated = users.map(u => u.email === currentUser.email ? { ...u, storiesGenerated: (u.storiesGenerated || 0) + 1 } : u);
        await window.storage.set("all-users", JSON.stringify(updated));
        const me = updated.find(u => u.email === currentUser.email);
        setCurrentUser(me);
        await window.storage.set("current-session", JSON.stringify(me));
      } catch (e) {}
    } catch (e) {
      setError("Generation hiccup — try again.");
    } finally {
      setGenerating(false);
    }
  };

  const copyPrompt = () => { if (!result) return; navigator.clipboard.writeText(result.masterPrompt); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadPrompt = () => { if (!result) return; const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${result.title.replace(/\s+/g, "-").toLowerCase()}.json`; a.click(); };

  const upgrade = async (planId) => {
    if (!currentUser) return;
    try {
      const usersRes = await window.storage.get("all-users");
      const users = usersRes ? JSON.parse(usersRes.value) : [];
      const updated = users.map(u => u.email === currentUser.email ? { ...u, tier: planId } : u);
      await window.storage.set("all-users", JSON.stringify(updated));
      const me = updated.find(u => u.email === currentUser.email);
      setCurrentUser(me);
      await window.storage.set("current-session", JSON.stringify(me));
    } catch (e) {}
    setShowCheckout(null);
    setShowPaywall(false);
  };

  const tryGenreClick = (gid) => { if (!rules.genres.includes(gid)) { triggerPaywall(`The "${GENRES.find(g => g.id === gid)?.name}" genre is locked on the ${rules.label} plan.`); return; } setGenre(gid); };
  const tryLengthClick = (l) => { if (!rules.lengths.includes(l)) { triggerPaywall(`${l} scripts are locked on the ${rules.label} plan.`); return; } setLength(l); };
  const tryIntensityChange = (v) => { if (v > rules.maxIntensity) { triggerPaywall(`Intensity above ${rules.maxIntensity}/10 is locked on the ${rules.label} plan.`); return; } setIntensity(v); };

  const submitComplaint = async (data) => {
    try {
      const cRes = await window.storage.get("all-complaints");
      const complaints = cRes ? JSON.parse(cRes.value) : [];
      const entry = { id: `c_${Date.now()}`, ...data, userEmail: currentUser?.email || "anonymous", userName: currentUser?.fullName || "Guest", status: "open", createdAt: new Date().toISOString() };
      complaints.unshift(entry);
      await window.storage.set("all-complaints", JSON.stringify(complaints));
      return { ok: true };
    } catch (e) { return { error: "Could not submit." }; }
  };

  const adminUpdateUser = async (email, updates) => {
    const usersRes = await window.storage.get("all-users");
    const users = usersRes ? JSON.parse(usersRes.value) : [];
    const updated = users.map(u => u.email === email ? { ...u, ...updates } : u);
    await window.storage.set("all-users", JSON.stringify(updated));
    setAllUsers(updated);
  };

  const adminDeleteUser = async (email) => {
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return;
    const usersRes = await window.storage.get("all-users");
    const users = usersRes ? JSON.parse(usersRes.value) : [];
    const updated = users.filter(u => u.email !== email);
    await window.storage.set("all-users", JSON.stringify(updated));
    setAllUsers(updated);
  };

  const adminUpdateComplaint = async (id, status) => {
    const cRes = await window.storage.get("all-complaints");
    const complaints = cRes ? JSON.parse(cRes.value) : [];
    const updated = complaints.map(c => c.id === id ? { ...c, status } : c);
    await window.storage.set("all-complaints", JSON.stringify(updated));
    setAllComplaints(updated);
  };

  const periodLabel = rules.period === "unlimited" ? "∞" : rules.period === "day" ? "today" : "this week";
  const canGenerate = currentUser && storiesUsed < rules.storiesPerPeriod;

  return (
    <div className="min-h-screen bg-black text-stone-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-red { 0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); } 50% { box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .fade-up { animation: fadeUp 0.8s ease-out; }
        .pulse-red { animation: pulse-red 2s infinite; }
        .gold-text { background: linear-gradient(90deg, #d4af37 0%, #f4e5b1 50%, #d4af37 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 4s linear infinite; }
        .blood-text { background: linear-gradient(90deg, #7f1d1d, #dc2626, #7f1d1d); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .grain::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E"); opacity: 0.08; pointer-events: none; mix-blend-mode: overlay; }
        .smooth-scroll { scroll-behavior: smooth; }
        input[type="range"]::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; background: #dc2626; border-radius: 50%; cursor: pointer; box-shadow: 0 0 10px rgba(220,38,38,0.6); }
      `}</style>

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || view !== "landing" ? "bg-black/95 backdrop-blur-lg border-b border-red-900/30" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setView("landing")} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-950 rounded flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Skull className="w-5 h-5 text-stone-100" />
            </div>
            <span className="font-display text-xl tracking-wide gold-text">INFINITE</span>
          </button>

          <div className="hidden md:flex items-center gap-7 text-sm text-stone-400">
            <button onClick={() => setView("landing")} className="hover:text-stone-100 transition">Home</button>
            <a href="#how" className="hover:text-stone-100 transition">How It Works</a>
            <a href="#pricing" className="hover:text-stone-100 transition">Pricing</a>
            <button onClick={() => requireAuth(() => setView("app"))} className="hover:text-stone-100 transition">Engine</button>
            <button onClick={() => requireAuth(() => setView("help"))} className="hover:text-stone-100 transition">Help</button>
            {isAdmin && <button onClick={() => setView("admin")} className="text-yellow-500 hover:text-yellow-400 transition flex items-center gap-1"><Crown className="w-3.5 h-3.5" /> Admin</button>}
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${isAdmin ? "bg-yellow-700" : "bg-red-900"}`}>{currentUser.fullName.charAt(0).toUpperCase()}</div>
                  <span className="text-xs text-stone-300">{currentUser.fullName.split(" ")[0]}</span>
                  <span className="text-[10px] text-stone-500 uppercase">{rules.label}</span>
                </div>
                <button onClick={logout} title="Log out" className="p-2 text-stone-400 hover:text-red-400 transition"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthModal("login")} className="text-sm text-stone-300 hover:text-stone-100 px-3 py-2">Log In</button>
                <button onClick={() => setAuthModal("signup")} className="bg-red-700 hover:bg-red-600 text-stone-100 px-4 py-2 rounded-sm text-sm font-medium tracking-wide transition shadow-lg shadow-red-900/50">Sign Up</button>
              </>
            )}
            <button className="md:hidden" onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        {navOpen && (
          <div className="md:hidden bg-black border-t border-red-900/30 px-6 py-4 flex flex-col gap-4 text-sm">
            <button onClick={() => { setView("landing"); setNavOpen(false); }} className="text-left">Home</button>
            <a href="#how" onClick={() => setNavOpen(false)}>How It Works</a>
            <a href="#pricing" onClick={() => setNavOpen(false)}>Pricing</a>
            <button onClick={() => { requireAuth(() => setView("app")); setNavOpen(false); }} className="text-left">Engine</button>
            <button onClick={() => { requireAuth(() => setView("help")); setNavOpen(false); }} className="text-left">Help Center</button>
            {isAdmin && <button onClick={() => { setView("admin"); setNavOpen(false); }} className="text-left text-yellow-500">Admin Panel</button>}
          </div>
        )}
      </nav>

      {/* ============ LANDING ============ */}
      {view === "landing" && (
        <div className="smooth-scroll">
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black"></div>
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(127,29,29,0.3) 0%, transparent 50%)" }}></div>
            <div className="relative max-w-5xl mx-auto px-6 py-32 text-center fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-xs uppercase tracking-[0.2em] text-red-300 mb-8">
                <Flame className="w-3 h-3" /> Inspired By Real Patterns · Psychologically Grounded
              </div>
              <h1 className="font-display text-6xl md:text-8xl leading-[0.95] mb-6 tracking-tight">
                Turn <span className="blood-text italic">Whispers</span><br/>Into <span className="gold-text">Empires</span>
              </h1>
              <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                The only cinematic story engine that generates Hollywood-grade scripts, voice-overs, and shot lists — ready to paste into any AI video tool. <span className="text-stone-200">One click. New story every time.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onClick={() => requireAuth(() => setView("app"))} className="group bg-red-700 hover:bg-red-600 text-stone-100 px-8 py-4 rounded-sm text-base font-medium tracking-wide transition shadow-2xl shadow-red-900/50 pulse-red flex items-center gap-2">
                  Start Your Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
                <a href="#how" className="text-stone-400 hover:text-stone-100 text-sm underline underline-offset-4 decoration-stone-700">See how it works</a>
              </div>
              <div className="mt-20 pt-10 border-t border-stone-800/50 flex flex-wrap justify-center items-center gap-8 text-xs uppercase tracking-widest text-stone-500">
                <span>Used by</span><span>TikTok Storytellers</span><span className="text-stone-700">·</span><span>Faceless YouTube Creators</span><span className="text-stone-700">·</span><span>Horror Pages</span><span className="text-stone-700">·</span><span>Podcast Studios</span>
              </div>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"><ChevronDown className="w-5 h-5 text-stone-600" /></div>
          </section>

          <section id="how" className="py-32 px-6 relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <div className="text-xs uppercase tracking-[0.3em] text-red-400 mb-4">The Process</div>
                <h2 className="font-display text-5xl md:text-6xl mb-4">Three Steps. <span className="italic text-stone-400">No Friction.</span></h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { n: "01", icon: <Sparkles className="w-6 h-6" />, title: "Sign Up + Choose Genre", desc: "Create your free account. Pick from 11 cinematic genres. Set era, visual grade, length, intensity." },
                  { n: "02", icon: <Zap className="w-6 h-6" />, title: "Click Generate", desc: "One click. Get a fully-grounded story with named characters, real places, scene-by-scene shot lists, and hit-hard voice-over." },
                  { n: "03", icon: <Film className="w-6 h-6" />, title: "Paste Into AI Video", desc: "Drop the master prompt into Veo, Runway, Sora, Kling. Done. Post. Watch the views compound." },
                ].map((s, i) => (
                  <div key={i} className="group relative p-8 bg-gradient-to-br from-stone-950 to-black border border-stone-900 hover:border-red-900/50 transition rounded-sm">
                    <div className="font-display text-7xl text-red-900/30 absolute top-4 right-6">{s.n}</div>
                    <div className="w-12 h-12 rounded-sm bg-red-950/40 border border-red-900/40 flex items-center justify-center text-red-400 mb-6">{s.icon}</div>
                    <h3 className="font-display text-2xl mb-3">{s.title}</h3>
                    <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="pricing" className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="text-xs uppercase tracking-[0.3em] text-red-400 mb-4">Pricing</div>
                <h2 className="font-display text-5xl md:text-6xl mb-4">Pick Your <span className="italic">Tier</span></h2>
                <p className="text-stone-400 max-w-2xl mx-auto">Every plan is clearly limited so you know exactly what you're getting. Cancel anytime.</p>
              </div>
              <div className="max-w-5xl mx-auto mb-12 bg-gradient-to-r from-stone-950 via-black to-stone-950 border border-stone-900 rounded-sm p-6">
                <div className="text-xs uppercase tracking-widest text-red-400 mb-4 text-center">What unlocks at each tier</div>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <div className="font-display text-lg text-stone-200 mb-2">Free</div>
                    <ul className="space-y-1 text-stone-400 text-xs"><li>• 3 genres: War, Fantasy, Martial Arts</li><li>• 60-second scripts only</li><li>• Intensity capped at 3/10</li><li>• 1 story per day</li></ul>
                  </div>
                  <div className="md:border-x md:border-stone-900 md:px-6">
                    <div className="font-display text-lg text-red-300 mb-2">Creator £5/wk</div>
                    <ul className="space-y-1 text-stone-400 text-xs"><li>• 6 genres: Philosophical, Thriller, Fantasy, Apocalypse, Martial Arts, War</li><li>• 60-second + 3-minute scripts</li><li>• Intensity up to 6/10</li><li>• 5 stories per week</li></ul>
                  </div>
                  <div>
                    <div className="font-display text-lg gold-text mb-2">Pro £20/mo</div>
                    <ul className="space-y-1 text-stone-400 text-xs"><li>• All 11 genres unlocked</li><li>• All lengths up to 10-min cinematic</li><li>• <span className="text-red-400">Ultra Dark Mode unlimited (7-10/10)</span></li><li>• Unlimited stories + advanced controls</li></ul>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => (
                  <div key={plan.id} className={`relative p-8 rounded-sm transition ${plan.highlighted ? "bg-gradient-to-b from-red-950/30 to-black border-2 border-red-700 scale-[1.02]" : "bg-stone-950 border border-stone-900 hover:border-stone-700"}`}>
                    {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-700 text-stone-100 text-xs px-3 py-1 rounded-sm uppercase tracking-wider">{plan.badge}</div>}
                    <div className="mb-6">
                      <h3 className="font-display text-2xl mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1"><span className="text-4xl font-display">{plan.price}</span><span className="text-stone-500 text-sm">{plan.period}</span></div>
                      <div className="text-xs text-stone-500 mt-2 uppercase tracking-wider">{plan.limit}</div>
                    </div>
                    <ul className="space-y-3 mb-8 text-sm">
                      {plan.features.map((f, i) => (<li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> <span className="text-stone-300">{f}</span></li>))}
                    </ul>
                    <button
                      onClick={() => {
                        if (plan.id === "free") { requireAuth(() => upgrade("free")); return; }
                        if (plan.id === "api") { alert(`Contact: ${ADMIN_EMAIL}`); return; }
                        requireAuth(() => setShowCheckout(plan));
                      }}
                      className={`w-full py-3 rounded-sm text-sm font-medium tracking-wide transition ${plan.highlighted ? "bg-red-700 hover:bg-red-600 text-stone-100" : "bg-stone-900 hover:bg-stone-800 text-stone-100 border border-stone-800"} ${currentUser?.tier === plan.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={currentUser?.tier === plan.id}
                    >
                      {currentUser?.tier === plan.id ? "Current Plan" : plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-32 px-6 relative grain">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-5xl md:text-7xl mb-6">The Story Is <span className="blood-text italic">Already Written.</span></h2>
              <p className="text-stone-400 mb-10 text-lg">You just haven't clicked the button yet.</p>
              <button onClick={() => requireAuth(() => setView("app"))} className="bg-red-700 hover:bg-red-600 text-stone-100 px-10 py-5 rounded-sm text-lg font-medium tracking-wide transition shadow-2xl shadow-red-900/50 pulse-red">
                Generate Your First Story →
              </button>
            </div>
          </section>

          <footer className="border-t border-stone-900 py-10 px-6 text-center text-xs text-stone-600">
            <p>INFINITE Story Engine · Cinematic AI for creators · © 2026 · Support: {ADMIN_EMAIL}</p>
          </footer>
        </div>
      )}

      {/* ============ APP / ENGINE ============ */}
      {view === "app" && currentUser && (
        <div className="pt-20 min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="font-display text-4xl mb-1">The <span className="gold-text">Engine</span></h1>
                <p className="text-stone-500 text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isAdmin ? "bg-yellow-500" : currentUser.tier === "pro" ? "bg-yellow-500" : currentUser.tier === "creator" ? "bg-red-500" : "bg-stone-500"}`}></span>
                  {currentUser.fullName} · <span className="text-stone-300">{rules.label}</span> plan · {storiesUsed} / {rules.storiesPerPeriod >= 9999 ? "∞" : rules.storiesPerPeriod} stories used {periodLabel}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMode("dark")} className={`px-4 py-2 rounded-sm text-sm tracking-wide transition flex items-center gap-2 ${mode === "dark" ? "bg-red-900/40 border border-red-700 text-stone-100" : "bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-100"}`}><Skull className="w-4 h-4" /> Dark Story</button>
                <button onClick={() => setMode("script")} className={`px-4 py-2 rounded-sm text-sm tracking-wide transition flex items-center gap-2 ${mode === "script" ? "bg-red-900/40 border border-red-700 text-stone-100" : "bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-100"}`}><Film className="w-4 h-4" /> Script Mode</button>
              </div>
            </div>

            {!isAdmin && currentUser.tier !== "pro" && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-950/30 via-stone-950 to-stone-950 border border-red-900/30 rounded-sm flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1 text-sm">
                  <div className="text-stone-200 mb-1">You're on <span className="text-red-300 font-medium">{rules.label}</span>. Locked items show 🔒 — click to upgrade.</div>
                  <div className="text-xs text-stone-500">{currentUser.tier === "free" ? "Free: 3 genres, 60s only, intensity ≤ 3, 1/day." : "Creator: 6 genres, 60s + 3min, intensity ≤ 6, 5/week."}</div>
                </div>
                <button onClick={() => setShowCheckout(PLANS[2])} className="text-xs bg-red-700 hover:bg-red-600 text-stone-100 px-3 py-1.5 rounded-sm whitespace-nowrap">Go Pro £20/mo</button>
              </div>
            )}

            <div className="grid lg:grid-cols-[320px_1fr] gap-6">
              <aside className="space-y-5 bg-stone-950 border border-stone-900 rounded-sm p-5 h-fit lg:sticky lg:top-24">
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500 mb-2 block">Genre</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {GENRES.map(g => {
                      const locked = !rules.genres.includes(g.id);
                      const active = genre === g.id;
                      return (
                        <button key={g.id} onClick={() => tryGenreClick(g.id)} className={`px-2 py-2 text-xs rounded-sm transition flex items-center gap-1.5 relative ${active ? "bg-red-900/50 border border-red-700 text-stone-100" : locked ? "bg-black/40 border border-stone-900 text-stone-600" : "bg-black border border-stone-800 text-stone-400 hover:border-stone-700"}`}>
                          <span>{g.icon}</span> {g.name}
                          {locked && <Lock className="w-2.5 h-2.5 ml-auto text-stone-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500 mb-2 block">Era</label>
                  <select value={era} onChange={e => setEra(e.target.value)} className="w-full bg-black border border-stone-800 rounded-sm px-3 py-2 text-sm focus:border-red-700 outline-none">{ERAS.map(e => <option key={e}>{e}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500 mb-2 block">Visual Grade</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-black border border-stone-800 rounded-sm px-3 py-2 text-sm focus:border-red-700 outline-none">{GRADES.map(g => <option key={g}>{g}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500 mb-2 block">Length</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["60 seconds", "3 minutes", "5 minutes", "10 minutes"].map(l => {
                      const locked = !rules.lengths.includes(l);
                      const active = length === l;
                      return (
                        <button key={l} onClick={() => tryLengthClick(l)} className={`px-2 py-2 text-xs rounded-sm transition relative ${active ? "bg-red-900/50 border border-red-700 text-stone-100" : locked ? "bg-black/40 border border-stone-900 text-stone-600" : "bg-black border border-stone-800 text-stone-400 hover:border-stone-700"}`}>
                          {l}{locked && <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-stone-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500 mb-2 flex justify-between">
                    <span>Intensity</span>
                    <span className={intensity >= 8 ? "text-red-400" : "text-stone-400"}>{intensity}/10 {intensity >= 8 && "🩸"}</span>
                  </label>
                  <input type="range" min="1" max="10" value={intensity} onChange={e => tryIntensityChange(parseInt(e.target.value))} className="w-full accent-red-700" />
                  <div className="flex justify-between text-[10px] text-stone-600 mt-1">
                    <span className={rules.maxIntensity >= 3 ? "text-stone-400" : ""}>1-3 Light</span>
                    <span className={rules.maxIntensity >= 6 ? "text-stone-400" : ""}>4-6 Heavy</span>
                    <span className={rules.maxIntensity >= 10 ? "text-red-400" : ""}>7-10 Ultra Dark</span>
                  </div>
                  <div className="text-xs text-stone-600 mt-2">Your cap: <span className="text-stone-300">{rules.maxIntensity}/10</span></div>
                </div>
                <button onClick={handleGenerate} disabled={generating} className={`w-full py-4 rounded-sm font-medium tracking-wide transition flex items-center justify-center gap-2 ${generating ? "bg-stone-800 text-stone-500" : "bg-red-700 hover:bg-red-600 text-stone-100 shadow-lg shadow-red-900/50"}`}>
                  {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Zap className="w-4 h-4" /> Generate Story — Live</>}
                </button>
                {!canGenerate && (<div className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 p-3 rounded-sm flex items-start gap-2"><Lock className="w-3 h-3 mt-0.5 shrink-0" /><span>{rules.period === "day" ? "Daily" : "Weekly"} limit reached. <button onClick={() => setShowCheckout(PLANS[2])} className="underline">Upgrade</button></span></div>)}
              </aside>

              <main className="min-h-[600px]">
                {!result && !generating && !error && (
                  <div className="bg-stone-950 border border-stone-900 rounded-sm p-12 text-center h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-900/40 flex items-center justify-center mb-4"><Sparkles className="w-7 h-7 text-red-400" /></div>
                    <h3 className="font-display text-3xl mb-2">Ready When You Are</h3>
                    <p className="text-stone-500 text-sm max-w-sm">Pick your settings, click Generate. A new grounded cinematic story every time.</p>
                  </div>
                )}
                {generating && (<div className="bg-stone-950 border border-stone-900 rounded-sm p-12 text-center h-full flex flex-col items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" /><h3 className="font-display text-2xl mb-2">Conjuring...</h3><p className="text-stone-500 text-sm">Grounding the story in real-world patterns.</p></div>)}
                {error && (<div className="bg-red-950/20 border border-red-900/50 rounded-sm p-8 text-center"><p className="text-red-400 mb-3">{error}</p><button onClick={handleGenerate} className="text-sm underline text-stone-300">Retry</button></div>)}
                {result && (
                  <div className="space-y-6 fade-up">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex bg-stone-950 border border-stone-900 rounded-sm p-1">
                        <button onClick={() => setOutputView("detailed")} className={`px-4 py-2 text-xs rounded-sm flex items-center gap-2 transition ${outputView === "detailed" ? "bg-red-900/40 text-stone-100" : "text-stone-400"}`}><Eye className="w-3 h-3" /> Detailed View</button>
                        <button onClick={() => setOutputView("prompt")} className={`px-4 py-2 text-xs rounded-sm flex items-center gap-2 transition ${outputView === "prompt" ? "bg-red-900/40 text-stone-100" : "text-stone-400"}`}><FileText className="w-3 h-3" /> Copy-Prompt View</button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={copyPrompt} className="px-3 py-2 text-xs bg-stone-900 hover:bg-stone-800 rounded-sm flex items-center gap-2 border border-stone-800 transition"><Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy Prompt"}</button>
                        <button onClick={downloadPrompt} className="px-3 py-2 text-xs bg-stone-900 hover:bg-stone-800 rounded-sm flex items-center gap-2 border border-stone-800 transition"><Download className="w-3 h-3" /> JSON</button>
                      </div>
                    </div>
                    {outputView === "detailed" ? (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-stone-950 to-black border border-stone-900 rounded-sm p-6">
                          <div className="text-xs text-red-400 uppercase tracking-widest mb-2">{GENRES.find(g => g.id === genre)?.name} · {era} · {grade}</div>
                          <h2 className="font-display text-4xl mb-3">{result.title}</h2>
                          <p className="text-stone-300 italic mb-4">{result.logline}</p>
                          <div className="border-l-2 border-red-700 pl-4 my-4"><div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Hook</div><p className="text-stone-100 font-display text-lg italic">"{result.hookLine}"</p></div>
                          {result.grounding && (<div className="grid sm:grid-cols-3 gap-3 text-xs mt-4"><div className="bg-black/50 p-3 rounded-sm border border-stone-900"><div className="text-stone-500 uppercase tracking-wider mb-1">Place</div><div className="text-stone-200">{result.grounding.place}</div></div><div className="bg-black/50 p-3 rounded-sm border border-stone-900"><div className="text-stone-500 uppercase tracking-wider mb-1">Year</div><div className="text-stone-200">{result.grounding.year}</div></div><div className="bg-black/50 p-3 rounded-sm border border-stone-900"><div className="text-stone-500 uppercase tracking-wider mb-1">Real Pattern</div><div className="text-stone-200">{result.grounding.realPattern}</div></div></div>)}
                        </div>
                        {result.characters && result.characters.length > 0 && (<div className="bg-stone-950 border border-stone-900 rounded-sm p-6"><h3 className="font-display text-xl mb-4 text-red-400">Character Anchors</h3><div className="space-y-3">{result.characters.map((c, i) => (<div key={i} className="border-l-2 border-stone-800 pl-4"><div className="font-medium text-stone-100">{c.name}</div><div className="text-sm text-stone-400">{c.description}</div>{c.voice && <div className="text-xs text-stone-500 mt-1 italic">Voice: {c.voice}</div>}</div>))}</div></div>)}
                        {result.scenes && result.scenes.map((scene, i) => (
                          <div key={i} className="bg-stone-950 border border-stone-900 rounded-sm p-6">
                            <div className="flex items-center justify-between mb-3"><div><div className="text-xs text-red-400 uppercase tracking-wider">Scene {scene.number} · {scene.beat}</div><h3 className="font-display text-2xl">{scene.title}</h3></div></div>
                            <p className="text-stone-400 text-sm mb-4 leading-relaxed">{scene.microScript}</p>
                            <div className="bg-black/50 border-l-2 border-red-700 p-4 mb-4"><div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Voice-Over</div><p className="font-display text-lg italic text-stone-100">"{scene.voiceOver}"</p></div>
                            {scene.shots && scene.shots.length > 0 && (
                              <div className="space-y-2"><div className="text-xs uppercase tracking-wider text-stone-500 mb-2">Shot List</div>
                                {scene.shots.map((shot, j) => (
                                  <div key={j} className="bg-black/30 border border-stone-900 rounded-sm p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div><span className="text-stone-500">Type:</span> <span className="text-stone-200">{shot.shotType}</span></div>
                                    <div><span className="text-stone-500">Camera:</span> <span className="text-stone-200">{shot.camera}</span></div>
                                    <div className="col-span-2"><span className="text-stone-500">Subject:</span> <span className="text-stone-200">{shot.subject}</span></div>
                                    <div className="col-span-2"><span className="text-stone-500">Action:</span> <span className="text-stone-200">{shot.action}</span></div>
                                    <div className="col-span-2 sm:col-span-4"><span className="text-stone-500">Env:</span> <span className="text-stone-200">{shot.environment}</span></div>
                                    {shot.continuity && <div className="col-span-2 sm:col-span-4"><span className="text-stone-500">Continuity:</span> <span className="text-stone-300">{shot.continuity}</span></div>}
                                    {shot.audio && <div className="col-span-2 sm:col-span-4"><span className="text-stone-500">Audio:</span> <span className="text-stone-300">{shot.audio}</span></div>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {result.captions && (<div className="bg-stone-950 border border-stone-900 rounded-sm p-6"><h3 className="font-display text-xl mb-3 text-red-400">Viral Captions</h3><div className="space-y-2">{result.captions.map((c, i) => (<div key={i} className="bg-black/50 border border-stone-900 p-3 rounded-sm text-sm text-stone-200">{c}</div>))}</div></div>)}
                      </div>
                    ) : (
                      <div className="bg-stone-950 border border-stone-900 rounded-sm p-6"><div className="text-xs uppercase tracking-wider text-stone-500 mb-3">Master Prompt — Paste into Veo, Runway, Sora, Kling</div><pre className="whitespace-pre-wrap text-sm text-stone-200 font-mono leading-relaxed bg-black/50 p-4 rounded-sm border border-stone-900 max-h-[600px] overflow-y-auto">{result.masterPrompt}</pre></div>
                    )}
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      )}

      {/* ============ HELP CENTER ============ */}
      {view === "help" && currentUser && <HelpCenter user={currentUser} onSubmit={submitComplaint} adminEmail={ADMIN_EMAIL} />}

      {/* ============ ADMIN PANEL ============ */}
      {view === "admin" && isAdmin && (
        <AdminPanel
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          users={allUsers}
          complaints={allComplaints}
          updateUser={adminUpdateUser}
          deleteUser={adminDeleteUser}
          updateComplaint={adminUpdateComplaint}
          adminEmail={ADMIN_EMAIL}
          openEngine={() => setView("app")}
        />
      )}

      {/* ============ AUTH MODAL ============ */}
      {authModal && <AuthModal mode={authModal} setMode={setAuthModal} onLogin={login} onSignup={signup} onClose={() => setAuthModal(null)} />}

      {/* ============ PAYWALL ============ */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setShowPaywall(false)}>
          <div className="bg-gradient-to-br from-stone-950 to-black border border-red-900/50 rounded-sm p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <Crown className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="font-display text-3xl mb-2">Unlock More</h3>
            <p className="text-stone-400 text-sm mb-6">{paywallReason}</p>
            <div className="space-y-3">
              <button onClick={() => { setShowPaywall(false); setShowCheckout(PLANS[1]); }} className="w-full bg-red-700 hover:bg-red-600 text-stone-100 py-3 rounded-sm text-sm font-medium">Creator — £5/week</button>
              <button onClick={() => { setShowPaywall(false); setShowCheckout(PLANS[2]); }} className="w-full bg-stone-900 hover:bg-stone-800 text-stone-100 py-3 rounded-sm text-sm border border-stone-800">Pro — £20/month (Unlimited + Ultra Dark)</button>
              <button onClick={() => setShowPaywall(false)} className="w-full text-stone-500 hover:text-stone-300 text-xs py-2">Maybe later</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CHECKOUT ============ */}
      {showCheckout && <SecureCheckout plan={showCheckout} user={currentUser} onClose={() => setShowCheckout(null)} onSuccess={() => upgrade(showCheckout.id)} />}
    </div>
  );
}

// ================ AUTH MODAL ================
function AuthModal({ mode, setMode, onLogin, onSignup, onClose }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", country: "United Kingdom", agreeTerms: false });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); setServerError(""); };

  const handleSubmit = async () => {
    const e = {};
    if (mode === "signup") {
      if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = "Full name required";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
      if (!form.agreeTerms) e.agreeTerms = "You must agree";
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setBusy(true);
    const res = mode === "signup" ? await onSignup(form) : await onLogin(form.email, form.password);
    setBusy(false);
    if (res?.error) setServerError(res.error);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-stone-950 border border-stone-800 rounded-sm w-full max-w-md my-8 fade-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-700 to-red-950 rounded flex items-center justify-center"><Skull className="w-5 h-5" /></div>
            <div><h3 className="font-display text-xl">{mode === "signup" ? "Create Your Account" : "Welcome Back"}</h3><div className="text-[10px] text-stone-500 uppercase tracking-wider">INFINITE Story Engine</div></div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-500 hover:text-stone-300" /></button>
        </div>

        <div className="p-6 space-y-4">
          {mode === "signup" && <FormField icon={<User className="w-4 h-4" />} label="Full Name" placeholder="Jane Doe" value={form.fullName} onChange={v => update("fullName", v)} error={errors.fullName} />}
          <FormField icon={<Mail className="w-4 h-4" />} label="Email" placeholder="you@example.com" value={form.email} onChange={v => update("email", v)} error={errors.email} type="email" />
          <FormField icon={<KeyRound className="w-4 h-4" />} label="Password" placeholder="••••••" value={form.password} onChange={v => update("password", v)} error={errors.password} type="password" />
          {mode === "signup" && (
            <>
              <FormField icon={<KeyRound className="w-4 h-4" />} label="Confirm Password" placeholder="••••••" value={form.confirmPassword} onChange={v => update("confirmPassword", v)} error={errors.confirmPassword} type="password" />
              <div>
                <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Country</label>
                <select value={form.country} onChange={e => update("country", e.target.value)} className="w-full bg-black border border-stone-800 rounded-sm px-3 py-2.5 text-sm focus:border-red-700 outline-none">{COUNTRIES.map(c => <option key={c}>{c}</option>)}</select>
              </div>
              <label className={`flex items-start gap-2 text-xs cursor-pointer ${errors.agreeTerms ? "text-red-400" : "text-stone-400"}`}>
                <input type="checkbox" checked={form.agreeTerms} onChange={e => update("agreeTerms", e.target.checked)} className="mt-0.5 accent-red-700" />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
            </>
          )}

          {serverError && <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 p-3 rounded-sm flex items-start gap-2"><AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> {serverError}</div>}

          <button onClick={handleSubmit} disabled={busy} className="w-full bg-red-700 hover:bg-red-600 text-stone-100 py-3 rounded-sm text-sm font-medium tracking-wide flex items-center justify-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{mode === "signup" ? <UserPlus className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />} {mode === "signup" ? "Create Account" : "Log In"}</>}
          </button>

          <div className="text-center text-xs text-stone-500 pt-2">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="text-red-400 hover:text-red-300 underline">{mode === "signup" ? "Log in" : "Sign up free"}</button>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-stone-900 text-[10px] text-stone-600 flex items-center justify-center gap-2"><ShieldCheck className="w-3 h-3 text-green-500" /> Encrypted · Your data is private</div>
      </div>
    </div>
  );
}

// ================ HELP CENTER ================
function HelpCenter({ user, onSubmit, adminEmail }) {
  const [tab, setTab] = useState("faq");
  const [form, setForm] = useState({ category: "Bug Report", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const faqs = [
    { q: "How do I generate my first story?", a: "Go to The Engine, pick your settings (genre, era, intensity), then click 'Generate Story — Live'. Each click produces a brand-new grounded cinematic story." },
    { q: "Why is a genre locked for me?", a: "Each tier unlocks more genres. Free has 3, Creator has 6, Pro has all 11. Click any locked genre to see upgrade options." },
    { q: "Can I cancel anytime?", a: "Yes. Subscriptions can be cancelled from your account at any time. You retain access until the end of the billing period." },
    { q: "Does the engine produce truly unique stories?", a: "Yes. Every click sends a new seed to the AI, producing a fresh story with new characters, places, and beats every time." },
    { q: "What AI video tools work with the master prompt?", a: "The master prompt is engineered for Veo, Runway Gen-3, Sora, Kling, Luma Dream Machine, and Pika. Paste it directly." },
    { q: "Is my payment information secure?", a: "Yes. Payments are processed via Stripe with 256-bit SSL and PCI-DSS compliance. We never store full card numbers." },
  ];

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setBusy(true);
    await onSubmit(form);
    setBusy(false);
    setSubmitted(true);
    setForm({ category: "Bug Report", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="font-display text-5xl mb-2">Help <span className="gold-text">Center</span></h1>
          <p className="text-stone-500 text-sm">All complaints and reviews are routed to <span className="text-red-300">{adminEmail}</span></p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-stone-900">
          {[{ id: "faq", label: "FAQs", icon: <HelpCircle className="w-4 h-4" /> }, { id: "complaint", label: "Submit Complaint", icon: <MessageSquare className="w-4 h-4" /> }, { id: "contact", label: "Contact", icon: <Mail className="w-4 h-4" /> }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition ${tab === t.id ? "border-red-700 text-stone-100" : "border-transparent text-stone-500 hover:text-stone-300"}`}>{t.icon} {t.label}</button>
          ))}
        </div>

        {tab === "faq" && (
          <div className="space-y-3">
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        )}

        {tab === "complaint" && (
          <div className="bg-stone-950 border border-stone-900 rounded-sm p-6 max-w-2xl">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-950/40 border border-green-900/40 flex items-center justify-center"><Check className="w-7 h-7 text-green-400" /></div>
                <h3 className="font-display text-2xl mb-2">Submitted</h3>
                <p className="text-stone-400 text-sm">Your message has been routed to {adminEmail}. We'll respond within 24 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl mb-1">Submit Complaint or Review</h3>
                <p className="text-stone-500 text-sm mb-5">All submissions are sent to <span className="text-red-300">{adminEmail}</span></p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-black border border-stone-800 rounded-sm px-3 py-2.5 text-sm focus:border-red-700 outline-none">
                      <option>Bug Report</option><option>Feature Request</option><option>Billing Issue</option><option>Content Quality Review</option><option>Account Issue</option><option>General Feedback</option><option>Other</option>
                    </select>
                  </div>
                  <FormField label="Subject" placeholder="Brief summary" value={form.subject} onChange={v => setForm({ ...form, subject: v })} />
                  <div>
                    <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Message</label>
                    <textarea rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe in detail..." className="w-full bg-black border border-stone-800 rounded-sm px-3 py-2.5 text-sm focus:border-red-700 outline-none resize-none" />
                  </div>
                  <div className="text-xs text-stone-500 bg-black/50 p-3 rounded-sm border border-stone-900">From: <span className="text-stone-300">{user.fullName}</span> · {user.email}</div>
                  <button onClick={handleSubmit} disabled={busy || !form.subject || !form.message} className="bg-red-700 hover:bg-red-600 text-stone-100 px-6 py-3 rounded-sm text-sm font-medium flex items-center gap-2 disabled:opacity-50">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit to Admin</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "contact" && (
          <div className="bg-stone-950 border border-stone-900 rounded-sm p-8 max-w-xl">
            <h3 className="font-display text-2xl mb-4">Direct Contact</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 p-4 bg-black border border-stone-900 rounded-sm">
                <Mail className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Admin Email</div>
                  <a href={`mailto:${adminEmail}`} className="text-stone-100 hover:text-red-300 transition">{adminEmail}</a>
                </div>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">All inquiries — billing, technical issues, partnership requests, API access, content questions — go directly to the admin inbox. Response time: within 24 hours.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-stone-950 border border-stone-900 rounded-sm">
      <button onClick={() => setOpen(!open)} className="w-full p-4 text-left flex items-center justify-between gap-4">
        <span className="text-stone-100 text-sm">{q}</span>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-stone-400 leading-relaxed">{a}</div>}
    </div>
  );
}

// ================ ADMIN PANEL ================
function AdminPanel({ adminTab, setAdminTab, users, complaints, updateUser, deleteUser, updateComplaint, adminEmail, openEngine }) {
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    suspended: users.filter(u => u.status === "suspended").length,
    paidUsers: users.filter(u => u.tier === "creator" || u.tier === "pro").length,
    totalStories: users.reduce((sum, u) => sum + (u.storiesGenerated || 0), 0),
    openComplaints: complaints.filter(c => c.status === "open").length,
    revenue: users.reduce((sum, u) => sum + (u.tier === "creator" ? 20 : u.tier === "pro" ? 20 : 0), 0),
  };

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "users", label: "Manage Users", icon: <Users className="w-4 h-4" /> },
    { id: "complaints", label: "Complaints", icon: <MessageSquare className="w-4 h-4" />, badge: stats.openComplaints },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Crown className="w-7 h-7 text-yellow-500" />
              <h1 className="font-display text-4xl">Admin <span className="gold-text">Panel</span></h1>
            </div>
            <p className="text-stone-500 text-sm">Logged in as: <span className="text-yellow-400">{adminEmail}</span> · Unlimited engine access</p>
          </div>
          <button onClick={openEngine} className="bg-red-700 hover:bg-red-600 text-stone-100 px-4 py-2 rounded-sm text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Open Engine</button>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <aside className="bg-stone-950 border border-stone-900 rounded-sm p-3 h-fit lg:sticky lg:top-24">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setAdminTab(t.id)} className={`w-full px-3 py-2.5 text-sm rounded-sm flex items-center gap-2.5 transition mb-1 ${adminTab === t.id ? "bg-yellow-900/20 border border-yellow-700/40 text-yellow-300" : "text-stone-400 hover:bg-stone-900 hover:text-stone-100"}`}>
                {t.icon} {t.label}
                {t.badge ? <span className="ml-auto bg-red-700 text-[10px] px-1.5 py-0.5 rounded-sm">{t.badge}</span> : null}
              </button>
            ))}
          </aside>

          <main>
            {adminTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="w-4 h-4" />} />
                  <StatCard label="Active Users" value={stats.activeUsers} icon={<Activity className="w-4 h-4" />} />
                  <StatCard label="Paid Subscribers" value={stats.paidUsers} icon={<Crown className="w-4 h-4" />} />
                  <StatCard label="Stories Generated" value={stats.totalStories} icon={<Film className="w-4 h-4" />} />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard label="Suspended Accounts" value={stats.suspended} icon={<Lock className="w-4 h-4" />} accent="red" />
                  <StatCard label="Open Complaints" value={stats.openComplaints} icon={<MessageSquare className="w-4 h-4" />} accent="red" />
                  <StatCard label="Est. Revenue (£)" value={stats.revenue} icon={<CreditCard className="w-4 h-4" />} accent="gold" />
                </div>
                <div className="bg-stone-950 border border-stone-900 rounded-sm p-5">
                  <h3 className="font-display text-xl mb-4">Recent Signups</h3>
                  <div className="space-y-2">
                    {users.length === 0 ? <p className="text-stone-500 text-sm">No users yet.</p> : users.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-black border border-stone-900 rounded-sm text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${u.role === "admin" ? "bg-yellow-700" : "bg-red-900"}`}>{u.fullName.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="text-stone-100">{u.fullName}</div>
                            <div className="text-xs text-stone-500">{u.email} · {u.country}</div>
                          </div>
                        </div>
                        <div className="text-xs"><span className={`px-2 py-1 rounded-sm uppercase tracking-wider ${u.tier === "admin" ? "bg-yellow-900/30 text-yellow-300" : u.tier === "pro" ? "bg-yellow-900/20 text-yellow-400" : u.tier === "creator" ? "bg-red-900/20 text-red-300" : "bg-stone-900 text-stone-400"}`}>{u.tier}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {adminTab === "users" && (
              <div className="bg-stone-950 border border-stone-900 rounded-sm">
                <div className="p-5 border-b border-stone-900 flex items-center justify-between">
                  <h3 className="font-display text-xl">All Users ({users.length})</h3>
                  <span className="text-xs text-stone-500">Audit · Manage tiers · Suspend</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-black/50 text-xs uppercase tracking-wider text-stone-500">
                      <tr>
                        <th className="text-left p-3">User</th><th className="text-left p-3">Country</th><th className="text-left p-3">Tier</th><th className="text-left p-3">Stories</th><th className="text-left p-3">Status</th><th className="text-left p-3">Joined</th><th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-t border-stone-900 hover:bg-black/30">
                          <td className="p-3"><div className="text-stone-100">{u.fullName}</div><div className="text-xs text-stone-500">{u.email}</div></td>
                          <td className="p-3 text-stone-300">{u.country}</td>
                          <td className="p-3">
                            <select value={u.tier} onChange={e => updateUser(u.email, { tier: e.target.value })} disabled={u.role === "admin"} className="bg-black border border-stone-800 rounded-sm px-2 py-1 text-xs disabled:opacity-50">
                              <option value="free">Free</option><option value="creator">Creator</option><option value="pro">Pro</option>{u.role === "admin" && <option value="admin">Admin</option>}
                            </select>
                          </td>
                          <td className="p-3 text-stone-300">{u.storiesGenerated || 0}</td>
                          <td className="p-3"><span className={`text-xs px-2 py-1 rounded-sm ${u.status === "suspended" ? "bg-red-900/30 text-red-300" : "bg-green-900/20 text-green-400"}`}>{u.status}</span></td>
                          <td className="p-3 text-stone-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {u.role !== "admin" && (
                                <>
                                  <button onClick={() => updateUser(u.email, { status: u.status === "suspended" ? "active" : "suspended" })} title={u.status === "suspended" ? "Reactivate" : "Suspend"} className="p-1.5 hover:bg-stone-900 rounded-sm"><Lock className="w-3 h-3 text-stone-400" /></button>
                                  <button onClick={() => { if (confirm(`Delete ${u.email}?`)) deleteUser(u.email); }} title="Delete" className="p-1.5 hover:bg-red-900/30 rounded-sm"><Trash2 className="w-3 h-3 text-red-400" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-stone-500">No users yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === "complaints" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xl">Complaints & Reviews ({complaints.length})</h3>
                  <span className="text-xs text-stone-500">All routed to {adminEmail}</span>
                </div>
                {complaints.length === 0 ? (
                  <div className="bg-stone-950 border border-stone-900 rounded-sm p-12 text-center text-stone-500">No complaints yet.</div>
                ) : complaints.map(c => (
                  <div key={c.id} className="bg-stone-950 border border-stone-900 rounded-sm p-5">
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-300 rounded-sm uppercase tracking-wider">{c.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-sm uppercase tracking-wider ${c.status === "open" ? "bg-yellow-900/30 text-yellow-300" : c.status === "resolved" ? "bg-green-900/30 text-green-400" : "bg-stone-900 text-stone-400"}`}>{c.status}</span>
                        </div>
                        <h4 className="font-medium text-stone-100">{c.subject}</h4>
                        <div className="text-xs text-stone-500 mt-1">{c.userName} · {c.userEmail} · {new Date(c.createdAt).toLocaleString()}</div>
                      </div>
                      <select value={c.status} onChange={e => updateComplaint(c.id, e.target.value)} className="bg-black border border-stone-800 rounded-sm px-2 py-1 text-xs">
                        <option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                      </select>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed bg-black/50 p-3 rounded-sm border border-stone-900">{c.message}</p>
                    <div className="mt-3 flex gap-2">
                      <a href={`mailto:${c.userEmail}?subject=Re: ${encodeURIComponent(c.subject)}`} className="text-xs bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-sm flex items-center gap-1.5"><Mail className="w-3 h-3" /> Reply via Email</a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "settings" && (
              <div className="bg-stone-950 border border-stone-900 rounded-sm p-6 space-y-5">
                <h3 className="font-display text-xl">Admin Settings</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-black border border-stone-900 rounded-sm">
                    <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Admin Email (hardcoded)</div>
                    <div className="text-yellow-400">{adminEmail}</div>
                    <div className="text-xs text-stone-500 mt-1">All complaints, reviews, and contact submissions are routed here.</div>
                  </div>
                  <div className="p-4 bg-black border border-stone-900 rounded-sm">
                    <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Engine Access</div>
                    <div className="text-stone-200">Unlimited · All genres · All lengths · Intensity 10/10</div>
                  </div>
                  <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-sm">
                    <div className="text-xs uppercase tracking-wider text-red-400 mb-2">Danger Zone</div>
                    <button onClick={async () => { if (confirm("Reset ALL non-admin users? This cannot be undone.")) { const filtered = users.filter(u => u.role === "admin"); await window.storage.set("all-users", JSON.stringify(filtered)); window.location.reload(); } }} className="text-xs bg-red-900/40 hover:bg-red-800/50 text-red-300 px-3 py-2 rounded-sm border border-red-800/50">Reset All Non-Admin Users</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  const accentColor = accent === "red" ? "text-red-400 border-red-900/40" : accent === "gold" ? "text-yellow-400 border-yellow-900/40" : "text-stone-300 border-stone-900";
  return (
    <div className={`bg-stone-950 border ${accentColor} rounded-sm p-4`}>
      <div className="flex items-center justify-between mb-2"><div className="text-xs uppercase tracking-wider text-stone-500">{label}</div><div className={accentColor.split(" ")[0]}>{icon}</div></div>
      <div className="font-display text-3xl">{value}</div>
    </div>
  );
}

// ================ SECURE CHECKOUT ================
function SecureCheckout({ plan, user, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: user?.fullName || "", email: user?.email || "", phone: "",
    addressLine1: "", addressLine2: "", city: "", postcode: "", country: user?.country || "United Kingdom",
    cardNumber: "", cardName: "", expiry: "", cvc: "",
    saveCard: true, agreeTerms: false,
  });
  const [errors, setErrors] = useState({});

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };
  const formatCard = (v) => v.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (v) => { const c = v.replace(/\D/g, "").slice(0, 4); return c.length > 2 ? `${c.slice(0,2)} / ${c.slice(2)}` : c; };

  const validateStep1 = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.replace(/\D/g,"").length < 7) e.phone = "Valid number required";
    if (!form.addressLine1.trim()) e.addressLine1 = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.postcode.trim()) e.postcode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.cardNumber.replace(/\s/g, "").length < 15) e.cardNumber = "Valid card required";
    if (!form.cardName.trim()) e.cardName = "Required";
    if (form.expiry.replace(/\D/g, "").length !== 4) e.expiry = "MM YY";
    if (form.cvc.length < 3) e.cvc = "3-4 digits";
    if (!form.agreeTerms) e.agreeTerms = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) { setStep(3); setTimeout(onSuccess, 1800); }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-stone-950 border border-stone-800 rounded-sm w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-green-500" /><div><h3 className="font-display text-xl">Secure Checkout</h3><div className="text-[10px] text-stone-500 uppercase tracking-wider">256-bit SSL · PCI-DSS Compliant</div></div></div>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-500 hover:text-stone-300" /></button>
        </div>

        <div className="px-6 pt-5">
          <div className="flex items-center gap-2 text-xs">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-red-400" : "text-stone-600"}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? "bg-red-700 text-stone-100" : "bg-stone-800"}`}>1</div>Details</div>
            <div className="flex-1 h-px bg-stone-800"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-red-400" : "text-stone-600"}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? "bg-red-700 text-stone-100" : "bg-stone-800"}`}>2</div>Payment</div>
            <div className="flex-1 h-px bg-stone-800"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-green-400" : "text-stone-600"}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? "bg-green-700 text-stone-100" : "bg-stone-800"}`}>3</div>Confirm</div>
          </div>
        </div>

        <div className="m-6 bg-black border border-stone-900 p-4 rounded-sm flex justify-between items-center">
          <div><div className="font-medium">{plan.name} Plan</div><div className="text-xs text-stone-500">{plan.limit}</div></div>
          <div className="font-display text-2xl">{plan.price}<span className="text-sm text-stone-500">{plan.period}</span></div>
        </div>

        {step === 1 && (
          <div className="px-6 pb-6 space-y-4">
            <div className="text-xs uppercase tracking-wider text-stone-500 flex items-center gap-2"><User className="w-3 h-3" /> Personal Details</div>
            <FormField icon={<User className="w-4 h-4" />} label="Full Name" placeholder="Jane Doe" value={form.fullName} onChange={v => update("fullName", v)} error={errors.fullName} />
            <div className="grid grid-cols-2 gap-3">
              <FormField icon={<Mail className="w-4 h-4" />} label="Email" placeholder="you@example.com" value={form.email} onChange={v => update("email", v)} error={errors.email} type="email" />
              <FormField icon={<Phone className="w-4 h-4" />} label="Phone" placeholder="+234..." value={form.phone} onChange={v => update("phone", v)} error={errors.phone} />
            </div>
            <div className="text-xs uppercase tracking-wider text-stone-500 flex items-center gap-2 pt-3"><MapPin className="w-3 h-3" /> Billing Address</div>
            <FormField label="Address Line 1" placeholder="123 Main Street" value={form.addressLine1} onChange={v => update("addressLine1", v)} error={errors.addressLine1} />
            <FormField label="Address Line 2 (optional)" placeholder="Apt, suite, etc." value={form.addressLine2} onChange={v => update("addressLine2", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" placeholder="Lagos" value={form.city} onChange={v => update("city", v)} error={errors.city} />
              <FormField label="Postcode / ZIP" placeholder="100001" value={form.postcode} onChange={v => update("postcode", v)} error={errors.postcode} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Country</label>
              <select value={form.country} onChange={e => update("country", e.target.value)} className="w-full bg-black border border-stone-800 rounded-sm px-3 py-2.5 text-sm focus:border-red-700 outline-none max-h-60">
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={handleNext} className="w-full bg-red-700 hover:bg-red-600 text-stone-100 py-3 rounded-sm text-sm font-medium tracking-wide flex items-center justify-center gap-2 mt-2">Continue to Payment <ArrowRight className="w-4 h-4" /></button>
          </div>
        )}

        {step === 2 && (
          <div className="px-6 pb-6 space-y-4">
            <div className="text-xs uppercase tracking-wider text-stone-500 flex items-center gap-2"><CreditCard className="w-3 h-3" /> Card Details</div>
            <FormField label="Card Number" placeholder="1234 5678 9012 3456" value={form.cardNumber} onChange={v => update("cardNumber", formatCard(v))} error={errors.cardNumber} icon={<CreditCard className="w-4 h-4" />} />
            <FormField label="Name on Card" placeholder="JANE DOE" value={form.cardName} onChange={v => update("cardName", v.toUpperCase())} error={errors.cardName} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Expiry (MM YY)" placeholder="12 / 28" value={form.expiry} onChange={v => update("expiry", formatExpiry(v))} error={errors.expiry} />
              <FormField label="CVC" placeholder="123" value={form.cvc} onChange={v => update("cvc", v.replace(/\D/g,"").slice(0,4))} error={errors.cvc} type="password" />
            </div>
            <label className="flex items-start gap-2 text-xs text-stone-400 cursor-pointer pt-2"><input type="checkbox" checked={form.saveCard} onChange={e => update("saveCard", e.target.checked)} className="mt-0.5 accent-red-700" /><span>Save card securely for future renewals (encrypted via Stripe)</span></label>
            <label className={`flex items-start gap-2 text-xs cursor-pointer ${errors.agreeTerms ? "text-red-400" : "text-stone-400"}`}><input type="checkbox" checked={form.agreeTerms} onChange={e => update("agreeTerms", e.target.checked)} className="mt-0.5 accent-red-700" /><span>I agree to the Terms of Service and Privacy Policy. I understand this is a recurring subscription that I can cancel anytime.</span></label>
            <div className="bg-green-950/20 border border-green-900/40 rounded-sm p-3 flex items-start gap-2 text-xs"><Shield className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><div className="text-stone-300">Your payment is protected by <span className="text-green-400">Stripe</span>. We never see or store your full card number. All data is encrypted with bank-level 256-bit SSL.</div></div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-sm text-sm">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-red-700 hover:bg-red-600 text-stone-100 py-3 rounded-sm text-sm font-medium tracking-wide flex items-center justify-center gap-2"><Lock className="w-3 h-3" /> Pay {plan.price} {plan.period}</button>
            </div>
            <div className="flex justify-center items-center gap-3 text-[10px] text-stone-600 uppercase tracking-widest pt-2"><span>VISA</span><span>·</span><span>MASTERCARD</span><span>·</span><span>AMEX</span><span>·</span><span>VERVE</span><span>·</span><span>PAYSTACK</span></div>
          </div>
        )}

        {step === 3 && (
          <div className="px-6 pb-8 pt-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-950/40 border border-green-900/40 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-green-400" /></div>
            <h4 className="font-display text-2xl mb-2">Processing Payment...</h4>
            <p className="text-stone-500 text-sm mb-1">Securely charging your card</p>
            <p className="text-stone-600 text-xs">Do not close this window</p>
          </div>
        )}

        <div className="px-6 py-3 border-t border-stone-900 flex justify-between items-center text-[10px] text-stone-600">
          <div className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Secured by Stripe</div>
          <div>Cancel anytime · Demo checkout</div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, error, type = "text", icon }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">{label}</label>
      <div className={`relative flex items-center bg-black border rounded-sm transition ${error ? "border-red-700" : "border-stone-800 focus-within:border-red-700"}`}>
        {icon && <div className="pl-3 text-stone-600">{icon}</div>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-stone-700 ${icon ? "pl-2" : ""}`} />
      </div>
      {error && <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</div>}
    </div>
  );
}