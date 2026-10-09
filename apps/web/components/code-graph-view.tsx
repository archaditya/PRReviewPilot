'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  FileCode2,
  GitBranch,
  Activity,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  X,
  Compass,
} from 'lucide-react';

export interface GraphNode {
  id: string;
  name: string;
  file: string;
  module: string;
  type: 'route' | 'controller' | 'service' | 'model' | 'utility';
  x: number;
  y: number;
  impacted: boolean;
  severity?: 'critical' | 'high' | 'medium' | 'none';
  findingsCount?: number;
  callers: string[];
  callees: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  type?: 'calls' | 'imports' | 'depends';
}

const INITIAL_NODES: GraphNode[] = [
  // ── Routes Layer ──
  {
    id: 'auth_routes',
    name: 'auth.routes.js',
    file: 'apps/api/src/routes/auth.routes.js',
    module: 'routes',
    type: 'route',
    x: 90,
    y: 130,
    impacted: true,
    severity: 'medium',
    findingsCount: 1,
    callers: ['app.js'],
    callees: ['auth.controller.js', 'auth.middleware.js'],
  },
  {
    id: 'repo_routes',
    name: 'repo.routes.js',
    file: 'apps/api/src/routes/repo.routes.js',
    module: 'routes',
    type: 'route',
    x: 90,
    y: 270,
    impacted: false,
    severity: 'none',
    callers: ['app.js'],
    callees: ['repo.controller.js'],
  },

  // ── Controllers Layer ──
  {
    id: 'auth_ctrl',
    name: 'auth.controller.js',
    file: 'apps/api/src/controllers/auth.controller.js',
    module: 'controllers',
    type: 'controller',
    x: 300,
    y: 110,
    impacted: true,
    severity: 'high',
    findingsCount: 2,
    callers: ['auth.routes.js'],
    callees: ['auth.service.js', 'logger.js'],
  },
  {
    id: 'repo_ctrl',
    name: 'repo.controller.js',
    file: 'apps/api/src/controllers/repo.controller.js',
    module: 'controllers',
    type: 'controller',
    x: 300,
    y: 270,
    impacted: false,
    severity: 'none',
    callers: ['repo.routes.js'],
    callees: ['repository.service.js', 'indexer-client.js'],
  },

  // ── Services Layer (Heart of logic) ──
  {
    id: 'auth_srv',
    name: 'auth.service.js',
    file: 'apps/api/src/services/auth.service.js',
    module: 'services',
    type: 'service',
    x: 520,
    y: 90,
    impacted: true,
    severity: 'critical',
    findingsCount: 3,
    callers: ['auth.controller.js'],
    callees: ['user.model.js', 'jwt.util.js'],
  },
  {
    id: 'repo_srv',
    name: 'repository.service.js',
    file: 'apps/api/src/services/repository.service.js',
    module: 'services',
    type: 'service',
    x: 520,
    y: 250,
    impacted: false,
    severity: 'none',
    callers: ['repo.controller.js'],
    callees: ['repository.model.js', 'installation.model.js', 'neo4j-client.js'],
  },

  // ── Models & Storage Layer ──
  {
    id: 'user_model',
    name: 'user.model.js',
    file: 'apps/api/src/models/user.model.js',
    module: 'models',
    type: 'model',
    x: 740,
    y: 70,
    impacted: false,
    severity: 'none',
    callers: ['auth.service.js'],
    callees: ['db.pool.js'],
  },
  {
    id: 'repo_model',
    name: 'repository.model.js',
    file: 'apps/api/src/models/repository.model.js',
    module: 'models',
    type: 'model',
    x: 740,
    y: 210,
    impacted: false,
    severity: 'none',
    callers: ['repository.service.js'],
    callees: ['db.pool.js'],
  },
  {
    id: 'inst_model',
    name: 'installation.model.js',
    file: 'apps/api/src/models/installation.model.js',
    module: 'models',
    type: 'model',
    x: 740,
    y: 330,
    impacted: false,
    severity: 'none',
    callers: ['repository.service.js'],
    callees: ['db.pool.js'],
  },

  // ── Shared Utilities Layer ──
  {
    id: 'jwt_util',
    name: 'jwt.util.js',
    file: 'apps/api/src/utils/jwt.util.js',
    module: 'utility',
    type: 'utility',
    x: 440,
    y: 360,
    impacted: false,
    severity: 'none',
    callers: ['auth.service.js'],
    callees: [],
  },
  {
    id: 'logger',
    name: 'logger.js',
    file: 'apps/api/src/utils/logger.js',
    module: 'utility',
    type: 'utility',
    x: 340,
    y: 20,
    impacted: false,
    severity: 'none',
    callers: ['auth.controller.js', 'repo.controller.js'],
    callees: [],
  },
  {
    id: 'db_pool',
    name: 'db.pool.js',
    file: 'apps/api/src/config/db.js',
    module: 'utility',
    type: 'utility',
    x: 900,
    y: 190,
    impacted: false,
    severity: 'none',
    callers: ['user.model.js', 'repository.model.js'],
    callees: [],
  },
];

