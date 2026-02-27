/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Box, 
  PawPrint, 
  Feather, 
  Shield, 
  Zap, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  Eraser,
  Camera,
  Search,
  BookOpen
} from 'lucide-react';
import { getCachedAudioUrl } from './services/geminiService';

// --- Types ---
type Category = 'left' | 'right';

interface AnimalItem {
  id: string;
  emoji: string;
  category: Category;
  name: string;
}

interface Mission {
  id: number;
  title: string;
  instruction: string;
  audioText: string;
  leftLabel: string;
  leftIcon: React.ReactNode;
  rightLabel: string;
  rightIcon: React.ReactNode;
  items: AnimalItem[];
}

interface FieldMission {
  id: number;
  task: string;
  icon: string;
  audioText: string;
}

// --- Constants ---
const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Living or Not?",
    instruction: "Is it alive?",
    audioText: "Level One! Scientist, let's look at things that are alive and things that are not alive. Put the living animals with the heart icon. Put the non-living objects with the stone. Living things breathe and grow!",
    leftLabel: "Living",
    leftIcon: <Heart className="text-red-500 fill-red-500" />,
    rightLabel: "Non-Living",
    rightIcon: <Box className="text-blue-500" />,
    items: [
      { id: 'm1-1', emoji: '🐶', category: 'left', name: 'Dog' },
      { id: 'm1-2', emoji: '🪨', category: 'right', name: 'Rock' },
      { id: 'm1-3', emoji: '🌳', category: 'left', name: 'Tree' },
      { id: 'm1-4', emoji: '🤖', category: 'right', name: 'Robot' },
      { id: 'm1-5', emoji: '🐛', category: 'left', name: 'Caterpillar' },
      { id: 'm1-6', emoji: '🎒', category: 'right', name: 'Backpack' },
    ]
  },
  {
    id: 2,
    title: "Fur or Feathers?",
    instruction: "What's on their skin?",
    audioText: "Level Two! Animals belong to different families based on their bodies. Put the animals with soft fur near the bear. Put the animals with feathers near the feather icon. Look closely at their skin!",
    leftLabel: "Fur",
    leftIcon: <PawPrint className="text-orange-500" />,
    rightLabel: "Feathers",
    rightIcon: <Feather className="text-sky-400" />,
    items: [
      { id: 'm2-1', emoji: '🐱', category: 'left', name: 'Cat' },
      { id: 'm2-2', emoji: '🦉', category: 'right', name: 'Owl' },
      { id: 'm2-3', emoji: '🐰', category: 'left', name: 'Rabbit' },
      { id: 'm2-4', emoji: '🦆', category: 'right', name: 'Duck' },
      { id: 'm2-5', emoji: '🦁', category: 'left', name: 'Lion' },
      { id: 'm2-6', emoji: '🦢', category: 'right', name: 'Swan' },
    ]
  },
  {
    id: 3,
    title: "Shells or Scales?",
    instruction: "Check their armor!",
    audioText: "Final Level! Some animals have hard shells for a home. Others have bumpy scales. Sort them into the right families. Use your zoologist eyes!",
    leftLabel: "Shell",
    leftIcon: <Shield className="text-green-600" />,
    rightLabel: "Scales",
    rightIcon: <Zap className="text-orange-400" />,
    items: [
      { id: 'm3-1', emoji: '🐌', category: 'left', name: 'Snail' },
      { id: 'm3-2', emoji: '🦎', category: 'right', name: 'Lizard' },
      { id: 'm3-3', emoji: '🦀', category: 'left', name: 'Crab' },
      { id: 'm3-4', emoji: '🐊', category: 'right', name: 'Gator' },
    ]
  }
];

const FIELD_MISSIONS: FieldMission[] = [
  { id: 1, task: "Find something that has 4 LEGS.", icon: "🐕", audioText: "Go explore the room! Find an object, a toy, or a picture of an animal with four legs. Draw it below!" },
  { id: 2, task: "Find something NON-LIVING that is GREEN.", icon: "💚", audioText: "Search the classroom for something green that is not alive. Like a block or a crayon. Draw what you find!" },
  { id: 3, task: "Find an animal with FEATHERS.", icon: "🪶", audioText: "Look at books or posters. Can you find an animal with feathers? Draw it here!" },
  { id: 4, task: "Find something LIVING and GROWING.", icon: "🪴", audioText: "Find a living thing that is growing big. Maybe a plant or even a friend! Draw it." },
  { id: 5, task: "Find an animal with SCALES.", icon: "🐍", audioText: "Look for a picture or toy of an animal with scales. Draw your discovery!" },
  { id: 6, task: "Find an animal with a SHELL.", icon: "🐢", audioText: "Can you find a turtle or a crab in the classroom? Look for a hard shell and draw it." },
  { id: 7, task: "Find an animal with soft FUR.", icon: "🧸", audioText: "Find a stuffed animal or a picture of an animal with soft fur. Draw it nicely!" },
  { id: 8, task: "Find something that makes a NOISE.", icon: "🔔", audioText: "Find a non-living object that makes a loud noise. Draw it here!" },
];

