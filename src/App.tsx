import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Clock, 
  LogOut, 
  User, 
  Check, 
  ShoppingBag, 
  TrendingUp, 
  Info, 
  ChevronRight, 
  Fingerprint, 
  Star,
  RefreshCw,
  FileText,
  Share2,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  Database,
  Key,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Save,
  Undo
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { AnimatePresence, motion } from "framer-motion";

import LoginForm from "@/components/ui/login-form";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import WarpShaderHero from "@/components/ui/wrap-shader";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { HeroSection } from "@/components/ui/hero-section-2";
import { AuthenticatedUser, SkinScan, SkinScores } from "./types";

// Stock facial Close-ups representing different skin concerns for sandbox mock scanning
const SAMPLE_MOCK_FACES = [
  {
    id: "concern_normal",
    label: "Hydrated Bright (Normal)",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    desc: "Clear skin surface, balanced moisture levels."
  },
  {
    id: "concern_dry",
    label: "Sensitive Dry/Dehydrated",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    desc: "Flaky textures, high skin age, light fine wrinkles."
  },
  {
    id: "concern_oily",
    label: "Acne-prone & Pores",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    desc: "Enlarged pores in T-zone areas, sebum accumulation."
  }
];

export default function App() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("skinova_theme") as "light" | "dark") || "light"
  );

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("skinova_theme", nextTheme);
  };

  // Synchronize document stylesheet selector
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<"dashboard" | "formulations" | "history" | "how-it-works" | "admin">("dashboard");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scans, setScans] = useState<SkinScan[]>([]);
  const [currentScan, setCurrentScan] = useState<SkinScan | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [scanningStatus, setScanningStatus] = useState("");
  const [uploadImg, setUploadImg] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [subscriptionBoxStatus, setSubscriptionBoxStatus] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Administration Microservices states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminScans, setAdminScans] = useState<any[]>([]);
  const [adminRawJson, setAdminRawJson] = useState<string>("");
  const [adminSearchTerm, setAdminSearchTerm] = useState<string>("");
  const [adminScanSearchTerm, setAdminScanSearchTerm] = useState<string>("");
  const [adminTab, setAdminTab] = useState<"users" | "scans" | "raw">("users");
  const [adminError, setAdminError] = useState<string>("");
  const [adminSuccess, setAdminSuccess] = useState<string>("");

  // Editing modals states
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingScan, setEditingScan] = useState<any | null>(null);

  // Creating states
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", password: "", isPro: false, isAdmin: false });

  const [showNewScanForm, setShowNewScanForm] = useState(false);
  const [newScanForm, setNewScanForm] = useState({
    email: "",
    skinType: "Normal",
    skinAge: 25,
    summary: "Clinical assessment logged by skin specialist derm-labs.",
    scores: { acne: 85, pores: 78, pigmentation: 82, wrinkles: 88, texture: 79, dryness: 81, darkCircles: 74 },
    ingredients: "Niacinamide, Salicylic Acid, Hyaluronic Acid, Ceramides",
    morningRoutine: [
      { step: "Cleanse", desc: "Wash with mild ceramide hydrating cleanser." },
      { step: "Target", desc: "Put 3 drops of Niacinamide serum for pore control." },
      { step: "Shield", desc: "Apply physical SPF 50 sunscreen." }
    ],
    nightRoutine: [
      { step: "Double Cleanse", desc: "Melt makeup & sunscreens with oil wash." },
      { step: "AHA Exfoliate", desc: "Apply 1% Glycolic Acid compound." },
      { step: "Barrier Restoration", desc: "Seal with peptide intensive ceramide cream." }
    ]
  });

  const shareCurrentScanReport = () => {
    if (!currentScan) return;
    const scoresText = getRenderableScores(currentScan.scores)
      .map(sc => `- ${sc.name}: ${sc.value}% (${sc.desc})`)
      .join("\n");
      
    const reportText = `SKINOVA DERMATOLOGY AI ASSESSMENT REPORT
-----------------------------------------------
Timestamp: ${new Date(currentScan.timestamp).toLocaleString()}
Client: ${user?.name || "Skinova Client"} (${user?.email})
Estimated Skin Age: ${currentScan.skinAge} Years
Skin Type Focus: ${currentScan.skinType}
Primary Active Solution: ${currentScan.ingredients.join(", ")}

MEASURED SKIN INDICATORS:
${scoresText}

EXECUTIVE CLINICAL DIAGNOSIS SYNOPSIS:
"${currentScan.summary}"

RECOMMENDED AM MORNING BARRIER PROTECT CHECKLIST:
${currentScan.morningRoutine?.map((step: any, idx: number) => `${idx + 1}. [${step.step}] ${step.desc}`).join("\n") || "No morning routine loaded."}

RECOMMENDED PM NIGHT CELLULAR RESTORATION CHECKLIST:
${currentScan.nightRoutine?.map((step: any, idx: number) => `${idx + 1}. [${step.step}] ${step.desc}`).join("\n") || "No night routine loaded."}

-----------------------------------------------
Computed dynamically via Skinova Deep Diagnostic Vision Engine.`;

    navigator.clipboard.writeText(reportText).then(() => {
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
      }, 3000);
    }).catch(err => {
      console.error("Failed to copy report text: ", err);
    });
  };
  
  // Camera references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Admin Database loading & management helpers
  const loadAdminDatabase = async () => {
    if (!user || !user.email) return;
    try {
      const res = await fetch("/api/admin/db", {
        headers: {
          "x-admin-email": user.email
        }
      });
      if (!res.ok) {
        const errorMsg = await res.json();
        setAdminError(errorMsg.error || "Failed to load database content.");
        return;
      }
      const data = await res.json();
      setAdminUsers(data.users || []);
      setAdminScans(data.scans || []);
      setAdminRawJson(JSON.stringify(data, null, 2));
      setAdminError("");
    } catch (err: any) {
      setAdminError("Error connecting to database microservices: " + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === "admin" && user) {
      loadAdminDatabase();
    }
  }, [activeTab, user]);

  const saveAdminDatabase = async (updatedUsers: any[], updatedScans: any[]) => {
    if (!user || !user.email) return;
    try {
      const res = await fetch("/api/admin/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user.email
        },
        body: JSON.stringify({ users: updatedUsers, scans: updatedScans })
      });
      if (!res.ok) {
         const errorData = await res.json();
         setAdminError(errorData.error || "Server commit failed.");
         return;
      }
      const data = await res.json();
      setAdminUsers(data.db.users);
      setAdminScans(data.db.scans);
      setAdminRawJson(JSON.stringify(data.db, null, 2));
      setAdminSuccess("Database synced & committed to server!");
      setTimeout(() => setAdminSuccess(""), 4000);
      setAdminError("");
    } catch (err: any) {
      setAdminError("Failed to update database: " + err.message);
    }
  };

  const saveRawJsonDatabase = async () => {
    try {
      const parsed = JSON.parse(adminRawJson);
      if (!parsed.users || !Array.isArray(parsed.users)) {
        setAdminError("Schema Error: root array 'users' is required.");
        return;
      }
      if (!parsed.scans || !Array.isArray(parsed.scans)) {
        setAdminError("Schema Error: root array 'scans' is required.");
        return;
      }
      await saveAdminDatabase(parsed.users, parsed.scans);
    } catch (err: any) {
      setAdminError("JSON Syntax Error: " + err.message);
    }
  };

  const triggerDatabaseReset = async () => {
    if (!window.confirm("WARNING: This will delete custom records and reset the system database back to defaults. Do you want to proceed?")) {
      return;
    }
    if (!user || !user.email) return;
    try {
      const res = await fetch("/api/admin/db/reset", {
        method: "POST",
        headers: {
          "x-admin-email": user.email
        }
      });
      if (!res.ok) {
        const errRes = await res.json();
        setAdminError(errRes.error || "Reset failed.");
        return;
      }
      const data = await res.json();
      setAdminUsers(data.db.users);
      setAdminScans(data.db.scans);
      setAdminRawJson(JSON.stringify(data.db, null, 2));
      setAdminSuccess("Database restored to clinical defaults!");
      setTimeout(() => setAdminSuccess(""), 4000);
    } catch (err: any) {
      setAdminError("Failed: " + err.message);
    }
  };

  const toggleUserPro = (userId: string) => {
    const updated = adminUsers.map((u: any) => {
      if (u.userId === userId) {
        return { ...u, isPro: !u.isPro };
      }
      return u;
    });
    saveAdminDatabase(updated, adminScans);
  };

  const toggleUserAdmin = (userId: string) => {
    const target = adminUsers.find((u: any) => u.userId === userId);
    if (target?.email === "admin@skinova.com") {
      alert("Safety Lock: System administrator seeds cannot be demoted.");
      return;
    }
    const updated = adminUsers.map((u: any) => {
      if (u.userId === userId) {
        return { ...u, isAdmin: !u.isAdmin };
      }
      return u;
    });
    saveAdminDatabase(updated, adminScans);
  };

  const deleteUser = (userId: string) => {
    const target = adminUsers.find((u: any) => u.userId === userId);
    if (target?.email === "admin@skinova.com") {
      alert("Safety Lock: System administrator seeds cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user ${target?.email || ""}?`)) {
      return;
    }
    const updatedUsers = adminUsers.filter((u: any) => u.userId !== userId);
    const updatedScans = adminScans.filter((s: any) => s.email !== target?.email);
    saveAdminDatabase(updatedUsers, updatedScans);
  };

  const handleCreateNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    try {
      const res = await fetch("/api/admin/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user.email
        },
        body: JSON.stringify(newUserForm)
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Failed to create user.");
        return;
      }
      const data = await res.json();
      setAdminUsers(data.db.users);
      setAdminScans(data.db.scans);
      setAdminRawJson(JSON.stringify(data.db, null, 2));
      setShowNewUserForm(false);
      setNewUserForm({ name: "", email: "", password: "", isPro: false, isAdmin: false });
      setAdminSuccess("User account registered successfully!");
      setTimeout(() => setAdminSuccess(""), 4005);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateNewScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user.email
        },
        body: JSON.stringify(newScanForm)
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Failed to create scan.");
        return;
      }
      const data = await res.json();
      setAdminUsers(data.db.users);
      setAdminScans(data.db.scans);
      setAdminRawJson(JSON.stringify(data.db, null, 2));
      setShowNewScanForm(false);
      setNewScanForm({
        email: "",
        skinType: "Normal",
        skinAge: 25,
        summary: "Clinical assessment logged by skin specialist derm-labs.",
        scores: { acne: 85, pores: 78, pigmentation: 82, wrinkles: 88, texture: 79, dryness: 81, darkCircles: 74 },
        ingredients: "Niacinamide, Salicylic Acid, Hyaluronic Acid, Ceramides",
        morningRoutine: [
          { step: "Cleanse", desc: "Wash with mild ceramide hydrating cleanser." },
          { step: "Target", desc: "Put 3 drops of Niacinamide serum for pore control." },
          { step: "Shield", desc: "Apply physical SPF 50 sunscreen." }
        ],
        nightRoutine: [
          { step: "Double Cleanse", desc: "Melt makeup & sunscreens with oil wash." },
          { step: "AHA Exfoliate", desc: "Apply 1% Glycolic Acid compound." },
          { step: "Barrier Restoration", desc: "Seal with peptide intensive ceramide cream." }
        ]
      });
      setAdminSuccess("Dermal scan report logged successfully!");
      setTimeout(() => setAdminSuccess(""), 4005);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = adminUsers.map((u) => u.userId === editingUser.userId ? editingUser : u);
    saveAdminDatabase(updated, adminScans);
    setEditingUser(null);
  };

  const handleUpdateScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScan) return;
    const updated = adminScans.map((s) => s.scanId === editingScan.scanId ? editingScan : s);
    saveAdminDatabase(adminUsers, updated);
    setEditingScan(null);
  };

  const deleteScan = (scanId: string) => {
    if (!window.confirm("Are you sure you want to delete this scan registry?")) return;
    const updated = adminScans.filter((s: any) => s.scanId !== scanId);
    saveAdminDatabase(adminUsers, updated);
  };

  // Load user session on boot
  useEffect(() => {
    const savedUser = localStorage.getItem("skinova_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.email === "guest@skinova.com") {
          // Erase entries after every refresh in Guest account
          fetch("/api/auth/guest/reset", { method: "POST" })
            .then(() => fetchHistory(parsed.email))
            .catch(err => console.error("Failed to reset guest history:", err));
        } else {
          fetchHistory(parsed.email);
        }
      } catch (e) {
        localStorage.removeItem("skinova_user");
      }
    }
  }, []);

  // Sync scan history on user changes
  useEffect(() => {
    if (user) {
      fetchHistory(user.email);
    } else {
      setScans([]);
      setCurrentScan(null);
    }
  }, [user]);

  // Handle Fetch Scan History
  const fetchHistory = async (email: string) => {
    try {
      const response = await fetch(`/api/skin/history?email=${encodeURIComponent(email)}`);
      const result = await response.json();
      if (response.ok && result.scans) {
        setScans(result.scans);
        if (result.scans.length > 0) {
          // Set latest scan as current default
          setCurrentScan(result.scans[result.scans.length - 1]);
        }
      }
    } catch (err) {
      console.error("Failed to load history list:", err);
    }
  };

  // Trigger webcamera activation
  const startCamera = async () => {
    setUploadImg(null);
    setErrorMsg("");
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setErrorMsg("Camera access denied or unsupportable in current iframe. Please choose a facial sandbox template below.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture face photograph via active canvas
  const captureSelfieMsg = () => {
    const video = videoRef.current;
    if (video) {
      // Use bound canvas element or fallback to a dynamic in-memory canvas
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setUploadImg(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle generic file attachment from client machine
  const [errorMsg, setErrorMsg] = useState("");
  const handleFileDropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadImg(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform secure AI Skin analyze
  const executeAISkinAnalysis = async () => {
    if (!uploadImg) {
      setErrorMsg("Select a facial template or snap a picture first.");
      return;
    }
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setErrorMsg("");
    setScanning(true);
    setScanningProgress(10);
    setScanningStatus("Authenticating core credentials & checking parameters...");

    // Staged animation triggers
    const stages = [
      { progress: 25, label: "Scanning facial geometry & pores level..." },
      { progress: 50, label: "Evaluating sebum lipids & acne breakouts..." },
      { progress: 75, label: "Analyzing pigmentation depth & UV damages..." },
      { progress: 90, label: "Synthesizing customized skincare formula recommendations..." }
    ];

    stages.forEach((st, idx) => {
      setTimeout(() => {
        setScanningProgress(st.progress);
        setScanningStatus(st.label);
      }, (idx + 1) * 800);
    });

    try {
      // Trigger fullstack backend API
      const response = await fetch("/api/skin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, 
          image: uploadImg 
        })
      });

      const result = await response.json();

      setTimeout(() => {
        if (!response.ok) {
          setErrorMsg(result.error || "Skincare scan algorithm failed. Please retry.");
          setScanning(false);
          return;
        }

        const newScan = result.scan;
        setCurrentScan(newScan);
        setScans(prev => [...prev, newScan]);
        setScanning(false);
        setScanningProgress(100);
      }, 4000);

    } catch (err) {
      setTimeout(() => {
        setErrorMsg("Network offline. Running emergency offline analyzer fallback.");
        setScanning(false);
      }, 4000);
    }
  };

  // Simulation Upgrade to Pro model (Slide 6 pricing levels)
  const upgradeToProPlan = async () => {
    if (!user) return;
    try {
      const response = await fetch("/api/user/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      const result = await response.json();
      if (response.ok) {
        const updated = { ...user, isPro: true };
        setUser(updated);
        localStorage.setItem("skinova_user", JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Pro upgrade failed", e);
    }
  };

  // Handle active user logout
  const handleLogout = () => {
    localStorage.removeItem("skinova_user");
    setUser(null);
    setCurrentScan(null);
    setScans([]);
    setActiveTab("dashboard");
  };

  // Subscribe Skincare Subscription Box (₹999 / ₹1999 per month - Slide 8)
  const handlePrebuiltSubscription = (planName: string, price: string) => {
    setSubscriptionBoxStatus(`Analyzing database... Customised subscription box successfully prepared!\n\nKit contains customized Cleanser, specialized Serum matching your scores, nourishing SPF shield and Booster formulation.\n\nBilling Setup: ${price}/month (INR).\nDelivery schedule initialized!`);
  };

  // Convert scores to list for easy rendering
  const getRenderableScores = (scores?: SkinScores) => {
    if (!scores) return [];
    return [
      { name: "Acne Control", value: scores.acne, desc: "Purity of active layers", color: "from-rose-400 to-orange-400" },
      { name: "Pores Smoothness", value: scores.pores, desc: "Refinement & clearance", color: "from-sky-400 to-indigo-400" },
      { name: "Pigmentation Tone", value: scores.pigmentation, desc: "Brightness uniformity", color: "from-yellow-400 to-amber-500" },
      { name: "Wrinkles Elasticity", value: scores.wrinkles, desc: "Skin-cell lift & fibers", color: "from-emerald-400 to-teal-500" },
      { name: "Hydrated Sebum", value: scores.dryness, desc: "Moisture balance index", color: "from-blue-400 to-indigo-500" },
      { name: "Dark Circles Recovery", value: scores.darkCircles, desc: "Periocular active oxygen", color: "from-purple-400 to-fuchsia-500" }
    ];
  };

  // Setup formatted chart data (Slide 5: Improvement graphs)
  const chartData = scans.map((s, idx) => ({
    name: `Scan ${idx + 1}`,
    Acne: s.scores.acne,
    Hydration: s.scores.dryness,
    Smoothness: s.scores.texture,
    Pigmentation: s.scores.pigmentation
  }));

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-[#0F0E0D] text-[#ECE5DC]' : 'bg-[#FCFAF7] text-neutral-800'} flex flex-col justify-between selection:bg-[#E6C79C]/30 transition-colors duration-300`}>
         {/* Dynamic Header Block */}
      {user && (
        <header className={`md:hidden sticky top-0 z-40 ${theme === 'dark' ? 'bg-[#141211]/95 border-[#E6C79C]/15' : 'bg-[#FCFAF7]/95 border-[#E6C79C]/10'} backdrop-blur-md border-b py-4 px-6 flex items-center justify-between transition-all duration-300`}>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setActiveTab("dashboard"); stopCamera(); }}>
            <div className={`w-8 h-8 rounded-full border ${theme === 'dark' ? 'border-[#E6C79C]/30 bg-[#1A1817]' : 'border-[#9c8468]/35 bg-[#FAF8F5]/90'} flex items-center justify-center text-[#9c8468] font-serif font-light text-xs tracking-widest relative overflow-hidden transition-all duration-500`}>
              <span className={`relative z-10 font-serif italic ${theme === 'dark' ? 'text-[#E6C79C]' : 'text-[#9c8468]'} font-medium`}>s</span>
            </div>
            <div>
              <h1 className={`text-sm font-serif font-light tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-neutral-950'} uppercase leading-none`}>
                Skinova
              </h1>
              <p className="text-[7px] uppercase tracking-[0.2em] text-[#9c8468] font-mono mt-0.5 font-semibold">botanical labs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-none border transition-all cursor-pointer ${theme === 'dark' ? 'border-neutral-800 text-[#E6C79C] hover:bg-neutral-900 bg-neutral-950/40' : 'border-neutral-200/60 text-neutral-600 hover:text-[#9c8468]'}`}
              title="Toggle theme mode"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <span className={`px-2 py-0.5 text-[7px] rounded-none font-mono uppercase tracking-widest font-semibold border ${user.isPro ? "bg-[#9c8468]/10 text-[#E6C79C] border-[#E6C79C]/20" : (theme === 'dark' ? "bg-neutral-900 text-neutral-400 border border-neutral-800" : "bg-neutral-50 text-neutral-400 border-neutral-200")}`}>
              {user.isPro ? "PRO" : "MBR"}
            </span>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`p-1.5 transition-all border rounded-none cursor-pointer ${theme === 'dark' ? 'text-neutral-300 border-neutral-800 hover:bg-neutral-900' : 'text-neutral-600 hover:text-neutral-900 border-neutral-200/60'}`}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Primary Container */}
      <main className="flex-grow w-full">
        <AnimatePresence mode="wait">
          
          {/* LANDING PAGE - Dynamic Shader Hero */}
          {!user && !showAuthModal && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen"
            >
              <WarpShaderHero 
                onGetStarted={() => setShowAuthModal(true)}
                onViewExamples={() => {
                  setShowAuthModal(true);
                }}
              />
            </motion.div>
          )}

          {/* AUTHENTICATION PORTAL (Slide 6/8 Integration) */}
          {showAuthModal && !user && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-[85vh] flex items-center justify-center p-4 py-16"
            >
              {/* Radial animated gradient as required */}
              <AnimatedGradientBackground 
                Breathing={true}
                gradientColors={["#ffffff", "#E6C79C", "#FFDFC6", "#F0FDF4", "#EFF6FF", "#FAF6F0", "#FCFAF7"]} 
                gradientStops={[20, 35, 50, 65, 80, 90, 100]}
              />
              
              <div className="relative z-10 w-full max-w-4xl">
                <LoginForm onSuccess={(authed) => {
                  setUser(authed);
                  setShowAuthModal(false);
                }} />
                
                <div className="text-center mt-6">
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="text-white/80 hover:text-white underline text-sm transition-colors cursor-pointer"
                  >
                    ← Back to Landing Home
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PRIVATE USER WORKSPACE (If authenticated) */}
          {user && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col md:flex-row min-h-screen w-full relative"
            >
              {/* Luxury Sidebar (Desktop: Sticky, Mobile: Drawer) */}
              <aside 
                id="workspace_aside_nav"
                className={`fixed md:sticky top-0 left-0 h-screen transition-all duration-500 ease-in-out z-50 md:translate-x-0 ${
                  isSidebarCollapsed 
                    ? "md:w-0 md:opacity-0 md:pointer-events-none md:border-none md:p-0 overflow-hidden" 
                    : "md:w-76 border-r md:opacity-100 md:p-6"
                } w-76 ${
                  theme === 'dark' 
                    ? 'bg-[#12100F] border-[#E6C79C]/15 text-[#ECE5DC] shadow-[4px_0_24px_rgba(0,0,0,0.3)]' 
                    : 'bg-[#FCFAF7] border-[#E6C79C]/25 text-neutral-800 shadow-[4px_0_24px_rgba(156,132,104,0.04)]'
                } flex flex-col justify-between py-8 px-6 ${
                  isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
                }`}
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-8">
                    {/* Brand Identifier */}
                    <div className="flex items-center justify-between pb-5 border-b border-[#E6C79C]/15">
                      <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => { setActiveTab("dashboard"); stopCamera(); setIsSidebarOpen(false); }}>
                        <div className={`w-9 h-9 rounded-full border transition-all duration-500 flex items-center justify-center shrink-0 ${
                          theme === 'dark' 
                            ? 'border-[#E6C79C]/35 bg-[#1C1918] text-[#E6C79C]' 
                            : 'border-[#9c8468]/30 bg-[#F0EAE1] text-[#9c8468]'
                        }`}>
                          <span className="font-serif italic font-semibold text-base">s</span>
                        </div>
                        
                        {!isSidebarCollapsed && (
                          <div className="hidden md:block transition-all duration-300">
                            <h1 className={`text-base font-serif font-light tracking-[0.25em] ${theme === 'dark' ? 'text-white' : 'text-neutral-900'} group-hover:text-[#9c8468] transition-colors leading-none uppercase`}>
                              Skinova
                            </h1>
                            <p className="text-[7px] uppercase tracking-[0.25em] text-[#9c8468]/90 font-mono mt-1 font-extrabold">botanical labs</p>
                          </div>
                        )}
                        
                        <div className="md:hidden">
                          <h1 className={`text-base font-serif font-light tracking-[0.25em] ${theme === 'dark' ? 'text-white' : 'text-neutral-950'} group-hover:text-[#9c8468] transition-colors leading-none uppercase`}>
                            Skinova
                          </h1>
                          <p className="text-[7px] uppercase tracking-[0.25em] text-[#9c8468]/90 font-mono mt-1 font-extrabold">botanical labs</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                          className={`hidden md:block p-2 border rounded-full transition-all cursor-pointer ${theme === 'dark' ? 'border-neutral-800 text-neutral-400 hover:text-white bg-[#1E1C1A]' : 'border-neutral-200/45 text-[#9c8468] hover:text-black bg-white'}`}
                          title={isSidebarCollapsed ? "Expand sidebar" : "Hide sidebar"}
                        >
                          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                        </button>
                        
                        <button 
                          onClick={() => setIsSidebarOpen(false)}
                          className={`md:hidden p-2 transition-all border rounded-full cursor-pointer ${theme === 'dark' ? 'text-neutral-450 border-neutral-850 hover:text-white' : 'text-[#9c8468] border-neutral-200/40 hover:bg-neutral-200/40'}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
 
                    {/* Re-designed Botanical Interactive Tabs */}
                    <nav className="flex flex-col gap-1.5 font-serif tracking-[0.08em] text-neutral-500">
                      <button 
                        onClick={() => { setActiveTab("dashboard"); stopCamera(); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 cursor-pointer transition-all duration-300 relative flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} text-xs rounded-lg ${activeTab === "dashboard" ? (theme === 'dark' ? "text-white bg-[#9c8468]/15 border-l-2 border-[#E6C79C]" : "text-[#735A40] font-semibold bg-[#9c8468]/8 border-l-2 border-[#9c8468]") : (theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-[#9c8468]/5")}`}
                        title="Diagnostics Hub"
                      >
                        <span className="text-[9px] font-mono opacity-50 font-sans w-4 text-center">I.</span>
                        {!isSidebarCollapsed && <span className="font-sans tracking-wide">Diagnostics Hub</span>}
                      </button>
                      
                      <button 
                        onClick={() => { setActiveTab("formulations"); stopCamera(); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 cursor-pointer transition-all duration-300 relative flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} text-xs rounded-lg ${activeTab === "formulations" ? (theme === 'dark' ? "text-white bg-[#9c8468]/15 border-l-2 border-[#E6C79C]" : "text-[#735A40] font-semibold bg-[#9c8468]/8 border-l-2 border-[#9c8468]") : (theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-[#9c8468]/5")}`}
                        title="Subscribed Formulas"
                      >
                        <span className="text-[9px] font-mono opacity-50 font-sans w-4 text-center">II.</span>
                        {!isSidebarCollapsed && <span className="font-sans tracking-wide">Subscribed Formulas</span>}
                      </button>
 
                      <button 
                        onClick={() => { setActiveTab("how-it-works"); stopCamera(); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 cursor-pointer transition-all duration-300 relative flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} text-xs rounded-lg ${activeTab === "how-it-works" ? (theme === 'dark' ? "text-white bg-[#9c8468]/15 border-l-2 border-[#E6C79C]" : "text-[#735A40] font-semibold bg-[#9c8468]/8 border-l-2 border-[#9c8468]") : (theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-[#9c8468]/5")}`}
                        title="Interactive Manual"
                      >
                        <span className="text-[9px] font-mono opacity-50 font-sans w-4 text-center">III.</span>
                        {!isSidebarCollapsed && <span className="font-sans tracking-wide">Interactive Manual</span>}
                      </button>
 
                      <button 
                        onClick={() => { setActiveTab("history"); stopCamera(); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 cursor-pointer transition-all duration-300 relative flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} text-xs rounded-lg ${activeTab === "history" ? (theme === 'dark' ? "text-white bg-[#9c8468]/15 border-l-2 border-[#E6C79C]" : "text-[#735A40] font-semibold bg-[#9c8468]/8 border-l-2 border-[#9c8468]") : (theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-[#9c8468]/5")}`}
                        title="My Progress"
                      >
                        <span className="text-[9px] font-mono opacity-50 font-sans w-4 text-center">IV.</span>
                        {!isSidebarCollapsed && <span className="font-sans tracking-wide">My Progress</span>}
                      </button>
 
                      {user && user.email === "joonbeee@skinova.admin.com" && (
                        <button 
                          onClick={() => { setActiveTab("admin"); stopCamera(); setIsSidebarOpen(false); }}
                          className={`w-full text-left px-4 py-3 cursor-pointer transition-all duration-300 relative flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} text-xs rounded-lg ${activeTab === "admin" ? (theme === 'dark' ? "text-rose-400 bg-[#9c8468]/15 border-l-2 border-[#E6C79C]" : "text-[#735A40] font-semibold bg-[#9c8468]/8 border-l-2 border-[#9c8468]") : (theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-[#9c8468]/5")}`}
                          title="Admin Panel"
                        >
                          <span className="text-[9px] font-mono opacity-50 font-sans w-4 text-center">V.</span>
                          {!isSidebarCollapsed && <span className="font-sans tracking-wide font-semibold text-rose-550 dark:text-[#E6C79C]">Admin Panel</span>}
                        </button>
                      )}
                    </nav>
                  </div>
 
                  <div className="pt-6 border-t border-[#E6C79C]/15 space-y-4">
                    <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
                      <div className={`w-9.5 h-9.5 rounded-full ${theme === 'dark' ? 'bg-[#9c8468]/20 border-[#E6C79C]/30 text-[#E6C79C]' : 'bg-[#E6C79C]/10 border-[#E6C79C]/20 text-[#9c8468]'} border flex items-center justify-center font-serif font-light italic shrink-0 shadow-xs`}>
                        {user.name ? user.name[0].toLowerCase() : "s"}
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-serif font-semibold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'} leading-none truncate`}>{user.name}</p>
                          <p className={`text-[8.5px] ${theme === 'dark' ? 'text-neutral-450' : 'text-neutral-500'} font-mono tracking-wider truncate uppercase font-bold mt-1.5`}>{user.email}</p>
                        </div>
                      )}
                    </div>
 
                    <div className={`flex items-center ${isSidebarCollapsed ? "flex-col gap-2 justify-center" : "justify-between gap-1.5"}`}>
                      {(!isSidebarCollapsed || !user.isPro) && (
                        <span className={`px-2.5 py-1 text-[8px] rounded-full font-mono uppercase tracking-widest font-extrabold border ${user.isPro ? "bg-[#9c8468]/15 text-[#E6C79C] border-[#E6C79C]/40" : (theme === 'dark' ? "bg-neutral-900 text-neutral-400 border border-neutral-800" : "bg-neutral-50 text-neutral-400 border-neutral-200")}`}>
                          {user.isPro ? "PRO" : "MEMBER"}
                        </span>
                      )}
                      
                      <button 
                        onClick={handleLogout}
                        title="Logout Logout"
                        className={`p-1.5 px-3 transition-all border rounded-full cursor-pointer flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-900' : 'text-[#9c8468] border-[#9c8468]/20 hover:text-white hover:bg-[#9c8468]'}`}
                      >
                        <LogOut className="w-3 h-3" />
                        {!isSidebarCollapsed && <span className="font-sans font-semibold text-[9px]">Exit</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
 
              {/* Mobile overlay backdrop when open */}
              {isSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/25 backdrop-blur-xs z-40 md:hidden animate-fade-in"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
 
              {/* Right Scrollable Panel */}
              <div className="flex-grow flex flex-col min-w-0">
                {/* Modern persistent header for content area relative to theme */}
                <div className={`hidden md:flex items-center justify-between px-8 py-4 border-b transition-all duration-300 ${theme === 'dark' ? 'bg-[#151413]/40 border-[#E6C79C]/10 text-white' : 'bg-white/40 border-neutral-200/60 text-neutral-800'} backdrop-blur-md sticky top-0 z-30`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className={`p-1.5 border rounded-none transition-all cursor-pointer ${theme === 'dark' ? 'border-neutral-800 text-[#E6C79C] hover:bg-neutral-900 bg-[#1E1C1A]' : 'border-neutral-200 text-neutral-600 hover:text-[#9c8468] bg-white'}`}
                      title={isSidebarCollapsed ? "Expand Menu Grid" : "Collapse Menu Grid"}
                    >
                      <Menu className="w-3.5 h-3.5" />
                    </button>
                    <div className={`flex items-center gap-2 px-3 py-1 ml-2.5 border rounded-full ${
                      theme === 'dark' 
                        ? 'border-[#E6C79C]/15 bg-[#1F1D1C]/60 text-white' 
                        : 'border-[#9c8468]/15 bg-[#FAF9F6]/80 text-[#735A40]'
                    } transition-all duration-300 backdrop-blur-xs`}>
                      <span className={`text-[9px] font-serif tracking-[0.2em] uppercase font-medium transition-colors ${
                        theme === 'dark' ? 'text-[#ECE5DC]' : 'text-neutral-800'
                      }`}>
                        Skinova Clinical Diagnostics
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleTheme}
                      className={`p-2 rounded-full border transition-all cursor-pointer ${theme === 'dark' ? 'border-neutral-800 text-[#E6C79C] hover:bg-neutral-900 bg-[#1E1C1A]' : 'border-neutral-200/40 text-[#9c8468] hover:bg-[#F3EFE9] bg-white'}`}
                      title="Adjust environmental brightness"
                    >
                      {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </button>
                    
                    <span className={`px-2 py-0.5 text-[8px] rounded-none font-mono uppercase tracking-widest font-semibold border ${user.isPro ? "bg-[#9c8468]/15 text-[#E6C79C] border-[#E6C79C]/40" : (theme === 'dark' ? "bg-neutral-900 text-neutral-400 border border-neutral-800" : "bg-neutral-50 text-neutral-400 border-neutral-200")}`}>
                      {user.isPro ? "PRO MEMBERSHIP" : "STANDARD MEMBER"}
                    </span>
                  </div>
                </div>

                <div className="flex-grow p-4 md:p-8">
                  <AnimatePresence mode="wait">
                    {/* TAB 1: CORE DIAGNOSTICS & ACTIVE SCANNER */}
                    {activeTab === "dashboard" && (
                      <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8 max-w-5xl mx-auto w-full"
                      >
                  {/* Dashboard Hero greeting */}
                  <div className={`${theme === 'dark' ? 'bg-[#1C1A18] border-[#E6C79C]/20 text-[#ECE5DC]' : 'bg-[#FAF9F6] border-[#E6C79C]/25 text-[#9c8468]'} border p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-sm`}>
                    <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-[#E6C79C]/10 to-transparent rounded-full pointer-events-none" />
                    <div className="relative z-10 max-w-2xl space-y-3.5">
                      <span className="text-[10px] font-mono tracking-[0.25em] text-[#9c8468] uppercase font-semibold">Diagnostic Consultation Sanctum</span>
                      <h2 className={`text-3xl md:text-5xl font-serif font-light ${theme === 'dark' ? 'text-white' : 'text-neutral-950'} leading-tight`}>
                        Welcome to Skinova, <br/>
                        <span className="italic text-[#9c8468] font-light">{user.name || "Skinova Client"}</span>
                      </h2>
                      <p className={`${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'} font-sans text-xs sm:text-sm leading-relaxed max-w-xl`}>
                        Gain direct perspective on your skin condition. Use our precise computer-assisted analysis to identify dermal parameters and calibrate physical botanical serum mixtures.
                      </p>
                    </div>
                  </div>

                  {/* Operational body */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Video view / Upload input / Template Picker */}
                    <div className={`lg:col-span-5 ${theme === 'dark' ? 'bg-[#151413] border-[#E6C79C]/15 text-[#ECE5DC]' : 'bg-white border-neutral-200/40 text-neutral-800'} rounded-3xl border p-6 space-y-6 shadow-sm`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-serif italic font-medium ${theme === 'dark' ? 'text-white' : 'text-neutral-900'} text-lg flex items-center gap-2`}>
                          <Camera className="w-4 h-4 text-[#9c8468]" />
                          1. Acquire Portrait Scan
                        </h3>
                        {cameraActive && (
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                        )}
                      </div>

                      {/* Display Viewport */}
                      <div className={`relative w-full aspect-square md:aspect-[4/3] rounded-xl bg-neutral-950 overflow-hidden flex flex-col items-center justify-center border ${theme === 'dark' ? 'border-[#E6C79C]/25 shadow-inner' : 'border-neutral-200'}`}>
                        <canvas ref={canvasRef} className="hidden" />
                        {cameraActive ? (
                          <video 
                            ref={videoRef} 
                            className="absolute inset-0 w-full h-full object-cover" 
                            playsInline
                          />
                        ) : uploadImg ? (
                          <img 
                            src={uploadImg} 
                            className="absolute inset-0 w-full h-full object-cover" 
                            alt="Captured Selfie Target" 
                          />
                        ) : (
                          <div className="text-center p-6 space-y-3">
                            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mx-auto text-neutral-450">
                              <Camera className="w-6 h-6" />
                            </div>
                            <p className="text-neutral-400 text-xs text-balance">
                              No image chosen. Use live capture or select a test target template below.
                            </p>
                          </div>
                        )}

                        {/* Analysis overlay scanning bars */}
                        {scanning && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400 animate-[bounce_2s_infinite] shadow-[0_0_15px_#f97316] z-10" />
                        )}
                      </div>

                      {/* Diagnostic Controllers */}
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          {cameraActive ? (
                            <button 
                              onClick={captureSelfieMsg}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold cursor-pointer transition-all shadow-md"
                            >
                              Capture Photo
                            </button>
                          ) : (
                            <button 
                              onClick={startCamera}
                              className={`px-4 py-2 border rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${theme === 'dark' ? 'border-neutral-800 bg-[#1E1C1A] text-neutral-300 hover:bg-neutral-900' : 'border-neutral-300 hover:bg-neutral-50 bg-white'}`}
                            >
                              <Camera className="w-3.5 h-3.5" /> Use Live Web-Cam
                            </button>
                          )}

                          <label className={`px-4 py-2 border rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${theme === 'dark' ? 'border-neutral-800 bg-[#1E1C1A] text-neutral-300 hover:bg-neutral-900' : 'border-neutral-300 hover:bg-neutral-50 bg-white'}`}>
                            <Upload className="w-3.5 h-3.5" /> Upload File
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileDropChange} 
                              className="hidden" 
                            />
                          </label>
                        </div>

                        {uploadImg && (
                          <button 
                            onClick={executeAISkinAnalysis}
                            disabled={scanning}
                            className={`w-full mt-2 py-3 disabled:opacity-40 text-white rounded-full text-xs font-semibold tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${theme === 'dark' ? 'bg-[#9c8468] hover:bg-[#866f54]' : 'bg-neutral-950 hover:bg-neutral-900'}`}
                          >
                            {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#E6C79C]" />}
                            <span>{scanning ? "Processing AI Scanner..." : "Analyze Skin Indicators"}</span>
                          </button>
                        )}
                      </div>

                      {/* Error feedback */}
                      {errorMsg && (
                        <p className={`text-xs p-3 rounded-lg border font-medium ${theme === 'dark' ? 'text-rose-400 bg-rose-950/20 border-rose-900/30' : 'text-rose-500 bg-rose-50 border-rose-100'}`}>
                          {errorMsg}
                        </p>
                      )}

                      {/* Facial sandbox templates */}
                      <div className={`pt-4 border-t ${theme === 'dark' ? 'border-neutral-850' : 'border-neutral-100'}`}>
                        <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'} mb-3 uppercase tracking-wider font-mono`}>Facial Templates (Sandbox Testing)</p>
                        <div className="grid grid-cols-3 gap-2">
                          {SAMPLE_MOCK_FACES.map((fc) => (
                            <button 
                              key={fc.id}
                              onClick={() => {
                                setUploadImg(fc.img);
                                setErrorMsg("");
                                stopCamera();
                              }}
                              className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                                theme === 'dark' 
                                  ? (uploadImg === fc.img ? "bg-[#9c8468]/20 border-[#E6C79C]/50 ring-2 ring-[#9c8468]/30" : "bg-[#1E1C1A] border-neutral-850 hover:bg-neutral-900")
                                  : (uploadImg === fc.img ? "bg-amber-50/50 border-amber-300 ring-2 ring-amber-100" : "bg-white border-neutral-200 hover:bg-neutral-50")
                              }`}
                            >
                              <img src={fc.img} className="w-full h-12 object-cover rounded" alt={fc.label} />
                              <p className={`text-[10px] font-semibold mt-1 truncate ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-850'}`}>{fc.label}</p>
                              <p className="text-[8px] text-neutral-400 line-clamp-1">{fc.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Dynamic Analysis Reports or Empty prompt */}
                    <div className="lg:col-span-7">
                      <AnimatePresence mode="wait">
                        
                        {/* 1. Loader State */}
                        {scanning && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`${theme === 'dark' ? 'bg-[#1C1A18] border-neutral-800' : 'bg-white border-neutral-100'} rounded-2xl border p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center space-y-6`}
                          >
                            <div className={`w-16 h-16 rounded-full border-4 ${theme === 'dark' ? 'border-[#E6C79C]/10 border-t-[#E6C79C]' : 'border-neutral-200 border-t-[#9c8468]'} animate-spin`} />
                            <div className="space-y-2">
                              <p className={`text-sm font-semibold tracking-wider font-mono ${theme === 'dark' ? 'text-[#E6C79C]' : 'text-neutral-500'}`}>{scanningProgress}% COMPLETE</p>
                              <p className={`${theme === 'dark' ? 'text-white' : 'text-neutral-800'} font-medium text-lg animate-pulse`}>{scanningStatus}</p>
                              <p className="text-xs text-neutral-400">Please remain still while machine diagnostics are mapped.</p>
                            </div>
                          </motion.div>
                        )}

                        {/* 2. Ready Results State */}
                        {!scanning && currentScan && (
                          <motion.div 
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            {/* Summary Core Header Card */}
                            <div className={`${theme === 'dark' ? 'bg-[#151413] border-neutral-850' : 'bg-white border-neutral-100'} rounded-3xl border p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden`}>
                              {/* Background organic glow accent */}
                              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#9c8468]/5 to-transparent rounded-full pointer-events-none" />
                              
                              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b ${theme === 'dark' ? 'border-neutral-850' : 'border-[#E6C79C]/20'}`}>
                                <div className="space-y-1.5">
                                  <span className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full font-bold border ${
                                    theme === 'dark' 
                                      ? 'bg-neutral-900/60 border-neutral-800 text-[#E6C79C]' 
                                      : 'bg-[#9c8468]/5 border-[#9c8468]/10 text-[#735A40]'
                                  }`}>
                                    Report: {new Date(currentScan.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                                  <h3 className={`text-3xl font-serif font-light tracking-tight ${theme === 'dark' ? 'text-white' : 'text-neutral-900'} mt-2`}>Dermatological Report</h3>
                                </div>
                                <div className="flex flex-row items-center gap-6">
                                  <div className="text-left py-1 px-3 border-l-2 border-[#9c8468]/40">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">Skin Age</p>
                                    <p className="text-3xl font-serif font-light text-amber-500">{currentScan.skinAge} <span className="text-xs font-sans text-neutral-400 uppercase tracking-widest font-normal">Years</span></p>
                                  </div>
                                  <button 
                                    onClick={shareCurrentScanReport}
                                    className="px-5 py-3 bg-[#9c8468] hover:bg-neutral-850 active:scale-[0.98] text-white rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md select-none text-xs font-semibold shrink-0"
                                    title="Export report and copy to clipboard"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>{shareSuccess ? "Copied!" : "Share Report"}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Key Dermal Metrics Bento-style */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className={`${theme === 'dark' ? 'bg-[#1C1A18] border-neutral-850' : 'bg-[#FAF8F5]/80 border-orange-100/40'} p-5 rounded-2xl border transition-all hover:shadow-xs`}>
                                  <span className="text-[9px] font-mono tracking-widest uppercase block text-neutral-400 mb-1">Diagnosis Tier</span>
                                  <p className={`font-serif text-base italic ${theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'}`}>{currentScan.skinType}</p>
                                </div>
                                <div className={`${theme === 'dark' ? 'bg-[#1C1A18] border-neutral-850' : 'bg-[#FAF8F5]/80 border-orange-100/40'} p-5 rounded-2xl border transition-all hover:shadow-xs`}>
                                  <span className="text-[9px] font-mono tracking-widest uppercase block text-neutral-400 mb-1">Barrier Integrity</span>
                                  <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'} mt-1 flex items-center gap-1`}>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                    <span>Stable Vitality</span>
                                  </p>
                                </div>
                                <div className={`p-4 col-span-1 rounded-2xl border transition-all hover:shadow-xs ${
                                  theme === 'dark' 
                                    ? 'bg-emerald-950/10 border-emerald-900/30' 
                                    : 'bg-emerald-50/30 border-emerald-100/60'
                                }`}>
                                  <span className={`text-[9px] font-mono tracking-widest uppercase block mb-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>Primary Agent Active</span>
                                  <p className={`font-semibold text-sm mt-1 truncate ${theme === 'dark' ? 'text-[#E6C79C]' : 'text-neutral-900'}`}>{currentScan.ingredients[0] || "Niacinamide"}</p>
                                </div>
                              </div>

                              {/* Executive Diagnosis Synopsis */}
                              <div className="space-y-2.5">
                                <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold flex items-center gap-1.5 tracking-wider">
                                  <Info className="w-3.5 h-3.5 text-[#9c8468]" /> CLINICAL DIAGNOSTICS SYNOPSIS
                                </span>
                                <div className={`text-xs sm:text-sm leading-relaxed px-5 py-4 rounded-2xl border relative ${
                                  theme === 'dark' 
                                    ? 'bg-[#1C1A18] border-neutral-850 text-neutral-300' 
                                    : 'bg-neutral-50 border-neutral-100 text-[#735A40]'
                                }`}>
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#9c8468] rounded-l-2xl" />
                                  <p className="font-sans leading-relaxed">{currentScan.summary}</p>
                                </div>
                              </div>
                            </div>
                            <div className={`${theme === 'dark' ? 'bg-[#151413] border-neutral-850' : 'bg-white border-neutral-100'} rounded-3xl border p-6 md:p-8 shadow-sm space-y-6`}>
                              <div className="flex items-center justify-between">
                                <h4 className={`font-semibold font-sans text-sm tracking-widest uppercase font-mono ${theme === 'dark' ? 'text-[#E6C79C]' : 'text-neutral-800'}`}>
                                  Measured Indicators Breakdown
                                </h4>
                                <span className="text-[10px] font-mono text-neutral-400">7 key diagnostics analyzed</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getRenderableScores(currentScan.scores).map((sc, i) => {
                                  // Determine therapeutic status beautifully
                                  const statusText = sc.value >= 82 ? "Excellent" : sc.value >= 60 ? "Balanced" : "Needs Care";
                                  const statusColor = sc.value >= 82 
                                    ? (theme === 'dark' ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" : "text-emerald-700 bg-emerald-50 border-emerald-100")
                                    : sc.value >= 60 
                                      ? (theme === 'dark' ? "text-amber-400 bg-amber-950/20 border-amber-900/30" : "text-amber-700 bg-amber-50 border-amber-100")
                                      : (theme === 'dark' ? "text-rose-400 bg-rose-950/20 border-rose-900/30" : "text-rose-700 bg-rose-50 border-rose-100");

                                  return (
                                    <div 
                                      key={i} 
                                      className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 hover:shadow-xs flex flex-col justify-between ${
                                        theme === 'dark' 
                                          ? 'bg-neutral-900/40 border-neutral-850 hover:bg-neutral-900/70' 
                                          : 'bg-[#FAF8F5]/80 border-neutral-200/40 hover:bg-white hover:border-[#E6C79C]/30'
                                      }`}
                                    >
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                          <div>
                                            <p className={`text-xs font-bold ${theme === 'dark' ? 'text-neutral-100' : 'text-neutral-850'}`}>{sc.name}</p>
                                            <p className="text-[10px] text-neutral-450 mt-0.5 leading-tight">{sc.desc}</p>
                                          </div>
                                          <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${theme === 'dark' ? 'bg-neutral-950 text-[#E6C79C]' : 'bg-[#FAF8F5] text-[#9c8468] border border-neutral-200/50'}`}>
                                              {sc.value}%
                                            </span>
                                            <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${statusColor}`}>
                                              {statusText}
                                            </span>
                                          </div>
                                        </div>
                                        <div className={`w-full h-2 rounded-full overflow-hidden relative ${theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-150'}`}>
                                          <div 
                                            className={`h-full bg-gradient-to-r ${sc.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${sc.value}%` }}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Advanced Pro-only Depth Detail (Slide 6/8 Premium Reports) */}
                                      <div className="mt-4 pt-3 border-t border-neutral-200/10">
                                        {user.isPro ? (
                                          <p className={`text-[10px] font-mono italic ${theme === 'dark' ? 'text-[#E6C79C]/70' : 'text-[#9c8468]'}`}>
                                            ✦ Depth index {(sc.value * 0.12).toFixed(2)}nm | Spectral deviation status stabilized
                                          </p>
                                        ) : (
                                          <button 
                                            onClick={upgradeToProPlan}
                                            className="text-[9px] text-neutral-400 hover:text-amber-600 flex items-center gap-1 transition-colors group cursor-pointer text-left"
                                          >
                                            <span>🔒 Deeper spectral mapping and cellular analysis available in Pro</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                                                     {/* Morning and Night routines checklist (Slide 4 slide 7) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              
                              {/* Morning Routine */}
                              <div className={`${theme === 'dark' ? 'bg-[#1C1A18] border-neutral-850' : 'bg-[#FAF9F6]/90 border-[#9c8468]/10'} border rounded-3xl p-6 space-y-5 shadow-sm relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full" />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1 px-3 bg-amber-550/10 text-amber-600 border border-amber-500/10 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                                      AM Routine
                                    </span>
                                    <h4 className={`font-serif text-base italic ${theme === 'dark' ? 'text-white' : 'text-neutral-850'}`}>Barrier Protection</h4>
                                  </div>
                                  <span className="text-[10px] font-mono text-neutral-400">Day Shield</span>
                                </div>

                                <div className="space-y-4">
                                  {currentScan.morningRoutine && currentScan.morningRoutine.map((step, idx) => (
                                    <div key={idx} className={`flex gap-4 items-start p-3.5 rounded-2xl border transition-all ${
                                      theme === 'dark' ? 'bg-neutral-900/20 border-neutral-850/60' : 'bg-white border-neutral-100 hover:border-[#9c8468]/15'
                                    }`}>
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${
                                        theme === 'dark' 
                                          ? 'bg-neutral-800 text-[#E6C79C]' 
                                          : 'bg-[#9c8468]/5 text-[#735A40] border border-[#9c8468]/10'
                                      }`}>
                                        0{idx + 1}
                                      </div>
                                      <div className="space-y-1">
                                        <p className={`text-xs font-bold leading-tight ${theme === 'dark' ? 'text-neutral-200' : 'text-neutral-850'}`} id={`am-step-${idx}`}>{step.step}</p>
                                        <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>{step.desc}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Night Routine */}
                              <div className={`${theme === 'dark' ? 'bg-[#121110] border-neutral-850' : 'bg-neutral-950 text-white'} border rounded-3xl p-6 space-y-5 shadow-sm relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full" />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1 px-3 bg-indigo-900/30 text-[#FFE1CB] border border-indigo-800/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                                      PM Routine
                                    </span>
                                    <h4 className="font-serif text-base italic text-white/95">Cellular Restoration</h4>
                                  </div>
                                  <span className="text-[10px] font-mono text-neutral-400">Night Repair</span>
                                </div>

                                <div className="space-y-4">
                                  {currentScan.nightRoutine && currentScan.nightRoutine.map((step, idx) => (
                                    <div key={idx} className={`flex gap-4 items-start p-3.5 rounded-2xl border transition-all ${
                                      theme === 'dark' ? 'bg-neutral-950/40 border-neutral-900/40' : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}>
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${
                                        theme === 'dark' 
                                          ? 'bg-neutral-900 text-[#E6C79C]' 
                                          : 'bg-white/10 text-[#E6C79C]'
                                      }`}>
                                        0{idx + 1}
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs font-bold leading-tight text-white/95" id={`pm-step-${idx}`}>{step.step}</p>
                                        <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-neutral-350' : 'text-white/70'}`}>{step.desc}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>

                            {/* Active Custom Serum Formulations Box (Slide 7 Product Customization) */}
                            <div className={`${theme === 'dark' ? 'bg-[#151413] border-[#E6C79C]/30 text-[#ECE5DC]' : 'bg-white border-[#E6C79C]/40'} border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden`}>
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#9c8468]/5 to-transparent rounded-full pointer-events-none" />
                              <div className="space-y-3">
                                <span className="text-[10px] uppercase tracking-widest font-mono text-[#9c8468] font-bold block">PERSONALIZED COMPOUND ACTIVE SEED</span>
                                <h4 className={`text-2xl font-serif font-light tracking-tight ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                                  Skinova Bespoke Formula <span className="italic font-light text-amber-600">S-{currentScan.scores.acne > 80 ? "08" : "04"}</span>
                                </h4>
                                <p className={`${theme === 'dark' ? 'text-neutral-450' : 'text-neutral-550'} text-xs max-w-xl leading-relaxed`}>
                                  A dynamically calibrated moisturizer booster synthesized specifically for your calculated dermal metrics. Enriched with 4% {currentScan.ingredients[0] || "Niacinamide"} and botanical micro-hyaluronic barrier shields.
                                </p>
                              </div>
                              <button 
                                onClick={() => setActiveTab("formulations")}
                                className="w-full md:w-auto px-6 py-3 bg-[#9c8468] hover:bg-neutral-850 text-white text-xs font-semibold rounded-full uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer text-center"
                              >
                                View Subscription Pack
                              </button>
                            </div>

                          </motion.div>
                        )}

                        {/* 3. Initial Empty State */}
                        {!scanning && !currentScan && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`${theme === 'dark' ? 'bg-[#151413]/50 border-neutral-850' : 'bg-[#FAF8F5]/50 border-[#E6C79C]/25'} rounded-2xl border border-dashed p-12 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4`}
                          >
                            <Sparkles className="w-10 h-10 text-[#E6C79C] animate-pulse" />
                            <div className="space-y-1">
                              <h3 className={`font-serif font-medium text-lg ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>No Active Diagnosis Logs Exist</h3>
                              <p className="text-neutral-500 text-xs max-w-sm text-balance">
                                Take or select a template portrait face in the scanning panel on the left to activate your detailed analysis profile report.
                              </p>
                            </div>
                          </motion.div>
                        )}

                      </AnimatePresence>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 2: SKIN CARE KITS & SUBSCRIPTION BOXES */}
              {activeTab === "formulations" && (
                <motion.div
                  key="formulations"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 max-w-5xl mx-auto w-full"
                >
                  <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs uppercase font-mono text-[#9c8468] tracking-widest font-black">Prebuilt & Tailored Subscriptions</span>
                    <h2 className={`text-3xl md:text-4xl font-serif font-medium tracking-tight ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                      Customized Skincare Solutions Box
                    </h2>
                    <p className={`${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'} text-sm`}>
                      We manufacture personalized serums, cleansers, and SPF barriers delivered straight to you monthly or quarterly. Stable recurring formulations, based entirely on AI recommendations.
                    </p>
                  </div>

                  {/* Pricing Matrix Match (Slide 8 pricing plans & models) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    {/* Basic freemium app summary */}
                    <div className={`${theme === 'dark' ? 'bg-[#151413] border-neutral-850' : 'bg-white border-neutral-100'} border rounded-3xl p-8 flex flex-col justify-between shadow-sm relative`}>
                      <div className="space-y-6">
                        <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider ${theme === 'dark' ? 'bg-neutral-900 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}`}>Plan Basic (Freemium)</span>
                        <div>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>₹149 - ₹299</p>
                          <p className="text-xs text-neutral-400">per month subscription</p>
                        </div>
                        <p className={`${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'} text-xs leading-relaxed`}>
                          Unlocks detailed weekly scanning reports, core ingredient guidance, and basic local daily skincare reminder templates.
                        </p>
                        <ul className={`space-y-2 text-xs border-t pt-4 ${theme === 'dark' ? 'border-neutral-850 text-neutral-300' : 'border-neutral-100 text-neutral-600'}`}>
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Basic AI Skin Scans</li>
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Daily routine checklist</li>
                          <li className="flex items-center gap-2 text-neutral-400"><Info className="w-3.5 h-3.5" /> No physical products included</li>
                        </ul>
                      </div>
                      
                      <button 
                        onClick={() => handlePrebuiltSubscription("Skinova Digital Core", "₹149")}
                        className={`w-full mt-8 py-3 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer ${theme === 'dark' ? 'bg-neutral-900 hover:bg-neutral-800 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'}`}
                      >
                        Activate App Pro
                      </button>
                    </div>

                    {/* Skincare Subscription Kit - Standard (Slide 8 плана ₹999) */}
                    <div className={`${theme === 'dark' ? 'bg-[#1C1A18] border-[#9c8468] ring-[#9c8468]/5' : 'bg-white border-[#E6C79C] ring-orange-50/50'} border-2 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative ring-4`}>
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-[#9c8468] to-neutral-900 text-white rounded-full font-mono text-[9px] font-black uppercase tracking-widest px-4 py-1 shadow-md">Best Value</span>
                      
                      <div className="space-y-6">
                        <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider ${theme === 'dark' ? 'bg-amber-950/40 text-[#E6C79C]' : 'bg-amber-50 text-[#9c8468]'}`}>Skincare Subscription Box (Essential)</span>
                        <div>
                          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>₹999</p>
                          <p className="text-xs text-neutral-400">per month (INR)</p>
                        </div>
                        <p className={`${theme === 'dark' ? 'text-neutral-350' : 'text-neutral-500'} text-xs leading-relaxed`}>
                          A physical tailored box sent to your doorstep monthly. Packed with clinical ingredients configured by your latest facial scan scores.
                        </p>
                        <ul className={`space-y-2 text-xs border-t pt-4 ${theme === 'dark' ? 'border-neutral-800 text-neutral-300' : 'border-neutral-100 text-neutral-600'}`}>
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Cleanser + Serum + Moisturizer + Sunscreen</li>
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Custom formulated compound concentrations</li>
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Free Shipping across major zones</li>
                        </ul>
                      </div>
                      
                      <button 
                        onClick={() => handlePrebuiltSubscription("Skincare Kit Essential", "₹999")}
                        className="w-full mt-8 py-3 px-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition-all cursor-pointer shadow-lg"
                      >
                        Subscribe Now (₹999/mo)
                      </button>
                    </div>

                    {/* Skincare Subscription Kit - Premium (Slide 8 plan ₹1999) */}
                    <div className="bg-neutral-950 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                      
                      <div className="space-y-6">
                        <span className="px-3 py-1 bg-white/10 text-[#E6C79C] rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider">Clinical Subscription Box (Pro Treatment)</span>
                        <div>
                          <p className="text-3xl font-bold text-[#E6C79C]">₹1,999</p>
                          <p className="text-xs text-neutral-400">per month (INR)</p>
                        </div>
                        <p className="text-neutral-300 text-xs leading-relaxed">
                          Clinically-grade concentrations designed to reverse aggressive aging or irritation patterns. Features high-dose active boosters.
                        </p>
                        <ul className="space-y-2 text-xs text-neutral-300 border-t border-white/10 pt-4">
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E6C79C]" /> Cleanser + Premium Custom Serum + Barrier SPF + Active Booster</li>
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E6C79C]" /> Advanced dermal diagnostic mapping</li>
                          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E6C79C]" /> Priority clinical chat support</li>
                        </ul>
                      </div>
                      
                      <button 
                        onClick={() => handlePrebuiltSubscription("Clinical Kit Pro", "₹1999")}
                        className="w-full mt-8 py-3 px-4 bg-[#E6C79C] hover:bg-white text-neutral-950 text-xs font-bold rounded-full transition-all cursor-pointer"
                      >
                        Order Treatment (₹1999/mo)
                      </button>
                    </div>

                  </div>

                  {/* Subscription Result feedback modal/alert simulator */}
                  {subscriptionBoxStatus && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-3xl p-6 border max-w-2xl mx-auto space-y-4 ${theme === 'dark' ? 'bg-[#1C1A18] border-neutral-800' : 'bg-orange-50/50 border-orange-200'}`}
                    >
                      <div className={`flex gap-3 items-start ${theme === 'dark' ? 'text-[#E6C79C]' : 'text-orange-900'}`}>
                        <ShoppingBag className="w-6 h-6 shrink-0 mt-1 text-[#9c8468]" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm">Receipt Registered Successfully</h4>
                          <p className={`text-xs whitespace-pre-line leading-relaxed ${theme === 'dark' ? 'text-[#ECE5DC]/80' : 'text-neutral-600'}`}>{subscriptionBoxStatus}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSubscriptionBoxStatus(null)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${theme === 'dark' ? 'bg-[#E6C79C] text-neutral-950 hover:bg-white' : 'bg-neutral-900 hover:bg-neutral-850 text-white'}`}
                      >
                        Acknowledge
                      </button>
                    </motion.div>
                  )}

                  {/* Affiliate partner recommendation section (Slide 7 & 8 Affiliate Marketing plans) */}
                  <div className={`rounded-3xl border p-8 shadow-sm max-w-5xl mx-auto space-y-8 ${theme === 'dark' ? 'bg-[#151413] border-neutral-850' : 'bg-white border-neutral-100'}`}>
                    <div className="space-y-1">
                      <h4 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>Partnered Brand Recommendations</h4>
                      <p className={`${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'} text-xs`}>
                        If you prefer standard prebuilt brands, buy certified direct recommendations from our affiliated retail stores (Nykaa, Amazon, Dermaco) and secure exclusive commission clearances!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: "The Dermaco Salicylic wash", rate: "12% Off", site: "Dermaco Outlet", link: "#" },
                        { name: "Nykaa Hydration Essence", rate: "15% Off", site: "Nykaa Partner", link: "#" },
                        { name: "L'Oreal Revitalift Hyaluronic Boost", rate: "10% Off", site: "Amazon Retail", link: "#" },
                        { name: "Neutrogena Sebum Clear Face Pack", rate: "18% Off", site: "Nykaa Partner", link: "#" }
                      ].map((partner, i) => (
                        <div key={i} className={`rounded-2xl p-4 border flex flex-col justify-between ${theme === 'dark' ? 'bg-[#1C1A18] border-neutral-800' : 'bg-[#FAF8F5] border-orange-100/30'}`}>
                          <div className="space-y-1">
                            <p className="text-[10px] text-[#9c8468] uppercase font-mono tracking-wider font-bold">{partner.site}</p>
                            <h5 className={`font-semibold text-xs line-clamp-2 ${theme === 'dark' ? 'text-[#ECE5DC]' : 'text-neutral-800'}`}>{partner.name}</h5>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-[11px]">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold font-mono">{partner.rate} Code</span>
                            <a href={partner.link} className={`${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'} underline`}>Buy Partner →</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: DIAGNOSTIC GRAPHS & HISTORICAL TRENDS (Slide 5) */}
              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 max-w-5xl mx-auto w-full"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-xs uppercase font-mono tracking-widest text-[#9c8468] font-bold">Progress Tracking over time</span>
                      <h2 className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>Facial Restoration Metrics Table</h2>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs text-neutral-400">Total Scans Performed</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'}`}>{scans.length} Entries</p>
                    </div>
                  </div>

                  {scans.length >= 2 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Interactive Recharts line graph */}
                      <div className={`lg:col-span-8 rounded-2xl border p-6 shadow-sm space-y-4 ${theme === 'dark' ? 'bg-[#151413] border-neutral-850' : 'bg-white border-neutral-100'}`}>
                        <div className={`flex items-center justify-between pb-4 border-b ${theme === 'dark' ? 'border-neutral-850' : 'border-neutral-100'}`}>
                          <h4 className={`font-bold text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}>
                            <TrendingUp className="w-4 h-4 text-[#9c8468]" /> Smoothness & Barrier Healing Slope
                          </h4>
                          <span className={`text-[10px] tracking-wide font-mono ${theme === 'dark' ? 'text-neutral-450' : 'text-neutral-400'}`}>HIGHER SCORE = HEALTHIER</span>
                        </div>
                        
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#242321' : '#f5f5f5'} />
                              <XAxis dataKey="name" stroke={theme === 'dark' ? '#888580' : '#a3a3a3'} fontSize={11} tickLine={false} />
                              <YAxis stroke={theme === 'dark' ? '#888580' : '#a3a3a3'} fontSize={11} domain={[0, 100]} tickLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1C1A18' : '#fff', borderColor: theme === 'dark' ? '#2C2B29' : '#e5e5e5', color: theme === 'dark' ? '#ECE5DC' : '#000' }} />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                              <Line type="monotone" dataKey="Acne" stroke="#f43f5e" activeDot={{ r: 8 }} strokeWidth={2} />
                              <Line type="monotone" dataKey="Hydration" stroke="#3b82f6" strokeWidth={2} />
                              <Line type="monotone" dataKey="Smoothness" stroke="#10b981" strokeWidth={2} />
                              <Line type="monotone" dataKey="Pigmentation" stroke="#eab308" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Right list sidebar: Scan directory select list */}
                      <div className={`lg:col-span-4 rounded-2xl border p-6 shadow-sm space-y-4 ${theme === 'dark' ? 'bg-[#151413] border-neutral-850' : 'bg-white border-neutral-100'}`}>
                        <h4 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}>Scan Logs Directory</h4>
                        <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2">
                          {scans.map((sc, i) => (
                            <button 
                              key={sc.scanId}
                              onClick={() => {
                                setCurrentScan(sc);
                                setActiveTab("dashboard");
                              }}
                              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${currentScan?.scanId === sc.scanId ? (theme === 'dark' ? "bg-amber-900/20 border-amber-800 shadow-sm" : "bg-amber-100/20 border-amber-300 shadow-sm") : (theme === 'dark' ? "bg-[#1C1A18] border-neutral-800 hover:bg-[#252321]" : "bg-white border-neutral-150 hover:bg-neutral-50")}`}
                            >
                              <div className="space-y-1">
                                <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}>Scan #{i+1} : {sc.skinType}</p>
                                <p className={`text-[10px] font-mono ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'}`}>{new Date(sc.timestamp).toLocaleString()}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-neutral-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-3xl border border-dashed p-12 text-center max-w-2xl mx-auto space-y-4 ${theme === 'dark' ? 'bg-[#151413] border-neutral-800' : 'bg-white border-neutral-250'}`}>
                      <Activity className={`w-10 h-10 mx-auto animate-pulse ${theme === 'dark' ? 'text-neutral-600' : 'text-neutral-300'}`} />
                      <div className="space-y-1">
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}>Not Enough Diagnostic Logs</h4>
                        <p className={`text-xs px-6 ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          Perform at least two separate skin scans on different templates or captured images to activate real-time slope calculations and progress graphing.
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab("dashboard")}
                        className={`px-6 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${theme === 'dark' ? 'bg-[#E6C79C] text-neutral-900 hover:bg-[#d4b58b]' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
                      >
                        Acquire First Scan
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: HOW IT WORKS TECHNOLOGY DETAILED SLIDES (Slide 2 Contents) */}
              {activeTab === "how-it-works" && (
                <motion.div
                  key="how-it-works"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 pb-16 max-w-5xl mx-auto w-full"
                >
                  <div className="text-center space-y-3">
                    <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#9c8468] font-semibold">Interactive Presentation</span>
                    <h2 className={`text-3xl md:text-4xl font-serif font-light tracking-tight ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>Skinova Functional Manual</h2>
                    <p className={`text-xs sm:text-sm max-w-lg mx-auto ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Explore the multi-module AI diagnostic layers and physical formulation models powering our custom skincare systems.
                    </p>
                  </div>

                  {/* Dynamic Animated Tabs integration */}
                  <div className="flex justify-center">
                    <AnimatedTabs 
                      theme={theme}
                      tabs={[
                        {
                          id: "what-is-skinova",
                          label: "Overview",
                          content: (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full p-2">
                              <img
                                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000"
                                alt="Skin Diagnostics Study"
                                className={`rounded-2xl w-full h-48 object-cover border ${theme === 'dark' ? 'border-neutral-800 grayscale-[0.4] opacity-80' : 'border-neutral-100'}`}
                              />
                              <div className="flex flex-col justify-center gap-y-3">
                                <h3 className={`text-lg font-serif font-medium ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>What is Skinova?</h3>
                                <p className={`text-xs leading-relaxed font-sans ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                  Skinova is an AI Skin Analyzer that uses your device's camera or a smart mirror to study your skin in detail. It evaluates acne, pores, pigmentation wrinkles, texture, dryness, dark circles, and hydration, and then crafts a fully personalized skincare routine tailored specifically to you.
                                </p>
                              </div>
                            </div>
                          )
                        },
                        {
                          id: "how-does-it-work",
                          label: "Process Map",
                          content: (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full p-2">
                              <img
                                src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=1000"
                                alt="Technology Core"
                                className={`rounded-2xl w-full h-48 object-cover border ${theme === 'dark' ? 'border-neutral-800 grayscale-[0.4] opacity-80' : 'border-neutral-100'}`}
                              />
                              <div className="flex flex-col justify-center gap-y-3">
                                <h3 className={`text-lg font-serif font-medium ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>Dermal Scan Sequence</h3>
                                <p className={`text-xs leading-relaxed font-sans ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                  First, scan your face: capture or upload a portrait photo. Second, data interpretation begins: our algorithms compare the skin layers to thousands of dermatological references. Third, personalized recommendations are curated, listing exact active compounds and morning and night routines.
                                </p>
                              </div>
                            </div>
                          )
                        },
                        {
                          id: "business-revenue-model",
                          label: "Revenue Architecture",
                          content: (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full p-2">
                              <img
                                src="https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=1000"
                                alt="Derm Kit Box"
                                className={`rounded-2xl w-full h-48 object-cover border ${theme === 'dark' ? 'border-neutral-800 grayscale-[0.4] opacity-80' : 'border-neutral-100'}`}
                              />
                              <div className="flex flex-col justify-center gap-y-3">
                                <h3 className={`text-lg font-serif font-medium ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>Sustainable Economics</h3>
                                <p className={`text-xs leading-relaxed font-sans ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                  We operate a Freemium model. Free features include basic scans and minor checklists. Active subscriptions (INR 149 - 299/mo) unlock advanced mapping. Physical customized skincare boxes (INR 999 - 1999/mo) deliver tailor-made serums, cleansers, and broad spf sunscreens directly.
                                </p>
                              </div>
                            </div>
                          )
                        }
                      ]}
                    />
                  </div>

                  {/* Beautiful customized Premium Peak-Skincare Hero section */}
                  <div className="pt-8">
                    <HeroSection
                      theme={theme}
                      logo={{
                        url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=200",
                        alt: "Skinova Diagnostics Logo",
                        text: "Skinova Labs"
                      }}
                      slogan="Elevate your dermis perspective"
                      title={
                        <>
                          Each Peak <br />
                          <span className="text-[#9c8468] font-serif italic">Teaches Something</span>
                        </>
                      }
                      subtitle="Discover breathtaking physical skin restoration and challenge your standard aging index with customizable serum solutions. Join an elite class of daily wellness practitioners."
                      callToAction={{
                        text: "Launch Skin Hub Diagnostics",
                        href: "#",
                      }}
                      backgroundImage="https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?auto=format&fit=crop&q=80&w=800"
                      contactInfo={{
                        website: "skinova-labs.com",
                        phone: "+1 (555) 123-4567",
                        address: "20 Fieldstone Lane, Clinical District",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("dashboard");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 5: ADMIN DATABASE & USERS MANAGEMENT PANEL */}
              {activeTab === "admin" && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8 pb-16 max-w-5xl mx-auto w-full"
                >
                  {!user || user.email !== "joonbeee@skinova.admin.com" ? (
                    <div className={`p-8 md:p-12 text-center rounded-3xl border max-w-xl mx-auto mt-12 transition-all shadow-xl ${
                      theme === 'dark' 
                        ? 'bg-[#1C1A18] border-rose-950 text-neutral-200' 
                        : 'bg-white border-neutral-200 text-neutral-800'
                    }`}>
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full animate-pulse border border-rose-500/20">
                          <ShieldCheck className="w-14 h-14" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono tracking-[0.25em] text-rose-550 dark:text-rose-400 font-extrabold uppercase">
                          Critical Access Blocked
                        </span>
                        <h3 className="font-serif italic text-3xl font-light text-neutral-900 dark:text-white">Security Area Restrained</h3>
                        <p className={`text-xs leading-relaxed max-w-md mx-auto ${theme === 'dark' ? 'text-neutral-450' : 'text-neutral-500'}`}>
                          This workstation terminal requires active administrator credentials. Only <span className="font-mono text-[#9c8468] dark:text-[#E6C79C] font-bold">joonbeee@skinova.admin.com</span> has executive authority to access real-time system registries.
                        </p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-neutral-200/40 dark:border-neutral-850 text-[10px] font-mono text-neutral-400 flex flex-col sm:flex-row justify-between items-center gap-2">
                        <span>Terminal Identification: <strong className="text-neutral-600 dark:text-neutral-350">{user?.email || "ANONYMOUS_CLIENT"}</strong></span>
                        <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-extrabold font-mono tracking-wider rounded">ACCESS_DENIED</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Premium Header with analytic metrics */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#9c8468] font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" /> SYSTEM REGISTER CONTROL
                          </span>
                          <h2 className={`text-4xl font-serif font-light tracking-tight ${theme === 'dark' ? 'text-white' : 'text-neutral-900'} mt-1`}>Database Administration</h2>
                          <p className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'} mt-1`}>
                            Session Signature: <span className="font-mono text-[#735A40] dark:text-[#E6C79C] font-bold">{user.email}</span> (Root executive clearance)
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={triggerDatabaseReset}
                            className={`px-4 py-2 border text-xs font-mono rounded-xl uppercase flex items-center gap-2 cursor-pointer transition-all ${
                              theme === 'dark' 
                                ? 'bg-rose-950/20 border-rose-900/30 text-rose-400 hover:bg-rose-900/30' 
                                : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'
                            }`}
                            title="Format & Reset System database to original defaults"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Factory Reset Disk DB</span>
                          </button>
                        </div>
                      </div>

                      {/* Premium KPI Metric Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#151413] border-neutral-850' : 'bg-white border-neutral-200/55'} shadow-sm flex items-center gap-4`}>
                          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-[#9c8468]/15 text-[#E6C79C]' : 'bg-[#9c8468]/5 text-[#735A40]'}`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider block text-neutral-450">Active Users DB</span>
                            <span className={`text-2xl font-bold font-sans ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>{adminUsers.length} Accounts</span>
                          </div>
                        </div>

                        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#151413] border-neutral-850' : 'bg-white border-neutral-200/55'} shadow-sm flex items-center gap-4`}>
                          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-[#9c8468]/15 text-[#E6C79C]' : 'bg-[#9c8468]/5 text-[#735A40]'}`}>
                            <Database className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider block text-neutral-450">Dermal Diagnostics</span>
                            <span className={`text-2xl font-bold font-sans ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>{adminScans.length} Scan Files</span>
                          </div>
                        </div>

                        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#151413] border-emerald-950/20' : 'bg-emerald-50/20 border-emerald-200'} shadow-sm flex items-center gap-4`}>
                          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-emerald-100/55 text-emerald-800'}`}>
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider block text-neutral-450">Server Integrity</span>
                            <span className="text-2xl font-bold font-sans text-emerald-500">Secure Live</span>
                          </div>
                        </div>
                      </div>

                      {/* Redesigned Tab Switchers */}
                      <div className="flex border-b border-neutral-250 dark:border-neutral-850 gap-2 overflow-x-auto pb-px">
                        <button
                          onClick={() => setAdminTab("users")}
                          className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                            adminTab === "users" 
                              ? "border-[#9c8468] text-[#735A40] dark:border-[#E6C79C] dark:text-[#E6C79C] font-extrabold" 
                              : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
                          }`}
                        >
                          User Directory ({adminUsers.length})
                        </button>
                        <button
                          onClick={() => setAdminTab("scans")}
                          className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                            adminTab === "scans" 
                              ? "border-[#9c8468] text-[#735A40] dark:border-[#E6C79C] dark:text-[#E6C79C] font-extrabold" 
                              : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
                          }`}
                        >
                          Dermal Scans ({adminScans.length})
                        </button>
                        <button
                          onClick={() => setAdminTab("raw")}
                          className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                            adminTab === "raw" 
                              ? "border-[#9c8468] text-[#735A40] dark:border-[#E6C79C] dark:text-[#E6C79C] font-extrabold" 
                              : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
                          }`}
                        >
                          Raw Database Editor
                        </button>
                      </div>

                  {/* SUBTAB 1: USER ACCOUNTS DIRECTORY */}
                  {adminTab === "users" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <input
                          type="text"
                          placeholder="Search users by name, email or ID..."
                          value={adminSearchTerm}
                          onChange={(e) => setAdminSearchTerm(e.target.value)}
                          className={`px-4 py-2 border text-xs outline-none w-full sm:max-w-md rounded-none font-mono ${theme === 'dark' ? 'bg-[#181615] border-neutral-800 text-white placeholder-neutral-600' : 'bg-white border-neutral-200 text-neutral-800 placeholder-neutral-400'}`}
                        />
                        <button
                          onClick={() => setShowNewUserForm(!showNewUserForm)}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-[#1E1C1A] dark:hover:bg-neutral-900 text-white border border-neutral-700/50 text-xs font-mono rounded-none uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-rose-500" />
                          <span>Add New User Account</span>
                        </button>
                      </div>

                      {/* CREATE NEW USER INLINE EXPANDABLE FORM */}
                      {showNewUserForm && (
                        <div className={`p-6 border rounded-none max-w-xl transition-all ${theme === 'dark' ? 'bg-[#161413] border-neutral-800' : 'bg-neutral-50 border-neutral-250'}`}>
                          <h4 className="text-xs font-mono uppercase font-black tracking-widest text-[#9c8468] mb-4">REGISTRY: ADD USER PORTAL</h4>
                          <form onSubmit={handleCreateNewUserSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-neutral-400 uppercase">Human Name</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="John Doe"
                                  value={newUserForm.name}
                                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                  className={`w-full px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-neutral-400 uppercase">Email Address</label>
                                <input
                                  type="email"
                                  required
                                  placeholder="client@mail.com"
                                  value={newUserForm.email}
                                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                  className={`w-full px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-neutral-400 uppercase">Secure Password</label>
                              <input
                                type="password"
                                required
                                placeholder="Min 6 characters recommended"
                                value={newUserForm.password}
                                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                className={`w-full px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}
                              />
                            </div>

                            <div className="flex gap-6 pt-2">
                              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newUserForm.isPro}
                                  onChange={(e) => setNewUserForm({ ...newUserForm, isPro: e.target.checked })}
                                  className="accent-rose-500"
                                />
                                <span className={theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'}>Grant PRO Tier Level</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newUserForm.isAdmin}
                                  onChange={(e) => setNewUserForm({ ...newUserForm, isAdmin: e.target.checked })}
                                  className="accent-rose-500"
                                />
                                <span className={theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'}>Grant Admin Permission</span>
                              </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
                              >
                                REGISTER ACCOUNT
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowNewUserForm(false)}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* EDIT USER SIDE-OVER FORM MODAL */}
                      {editingUser && (
                        <div className={`p-6 border rounded-none max-w-xl ${theme === 'dark' ? 'border-rose-500/40 bg-rose-950/5' : 'border-rose-400 bg-rose-50/50'}`}>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-mono uppercase font-black text-rose-550">EDITING USER: {editingUser.email}</h4>
                            <button onClick={() => setEditingUser(null)} className="text-neutral-400 hover:text-rose-600 text-xs py-1 px-2 border rounded-none">Close [x]</button>
                          </div>
                          <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-neutral-500 uppercase">Human Display Name</label>
                              <input
                                type="text"
                                value={editingUser.name || ""}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                className={`w-full px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-805'}`}
                              />
                            </div>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!editingUser.isPro}
                                  onChange={(e) => setEditingUser({ ...editingUser, isPro: e.target.checked })}
                                  className="accent-rose-500"
                                />
                                <span>PRO Active</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!editingUser.isAdmin}
                                  onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                                  className="accent-rose-500"
                                />
                                <span>Admin Powers</span>
                              </label>
                            </div>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono uppercase"
                            >
                              Apply User Alterations
                            </button>
                          </form>
                        </div>
                      )}

                      {/* REGISTRY USER TABLE LIST */}
                      <div className={`border overflow-x-auto rounded-none ${theme === 'dark' ? 'border-neutral-800 bg-[#0F0D0C]' : 'border-neutral-200 bg-white'}`}>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className={`text-[10px] font-mono uppercase border-b ${theme === 'dark' ? 'bg-[#181615] border-neutral-850 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-500'}`}>
                              <th className="p-4">UserID</th>
                              <th className="p-4">Name Display</th>
                              <th className="p-4">Email Address</th>
                              <th className="p-4 text-center">Membership Tier</th>
                              <th className="p-4 text-center">Root Admin?</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200/20 dark:divide-neutral-800/40 text-xs font-mono">
                            {adminUsers
                              .filter(u => 
                                !adminSearchTerm || 
                                u.name?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                                u.email?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                                u.userId?.toLowerCase().includes(adminSearchTerm.toLowerCase())
                              )
                              .map(u => (
                                <tr key={u.userId} className={`${theme === 'dark' ? 'hover:bg-[#1A1817]' : 'hover:bg-neutral-50/20'}`}>
                                  <td className="p-4 text-neutral-450 font-bold">{u.userId}</td>
                                  <td className="p-4 font-serif italic text-sm">{u.name || "Client"}</td>
                                  <td className="p-4">{u.email}</td>
                                  <td className="p-4 text-center">
                                    <button
                                      onClick={() => toggleUserPro(u.userId)}
                                      className={`px-2.5 py-0.5 rounded-none text-[9px] font-mono border uppercase tracking-wider cursor-pointer ${u.isPro ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-450 border-neutral-200 dark:border-neutral-750'}`}
                                      title="Toggle user tier"
                                    >
                                      {u.isPro ? 'PRO TIER' : 'FREE'}
                                    </button>
                                  </td>
                                  <td className="p-4 text-center">
                                    <button
                                      onClick={() => toggleUserAdmin(u.userId)}
                                      className={`px-2.5 py-0.5 rounded-none text-[9px] font-mono border uppercase tracking-wider cursor-pointer ${u.isAdmin ? 'bg-rose-550/10 text-rose-500 border-rose-500/30 font-bold' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-450 border-neutral-200 dark:border-neutral-750'}`}
                                      title="Toggle administrator role"
                                    >
                                      {u.isAdmin ? 'ADMIN' : 'MEMBER'}
                                    </button>
                                  </td>
                                  <td className="p-4 text-right space-x-2">
                                    <button
                                      onClick={() => setEditingUser(u)}
                                      className="p-1 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                                      title="Modify user parameters"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 inline" />
                                    </button>
                                    <button
                                      onClick={() => deleteUser(u.userId)}
                                      className="p-1 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                                      title="Erase log data"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 inline" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: DIAGNOSTIC SCANS DIRECTORY */}
                  {adminTab === "scans" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <input
                          type="text"
                          placeholder="Search scans by user email..."
                          value={adminScanSearchTerm}
                          onChange={(e) => setAdminScanSearchTerm(e.target.value)}
                          className={`px-4 py-2 border text-xs outline-none w-full sm:max-w-md rounded-none font-mono ${theme === 'dark' ? 'bg-[#181615] border-neutral-800 text-white placeholder-neutral-600' : 'bg-white border-neutral-200 text-neutral-800 placeholder-neutral-400'}`}
                        />
                        <button
                          onClick={() => setShowNewScanForm(!showNewScanForm)}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-[#1E1C1A] dark:hover:bg-neutral-900 text-white border border-neutral-700/50 text-xs font-mono rounded-none uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-rose-500" />
                          <span>Simulate / Input Dermal Scan</span>
                        </button>
                      </div>

                      {/* CREATE NEW SCAN INLINE FORM */}
                      {showNewScanForm && (
                        <div className={`p-6 border rounded-none max-w-2xl transition-all ${theme === 'dark' ? 'bg-[#161413] border-neutral-800' : 'bg-neutral-50 border-neutral-250'}`}>
                          <h4 className="text-xs font-mono uppercase font-black tracking-widest text-[#9c8468] mb-4">MOCK SIMULATOR: LOG SCAN REPORT</h4>
                          <form onSubmit={handleCreateNewScanSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-neutral-400 uppercase">Associate User Email</label>
                                <input
                                  type="email"
                                  required
                                  placeholder="client@mail.com"
                                  value={newScanForm.email}
                                  onChange={(e) => setNewScanForm({ ...newScanForm, email: e.target.value })}
                                  className={`w-full px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-205 text-neutral-800'}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-neutral-400 uppercase">Assessed Skin Type</label>
                                <select
                                  value={newScanForm.skinType}
                                  onChange={(e) => setNewScanForm({ ...newScanForm, skinType: e.target.value })}
                                  className={`w-full px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-205 text-neutral-800'}`}
                                >
                                  <option value="Dry">Dry</option>
                                  <option value="Oily">Oily</option>
                                  <option value="Normal">Normal</option>
                                  <option value="Sensitive">Sensitive</option>
                                  <option value="Combination">Combination</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-neutral-400 uppercase">Assessed Skin Age (Years)</label>
                                <input
                                  type="number"
                                  required
                                  value={newScanForm.skinAge}
                                  onChange={(e) => setNewScanForm({ ...newScanForm, skinAge: parseInt(e.target.value) || 25 })}
                                  className={`w-full px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-205 text-neutral-800'}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-neutral-400 uppercase">Ingredients (Separated by commas)</label>
                                <input
                                  type="text"
                                  required
                                  value={newScanForm.ingredients}
                                  onChange={(e) => setNewScanForm({ ...newScanForm, ingredients: e.target.value })}
                                  className={`w-full px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-205 text-neutral-800'}`}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-neutral-400 uppercase">Clinical Diagnostic Summary</label>
                              <textarea
                                value={newScanForm.summary}
                                onChange={(e) => setNewScanForm({ ...newScanForm, summary: e.target.value })}
                                className={`w-full h-16 px-3 py-1.5 border text-xs outline-none ${theme === 'dark' ? 'bg-[#1E1C1A] border-neutral-800 text-white' : 'bg-white border-neutral-205 text-neutral-800'}`}
                              />
                            </div>

                            <div className="p-3 border border-neutral-200 dark:border-neutral-800 space-y-3">
                              <span className="text-[9px] font-mono text-rose-500 uppercase tracking-widest font-bold">Health Score Metrics (0 - 100)</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                                <div className="space-y-1">
                                  <label className="text-[8px] text-neutral-400 block">Acne</label>
                                  <input type="number" value={newScanForm.scores.acne} onChange={(e) => setNewScanForm({ ...newScanForm, scores: { ...newScanForm.scores, acne: parseInt(e.target.value) || 0 }})} className="w-full p-1 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-rose-500" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] text-neutral-400 block">Pores</label>
                                  <input type="number" value={newScanForm.scores.pores} onChange={(e) => setNewScanForm({ ...newScanForm, scores: { ...newScanForm.scores, pores: parseInt(e.target.value) || 0 }})} className="w-full p-1 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-rose-500" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] text-neutral-400 block">Wrinkles</label>
                                  <input type="number" value={newScanForm.scores.wrinkles} onChange={(e) => setNewScanForm({ ...newScanForm, scores: { ...newScanForm.scores, wrinkles: parseInt(e.target.value) || 0 }})} className="w-full p-1 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-rose-500" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] text-neutral-400 block">Texture</label>
                                  <input type="number" value={newScanForm.scores.texture} onChange={(e) => setNewScanForm({ ...newScanForm, scores: { ...newScanForm.scores, texture: parseInt(e.target.value) || 0 }})} className="w-full p-1 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-rose-500" />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="px-5 py-2.5 bg-[#9c8468] hover:bg-[#b09678] text-white text-xs font-mono uppercase cursor-pointer"
                              >
                                Log Scan Record
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowNewScanForm(false)}
                                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-mono uppercase cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* EDIT SCAN MODAL */}
                      {editingScan && (
                        <div className={`p-6 border rounded-none max-w-xl ${theme === 'dark' ? 'border-amber-500 bg-amber-950/5' : 'border-amber-400 bg-amber-50/50'}`}>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-mono text-amber-500 uppercase font-black">EDIT SCAN DETAILS {editingScan.scanId}</h4>
                            <button onClick={() => setEditingScan(null)} className="text-neutral-400 hover:text-amber-805 text-xs py-1 px-2 border">Close [x]</button>
                          </div>
                          <form onSubmit={handleUpdateScanSubmit} className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-amber-500">Assessed Dermal Skin Type</label>
                              <input
                                type="text"
                                value={editingScan.skinType || ""}
                                onChange={(e) => setEditingScan({ ...editingScan, skinType: e.target.value })}
                                className="w-full px-3 py-1.5 border text-xs outline-none bg-[#1E1C1A] border-neutral-800 text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-amber-500">Biological Skin Age</label>
                              <input
                                type="number"
                                value={editingScan.skinAge || 25}
                                onChange={(e) => setEditingScan({ ...editingScan, skinAge: parseInt(e.target.value) || 25 })}
                                className="w-full px-3 py-1.5 border text-xs outline-none bg-[#1E1C1A] border-neutral-800 text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-amber-500">Dermal Diagnostics Summary</label>
                              <textarea
                                value={editingScan.summary || ""}
                                onChange={(e) => setEditingScan({ ...editingScan, summary: e.target.value })}
                                className="w-full h-16 px-3 py-1.5 border text-xs outline-none bg-[#1E1C1A] border-neutral-800 text-white"
                              />
                            </div>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono uppercase"
                            >
                              Update Scan Record
                            </button>
                          </form>
                        </div>
                      )}

                      {/* HISTORICAL SCAN DATABASE GRID */}
                      <div className={`border overflow-x-auto rounded-none ${theme === 'dark' ? 'border-neutral-800 bg-[#0F0D0C]' : 'border-neutral-200 bg-white'}`}>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className={`text-[10px] font-mono uppercase border-b ${theme === 'dark' ? 'bg-[#181615] border-neutral-850 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-500'}`}>
                              <th className="p-4">ScanID</th>
                              <th className="p-4">Client User Email</th>
                              <th className="p-4">Timestamp date/time</th>
                              <th className="p-4">Diagnosed Type</th>
                              <th className="p-4 text-center">Score Averages</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200/20 dark:divide-neutral-800/40 text-xs font-mono">
                            {adminScans
                              .filter(s => !adminScanSearchTerm || s.email?.toLowerCase().includes(adminScanSearchTerm.toLowerCase()))
                              .map(s => {
                                const acneScore = s.scores?.acne ?? 80;
                                const hydrationScore = s.scores?.dryness ?? 80;
                                const roughnessScore = s.scores?.texture ?? 80;
                                const scoreAvg = Math.round((acneScore + hydrationScore + roughnessScore) / 3);
                                return (
                                  <tr key={s.scanId} className={`${theme === 'dark' ? 'hover:bg-[#1A1817]' : 'hover:bg-neutral-50/20'}`}>
                                    <td className="p-4 text-rose-500 font-bold">{s.scanId}</td>
                                    <td className="p-4 italic font-sans text-sm">{s.email}</td>
                                    <td className="p-4 text-neutral-400 text-[11px]">{new Date(s.timestamp).toLocaleString()}</td>
                                    <td className="p-4">
                                      <span className={`px-2 py-0.5 border text-[10px] font-sans ${theme === 'dark' ? 'bg-[#1E1C1A] border-amber-900/40 text-amber-400' : 'bg-amber-50 border-amber-250 text-amber-800'}`}>
                                        {s.skinType} (Age {s.skinAge})
                                      </span>
                                    </td>
                                    <td className="p-4 text-center">
                                      <span className={`font-bold font-mono px-1.5 py-0.5 ${scoreAvg >= 80 ? 'text-emerald-500' : scoreAvg >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                                        {scoreAvg}%
                                      </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                      <button
                                        onClick={() => setEditingScan(s)}
                                        className="p-1 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                                        title="Edit Scan Settings"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 inline" />
                                      </button>
                                      <button
                                        onClick={() => deleteScan(s.scanId)}
                                        className="p-1 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                                        title="Erase Scan Entry"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 inline" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: RAW DATABASE JSON EDITOR */}
                  {adminTab === "raw" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-zinc-950 p-3 border border-neutral-800">
                        <span className="text-[10px] font-mono text-neutral-400">CORE RAW DATABASE MEMORY REPRESENTATION (database.json)</span>
                        <div className="space-x-2">
                          <button
                            onClick={saveRawJsonDatabase}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono uppercase tracking-wider cursor-pointer font-bold"
                          >
                            Sync Changes to Disk
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase">Write, update, or paste clean key-value tables here:</label>
                        <textarea
                          value={adminRawJson}
                          onChange={(e) => setAdminRawJson(e.target.value)}
                          className="w-full h-[450px] p-4 bg-[#0A0908] border border-neutral-850 text-neutral-300 font-mono text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  )}
                    </>
                  )}
                </motion.div>
              )}

                  </AnimatePresence>
                </div>

                {/* Aesthetic Footer Block */}
                <footer className={`py-12 px-6 md:px-12 mt-20 text-xs font-serif border-t transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0A0908] text-neutral-500 border-neutral-850' : 'bg-[#FAF9F6] text-neutral-500 border-[#E6C79C]/15'}`}>
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                       <Fingerprint className="w-4 h-4 text-[#9c8468]" />
                       <span>© 2026 Skinova Labs. Certified HIPAA & GDPR Compliant Dermal Platform.</span>
                    </div>
                    <div className="flex gap-8 font-mono text-[9px] uppercase tracking-widest text-[#9c8468]">
                      <span className={`cursor-pointer transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-neutral-900'}`} onClick={() => { if (!user) { setShowAuthModal(true); } else { setActiveTab("how-it-works"); } }}>Technical Paper</span>
                      <span className={`cursor-pointer transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-neutral-900'}`} onClick={() => { if (!user) { setShowAuthModal(true); } else { setActiveTab("formulations"); } }}>Subscription Outlets</span>
                      <span className={`cursor-pointer transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-[#7f694e]'}`}>Derm-Partner API</span>
                    </div>
                  </div>
                </footer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