const INITIAL_EDGES: GraphEdge[] = [
  { from: 'auth_routes', to: 'auth_ctrl', type: 'calls' },
  { from: 'repo_routes', to: 'repo_ctrl', type: 'calls' },
  { from: 'auth_ctrl', to: 'auth_srv', type: 'calls' },
  { from: 'auth_ctrl', to: 'logger', type: 'imports' },
  { from: 'repo_ctrl', to: 'repo_srv', type: 'calls' },
  { from: 'repo_ctrl', to: 'logger', type: 'imports' },
  { from: 'auth_srv', to: 'user_model', type: 'depends' },
  { from: 'auth_srv', to: 'jwt_util', type: 'imports' },
  { from: 'repo_srv', to: 'repo_model', type: 'depends' },
  { from: 'repo_srv', to: 'inst_model', type: 'depends' },
  { from: 'user_model', to: 'db_pool', type: 'depends' },
  { from: 'repo_model', to: 'db_pool', type: 'depends' },
];

export function CodeGraphView({
  prNumber = 42,
  activeFile = '',
}: {
  prNumber?: number;
  activeFile?: string;
}) {
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('auth_srv');
  const [filterMode, setFilterMode] = useState<'all' | 'impacted' | 'services'>('impacted');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );

  // Filter nodes based on perspective
  const visibleNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchesSearch =
        !searchQuery ||
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.file.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === 'impacted') {
        return n.impacted || n.callers.includes('auth.service.js') || n.callees.includes('auth.service.js');
      }
      if (filterMode === 'services') {
        return n.type === 'service' || n.type === 'controller';
      }
      return true;
    });
  }, [nodes, filterMode, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to));
  }, [edges, visibleNodeIds]);

  // Handle Dragging of Nodes
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
  };

  // Handle Canvas Pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsPanningCanvas(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      // Convert screen coordinates to SVG coordinates
      const svgX = (e.clientX - rect.left - pan.x) / zoomLevel;
      const svgY = (e.clientY - rect.top - pan.y) / zoomLevel;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: Math.max(30, svgX), y: Math.max(30, svgY) } : n)),
      );
    } else if (isPanningCanvas) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanningCanvas(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((z) => Math.min(Math.max(z * zoomFactor, 0.5), 2.2));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId('auth_srv');
  };

  const getNodeColor = (node: GraphNode) => {
    if (node.impacted) {
      if (node.severity === 'critical') return '#f43f5e'; // rose-500
      if (node.severity === 'high') return '#F6821F'; // cloudflare orange
      return '#38bdf8'; // sky-400
    }
    if (node.type === 'route') return '#38bdf8';
    if (node.type === 'service') return '#fbbf24';
    if (node.type === 'model') return '#34d399';
    return '#64748b'; // slate-500
  };

  return (
    <div className="card-chai p-5 space-y-4">
      {/* ── Visualizer Header & Perspective Switcher ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-orange-400" />
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              Neo4j AST Code Knowledge Graph
              <span className="font-mono text-[10px] text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                GPU Force-Directed
              </span>
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Traversing 300+ indexed source files. Click and drag nodes, zoom with scroll wheel, or filter by PR blast radius.
          </p>
        </div>

        {/* Toolbar & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search Within Graph */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search file or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/40 w-44 font-mono"
            />
          </div>

          {/* Perspective Selector */}
          <div className="inline-flex rounded-lg bg-neutral-900 p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setFilterMode('impacted')}
              className={`px-3 py-1.5 rounded-md text-xs transition flex items-center gap-1.5 ${
                filterMode === 'impacted'
                  ? 'bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="h-3 w-3 text-rose-400" />
              <span>PR Blast Radius ({prNumber ? `#${prNumber}` : 'Active'})</span>
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-md text-xs transition ${
                filterMode === 'all'
                  ? 'bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Architecture ({nodes.length} Key Modules)
            </button>
            <button
              onClick={() => setFilterMode('services')}
              className={`px-3 py-1.5 rounded-md text-xs transition ${
                filterMode === 'services'
                  ? 'bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Services & Controllers
            </button>
          </div>

          {/* Camera Controls */}
          <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-neutral-900">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.2))}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-white/5"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.5))}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-white/5"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-white/5"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive Draggable SVG Canvas ── */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[400px] sm:h-[450px] bg-[#0c0e12] rounded-xl border border-white/10 overflow-hidden select-none ${
          isPanningCanvas ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox="0 0 1000 450"
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: '50% 50%',
            transition: draggingNodeId || isPanningCanvas ? 'none' : 'transform 150ms ease-out',
          }}
        >
          {/* Defs for directional arrowheads and gradient glow */}
          <defs>
            <marker id="edge-arrow" markerWidth="8" markerHeight="6" refX="22" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#475569" />
            </marker>
            <marker id="edge-arrow-impact" markerWidth="9" markerHeight="6" refX="26" refY="3" orient="auto">
              <polygon points="0 0, 9 3, 0 6" fill="#f43f5e" />
            </marker>
            <marker id="edge-arrow-selected" markerWidth="9" markerHeight="6" refX="26" refY="3" orient="auto">
              <polygon points="0 0, 9 3, 0 6" fill="#F6821F" />
            </marker>

            {/* Subtle Canvas Dot Grid */}
            <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.06)" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="2000" height="2000" x="-500" y="-500" fill="url(#dot-grid)" />

          {/* ── Edges / Relationship Arrows ── */}
          {visibleEdges.map((e, idx) => {
            const source = nodes.find((n) => n.id === e.from);
            const target = nodes.find((n) => n.id === e.to);
            if (!source || !target) return null;

            const isImpactedEdge = source.impacted && target.impacted;
            const isSelectedEdge =
              selectedNodeId && (source.id === selectedNodeId || target.id === selectedNodeId);

            let strokeColor = '#334155';
            let strokeWidth = 1.5;
            let marker = 'url(#edge-arrow)';

            if (isImpactedEdge) {
              strokeColor = '#f43f5e';
              strokeWidth = 2.5;
              marker = 'url(#edge-arrow-impact)';
            } else if (isSelectedEdge) {
              strokeColor = '#F6821F';
              strokeWidth = 2;
              marker = 'url(#edge-arrow-selected)';
            }

            // Quadratic bezier curved path for organic graph feel
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2 - 12;

            return (
              <g key={idx} className="transition-all">
                <path
                  d={`M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isImpactedEdge ? '5 3' : 'none'}
                  markerEnd={marker}
                />
              </g>
            );
          })}

          {/* ── Nodes ── */}
          {visibleNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isDragging = draggingNodeId === node.id;
            const nodeColor = getNodeColor(node);

            return (
              <g
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                className="cursor-pointer"
              >
                {/* Blast Radius Pulse Halo */}
                {node.impacted && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 36 : 30}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="2.5"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Outer Selection Highlight Ring */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={28}
                    fill="none"
                    stroke="#F6821F"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 22 : 18}
                  fill="#0c0e12"
                  stroke={nodeColor}
                  strokeWidth={node.impacted ? 3 : 2}
                  className="transition-transform duration-100"
                />

                {/* Node Type Initial Letter */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  fill="#f8fafc"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {node.type[0].toUpperCase()}
                </text>

                {/* Node Label Capsule */}
                <g transform={`translate(${node.x}, ${node.y + 26})`}>
                  <rect
                    x="-60"
                    y="-2"
                    width="120"
                    height="18"
                    rx="9"
                    fill={isSelected ? '#1e2430' : '#0f131a'}
                    stroke={isSelected ? '#F6821F' : 'rgba(255,255,255,0.1)'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="11"
                    fill={node.impacted ? '#f43f5e' : '#e2e8f0'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight={node.impacted || isSelected ? '600' : '400'}
                  >
                    {node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* ── Overlay Legend & Canvas Telemetry ── */}
        <div className="absolute bottom-3 left-3 bg-neutral-950/85 border border-white/10 rounded-lg px-3 py-1.5 flex items-center space-x-4 text-[10px] font-mono text-neutral-300 backdrop-blur-md pointer-events-none">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
            <span>Modified in PR</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
            <span>Service & Logic</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            <span>Route & Controller</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Model & Storage</span>
          </div>
        </div>

        {/* Tip helper */}
        <div className="absolute top-3 right-3 bg-neutral-950/80 border border-white/10 rounded-md px-2.5 py-1 text-[10px] font-mono text-neutral-400 backdrop-blur-sm pointer-events-none">
          Drag nodes • Scroll to zoom • Drag background to pan
        </div>
      </div>

      {/* ── Interactive Node Inspector Drawer ── */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <FileCode2 className="w-4 h-4 text-orange-400" />
              <span className="font-mono text-sm font-bold text-white">{selectedNode.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-orange-300 uppercase">
                {selectedNode.type}
              </span>
              {selectedNode.impacted ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Altered by PR • Blast Radius Flag ({selectedNode.findingsCount || 0} finding)
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                  Stable Upstream Component
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-neutral-400">
              Path: <span className="text-neutral-200">{selectedNode.file}</span>
            </p>

            {/* Callers & Callees Cross-links */}
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">Inbound Callers ({selectedNode.callers.length}):</span>
                {selectedNode.callers.length > 0 ? (
                  selectedNode.callers.map((c, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-white/5 text-orange-300 text-[10px] border border-white/10"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-600">None</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">Outbound Dependencies ({selectedNode.callees.length}):</span>
                {selectedNode.callees.length > 0 ? (
                  selectedNode.callees.map((c, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-white/5 text-neutral-300 text-[10px] border border-white/10"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-600">Leaf Node</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <button
              onClick={() => {
                setPan({ x: -selectedNode.x + 350, y: -selectedNode.y + 150 });
                setZoomLevel(1.3);
              }}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-orange-400" />
              <span>Center Node</span>
            </button>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
