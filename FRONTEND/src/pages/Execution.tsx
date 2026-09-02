import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Database, Lock, Unlock, Download, Upload, Edit3, Palette, Atom } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Attribute {
  id: string;
  name: string;
  entityId: string;
  angle: number;
  distance: number;
  color: string;
}

interface Entity {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  icon?: string; // icon name
}

interface Settings {
  attrPaddingX: number;
  attrPaddingY: number;
  fontSize: number;
}

interface DiagramData {
  entities: Entity[];
  attributes: Attribute[];
  settings: Settings;
}

// --- Default Data ---
const DEFAULT_SETTINGS: Settings = {
  attrPaddingX: 4,
  attrPaddingY: 3,
  fontSize: 11,
};

const DEFAULT_ENTITIES: Entity[] = [
  { id: 'user', name: 'User', x: 300, y: 300, color: '#fdba74', radius: 55, icon: 'user' },
  { id: 'order', name: 'Order', x: 600, y: 200, color: '#fb923c', radius: 55, icon: 'shoppingCart' },
  { id: 'product', name: 'Product', x: 900, y: 350, color: '#f97316', radius: 55, icon: 'package' },
  { id: 'category', name: 'Category', x: 650, y: 550, color: '#ea580c', radius: 55, icon: 'tag' },
  { id: 'review', name: 'Review', x: 350, y: 550, color: '#c2410c', radius: 55, icon: 'star' },
];

const DEFAULT_ATTRIBUTES: Attribute[] = [
  { id: 'u1', name: 'user_id', entityId: 'user', angle: 0, distance: 100, color: '#93c5fd' },
  { id: 'u2', name: 'username', entityId: 'user', angle: 90, distance: 100, color: '#93c5fd' },
  { id: 'u3', name: 'email', entityId: 'user', angle: 180, distance: 100, color: '#93c5fd' },
  { id: 'u4', name: 'created_at', entityId: 'user', angle: 270, distance: 100, color: '#93c5fd' },
  { id: 'o1', name: 'order_id', entityId: 'order', angle: 45, distance: 100, color: '#93c5fd' },
  { id: 'o2', name: 'total', entityId: 'order', angle: 135, distance: 100, color: '#93c5fd' },
  { id: 'o3', name: 'status', entityId: 'order', angle: 225, distance: 100, color: '#93c5fd' },
  { id: 'p1', name: 'product_id', entityId: 'product', angle: 0, distance: 100, color: '#93c5fd' },
  { id: 'p2', name: 'name', entityId: 'product', angle: 90, distance: 100, color: '#93c5fd' },
  { id: 'p3', name: 'price', entityId: 'product', angle: 180, distance: 100, color: '#93c5fd' },
  { id: 'c1', name: 'cat_id', entityId: 'category', angle: 270, distance: 100, color: '#93c5fd' },
  { id: 'c2', name: 'title', entityId: 'category', angle: 90, distance: 100, color: '#93c5fd' },
  { id: 'r1', name: 'review_id', entityId: 'review', angle: 180, distance: 100, color: '#93c5fd' },
  { id: 'r2', name: 'rating', entityId: 'review', angle: 270, distance: 100, color: '#93c5fd' },
  { id: 'r3', name: 'comment', entityId: 'review', angle: 0, distance: 100, color: '#93c5fd' },
];

const RELATIONSHIPS = [
  { from: 'user', to: 'order' },
  { from: 'user', to: 'review' },
  { from: 'order', to: 'product' },
  { from: 'product', to: 'category' },
  { from: 'product', to: 'review' },
];

const ORANGE_COLORS = [
  '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316',
  '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
];

const BLUE_COLORS = [
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
];

// Icon mapping
const ICONS: Record<string, React.ReactNode> = {
  user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  shoppingCart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  package: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  tag: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  star: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  atom: <Atom className="w-5 h-5" />,
};

