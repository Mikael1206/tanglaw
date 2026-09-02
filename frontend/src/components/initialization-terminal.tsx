"use client";

/**
 * Technical 'Initialization Terminal' for the student onboarding flow.
 * Modular, grid-anchored interface for collecting unit parameters.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Database, ShieldCheck, MapPin, GraduationCap, DollarSign, User } from "lucide-react";
import { useRouter } from "next/navigation";
import OwelBriefing from "./owel-briefing";

const STEPS = [
  { id: 1, key: "IDENTITY", label: "Unit Identity", icon: User, report: "I need your legal alias or student unit identifier to personalize the navigation stream." },
  { id: 2, key: "TRAJECTORY", label: "Academic Path", icon: GraduationCap, report: "Calibrating your academic coordinates helps me scan for relevant program-based grants." },
  { id: 3, key: "FINANCIAL", label: "Financial Tier", icon: DollarSign, report: "Input your family income bracket to filter grants by financial eligibility constraints." },
  { id: 4, key: "COORDINATES", label: "Geo-Location", icon: MapPin, report: "Finally, I need your regional data to locate localized LGU assistance and community grants." },
];

export default function InitializationTerminal() {
  const [currentStep, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    program: "",
    year: "",
    income: "",
    location: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const activeStep = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setIsAnalyzing(true);        setTimeout(() => {
          setIsAnalyzing(false);
          setCurrentIndex((prev) => prev + 1);
        }, 400);
    } else {
      // Finalize and redirect
      setIsAnalyzing(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 font-sans">
      {/* ── Progress Unit ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="border-technical bg-[color:var(--theme-surface)] p-6 flex items-center justify-between shadow-sm relative overflow-hidden rounded-xl"
      >
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="h-10 w-10 border-technical bg-primary flex items-center justify-center text-white shadow-xl rounded-md"
          >
            <Database className="h-5 w-5" />
          </motion.div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[color:var(--theme-typography-secondary)]">Boot Sequence</p>
            <div className="flex items-center gap-4">
              <div className="w-48 h-1 bg-gray-100 relative rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="absolute h-full bg-primary"
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-primary">[{Math.round(progress)}%]</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[9px] font-mono text-[color:var(--theme-text-muted)] uppercase">
          <span>[SECURE_CHANNEL: ACTIVE]</span>
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
        </div>
      </motion.div>

      {/* ── Main Terminal Body ── */}
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="grid gap-0 lg:grid-cols-[1fr_340px] items-stretch border-technical shadow-2xl bg-[color:var(--theme-surface)] overflow-hidden relative rounded-xl"
      >
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary z-20 rounded-tl-lg" />
        
        {/* Left: Input Zone */}
        <div className="p-12 min-h-[440px] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-technical relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-primary">
                  <activeStep.icon className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">INIT: {activeStep.key}</span>
                </div>
                <h2 className="text-4xl font-black text-[color:var(--theme-typography-main)] uppercase tracking-technical leading-tight">
                  {activeStep.label}
                </h2>
              </div>

              {/* Step Renderers */}
              <div className="max-w-md">
                {activeStep.key === "IDENTITY" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 }}
                  >
                    <input
                      type="text"
                      placeholder="ENTER FULL NAME / ALIAS"
                      className="w-full bg-[color:var(--theme-surface)]/50 border-technical p-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300 rounded-md"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoFocus
                    />
                  </motion.div>
                )}

                {activeStep.key === "TRAJECTORY" && (
                  <div className="grid grid-cols-1 gap-2">
                    {["BSCS", "BSIT", "BSA", "BSEMC"].map((p, idx) => (
                      <motion.button
                        key={p}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        whileHover={{ x: 4, backgroundColor: "var(--theme-surface)" }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setFormData({ ...formData, program: p })}
                        className={`p-6 border-technical text-[10px] font-black uppercase tracking-widest text-left transition-all rounded-md ${
                          formData.program === p ? "bg-primary text-white" : "bg-[color:var(--theme-surface)] text-[color:var(--theme-text-body)]"
                        }`}
                      >
                        {p} - Bachelor of Science
                      </motion.button>
                    ))}
                  </div>
                )}

                {activeStep.key === "FINANCIAL" && (
                  <div className="grid grid-cols-1 gap-2 border-technical overflow-hidden rounded-md">
                    {["T-1: < ₱200K", "T-2: ₱200K - ₱400K", "T-3: ₱400K - ₱600K", "T-4: > ₱600K"].map((t, idx) => (
                      <motion.button
                        key={t}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        whileHover={{ backgroundColor: "var(--theme-surface)" }}
                        onClick={() => setFormData({ ...formData, income: t })}
                        className={`p-5 text-[9px] font-black uppercase tracking-widest text-left border-b border-technical last:border-b-0 transition-all ${
                          formData.income === t ? "bg-primary text-white" : "bg-[color:var(--theme-surface)] text-[color:var(--theme-text-body)]"
                        }`}
                      >
                        {t} ANNUAL_INCOME_BRACKET
                      </motion.button>
                    ))}
                  </div>
                )}

                {activeStep.key === "COORDINATES" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <select
                      className="w-full bg-[color:var(--theme-surface)]/50 border-technical p-6 text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer rounded-md"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    >
                      <option value="">SELECT REGIONAL_CODE</option>
                      <option value="NCR">NCR - NATIONAL CAPITAL REGION</option>
                      <option value="R3">REGION III - CENTRAL LUZON</option>
                      <option value="R4A">REGION IV-A - CALABARZON</option>
                    </select>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-12 flex items-center justify-between border-t border-technical mt-auto">
            <div className="flex items-center gap-4 text-[9px] font-mono text-[color:var(--theme-text-muted)] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              IO: Waiting for parameter input
            </div>
            
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-4 bg-primary text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all hover:shadow-primary/20 disabled:opacity-50 rounded-md"
            >
              {isAnalyzing ? "Analyzing..." : currentStep === STEPS.length - 1 ? "Finalize" : "Commit"}
              {!isAnalyzing && <ChevronRight className="h-4 w-4" />}
            </motion.button>
          </div>
        </div>

        {/* Right: Briefing Zone */}
        <div className="bg-[color:var(--theme-surface)]/30">
          <OwelBriefing step={currentStep + 1} report={activeStep.report} />
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <p className="text-[8px] font-mono uppercase text-[color:var(--theme-text-muted)] font-black tracking-widest">Data Metadata</p>
              <motion.div 
                layout
                className="p-6 border-technical bg-[color:var(--theme-surface)]/50 text-[9px] font-mono space-y-2 opacity-80 rounded-lg shadow-inner"
              >
                <p>U_ALIAS: <span className="text-primary">{formData.name || "NULL"}</span></p>
                <p>A_COORDS: <span className="text-primary">{formData.program || "NULL"}</span></p>
                <p>F_TIER: <span className="text-primary">{formData.income || "NULL"}</span></p>
                <p>G_LOC: <span className="text-primary">{formData.location || "NULL"}</span></p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <p className="text-center text-[9px] font-mono text-[color:var(--theme-text-muted)] uppercase tracking-widest opacity-60">
        Unauthorized access is prohibited // encryption key: TNG-L-4X-2026
      </p>
    </div>
  );
}
