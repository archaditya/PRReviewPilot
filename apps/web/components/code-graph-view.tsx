'use client';

import React, { useState } from 'react';
import { GitCommit, Layers, AlertCircle, ZoomIn, ZoomOut, RefreshCw, FileCode, CheckCircle2 } from 'lucide-react';

interface GraphNode {
  id: string;
  name: string;
  module: string;
  type: 'service' | 'controller' | 'model' | 'route' | 'utility';
  x: number;
  y: number;
  impacted: boolean;
  severity?: 'critical' | 'high' | 'medium' | 'none';
  findingsCount?: number;
}

interface GraphEdge {
  from: string;
  to: string;
}

export function CodeGraphView({ prNumber = 42, activeFile = '' }: { prNumber?: number; activeFile?: string }) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filter, setFilter] = useState<'all' | 'impacted'>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Nodes representing architecture components
  const nodes: GraphNode[] = [
    { id: 'auth_routes', name: 'auth.routes.js', module: 'routes', type: 'route', x: 100, y: 150, impacted: true, severity: 'medium', findingsCount: 1 },
    { id: 'auth_ctrl', name: 'auth.controller.js', module: 'controllers', type: 'controller', x: 280, y: 150, impacted: true, severity: 'high', findingsCount: 1 },
    { id: 'auth_srv', name: 'auth.service.js', module: 'services', type: 'service', x: 480, y: 150, impacted: true, severity: 'critical', findingsCount: 1 },
    { id: 'user_model', name: 'user.model.js', module: 'models', type: 'model', x: 680, y: 110, impacted: false, severity: 'none' },
    { id: 'jwt_util', name: 'jwt.util.js', module: 'utils', type: 'utility', x: 480, y: 280, impacted: false, severity: 'none' },
    { id: 'logger', name: 'logger.js', module: 'utils', type: 'utility', x: 380, y: 30, impacted: false, severity: 'none' },
    { id: 'db_pool', name: 'db.js', module: 'config', type: 'utility', x: 680, y: 240, impacted: false, severity: 'none' },
  ];

  const edges: GraphEdge[] = [
    { from: 'auth_routes', to: 'auth_ctrl' },
    { from: 'auth_ctrl', to: 'auth_srv' },
    { from: 'auth_ctrl', to: 'logger' },
    { from: 'auth_srv', to: 'user_model' },
    { from: 'auth_srv', to: 'jwt_util' },
    { from: 'user_model', to: 'db_pool' },
  ];

  const filteredNodes = nodes.filter((n) => filter === 'all' || (filter === 'impacted' && n.impacted));

  const getNodeColor = (node: GraphNode) => {
    if (node.impacted) {
      if (node.severity === 'critical') return '#f43f5e'; // rose-500
      if (node.severity === 'high') return '#f59e0b'; // amber-500
      return '#6366f1'; // indigo-500
    }
    return '#334155'; // slate-700
  };

  return (
    <div className="glass-panel rounded-2xl border border-gray-800 p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">Codebase Dependency & Impact Graph</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Visualizing dependency links and blast radius caused by changes in PR #{prNumber}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter options */}
          <div className="inline-flex rounded-lg bg-gray-900 p-1 border border-gray-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition ${filter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
            >
              All Modules
            </button>
            <button
              onClick={() => setFilter('impacted')}
              className={`px-3 py-1 rounded-md transition ${filter === 'impacted' ? 'bg-rose-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
            >
              Impacted Only (3)
            </button>
          </div>

          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-80 bg-gray-950/70 rounded-xl border border-gray-800/80 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 820 340"
          className="w-full h-full transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Defs for gradients & arrows */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="18"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
            <marker
              id="arrowhead-impact"
              markerWidth="10"
              markerHeight="7"
              refX="18"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Grid lines background */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Edges */}
          {edges.map((e, idx) => {
            const source = nodes.find((n) => n.id === e.from);
            const target = nodes.find((n) => n.id === e.to);
            if (!source || !target) return null;

            const isImpactedEdge = source.impacted && target.impacted;

            return (
              <g key={idx}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isImpactedEdge ? '#f43f5e' : '#334155'}
                  strokeWidth={isImpactedEdge ? 2.5 : 1.5}
                  strokeDasharray={isImpactedEdge ? '4 2' : 'none'}
                  markerEnd={isImpactedEdge ? 'url(#arrowhead-impact)' : 'url(#arrowhead)'}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const nodeColor = getNodeColor(node);

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Glow ring for impacted nodes */}
                {node.impacted && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 32 : 28}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 24 : 20}
                  fill="#0f172a"
                  stroke={nodeColor}
                  strokeWidth={node.impacted ? 3 : 2}
                />

                {/* Node icon / label */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  fill="#f8fafc"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {node.type[0].toUpperCase()}
                </text>

                {/* Label text below node */}
                <text
                  x={node.x}
                  y={node.y + 36}
                  fill={node.impacted ? '#f8fafc' : '#94a3b8'}
                  fontSize="11"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  fontWeight={node.impacted ? '600' : '400'}
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-gray-900/90 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center space-x-4 text-[11px] text-gray-300 backdrop-blur-sm">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Modified & Critical</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Affected Dependent</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
            <span>Stable Dependency</span>
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-sm font-bold text-white">{selectedNode.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">
                {selectedNode.type}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Module: <span className="text-gray-300 font-semibold">{selectedNode.module}</span> • Status:{' '}
              {selectedNode.impacted ? (
                <span className="text-rose-400 font-bold">Modified in this PR ({selectedNode.findingsCount || 0} findings)</span>
              ) : (
                <span className="text-emerald-400">Unmodified upstream caller</span>
              )}
            </p>
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800"
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}
