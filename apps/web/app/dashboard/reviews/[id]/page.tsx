'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  Layers,
  FileCode,
  Check,
  X,
  PieChart,
  ListFilter,
  Activity,
  GitBranch,
} from 'lucide-react';
import { ReviewVisualSummary } from '@/components/review-visual-summary';
import { CodeGraphView } from '@/components/code-graph-view';

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'visual' | 'findings' | 'graph' | 'timeline'>('visual');
  const [findings, setFindings] = useState([
    {
      id: 'f-1',
      file: 'src/services/auth.service.js',
      line: 48,
      category: 'security',
      severity: 'critical',
      title: 'Insecure Token Generation without Cryptographic Salt',
      message: 'The token hash does not enforce sufficient entropy and lacks a unique salt before storage, allowing possible precomputed rainbow table attacks.',
      suggestion: 'const tokenHash = crypto.createHash(\'sha256\').update(token + process.env.TOKEN_SALT).digest(\'hex\');',
      status: 'open',
    },
    {
      id: 'f-2',
      file: 'src/controllers/auth.controller.js',
      line: 112,
      category: 'bug_risk',
      severity: 'high',
      title: 'Unhandled Promise Rejection on Token Refresh',
      message: 'The asynchronous callback does not catch network timeouts from the provider, potentially crashing the Node worker.',
      suggestion: 'try {\n  await provider.refreshToken(token);\n} catch (err) {\n  logger.error({ err }, "Token refresh failed");\n  return res.status(401).json({ error: "Session expired" });\n}',
      status: 'open',
    },
  ]);

  const timelineEvents = [
    { title: 'Pull Request Webhook Received', time: '12:04:02 PM', desc: 'Triggered by GitHub push event on branch feat/oauth-rotation' },
    { title: 'Unified Diff Extracted', time: '12:04:03 PM', desc: 'Fetched 3 modified files (+148, -32 lines)' },
    { title: 'AST & Dependency Graph Analyzed', time: '12:04:05 PM', desc: 'Mapped imports: auth.routes.js -> auth.controller.js -> auth.service.js' },
    { title: 'AI Code Review Engine Completed', time: '12:04:14 PM', desc: 'Identified 2 high-priority findings and calculated Risk Index: 82/100' },
    { title: 'Inline PR Comments Posted', time: '12:04:16 PM', desc: 'Posted suggestions directly to GitHub PR #42 with suggestion diffs' },
  ];

  const handleStatusChange = (id: string, newStatus: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/reviews"
          className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reviews</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span>Review Job ID: <span className="font-mono text-gray-300">rev-101</span></span>
        </div>
      </div>

      {/* Main Review Summary Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-400">org/core-api</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-indigo-400 font-medium">PR #42</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-400 flex items-center">
                <GitBranch className="w-3 h-3 mr-1" /> feat/oauth-rotation
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Add OAuth refresh token rotation and session revocation
            </h1>
            <p className="text-xs text-gray-400 mt-1 flex items-center space-x-4">
              <span>Author: dev-alex</span>
              <span>Commit: 7f8a92b</span>
              <span>Provider: GitHub</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              🔴 CRITICAL RISK DETECTED
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-800 space-x-6 pt-2 text-sm">
          <button
            onClick={() => setActiveTab('visual')}
            className={`pb-3 font-semibold flex items-center space-x-2 transition ${
              activeTab === 'visual'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Visual & Simpler Explanation</span>
          </button>

          <button
            onClick={() => setActiveTab('findings')}
            className={`pb-3 font-semibold flex items-center space-x-2 transition ${
              activeTab === 'findings'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Code Findings ({findings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`pb-3 font-semibold flex items-center space-x-2 transition ${
              activeTab === 'graph'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Codebase Dependency Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 font-semibold flex items-center space-x-2 transition ${
              activeTab === 'timeline'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Pipeline Audit Log</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'visual' && (
        <ReviewVisualSummary
          prTitle="Add OAuth refresh token rotation and session revocation"
          author="dev-alex"
          riskLevel="critical"
          riskScore={82}
        />
      )}

      {activeTab === 'findings' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Detailed Code Findings</span>
            <span className="text-xs font-normal text-gray-400">({findings.length} issues)</span>
          </h2>

          {findings.map((f) => (
            <div
              key={f.id}
              className={`glass-panel p-5 rounded-xl border ${
                f.status === 'resolved'
                  ? 'border-emerald-500/30 opacity-70'
                  : 'border-gray-800'
              } transition space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      f.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {f.severity}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">Category: {f.category}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs font-mono text-indigo-300 flex items-center space-x-1">
                    <FileCode className="w-3.5 h-3.5 inline mr-1" />
                    {f.file}:{f.line}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {f.status === 'resolved' ? (
                    <span className="text-xs text-emerald-400 flex items-center space-x-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatusChange(f.id, 'resolved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center space-x-1 transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(f.id, 'dismissed')}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-medium flex items-center space-x-1 transition"
                      >
                        <X className="w-3 h-3" />
                        <span>Dismiss</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{f.message}</p>

              {f.suggestion && (
                <div className="rounded-lg bg-black/60 p-3 border border-gray-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                  <div className="text-gray-500 mb-1 text-[11px] font-sans font-medium">Suggested Fix (Automated Diff):</div>
                  <pre>{f.suggestion}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'graph' && (
        <CodeGraphView prNumber={42} activeFile="src/services/auth.service.js" />
      )}

      {activeTab === 'timeline' && (
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
          <h3 className="font-bold text-lg text-white">Review Pipeline Execution Stepper</h3>
          <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-6">
            {timelineEvents.map((evt, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-background" />
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-white">{evt.title}</h4>
                  <span className="text-xs font-mono text-gray-500">{evt.time}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{evt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
