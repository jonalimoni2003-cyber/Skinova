"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs?: Tab[];
  defaultTab?: string;
  className?: string;
  theme?: "light" | "dark";
}

const defaultTabs: Tab[] = [
  {
    id: "tab1",
    label: "Skin Analysis Phase",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full p-2">
        <img
          src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=1000"
          alt="Skin Diagnostics"
          className="rounded-2xl w-full h-52 object-cover shadow-sm border border-neutral-100"
        />

        <div className="flex flex-col justify-center gap-y-3">
          <h2 className="text-xl font-serif text-neutral-900 font-medium">
            Step 1: Clinical Capture & Scoring
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            Using computer vision, the algorithm detects surface-level and deep dermis indicators like active redness, open pores, wrinkles, and relative hydration levels in real-time.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "tab2",
    label: "AI Formulator Engine",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full p-2">
        <img
          src="https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=1000"
          alt="Derm Formulation"
          className="rounded-2xl w-full h-52 object-cover shadow-sm border border-neutral-100"
        />
        <div className="flex flex-col justify-center gap-y-3">
          <h2 className="text-xl font-serif text-neutral-900 font-medium">
            Step 2: Ingredient Mapping Sequence
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            Our expert expert system pairs identified skin concerns with synergistic active items such as high-purity Vitamin C, low-molecular Hyaluronic acids, and non-comedogenic ceramide barriers.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "tab3",
    label: "Continuous Tracking",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full p-2">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000"
          alt="Progress Logs"
          className="rounded-2xl w-full h-52 object-cover shadow-sm border border-neutral-100"
        />
        <div className="flex flex-col justify-center gap-y-3">
          <h2 className="text-xl font-serif text-neutral-900 font-medium">
            Step 3: Sequential Calibration
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            As you log routine completions and perform weekly follow-up reviews, the system refines your baseline scores to adapt to weather modifications and seasonal shifts dynamically.
          </p>
        </div>
      </div>
    ),
  },
];

const AnimatedTabs = ({
  tabs = defaultTabs,
  defaultTab,
  className,
  theme = "light",
}: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id);

  if (!tabs?.length) return null;

  return (
    <div className={cn("w-full max-w-3xl flex flex-col gap-y-4", className)}>
      <div className={cn(
        "flex gap-2 flex-wrap border p-1.5 rounded-2xl",
        theme === "dark" 
          ? "bg-[#1C1A18] border-neutral-800" 
          : "bg-[#9c8468]/5 border-[#9c8468]/10"
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-4 py-2 text-xs font-semibold rounded-xl outline-none transition-all duration-300 uppercase tracking-wider"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab-indicator"
                className={cn(
                  "absolute inset-0 rounded-xl border",
                  theme === "dark" 
                    ? "bg-[#151413] border-[#E6C79C]/30 shadow-md" 
                    : "bg-white border-[#E6C79C]/20 shadow-sm"
                )}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className={cn(
              "relative z-10 transition-colors duration-300", 
              activeTab === tab.id 
                ? (theme === "dark" ? "text-[#E6C79C]" : "text-[#9c8468]")
                : (theme === "dark" ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-500 hover:text-neutral-800")
            )}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className={cn(
        "p-6 transition-all rounded-3xl min-h-[15rem] flex items-center border",
        theme === "dark" 
          ? "bg-[#151413] border-neutral-850 shadow-inner" 
          : "bg-white border-neutral-200/40 shadow-sm hover:shadow-md hover:border-neutral-200"
      )}>
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                className="w-full"
                initial={{
                  opacity: 0,
                  scale: 0.98,
                  y: 4,
                  filter: "blur(2px)",
                }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, y: -4, filter: "blur(2px)" }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
              >
                {tab.content}
              </motion.div>
            )
        )}
      </div>
    </div>
  );
};

export { AnimatedTabs };
