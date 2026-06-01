import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface LoginFormProps {
  onSuccess?: (user: { email: string; name?: string; token?: string; isPro?: boolean }) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleGuestLogin = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Guest login failed.");
      }
      setSuccessMsg("Logged in as Guest Explorer (Demo Access Activated)!");
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            email: result.user.email,
            name: result.user.name,
            token: result.token,
            isPro: result.user.isPro,
          });
        }
      }, 800);
    } catch (err: any) {
      setError(err.message || "Could not register guest session.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    // Secure Data Sanitization / Simple client side validation
    const sanitizedEmail = email.trim().toLowerCase();
    if (!sanitizedEmail || !password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (isSignUp && !name.trim()) {
      setError("Please enter your name for sign up.");
      setLoading(false);
      return;
    }

    // Backend validation API Call
    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignUp 
        ? { email: sanitizedEmail, password, name: name.trim() }
        : { email: sanitizedEmail, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed. Please try again.");
      }

      setSuccessMsg(isSignUp ? "Account created successfully! Logging you in..." : "Logged in successfully!");
      
      // Delay slightly for visual comfort
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            email: result.user.email,
            name: result.user.name,
            token: result.token,
            isPro: result.user.isPro,
          });
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-auto min-h-[600px] md:h-[700px] w-full bg-white rounded-3xl overflow-hidden shadow-2xl transition-all border border-gray-100 max-w-5xl mx-auto">
      {/* Left decoration panel */}
      <div className="w-1/2 hidden md:block relative bg-[#FAF6F0]">
        <img 
          className="h-full w-full object-cover select-none" 
          src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop" 
          alt="Skinova Care Aesthetic Background" 
          onError={(e) => {
            // fallback if the raw link was desired but unsplash is preferred for design realism
            (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
          <p className="font-sans text-xs uppercase tracking-widest text-[#E6C79C] mb-2 font-semibold">AI Powered Skincare Hub</p>
          <h3 className="font-sans text-3xl font-medium tracking-tight mb-3">Skinova Analytics</h3>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Scan your skin, track routines, and receive dermatological insights customized by advanced intelligence.
          </p>
        </div>
      </div>
  
      {/* Right form panel */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-[#FAFafd]">
        <form onSubmit={handleSubmit} className="md:w-96 w-80 flex flex-col items-center justify-center animate-fade-in">
          <h2 className="text-4xl text-neutral-900 font-medium tracking-tight font-sans">
            {isSignUp ? "Create Account" : "Sign in"}
          </h2>
          <p className="text-sm text-neutral-500/90 mt-3 text-center">
            {isSignUp ? "Sign up to start your personalized AI skin journey" : "Welcome back! Please sign in to continue"}
          </p>

          <button 
            type="button" 
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full mt-6 bg-[#9c8468] hover:bg-neutral-850 hover:bg-neutral-900 text-white flex items-center justify-center h-12 rounded-full cursor-pointer transition-all border border-[#9c8468] shadow-sm font-sans font-medium text-sm tracking-wide"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Explore with Guest Demo Access</span>
          </button>

          <button 
            type="button" 
            onClick={() => {
              setSuccessMsg("");
              setError("Google sign-in is managed via manual email flow below.");
            }}
            className="w-full mt-3 bg-neutral-500/5 hover:bg-neutral-500/10 flex items-center justify-center h-11 rounded-full cursor-pointer transition-all border border-neutral-200/40"
          >
            <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg" alt="googleLogo" className="w-5 h-5 mr-3" />
            <span className="text-sm text-neutral-700 font-medium">Continue with Google</span>
          </button>
  
          <div className="flex items-center gap-4 w-full my-5">
            <div className="w-full h-px bg-neutral-300/60"></div>
            <p className="text-nowrap text-xs text-neutral-400 font-sans tracking-wide">
              or use your email
            </p>
            <div className="w-full h-px bg-neutral-300/60"></div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="w-full mb-4 px-4 py-3 bg-rose-50 text-rose-600 text-xs rounded-xl font-medium border border-rose-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="w-full mb-4 px-4 py-3 bg-emerald-50 text-emerald-600 text-xs rounded-xl font-medium border border-emerald-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
              {successMsg}
            </div>
          )}

          {isSignUp && (
            <div className="flex items-center mb-4 w-full bg-white border border-neutral-300/60 focus-within:border-indigo-400 h-12 rounded-full overflow-hidden pl-6 gap-3 transition-colors shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#9CA3AF"/>
              </svg>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name" 
                className="bg-transparent text-neutral-800 placeholder-neutral-400 outline-none text-sm w-full h-full" 
                required={isSignUp}
              />                 
            </div>
          )}
  
          <div className="flex items-center w-full bg-white border border-neutral-300/60 focus-within:border-indigo-400 h-12 rounded-full overflow-hidden pl-6 gap-3 transition-colors shadow-sm">
            <svg width="15" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#9CA3AF"/>
            </svg>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" 
              className="bg-transparent text-neutral-800 placeholder-neutral-400 outline-none text-sm w-full h-full" 
              required 
            />                 
          </div>
  
          <div className="flex items-center mt-4 w-full bg-white border border-neutral-300/60 focus-within:border-indigo-400 h-12 rounded-full overflow-hidden pl-6 gap-3 transition-colors shadow-sm">
            <svg width="13" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#9CA3AF"/>
            </svg>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="bg-transparent text-neutral-800 placeholder-neutral-400 outline-none text-sm w-full h-full" 
              required 
            />
          </div>
  
          <div className="w-full flex items-center justify-between mt-6 text-neutral-500">
            <div className="flex items-center gap-2">
              <input 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-neutral-300 rounded cursor-pointer" 
                type="checkbox" 
                id="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-sm select-none cursor-pointer text-neutral-600 font-sans" htmlFor="checkbox">Remember me</label>
            </div>
            <button 
              type="button" 
              onClick={() => setError("Password reset feature is coming soon! Please use manual signup.")}
              className="text-sm underline hover:text-indigo-500 font-sans"
            >
              Forgot password?
            </button>
          </div>
  
          <button 
            type="submit" 
            disabled={loading}
            className="mt-8 w-full h-12 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all font-medium text-sm shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            <span>{isSignUp ? "Sign Up" : "Login"}</span>
          </button>
          
          <p className="text-neutral-500/90 text-sm mt-5 font-sans">
            {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccessMsg("");
              }}
              className="text-indigo-600 font-medium hover:underline cursor-pointer"
            >
              {isSignUp ? "Sign In" : "Sign up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