// --- Components ---

const DrawingCanvas = ({ initialImage, onDraw, onSave }: { initialImage?: string, onDraw: () => void, onSave: (data: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Save current content before resize if any
        const tempImage = canvas.toDataURL();
        
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        ctx.lineCap = 'round';
        ctx.lineWidth = 6;

        // Restore content after resize
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = tempImage;
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    
    return () => observer.disconnect();
  }, []);

  // Load initial image when mission changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (initialImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = initialImage;
      }
    }
  }, [initialImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      onDraw();
      const canvas = canvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL());
      }
    }
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 8;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSave('');
    }
  };

  return (
    <div className="relative w-full h-full bg-white rounded-[28px] md:rounded-[40px] border-4 border-dashed border-slate-200 overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full touch-none cursor-crosshair"
      />
      
      {/* Integrated Color Palette */}
      <div className="drawing-palette absolute left-1/2 -translate-x-1/2 bottom-3 md:bottom-4 flex items-center justify-center gap-3 px-3 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100">
        {['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'].map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full border-2 transition-all active:scale-90 ${color === c ? 'scale-105 border-slate-400 shadow-md' : 'border-white'}`}
            style={{ backgroundColor: c }}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>

      <button 
        onClick={clear}
        className="drawing-eraser absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors shadow-md active:scale-90"
      >
        <Eraser size={20} />
      </button>
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'sorting' | 'field-guide' | 'celebration'>('start');
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [currentFieldIdx, setCurrentFieldIdx] = useState(0);
  const [shuffledFieldMissions, setShuffledFieldMissions] = useState<FieldMission[]>([]);
  const [sortedItems, setSortedItems] = useState<{ [key: string]: Category }>({});
  const [fieldDrawings, setFieldDrawings] = useState<{ [missionId: number]: string }>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showWrongDropCue, setShowWrongDropCue] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wrongDropTimerRef = useRef<number | null>(null);

  const currentMission = MISSIONS[currentMissionIdx];
  const currentFieldMission = shuffledFieldMissions[currentFieldIdx];

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
    }
    setIsSpeaking(false);
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      stopAllAudio();
      return;
    }

    setIsSpeaking(true);
    
    try {
      const audioUrl = await getCachedAudioUrl(text);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        console.error('Local audio playback error. Generate audio assets first.', audioUrl);
        setIsSpeaking(false);
      };
      audio.play().catch((e) => {
        console.error('Local audio play failed:', e);
        setIsSpeaking(false);
      });
    } catch (e) {
      console.error("Speak error:", e);
      setIsSpeaking(false);
    }
  };

  const handleDrop = (itemId: string, category: Category) => {
    const item = currentMission.items.find(i => i.id === itemId);
    if (item && item.category === category) {
      setSortedItems(prev => ({ ...prev, [itemId]: category }));
    } else {
      if (wrongDropTimerRef.current) {
        window.clearTimeout(wrongDropTimerRef.current);
      }
      setShowWrongDropCue(true);
      wrongDropTimerRef.current = window.setTimeout(() => {
        setShowWrongDropCue(false);
      }, 1700);

      const el = document.getElementById(`item-${itemId}`);
      if (el) {
        el.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(0)' },
        ], { duration: 300 });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (wrongDropTimerRef.current) {
        window.clearTimeout(wrongDropTimerRef.current);
      }
    };
  }, []);

  const allSorted = currentMission.items.every(item => sortedItems[item.id]);

  const skipToFieldGuide = () => {
    stopAllAudio();
    const shuffled = [...FIELD_MISSIONS].sort(() => Math.random() - 0.5);
    setShuffledFieldMissions(shuffled);
    setSortedItems({});
    setFieldDrawings({});
    setGameState('field-guide');
  };

  const nextMission = () => {
    if (currentMissionIdx < MISSIONS.length - 1) {
      setCurrentMissionIdx(prev => prev + 1);
      setSortedItems({});
    } else {
      skipToFieldGuide();
    }
  };

  const nextFieldMission = () => {
    const currentDrawing = fieldDrawings[currentFieldMission.id];
    if (!currentDrawing && !hasDrawn) {
      handleSpeak("Scientist! Don't forget to draw what you found in your field guide!");
      return;
    }
    if (currentFieldIdx < shuffledFieldMissions.length - 1) {
      setCurrentFieldIdx(prev => prev + 1);
      setHasDrawn(false);
    } else {
      setGameState('celebration');
    }
  };

  const prevFieldMission = () => {
    if (currentFieldIdx > 0) {
      setCurrentFieldIdx(prev => prev - 1);
      setHasDrawn(false);
    }
  };

  const unsortedItems = currentMission.items.filter(item => !sortedItems[item.id]);

  const backToStart = () => {
    stopAllAudio();
    setGameState('start');
    setCurrentMissionIdx(0);
    setCurrentFieldIdx(0);
    setSortedItems({});
  };

  return (
    <div
      className={`app-shell w-full flex flex-col p-3 md:p-6 max-w-6xl mx-auto bg-slate-50 relative ${
        gameState === 'start' || gameState === 'sorting' || gameState === 'field-guide'
          ? 'h-[100dvh] overflow-hidden'
          : 'min-h-[100dvh] overflow-y-auto'
      }`}
    >
      {/* Global Navigation Overlays */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 no-print">
        {gameState === 'celebration' && (
          <button 
            onClick={backToStart}
            className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-tighter"
            title="Back to Start"
          >
            <RotateCcw size={16} />
            <span>Start</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="start-screen flex-grow flex flex-col items-center justify-center text-center gap-5 md:gap-8 pt-6 md:pt-0 min-h-0"
          >
            <div className="relative">
              <div className="text-[7rem] md:text-[10rem] animate-bounce-gentle leading-none">🦁</div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 md:-top-5 text-4xl md:text-5xl">🎓</div>
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black text-green-600 tracking-tight">Zoologist Academy</h1>
              <p className="text-xl md:text-3xl font-medium text-slate-500">Become a real animal scientist!</p>
            </div>
            <div className="flex flex-col gap-3 md:gap-4 w-full max-w-sm md:max-w-md pb-2">
              <button 
                onClick={() => setGameState('sorting')}
                className="btn-primary text-3xl md:text-5xl py-6 md:py-10 w-full"
              >
                START TRAINING
              </button>
              
              <button 
                onClick={skipToFieldGuide}
                className="text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-2 text-lg md:text-xl"
              >
                <BookOpen size={24} /> Skip to Field Guide
              </button>

            </div>
          </motion.div>
        )}

        {gameState === 'sorting' && (
          <motion.div 
            key="sorting"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="sorting-screen flex-grow flex flex-col gap-3 md:gap-4 h-full min-h-0"
          >
            <div className="flex flex-col gap-4 h-full min-h-0 overflow-hidden">
              <div className="flex items-center justify-between gap-2 shrink-0">
                <div className="bg-white px-3 md:px-4 py-1 rounded-full shadow-sm border border-slate-100 font-black text-xs text-slate-400 flex items-center gap-2">
                  Level: <span className="text-green-600">{currentMissionIdx + 1}</span> / {MISSIONS.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={skipToFieldGuide}
                    className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-tighter"
                    title="Skip to Field Guide"
                  >
                    <BookOpen size={16} />
                    <span>Field Guide</span>
                  </button>
                </div>
              </div>

              <header className="bg-white p-3 md:p-6 rounded-[26px] md:rounded-[35px] shadow-md border-b-4 border-green-200 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="bg-blue-100 p-2 md:p-3 rounded-2xl text-blue-600 shrink-0">
                    <Search size={24} />
                  </div>
                  <div className="text-left min-w-0">
                    <h2 className="text-lg md:text-4xl font-black text-slate-800 leading-tight uppercase tracking-tight break-words">{currentMission.instruction}</h2>
                    <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mt-1">Digital Training Phase</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSpeak(currentMission.audioText)}
                  className={`p-2 md:p-4 rounded-full shadow-lg transition-all shrink-0 ${isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  title="Play Audio"
                >
                  {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </header>

              <div className="flex-[2.7] md:flex-[3] grid grid-cols-2 gap-2 md:gap-4 min-h-0">
                <div id="zone-left" className={`drop-zone bg-blue-50 border-blue-200 shadow-inner flex flex-col min-h-0 ${allSorted ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 shrink-0">
                    <span className="text-3xl md:text-4xl drop-shadow-sm">{currentMission.leftIcon}</span>
                    <span className="text-base md:text-xl font-black text-blue-700 uppercase leading-none">{currentMission.leftLabel}</span>
                  </div>
                  <div className="flex-grow overflow-y-auto p-2 md:p-4">
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center content-start">
                      {Object.entries(sortedItems)
                        .filter(([_, cat]) => cat === 'left')
                        .map(([id]) => (
                          <motion.div 
                            key={id} 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-4xl md:text-5xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-2xl shadow-sm border-2 border-blue-100 shrink-0"
                          >
                            {currentMission.items.find(i => i.id === id)?.emoji}
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </div>

                <div id="zone-right" className={`drop-zone bg-orange-50 border-orange-200 shadow-inner flex flex-col min-h-0 ${allSorted ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 shrink-0">
                    <span className="text-3xl md:text-4xl drop-shadow-sm">{currentMission.rightIcon}</span>
                    <span className="text-base md:text-xl font-black text-orange-700 uppercase leading-none">{currentMission.rightLabel}</span>
                  </div>
                  <div className="flex-grow overflow-y-auto p-2 md:p-4">
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center content-start">
                      {Object.entries(sortedItems)
                        .filter(([_, cat]) => cat === 'right')
                        .map(([id]) => (
                          <motion.div 
                            key={id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-4xl md:text-5xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-2xl shadow-sm border-2 border-orange-100 shrink-0"
                          >
                            {currentMission.items.find(i => i.id === id)?.emoji}
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showWrongDropCue && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    className="mx-auto w-full max-w-md rounded-3xl border-b-4 border-red-200 bg-red-50 px-6 py-3 shadow-md shrink-0"
                  >
                    <div className="flex items-center justify-center text-5xl md:text-6xl">
                      <motion.span
                        initial={{ scale: 0.9 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.4 }}
                        className="drop-shadow-sm text-red-500"
                      >
                        🤔
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-[1.25] md:flex-1 bg-white p-2 md:p-4 rounded-[24px] md:rounded-[35px] shadow-inner border-2 border-slate-100 flex justify-center items-center shrink-0 relative z-10 min-h-[11.5rem] md:min-h-0">
                {!allSorted ? (
                  <div
                    className={`w-full justify-items-center content-center gap-2 md:gap-4 ${
                      currentMission.items.length === 4 ? 'grid grid-cols-2' : 'grid grid-cols-3'
                    } md:flex md:flex-nowrap md:justify-center`}
                  >
                    {unsortedItems.map(item => (
                        <motion.div
                          id={`item-${item.id}`}
                          key={item.id}
                          drag
                          dragSnapToOrigin
                          dragElastic={0.1}
                          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                          whileDrag={{ scale: 1.2, zIndex: 100, cursor: 'grabbing' }}
                          onDragEnd={(_, info) => {
                            const x = info.point.x;
                            const leftZone = document.getElementById('zone-left')?.getBoundingClientRect();
                            const rightZone = document.getElementById('zone-right')?.getBoundingClientRect();
                            if (leftZone && x >= leftZone.left && x <= leftZone.right) handleDrop(item.id, 'left');
                            else if (rightZone && x >= rightZone.left && x <= rightZone.right) handleDrop(item.id, 'right');
                          }}
                          className="text-5xl md:text-6xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center bg-white rounded-2xl shadow-lg border-2 border-slate-50 cursor-grab shrink-0 touch-none select-none"
                        >
                          {item.emoji}
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <button onClick={nextMission} className="btn-primary flex items-center gap-3 text-2xl md:text-3xl py-4 md:py-6 px-10">
                      NEXT TRAINING <ArrowRight />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'field-guide' && currentFieldMission && (
          <motion.div 
            key="field-guide"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="flex-grow flex flex-col gap-3 md:gap-4 h-full min-h-0"
          >
            <div className="field-guide-shell relative bg-white p-2 sm:p-3 md:p-4 rounded-[28px] md:rounded-[40px] shadow-lg border-2 border-slate-100 flex flex-col flex-grow overflow-hidden gap-2 md:gap-3 border-t-8 border-t-yellow-400 h-full min-h-0">
              <header className="field-guide-header grid grid-cols-[auto_1fr_auto] items-center gap-2 md:gap-4 shrink-0">
                <div className="field-guide-icon p-2 md:p-3 bg-yellow-50 rounded-3xl text-yellow-600">
                  <span className="field-guide-icon-emoji text-3xl md:text-6xl drop-shadow-sm">{currentFieldMission.icon}</span>
                </div>
                <div className="text-left min-w-0">
                  <div className="field-guide-meta flex items-center gap-2 mb-1">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Field Log 📔</h3>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mission {currentFieldIdx + 1} of {shuffledFieldMissions.length}</span>
                  </div>
                  <h2 className="field-guide-title text-base md:text-xl font-black text-slate-800 leading-tight uppercase">MISSION: FIND IT!</h2>
                  <p className="field-guide-task text-sm md:text-lg font-bold text-blue-600 leading-tight">{currentFieldMission.task}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={backToStart}
                    className="bg-white p-2.5 md:p-3 rounded-full shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors active:scale-95"
                    title="Back to Start"
                    aria-label="Back to Start"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button 
                    onClick={() => handleSpeak(currentFieldMission.audioText)}
                    className={`field-guide-audio p-3 md:p-5 min-w-12 min-h-12 md:min-w-16 md:min-h-16 rounded-full shadow-lg border-2 border-white transition-all ${isSpeaking ? 'bg-red-500 text-white animate-pulse scale-105' : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'}`}
                    title={isSpeaking ? 'Stop audio' : 'Play audio'}
                    aria-label={isSpeaking ? 'Stop audio' : 'Play audio'}
                  >
                    {isSpeaking ? <VolumeX size={28} /> : <Volume2 size={28} />}
                  </button>
                </div>
              </header>

              <div className="drawing-stage flex-1 min-h-0">
                <DrawingCanvas 
                  initialImage={fieldDrawings[currentFieldMission.id]}
                  onDraw={() => setHasDrawn(true)} 
                  onSave={(data) => setFieldDrawings(prev => ({ ...prev, [currentFieldMission.id]: data }))}
                />
              </div>

              <footer className="field-guide-footer flex gap-2 md:gap-3 shrink-0">
                <button 
                  onClick={prevFieldMission}
                  className={`bg-slate-100 text-slate-500 px-4 md:px-7 rounded-[18px] md:rounded-[25px] font-black text-lg md:text-2xl shadow active:scale-95 transition-transform ${currentFieldIdx === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                >
                  ◀
                </button>
                <button 
                  onClick={nextFieldMission}
                  className={`flex-grow bg-green-500 text-white py-2.5 md:py-4 rounded-[18px] md:rounded-[25px] font-black text-sm md:text-xl shadow-xl active:scale-95 transition-transform border-b-6 border-green-700 ${(!hasDrawn && !fieldDrawings[currentFieldMission.id]) ? 'opacity-50 grayscale' : ''}`}
                >
                  I FOUND IT! ➔
                </button>
                <button 
                  onClick={() => {
                    const currentDrawing = fieldDrawings[currentFieldMission.id];
                    if (!currentDrawing && !hasDrawn) {
                      handleSpeak("Scientist! Don't forget to draw what you found in your field guide!");
                      return;
                    }
                    if (currentFieldIdx < shuffledFieldMissions.length - 1) {
                      setCurrentFieldIdx(prev => prev + 1);
                      setHasDrawn(false);
                    }
                  }}
                  className={`bg-slate-100 text-slate-500 px-4 md:px-7 rounded-[18px] md:rounded-[25px] font-black text-lg md:text-2xl shadow active:scale-95 transition-transform ${currentFieldIdx === shuffledFieldMissions.length - 1 ? 'opacity-30 pointer-events-none' : ''}`}
                >
                  ▶
                </button>
              </footer>
            </div>
          </motion.div>
        )}

        {gameState === 'celebration' && (
          <motion.div 
            key="celebration"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-grow flex flex-col items-center justify-center text-center gap-8"
          >
            <div className="relative">
              <div className="text-[14rem] animate-bounce-gentle">🏆</div>
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-[140%] h-[140%] bg-yellow-200/50 rounded-full blur-3xl animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-8xl font-black text-slate-800 tracking-tight">Master Zoologist!</h1>
              <p className="text-4xl font-medium text-slate-500">You explored the world and filled your guide!</p>
            </div>
            <button 
              onClick={() => {
                setCurrentMissionIdx(0);
                setCurrentFieldIdx(0);
                setSortedItems({});
                setGameState('start');
              }}
              className="btn-primary text-4xl px-16 py-8 flex items-center gap-4 mt-8"
            >
              <RotateCcw size={40} /> PLAY AGAIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