export default function ERDiagramWithIcons() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'entity' | 'attribute' | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('atom');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load
  useEffect(() => {
    const saved = localStorage.getItem('er-diagram-v5');
    if (saved) {
      try {
        const parsed: DiagramData = JSON.parse(saved);
        setEntities(parsed.entities);
        setAttributes(parsed.attributes);
        setSettings(parsed.settings);
      } catch {
        setEntities(DEFAULT_ENTITIES);
        setAttributes(DEFAULT_ATTRIBUTES);
      }
    } else {
      setEntities(DEFAULT_ENTITIES);
      setAttributes(DEFAULT_ATTRIBUTES);
    }
  }, []);

  // Save
  useEffect(() => {
    if (entities.length > 0) {
      const data: DiagramData = { entities, attributes, settings };
      localStorage.setItem('er-diagram-v5', JSON.stringify(data));
    }
  }, [entities, attributes, settings]);

  // Calculate attribute position
  const getAttrPosition = useCallback((attr: Attribute) => {
    const entity = entities.find(e => e.id === attr.entityId);
    if (!entity) return { x: 0, y: 0 };
    const rad = (attr.angle * Math.PI) / 180;
    return {
      x: entity.x + Math.cos(rad) * attr.distance,
      y: entity.y + Math.sin(rad) * attr.distance,
    };
  }, [entities]);

  // Handle entity drag end
  const handleEntityDragEnd = useCallback((entityId: string, event: any, info: PanInfo) => {
    if (isLocked) return;
    setEntities(prev => prev.map(e => {
      if (e.id !== entityId) return e;
      return {
        ...e,
        x: e.x + info.offset.x,
        y: e.y + info.offset.y,
      };
    }));
  }, [isLocked]);

  // Handle attribute drag end
  const handleAttrDragEnd = useCallback((attrId: string, event: any, info: PanInfo) => {
    if (isLocked) return;
    
    setAttributes(prev => prev.map(attr => {
      if (attr.id !== attrId) return attr;
      
      const entity = entities.find(e => e.id === attr.entityId);
      if (!entity) return attr;
      
      const rad = (attr.angle * Math.PI) / 180;
      const currentX = entity.x + Math.cos(rad) * attr.distance + info.offset.x;
      const currentY = entity.y + Math.sin(rad) * attr.distance + info.offset.y;
      
      const dx = currentX - entity.x;
      const dy = currentY - entity.y;
      let newAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const newDistance = Math.max(entity.radius + 40, Math.min(250, Math.sqrt(dx * dx + dy * dy)));
      
      return { ...attr, angle: newAngle, distance: newDistance };
    }));
  }, [isLocked, entities]);

  // Text editing
  const handleDoubleClick = (e: React.MouseEvent, id: string, type: 'entity' | 'attribute', currentText: string) => {
    e.stopPropagation();
    if (isLocked) return;
    setSelectedId(id);
    setSelectedType(type);
    setEditingText(currentText);
    setIsEditing(true);
  };

  const saveText = () => {
    if (!selectedId || !selectedType) return;
    if (selectedType === 'entity') {
      setEntities(prev => prev.map(e => e.id === selectedId ? { ...e, name: editingText } : e));
    } else {
      setAttributes(prev => prev.map(a => a.id === selectedId ? { ...a, name: editingText } : a));
    }
    setIsEditing(false);
  };

  // Color change
  const changeColor = (color: string) => {
    if (!selectedId || !selectedType || isLocked) return;
    if (selectedType === 'entity') {
      setEntities(prev => prev.map(e => e.id === selectedId ? { ...e, color } : e));
    } else {
      setAttributes(prev => prev.map(a => a.id === selectedId ? { ...a, color } : a));
    }
  };

  // Icon change for entity
  const changeIcon = (iconName: string) => {
    if (!selectedId || selectedType !== 'entity' || isLocked) return;
    setEntities(prev => prev.map(e => e.id === selectedId ? { ...e, icon: iconName } : e));
    setSelectedIcon(iconName);
  };

  // Export/Import
  const exportToFile = () => {
    const data: DiagramData = { entities, attributes, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'er-diagram-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data: DiagramData = JSON.parse(ev.target?.result as string);
        setEntities(data.entities);
        setAttributes(data.attributes);
        setSettings(data.settings);
      } catch {
        alert('Invalid file');
      }
    };
    reader.readAsText(file);
  };

  const selectedItem = selectedType === 'entity' 
    ? entities.find(e => e.id === selectedId)
    : attributes.find(a => a.id === selectedId);

  if (entities.length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full border-2 transition-colors",
            isLocked ? "bg-amber-100 border-amber-400" : "bg-orange-100 border-orange-400"
          )}>
            <Database className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">ER Diagram Editor</h1>
            <p className="text-xs text-slate-500">
              {isLocked ? '🔒 View Mode' : '✏️ Drag to move • Drag blue pills to orbit'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={exportToFile} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={importFromFile} className="hidden" />

          <div className="w-px h-6 bg-slate-300 mx-1" />
          
          <button onClick={() => setIsLocked(!isLocked)} className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
            isLocked ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-orange-50 border-orange-300 text-orange-700"
          )}>
            {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isLocked ? 'Unlock' : 'Lock'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!isLocked && (
          <aside className="w-72 bg-white border-r border-slate-200 p-4 overflow-y-auto z-20">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Panel
            </h2>

            {isEditing && selectedItem && (
              <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                  Editing {selectedType} Name
                </label>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveText()}
                  onBlur={saveText}
                  autoFocus
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {selectedId && !isEditing && selectedType === 'entity' && (
              <div className="mb-6">
                <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-2">
                  <Palette className="w-3 h-3" />
                  Entity Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(ICONS).map(iconName => (
                    <button
                      key={iconName}
                      onClick={() => changeIcon(iconName)}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all flex items-center justify-center",
                        (selectedItem as Entity)?.icon === iconName ? "border-slate-800 bg-slate-100" : "border-slate-200 hover:border-slate-400"
                      )}
                    >
                      <div className="text-slate-700">
                        {ICONS[iconName]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedId && !isEditing && (
              <div className="mb-6">
                <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-2">
                  <Palette className="w-3 h-3" />
                  {selectedType === 'entity' ? 'Entity Color (Orange)' : 'Attribute Color (Blue)'}
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {(selectedType === 'entity' ? ORANGE_COLORS : BLUE_COLORS).map(color => (
                    <button
                      key={color}
                      onClick={() => changeColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-md border-2 transition-all",
                        selectedItem?.color === color ? "border-slate-800 scale-110" : "border-slate-200"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="text-xs font-medium text-slate-600 mb-2">Size Settings</label>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Entity Radius</span>
                    <span>{entities[0]?.radius || 55}px</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="80"
                    value={entities[0]?.radius || 55}
                    onChange={(e) => {
                      const r = parseInt(e.target.value);
                      setEntities(prev => prev.map(en => ({ ...en, radius: r })));
                    }}
                    className="w-full h-1 bg-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Font Size</span>
                    <span>{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="9"
                    max="14"
                    value={settings.fontSize}
                    onChange={(e) => setSettings(s => ({ ...s, fontSize: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-[11px] text-orange-800 leading-relaxed">
                <strong>Orange circles</strong> = Entities with icons<br/>
                <strong>Blue pills</strong> = Attributes (drag to orbit)<br/>
                <strong>Double-click</strong> text to edit names
              </p>
            </div>
          </aside>
        )}

        {/* Canvas */}
        <main 
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          onClick={() => { setSelectedId(null); setSelectedType(null); setIsEditing(false); }}
        >
          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Entity relationships - ORANGE */}
            {RELATIONSHIPS.map((rel, i) => {
              const from = entities.find(e => e.id === rel.from);
              const to = entities.find(e => e.id === rel.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`rel-${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeDasharray="5,5"
                  className="opacity-60"
                />
              );
            })}

            {/* Entity-Attribute connections */}
            {attributes.map(attr => {
              const entity = entities.find(e => e.id === attr.entityId);
              if (!entity) return null;
              const pos = getAttrPosition(attr);
              return (
                <line
                  key={`conn-${attr.id}`}
                  x1={entity.x}
                  y1={entity.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  className="opacity-40"
                />
              );
            })}
          </svg>

          {/* ATTRIBUTES - Blue rounded rectangles */}
          {attributes.map((attr) => {
            const pos = getAttrPosition(attr);
            const isSelected = selectedId === attr.id && selectedType === 'attribute';
            
            return (
              <motion.div
                key={attr.id}
                drag={!isLocked}
                dragMomentum={false}
                onDragEnd={(e, info) => handleAttrDragEnd(attr.id, e, info)}
                initial={false}
                animate={{ x: pos.x, y: pos.y }}
                whileDrag={{ scale: 1.1, zIndex: 50 }}
                className={cn(
                  "absolute z-10",
                  isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
                )}
                style={{ 
                  left: 0, 
                  top: 0,
                  x: pos.x, 
                  y: pos.y, 
                  translateX: '-50%', 
                  translateY: '-50%' 
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(attr.id);
                  setSelectedType('attribute');
                  setIsEditing(false);
                }}
                onDoubleClick={(e) => handleDoubleClick(e, attr.id, 'attribute', attr.name)}
              >
                <div 
                  className={cn(
                    "rounded-2xl border-2 shadow-sm flex items-center justify-center transition-all",
                    isSelected && !isLocked ? "ring-2 ring-blue-500 ring-offset-2" : "",
                    isLocked ? "border-slate-400" : "border-blue-400"
                  )}
                  style={{
                    backgroundColor: attr.color,
                    padding: `${settings.attrPaddingY * 2}px ${settings.attrPaddingX * 3}px`,
                    minWidth: '60px',
                  }}
                >
                  <span 
                    className="font-medium text-slate-800 whitespace-nowrap"
                    style={{ fontSize: `${settings.fontSize}px` }}
                  >
                    {attr.name}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* ENTITIES - Orange circles with icons */}
          {entities.map((entity) => {
            const isSelected = selectedId === entity.id && selectedType === 'entity';
            const icon = entity.icon ? ICONS[entity.icon] : ICONS['atom'];
            
            return (
              <motion.div
                key={entity.id}
                drag={!isLocked}
                dragMomentum={false}
                onDragEnd={(e, info) => handleEntityDragEnd(entity.id, e, info)}
                initial={false}
                animate={{ x: entity.x, y: entity.y }}
                whileDrag={{ scale: 1.05, zIndex: 50 }}
                className={cn(
                  "absolute z-20",
                  isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
                )}
                style={{ 
                  left: 0,
                  top: 0,
                  x: entity.x, 
                  y: entity.y, 
                  translateX: '-50%', 
                  translateY: '-50%' 
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(entity.id);
                  setSelectedType('entity');
                  setIsEditing(false);
                }}
                onDoubleClick={(e) => handleDoubleClick(e, entity.id, 'entity', entity.name)}
              >
                <div 
                  className={cn(
                    "rounded-full border-2 shadow-md flex flex-col items-center justify-center transition-all gap-1",
                    isSelected && !isLocked ? "ring-2 ring-orange-500 ring-offset-2" : "",
                    isLocked ? "border-orange-600" : "border-orange-700"
                  )}
                  style={{
                    backgroundColor: entity.color,
                    width: `${entity.radius * 2}px`,
                    height: `${entity.radius * 2}px`,
                  }}
                >
                  {/* Icon - above the name */}
                  <div className="text-slate-800 opacity-80">
                    {icon}
                  </div>
                  
                  {/* Entity Name */}
                  <span 
                    className="font-bold text-slate-900 text-center leading-tight px-2"
                    style={{ fontSize: `${Math.max(9, settings.fontSize)}px` }}
                  >
                    {entity.name}
                  </span>
                </div>
              </motion.div>
            );
          })}

          <div className="absolute bottom-4 left-4 z-30">
            <p className={cn("text-[10px] font-medium", isLocked ? "text-amber-600" : "text-slate-400")}>
              {isLocked ? '🔒 Locked' : '✏️ Drag orange circles • Drag blue pills to orbit'}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}