'use client';

import React from 'react';
import { ShieldAlert, Zap, AlertTriangle, CheckCircle, ArrowRight, BookOpen, Users } from 'lucide-react';

interface VisualSummaryProps {
  prTitle: string;
  author: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskScore?: number; // 0 to 100
}

export function ReviewVisualSummary({
  prTitle,
  author,
  riskLevel,
  riskScore = 82,
}: VisualSummaryProps) {
  return (
    <div className="space-y-6">
      {/* 1. Pictorial Risk Meter & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Meter Gauge Card */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center">
          <div className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
            Overall Risk Index
          </div>

          {/* SVG Circular Risk Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#1f2937"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={riskScore > 75 ? '#f43f5e' : riskScore > 50 ? '#f59e0b' : '#10b981'}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * riskScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{riskScore}</span>
              <span className="text-[10px] text-gray-400 uppercase font-semibold">/ 100 Risk</span>
            </div>
          </div>

          <div className="mt-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                riskScore > 75
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {riskLevel} Severity Attention Required
            </span>
          </div>
        </div>

        {/* Categories Breakdown Card */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
          <h4 className="font-semibold text-white text-sm">Risk Distribution Breakdown</h4>
          <div className="space-y-3.5 my-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-medium flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> Security Deficiencies
                </span>
                <span className="text-rose-400 font-bold">High (Critical)</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-medium flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Logic & Runtime Errors
                </span>
                <span className="text-amber-400 font-bold">Medium Risk</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full w-[60%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-medium flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Performance Impact
                </span>
                <span className="text-emerald-400 font-bold">Low Overhead</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full w-[25%]" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500">
            *Analyzed against OWASP Top 10, concurrency safety, and repository history.
          </p>
        </div>

        {/* PR Quick Facts */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
          <h4 className="font-semibold text-white text-sm">Review Fast Facts</h4>
          <div className="grid grid-cols-2 gap-3 my-2 text-left">
            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80">
              <span className="text-[11px] text-gray-400 block">Files Touched</span>
              <span className="text-xl font-bold text-white">3 files</span>
            </div>
            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80">
              <span className="text-[11px] text-gray-400 block">Diff Volume</span>
              <span className="text-xl font-bold text-emerald-400">+148 / -32</span>
            </div>
            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80">
              <span className="text-[11px] text-gray-400 block">Est. Review Time</span>
              <span className="text-xl font-bold text-white">4 mins</span>
            </div>
            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80">
              <span className="text-[11px] text-gray-400 block">Blast Radius</span>
              <span className="text-xl font-bold text-indigo-400">Moderate</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            <span>Authored by {author}</span>
          </div>
        </div>
      </div>

      {/* 2. Plain English / ELI5 Overview ("Explain Like I'm 5") */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold text-base text-white">Plain English Summary (For Quick Triage)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-900/70 border border-gray-800">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              1. What this code actually does
            </span>
            <p className="text-xs text-gray-300 leading-relaxed">
              This pull request updates how OAuth session tokens are refreshed when users stay logged in. It adds automatic token expiration renewals so users don't get kicked out randomly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/70 border border-gray-800">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
              2. Why it flagged a warning
            </span>
            <p className="text-xs text-gray-300 leading-relaxed">
              The token hash is being saved to the database without a cryptographic salt, and if Bitbucket/GitHub servers take too long to respond, an unhandled error could crash the backend process.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/70 border border-gray-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              3. What to do before merging
            </span>
            <p className="text-xs text-gray-300 leading-relaxed">
              Apply the two 1-line code suggestions in the "Findings" tab: wrap the token refresh inside a try/catch block and use salted hashing.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Pictorial Architecture Flow (Before vs After) */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="font-bold text-base text-white">Pictorial Architecture Flow (Before vs After)</h3>
        <p className="text-xs text-gray-400">Visual comparison of authentication sequence changes introduced by this pull request.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Flow */}
          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Before (Current Production)</span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between">
                <span>Client requests API</span>
                <span className="text-gray-500 font-mono text-[10px]">Auth Header</span>
              </div>
              <div className="text-center text-gray-600">↓</div>
              <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between">
                <span>Token Expired?</span>
                <span className="text-rose-400 font-semibold">Immediate 401 Session Loss</span>
              </div>
            </div>
          </div>

          {/* After Flow */}
          <div className="p-4 rounded-xl bg-gray-950/80 border border-indigo-500/30 space-y-3">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">After (Proposed in this PR)</span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between">
                <span>Client requests API</span>
                <span className="text-gray-500 font-mono text-[10px]">Auth Header</span>
              </div>
              <div className="text-center text-indigo-500 font-bold">↓</div>
              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between">
                <span>Token Expired?</span>
                <span className="text-emerald-400 font-semibold">Rotates Token via Provider Seamlessly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
