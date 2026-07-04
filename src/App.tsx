import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Image as ImageIcon, 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  Download, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  GraduationCap, 
  Sparkles, 
  Compass, 
  FileText, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Bookmark,
  Award,
  BookMarked
} from "lucide-react";
import { EDITORIALS, PAINTINGS, Editorial, Painting } from "./data";

export default function App() {
  
  // Page state
  // Page 1: Cover Page
  // Page 2: Table of Contents
  // Page 3: Editorial 1 ("The Fragile Shield...")
  // Page 4: Painting 1 ("Shattered Crests")
  // Page 5: Editorial 2 ("The Quantum Threat...")
  // Page 6: Painting 2 ("Whispering Skies")
  // ...
  // Page 17: Editorial 8 ("The Symbiotic Nexus...")
  // Page 18: Painting 8 ("Primeval Whispers")
  // Page 19: Back Cover / Epilogue
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAutoFlipping, setIsAutoFlipping] = useState<boolean>(false);
  const [hoveredCorner, setHoveredCorner] = useState<"left" | "right" | null>(null);

  // 3D Flip state parameters
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward">("forward");
  const [flipOldPage, setFlipOldPage] = useState<number>(1);

  // PDF Modal Reader State
  const [activePdfEditorial, setActivePdfEditorial] = useState<Editorial | null>(null);
  const [pdfZoom, setPdfZoom] = useState<number>(100); // 80%, 100%, 120%
  const [pdfActiveSection, setPdfActiveSection] = useState<number>(0);
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [pdfSidebarOpen, setPdfSidebarOpen] = useState<boolean>(true);

  // Dropdowns in header
  const [editorialsDropdownOpen, setEditorialsDropdownOpen] = useState<boolean>(false);
  const [galleryDropdownOpen, setGalleryDropdownOpen] = useState<boolean>(false);

  // Touch coordinates
  const touchStartX = useRef<number>(0);

  // Check screen size
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Keyboard Navigation (Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePdfEditorial) return; // ignore when reader is open
      if (e.key === "ArrowRight") {
        turnPageNext();
      } else if (e.key === "ArrowLeft") {
        turnPagePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, isMobile, isAutoFlipping, activePdfEditorial]);

  // Synthesize realistic page flip sound using Web Audio API
  const playPageFlipSound = () => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const bufferSize = ctx.sampleRate * 0.35; // 0.35 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Synthesize pink noise + soft crackle for paper friction
      for (let i = 0; i < bufferSize; i++) {
        const progress = i / bufferSize;
        const noise = Math.random() * 2 - 1;
        // Exponential decay envelope
        const envelope = Math.pow(1 - progress, 2.5);
        // Add crackle spikes
        const crackle = Math.random() > 0.98 ? (Math.random() * 0.5) : 0;
        data[i] = (noise * 0.4 + crackle) * envelope;
      }
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      // Sweep lowpass filter down to simulate heavy paper movement
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.3);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      source.start();
    } catch (e) {
      console.warn("Web Audio API not allowed or supported yet.", e);
    }
  };

  // Turn page helpers
  const turnPageNext = () => {
    if (isFlipping || isAutoFlipping) return;
    const maxPage = 19;
    let nextPage = currentPage;
    if (isMobile) {
      if (currentPage < maxPage) {
        nextPage = currentPage + 1;
      }
    } else {
      // Desktop spreads: page index goes from 1 (Cover) -> 2 (Spread 2-3) -> 4 (Spread 4-5) etc.
      if (currentPage === 1) {
        nextPage = 2;
      } else if (currentPage < 18) {
        nextPage = currentPage + 2;
      }
    }

    if (nextPage !== currentPage) {
      playPageFlipSound();
      setFlipOldPage(currentPage);
      setFlipDirection("forward");
      setIsFlipping(true);
      setCurrentPage(nextPage);
    }
  };

  const turnPagePrev = () => {
    if (isFlipping || isAutoFlipping) return;
    let prevPageNum = currentPage;
    if (isMobile) {
      if (currentPage > 1) {
        prevPageNum = currentPage - 1;
      }
    } else {
      if (currentPage === 2) {
        prevPageNum = 1;
      } else if (currentPage > 2) {
        prevPageNum = currentPage - 2;
      }
    }

    if (prevPageNum !== currentPage) {
      playPageFlipSound();
      setFlipOldPage(currentPage);
      setFlipDirection("backward");
      setIsFlipping(true);
      setCurrentPage(prevPageNum);
    }
  };

  // Automated Sequential Flipping or direct premium flip to target page index
  const animateFlipToPage = (targetPage: number) => {
    if (isFlipping || isAutoFlipping) return;
    
    // Normalize target spread start for desktop
    let target = targetPage;
    if (!isMobile) {
      if (targetPage > 1 && targetPage % 2 !== 0) {
        target = targetPage - 1; // Align to left page of spread
      }
    }

    if (target === currentPage) return;
    
    setEditorialsDropdownOpen(false);
    setGalleryDropdownOpen(false);

    // Play sound and trigger the premium 3D page flip directly!
    playPageFlipSound();
    setFlipOldPage(currentPage);
    setFlipDirection(target > currentPage ? "forward" : "backward");
    setIsFlipping(true);
    setCurrentPage(target);
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        turnPageNext();
      } else {
        turnPagePrev();
      }
    }
  };

  // PDF download simulation
  const triggerPdfDownload = (fileName: string) => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      window.print(); // Print to PDF is the best way to download fully formatted documents in real-time!
    }, 1200);
  };

  const scrollToPdfSection = (idx: number) => {
    setPdfActiveSection(idx);
    const targetId = idx === 0 ? "pdf-sec-intro" : `pdf-sec-${idx}`;
    const element = document.getElementById(targetId);
    const container = document.getElementById("pdf-scroll-container");
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({
        top: relativeTop - 20, // 20px padding offset
        behavior: "smooth"
      });
    }
  };

  // Map absolute page numbers to visual spreads
  // Desktop Spreads:
  // Spread 0: [desk, Cover (Page 1)]
  // Spread 1: [TOC (Page 2), Editorial 1 (Page 3)]
  // Spread 2: [Painting 1 (Page 4), Editorial 2 (Page 5)]
  // Spread 3: [Painting 2 (Page 6), Editorial 3 (Page 7)]
  // Spread 4: [Painting 3 (Page 8), Editorial 4 (Page 9)]
  // Spread 5: [Painting 4 (Page 10), Editorial 5 (Page 11)]
  // Spread 6: [Painting 5 (Page 12), Editorial 6 (Page 13)]
  // Spread 7: [Painting 6 (Page 14), Editorial 7 (Page 15)]
  // Spread 8: [Painting 7 (Page 16), Editorial 8 (Page 17)]
  // Spread 9: [Painting 8 (Page 18), Back Cover (Page 19)]
  
  const getLeftPageNum = () => {
    if (currentPage === 1) return null;
    return currentPage % 2 === 0 ? currentPage : currentPage - 1;
  };

  const getRightPageNum = () => {
    if (currentPage === 1) return 1;
    const left = getLeftPageNum();
    return left ? left + 1 : null;
  };

  // Render individual page content
  const renderPageContent = (pageNum: number) => {
    if (pageNum === 1) {
      // Cover Page
      return (
        <div id="page-cover" className="h-full flex flex-col justify-between p-8 md:p-12 text-center relative select-none">
          {/* Cover decorative border */}
          <div className="absolute inset-4 border-2 border-brass/30 pointer-events-none rounded-sm"></div>
          <div className="absolute inset-5 border border-brass/10 pointer-events-none rounded-sm"></div>
          
          <div className="mt-6 flex flex-col items-center">
            <span className="font-sans text-xs tracking-widest text-brass font-semibold uppercase">High-School Science Society</span>
            <div className="flex items-center gap-2 mt-3 text-brass">
              <span className="h-[1px] w-8 bg-brass-light/40"></span>
              <GraduationCap className="h-5 w-5" />
              <span className="h-[1px] w-8 bg-brass-light/40"></span>
            </div>
          </div>

          <div className="my-auto flex flex-col items-center">
            {/* Elegant Vintage Heading */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-leather tracking-widest leading-tight">
              KRITHATHMIKA
            </h1>
            <p className="font-serif italic text-base md:text-lg text-brass mt-3 font-medium">
              "The Awakened Mind"
            </p>
            <div className="w-16 h-[2px] bg-brass my-6"></div>
            <p className="font-sans text-xs uppercase tracking-widest text-leather/80 font-medium">
              First Digital Edition • Vol. I
            </p>
            <p className="font-serif text-sm italic text-leather/60 mt-2">
              Published in affiliation with the Science Department
            </p>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <div className="flex gap-4 items-center justify-center text-xs text-brass-light font-semibold tracking-wider uppercase">
              <span>ESTD. 2026</span>
              <span className="text-brass/40">•</span>
              <span>JULY ISSUE</span>
            </div>
            <p className="text-[10px] text-leather/40 mt-4 uppercase tracking-widest">
              Tap / Click edge or use Arrow Keys to open
            </p>
            <motion.div 
              animate={{ x: [0, 5, 0] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-2 text-brass"
            >
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>
      );
    }

    if (pageNum === 2) {
      // Table of Contents
      return (
        <div id="page-toc" className="h-full flex flex-col p-6 md:p-8 relative justify-between">
          <div className="absolute inset-4 border border-brass/10 pointer-events-none rounded-sm"></div>
          
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-brass/20">
              <span className="font-display text-xs tracking-wider text-brass">Contents</span>
              <span className="font-sans text-[10px] uppercase text-leather/50">Krithathmika • Vol. I</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-leather mt-6 mb-8 text-center tracking-widest">
              INDEX OF WORKS
            </h2>

            {/* Editorial list */}
            <div className="space-y-4">
              <h3 className="font-sans text-[11px] font-bold text-brass uppercase tracking-widest border-b border-brass/10 pb-1 mb-3 flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Editorial Corner (Papers)
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {EDITORIALS.map((ed) => {
                  const targetPage = ed.id * 2 + 1; // page index map
                  return (
                    <button 
                      key={ed.id}
                      onClick={() => animateFlipToPage(targetPage)}
                      className="text-left group flex items-start justify-between p-1.5 rounded hover:bg-brass-light/5 transition"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-serif text-xs font-semibold text-leather group-hover:text-brass transition line-clamp-1">
                          {ed.id}. {ed.title}
                        </p>
                        <p className="text-[10px] text-leather/50 line-clamp-1">{ed.author} • {ed.subject}</p>
                      </div>
                      <span className="font-serif text-xs text-brass group-hover:font-bold transition">p. {targetPage}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine arts gallery list */}
            <div className="space-y-4 mt-8">
              <h3 className="font-sans text-[11px] font-bold text-brass uppercase tracking-widest border-b border-brass/10 pb-1 mb-3 flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3" /> Fine Arts Gallery (Paintings)
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {PAINTINGS.map((p) => {
                  const targetPage = p.id * 2 + 2; // page index map
                  return (
                    <button 
                      key={p.id}
                      onClick={() => animateFlipToPage(targetPage)}
                      className="text-left group flex items-start justify-between p-1.5 rounded hover:bg-brass-light/5 transition"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-serif text-xs font-semibold text-leather group-hover:text-brass transition line-clamp-1">
                          🎨 {p.title}
                        </p>
                        <p className="text-[10px] text-leather/50 line-clamp-1">by {p.artist} ({p.grade})</p>
                      </div>
                      <span className="font-serif text-xs text-brass group-hover:font-bold transition">p. {targetPage}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-brass/10 mt-4">
            <p className="font-serif text-[11px] italic text-leather/60">
              "Equipped with his five senses, man explores the universe around him and calls the adventure Science."
            </p>
          </div>
        </div>
      );
    }

    if (pageNum === 19) {
      // Back Cover
      return (
        <div id="page-backcover" className="h-full flex flex-col justify-between p-8 text-center relative select-none">
          <div className="absolute inset-4 border-2 border-brass/30 pointer-events-none rounded-sm"></div>
          
          <div className="mt-8 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-brass/30 flex items-center justify-center text-brass mb-2">
              <Award className="h-6 w-6" />
            </div>
            <span className="font-display text-xs tracking-widest text-leather font-bold">Krithathmika Society</span>
            <p className="text-[9px] text-leather/40 uppercase mt-1">First Digital Edition 2026</p>
          </div>

          <div className="my-auto max-w-sm mx-auto bg-brass-light/5 p-5 rounded border border-brass/10">
            <h4 className="font-display text-sm font-bold text-leather mb-3 tracking-wider">EDITORS &amp; ACKNOWLEDGEMENTS</h4>
            <div className="space-y-2 text-left text-xs text-leather/80">
              <p><strong className="text-leather">Chief Editor:</strong> Hridjay (Grade 11)</p>
              <p><strong className="text-leather">Staff Advisory Board:</strong> Dr. Elizabeth Thomas, Prof. K. G. Rajendran</p>
              <p><strong className="text-leather">Digital Design:</strong> Hridjay &amp; Krithathmika AI Assistants</p>
              <p><strong className="text-leather">Fine Arts Coordinator:</strong> Mrs. Mini Paul</p>
              <p className="text-[10px] text-leather/60 italic mt-4 pt-3 border-t border-brass/10 text-center">
                Special gratitude to our high-school Science and Fine Arts Clubs for providing these remarkable articles and masterworks.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[10px] text-leather/50 uppercase tracking-widest">
              End of First digital edition
            </p>
            <p className="text-[9px] text-leather/40 mt-1">
              © 2026 Krithathmika Science Magazine. All rights reserved.
            </p>
          </div>
        </div>
      );
    }

    // Determine if pageNum belongs to Editorial (odd pages >= 3) or Painting (even pages >= 4)
    if (pageNum % 2 !== 0) {
      // Editorial page (Odd: 3, 5, 7, 9, 11, 13, 15, 17)
      const editorialId = Math.floor((pageNum - 3) / 2) + 1;
      const ed = EDITORIALS.find((e) => e.id === editorialId);
      if (!ed) return <div className="p-8">Page Not Found</div>;

      return (
        <div className="h-full flex flex-col p-6 md:p-8 relative justify-between">
          <div className="absolute inset-4 border border-brass/10 pointer-events-none rounded-sm"></div>

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-brass/20 text-[10px] uppercase text-leather/60 font-semibold tracking-wider">
              <span>{ed.subject}</span>
              <span>Krithathmika • Paper #{ed.id}</span>
            </div>

            {/* Title Block */}
            <div className="mt-5">
              <span className="font-sans text-[10px] font-bold text-brass uppercase tracking-widest bg-brass/5 px-2 py-0.5 rounded">
                Editorial Paper
              </span>
              <h1 className="font-display text-xl md:text-2xl font-bold text-leather leading-tight mt-2.5">
                {ed.title}
              </h1>
              <p className="font-sans text-xs text-brass-light font-semibold mt-1">
                by {ed.author} • {ed.grade}
              </p>
            </div>

            {/* Abstract/Intro paragraph - fully readable */}
            <div className="mt-5 bg-brass-light/5 p-4 rounded border-l-2 border-brass/30">
              <p className="font-serif text-sm italic text-leather/90 leading-relaxed first-letter:text-3xl first-letter:font-display first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-leather">
                {ed.intro}
              </p>
            </div>

            {/* Faded Teaser Block (Threads Ad Preview Style) */}
            <div className="mt-6 relative rounded border border-brass/10 bg-white/40 overflow-hidden shadow-sm">
              <div className="p-4 select-none">
                <h4 className="font-display text-xs font-bold text-brass uppercase tracking-widest mb-1.5">
                  {ed.sections[0].title}
                </h4>
                <p className="font-serif text-xs text-leather/60 leading-relaxed line-clamp-3">
                  {ed.sections[0].paragraphs[0]}
                </p>
              </div>

              {/* White Fade to represent locked preview */}
              <div className="absolute inset-0 bg-gradient-to-t from-parchment via-parchment/65 to-transparent flex flex-col justify-end items-center pb-4">
                <p className="text-[10px] text-leather/50 uppercase font-bold tracking-wider mb-2">
                  Threads of discovery continue...
                </p>
                <button
                  onClick={() => {
                    playPageFlipSound();
                    setActivePdfEditorial(ed);
                    setPdfActiveSection(0);
                    setPdfPage(1);
                  }}
                  className="px-4 py-2 bg-leather hover:bg-brass text-white font-sans text-xs font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition duration-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read Full Article
                </button>
              </div>
            </div>
          </div>

          {/* Page footer */}
          <div className="flex items-center justify-between pt-3 border-t border-brass/10 text-[10px] text-leather/50">
            <span>Ref: {ed.pdfFileName}</span>
            <span className="font-serif italic font-semibold">Page {pageNum}</span>
          </div>
        </div>
      );
    } else {
      // Painting Page (Even: 4, 6, 8, 10, 12, 14, 16, 18)
      const paintingId = Math.floor((pageNum - 4) / 2) + 1;
      const painting = PAINTINGS.find((p) => p.id === paintingId);
      if (!painting) return <div className="p-8">Page Not Found</div>;

      return (
        <div className="h-full flex flex-col p-6 md:p-8 relative justify-between select-none">
          <div className="absolute inset-4 border border-brass/10 pointer-events-none rounded-sm"></div>

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-brass/20 text-[10px] uppercase text-leather/60 font-semibold tracking-wider">
              <span>Creative Showcase</span>
              <span>Krithathmika Fine Arts Club</span>
            </div>

            {/* Gold/Wood Framed Art Canvas */}
            <div className="mt-5 p-2 bg-neutral-900 shadow-xl border-4 border-[#3a2312] rounded-md relative group">
              <div className="absolute inset-0 border border-amber-600/30 pointer-events-none"></div>
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-950 relative">
                <img
                  src={painting.imageUrl}
                  alt={painting.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
            </div>

            {/* Placard Beneath */}
            <div className="mt-5 bg-parchment-dark/30 p-4 border border-brass/15 rounded text-center relative max-w-sm mx-auto shadow-inner">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-parchment border border-brass/20 text-[8px] uppercase tracking-widest text-brass px-2 py-0.5 rounded">
                Exhibit Tag
              </span>
              <h3 className="font-display text-sm font-extrabold text-leather tracking-wide">
                "{painting.title}"
              </h3>
              <p className="font-sans text-[11px] text-brass font-semibold mt-0.5">
                by {painting.artist} • {painting.grade}
              </p>
              <p className="font-serif text-xs text-leather/70 leading-relaxed mt-2.5 italic">
                {painting.description}
              </p>
            </div>
          </div>

          {/* Page footer */}
          <div className="flex items-center justify-between pt-3 border-t border-brass/10 text-[10px] text-leather/50">
            <span>Painting #{painting.id}</span>
            <span className="font-serif italic font-semibold">Page {pageNum}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative select-none text-leather overflow-hidden">
      
      <div className="min-h-screen bg-[#110d0a] flex flex-col">
        {/* Top Banner & Control Header */}
        <header className="bg-leather text-parchment shadow-md border-b border-brass/35 py-3 px-4 md:px-8 flex items-center justify-between relative z-30 no-print select-none">
          <div className="flex items-center gap-3">
            {/* Logo Crest */}
            <button 
              onClick={() => animateFlipToPage(1)} 
              className="flex items-center gap-2.5 text-left hover:opacity-90 transition group"
            >
              <div className="h-9 w-9 rounded-full bg-brass flex items-center justify-center text-parchment border border-brass-light/40 group-hover:scale-105 transition">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-base tracking-widest font-extrabold block">KRITHATHMIKA</span>
                <span className="font-sans text-[10px] tracking-wider text-brass-light block uppercase font-semibold">High-School Science Society</span>
              </div>
            </button>
          </div>

          {/* Dynamic Top Navigation Controls */}
          <div className="flex items-center gap-1 md:gap-4 font-sans text-xs font-semibold uppercase tracking-wider">
          {/* Cover & TOC links */}
          <button 
            onClick={() => animateFlipToPage(1)}
            className="px-2.5 py-1.5 rounded hover:bg-brass/20 text-brass-light hover:text-parchment transition duration-150 cursor-pointer hidden sm:inline"
          >
            Cover
          </button>
          
          <button 
            onClick={() => animateFlipToPage(2)}
            className="px-2.5 py-1.5 rounded hover:bg-brass/20 text-brass-light hover:text-parchment transition duration-150 cursor-pointer flex items-center gap-1"
          >
            <BookMarked className="h-3.5 w-3.5" />
            Index
          </button>

          {/* Editorials Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setEditorialsDropdownOpen(!editorialsDropdownOpen);
                setGalleryDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition duration-150 cursor-pointer ${editorialsDropdownOpen ? "bg-brass/40 text-parchment" : "text-brass-light hover:bg-brass/20 hover:text-parchment"}`}
            >
              <span>Papers</span>
              <ChevronDownIcon className="h-3 w-3" />
            </button>
            <AnimatePresence>
              {editorialsDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setEditorialsDropdownOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 md:w-72 bg-leather border border-brass/40 rounded shadow-xl overflow-hidden z-50 text-left normal-case"
                  >
                    <div className="p-2 border-b border-brass/20 bg-black/20 text-[10px] font-bold text-brass-light uppercase tracking-widest">
                      Scientific Papers
                    </div>
                    <div className="max-h-80 overflow-y-auto py-1">
                      {EDITORIALS.map((ed) => (
                        <button
                          key={ed.id}
                          onClick={() => animateFlipToPage(ed.id * 2 + 1)}
                          className="w-full text-left px-3 py-2 text-xs text-parchment hover:bg-brass hover:text-white transition flex gap-2"
                        >
                          <span className="text-brass-light font-mono text-[10px]">#{ed.id}</span>
                          <span className="line-clamp-2">{ed.title}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Gallery Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setGalleryDropdownOpen(!galleryDropdownOpen);
                setEditorialsDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition duration-150 cursor-pointer ${galleryDropdownOpen ? "bg-brass/40 text-parchment" : "text-brass-light hover:bg-brass/20 hover:text-parchment"}`}
            >
              <span>Gallery</span>
              <ChevronDownIcon className="h-3 w-3" />
            </button>
            <AnimatePresence>
              {galleryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGalleryDropdownOpen(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-leather border border-brass/40 rounded shadow-xl overflow-hidden z-50 text-left normal-case"
                  >
                    <div className="p-2 border-b border-brass/20 bg-black/20 text-[10px] font-bold text-brass-light uppercase tracking-widest">
                      Fine Arts Gallery
                    </div>
                    <div className="max-h-80 overflow-y-auto py-1">
                      {PAINTINGS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => animateFlipToPage(p.id * 2 + 2)}
                          className="w-full text-left px-3 py-2 text-xs text-parchment hover:bg-brass hover:text-white transition flex gap-2"
                        >
                          <span className="text-brass-light font-mono text-[10px]">#{p.id}</span>
                          <span className="line-clamp-1">{p.title}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Sound toggle */}
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="p-1.5 rounded hover:bg-brass/20 text-brass-light hover:text-white transition cursor-pointer"
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Container Stage - Desk surface */}
      <main 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex flex-col justify-center items-center p-4 md:p-6 select-none relative z-10 no-print"
      >
        <div className="w-full max-w-5xl flex flex-col items-center justify-center gap-6">
          
          {/* Magazine Book Container */}
          <div className="relative w-full aspect-[4/5] md:aspect-[1.4/1] bg-paper-shadow rounded-lg overflow-visible shadow-2xl flex items-center justify-center">
            
            {/* Skeuomorphic Leather/Wood Outer Cover backer */}
            <div className="absolute inset-y-0 w-[101.5%] bg-[#1c120a] rounded-lg -z-10 shadow-2xl border-l border-r border-[#2d1d11] book-spine"></div>
            
            {/* The double-page paper spread with 3D perspective and flip capabilities */}
            <div 
              className="w-full h-full bg-[#fbf8f3] rounded-md overflow-hidden relative flex flex-col md:flex-row select-none"
              style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
            >
              {(() => {
                const getLeftPageNumFor = (p: number) => {
                  if (p === 1) return null;
                  return p % 2 === 0 ? p : p - 1;
                };

                const getRightPageNumFor = (p: number) => {
                  if (p === 1) return 1;
                  const left = getLeftPageNumFor(p);
                  return left ? left + 1 : null;
                };

                const renderLeftLeatherLining = () => (
                  <div className="h-full w-full flex flex-col justify-center items-center bg-[#21160e] p-8 select-none relative">
                    <div className="absolute inset-4 border border-brass/10 pointer-events-none rounded-sm"></div>
                    <span className="font-display text-[10px] tracking-widest text-brass/45 uppercase font-semibold text-center">
                      Krithathmika School Science Club
                    </span>
                    <div className="mt-8 opacity-25">
                      <Compass className="h-20 w-20 text-brass" />
                    </div>
                  </div>
                );

                const renderLeftOrLeather = (pageNum: number | null) => {
                  if (pageNum === null) return renderLeftLeatherLining();
                  return renderPageContent(pageNum);
                };

                if (isMobile) {
                  // --- Mobile View: Single Page Layout with 3D Turn ---
                  return (
                    <div className="w-full h-full relative page-texture p-1 overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
                      {/* Underneath page content */}
                      {renderPageContent(currentPage)}

                      {/* Moving turning page overlay */}
                      {isFlipping && (
                        <motion.div
                          key={`mobile-flip-${flipOldPage}-${currentPage}`}
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: flipDirection === "forward" ? -180 : 180 }}
                          transition={{ duration: 0.55, ease: "easeInOut" }}
                          onAnimationComplete={() => setIsFlipping(false)}
                          style={{
                            position: "absolute",
                            inset: 0,
                            transformOrigin: flipDirection === "forward" ? "left center" : "right center",
                            transformStyle: "preserve-3d",
                            zIndex: 40,
                          }}
                        >
                          {/* Front face (old page) */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transformStyle: "preserve-3d",
                            }}
                            className="page-texture p-1"
                          >
                            {renderPageContent(flipOldPage)}
                          </div>

                          {/* Back face (new page) */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: flipDirection === "forward" ? "rotateY(180deg)" : "rotateY(-180deg)",
                              transformStyle: "preserve-3d",
                            }}
                            className="page-texture p-1"
                          >
                            {renderPageContent(currentPage)}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                } else {
                  // --- Desktop View: Dual Page Layout with full 3D Leaf Turn ---
                  // Calculate what static background pages should render behind the moving flip leaf
                  const leftPageStatic = isFlipping
                    ? (flipDirection === "forward" ? getLeftPageNumFor(flipOldPage) : getLeftPageNumFor(currentPage))
                    : getLeftPageNum();

                  const rightPageStatic = isFlipping
                    ? (flipDirection === "forward" ? getRightPageNumFor(currentPage) : getRightPageNumFor(flipOldPage))
                    : getRightPageNum();

                  return (
                    <>
                      {/* Static Left Page Background */}
                      <div className="w-1/2 h-full relative page-texture-left border-r border-black/5 p-1" style={{ transformStyle: "preserve-3d" }}>
                        {renderLeftOrLeather(leftPageStatic)}

                        {/* Interactive Bottom Left Turn Area */}
                        {!isFlipping && leftPageStatic !== null && currentPage > 1 && (
                          <div 
                            onMouseEnter={() => setHoveredCorner("left")}
                            onMouseLeave={() => setHoveredCorner(null)}
                            onClick={turnPagePrev}
                            className="absolute bottom-0 left-0 w-16 h-16 cursor-pointer z-20 group"
                            title="Previous page"
                          >
                            <motion.div 
                              className="absolute bottom-0 left-0 w-8 h-8 bg-brass/10 page-fold-corner rounded-tr-lg border-t border-r border-brass/20"
                              animate={{ 
                                width: hoveredCorner === "left" ? 36 : 24, 
                                height: hoveredCorner === "left" ? 36 : 24 
                              }}
                            />
                            <ChevronLeft className="absolute bottom-2 left-2 h-4 w-4 text-brass opacity-40 group-hover:opacity-100 transition" />
                          </div>
                        )}
                      </div>

                      {/* Center Shadow binding effect */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 center-spine-shadow z-20 pointer-events-none"></div>

                      {/* Static Right Page Background */}
                      <div className="w-1/2 h-full relative page-texture p-1" style={{ transformStyle: "preserve-3d" }}>
                        {rightPageStatic !== null && renderPageContent(rightPageStatic)}

                        {/* Interactive Bottom Right Turn Area */}
                        {!isFlipping && currentPage < 18 && (
                          <div 
                            onMouseEnter={() => setHoveredCorner("right")}
                            onMouseLeave={() => setHoveredCorner(null)}
                            onClick={turnPageNext}
                            className="absolute bottom-0 right-0 w-16 h-16 cursor-pointer z-20 group"
                            title="Next page"
                          >
                            <motion.div 
                              className="absolute bottom-0 right-0 w-8 h-8 bg-brass/10 page-fold-corner rounded-tl-lg border-t border-l border-brass/20"
                              style={{ transform: "scaleX(-1)" }}
                              animate={{ 
                                width: hoveredCorner === "right" ? 36 : 24, 
                                height: hoveredCorner === "right" ? 36 : 24 
                              }}
                            />
                            <ChevronRight className="absolute bottom-2 right-2 h-4 w-4 text-brass opacity-40 group-hover:opacity-100 transition" />
                          </div>
                        )}
                      </div>

                      {/* Overlap 3D Turning Leaf Animation */}
                      {isFlipping && (
                        <motion.div
                          key={`desktop-flip-${flipOldPage}-${currentPage}`}
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: flipDirection === "forward" ? -180 : 180 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          onAnimationComplete={() => setIsFlipping(false)}
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            width: "50%",
                            left: flipDirection === "forward" ? "50%" : 0,
                            transformOrigin: flipDirection === "forward" ? "left center" : "right center",
                            transformStyle: "preserve-3d",
                            zIndex: 40,
                          }}
                        >
                          {/* Front Side (facing initially) */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transformStyle: "preserve-3d",
                            }}
                            className={flipDirection === "forward" ? "page-texture p-1 border-l border-black/5" : "page-texture-left p-1 border-r border-black/5"}
                          >
                            {flipDirection === "forward"
                              ? (getRightPageNumFor(flipOldPage) !== null && renderPageContent(getRightPageNumFor(flipOldPage)!))
                              : renderLeftOrLeather(getLeftPageNumFor(flipOldPage))
                            }
                          </div>

                          {/* Back Side (revealed when flipped past 90 degrees) */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: flipDirection === "forward" ? "rotateY(180deg)" : "rotateY(-180deg)",
                              transformStyle: "preserve-3d",
                            }}
                            className={flipDirection === "forward" ? "page-texture-left p-1 border-r border-black/5" : "page-texture p-1 border-l border-black/5"}
                          >
                            {flipDirection === "forward"
                              ? renderLeftOrLeather(getLeftPageNumFor(currentPage))
                              : (getRightPageNumFor(currentPage) !== null && renderPageContent(getRightPageNumFor(currentPage)!))
                            }
                          </div>
                        </motion.div>
                      )}
                    </>
                  );
                }
              })()}
            </div>
          </div>

          {/* Quick Page Navigation Footer bar */}
          <div className="flex items-center justify-between w-full max-w-sm px-4 py-2 bg-leather/85 rounded-full border border-brass/40 shadow-lg text-parchment font-sans text-xs select-none">
            <button 
              onClick={turnPagePrev}
              disabled={currentPage <= 1 || isAutoFlipping}
              className="p-1.5 rounded-full hover:bg-brass disabled:opacity-30 disabled:hover:bg-transparent transition duration-150 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <span className="font-semibold text-brass-light tracking-wide uppercase">
              {currentPage === 1 ? "Cover Page" : `Spread ${Math.floor(currentPage / 2) + 1} of 9 (Pages ${currentPage === 19 ? "18-19" : `${currentPage}-${currentPage + 1}`})`}
            </span>

            <button 
              onClick={turnPageNext}
              disabled={currentPage >= 19 || isAutoFlipping}
              className="p-1.5 rounded-full hover:bg-brass disabled:opacity-30 disabled:hover:bg-transparent transition duration-150 cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>

      {/* --- IMMERSIVE FULL PDF SCIENTIFIC READER OVERLAY --- */}
      <AnimatePresence>
        {activePdfEditorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-2 md:p-6 no-print overflow-hidden font-sans"
          >
            {/* Main Fullscreen Reader Shell */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#faf6f0] w-full max-w-6xl h-[94vh] rounded-lg shadow-2xl border-4 border-[#332211] overflow-hidden flex flex-col relative"
            >
              {/* PDF Header bar */}
              <div className="bg-[#2a1b10] text-parchment px-4 py-3 border-b border-brass/40 flex items-center justify-between select-none">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-red-800 rounded flex items-center justify-center font-bold text-xs shadow">
                    PDF
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs tracking-wider line-clamp-1">
                      {activePdfEditorial.pdfFileName}
                    </h3>
                    <p className="text-[9px] text-brass-light font-mono uppercase tracking-widest mt-0.5">
                      Krithathmika Digital Archive • Secure Access
                    </p>
                  </div>
                </div>

                {/* Desktop Reader controls */}
                <div className="flex items-center gap-1.5 md:gap-4 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center bg-black/35 rounded border border-brass/25 px-1 py-0.5">
                    <button 
                      onClick={() => setPdfZoom(Math.max(80, pdfZoom - 10))} 
                      className="p-1.5 hover:text-brass-light cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-[10px] text-brass-light px-1 select-none">{pdfZoom}%</span>
                    <button 
                      onClick={() => setPdfZoom(Math.min(130, pdfZoom + 10))} 
                      className="p-1.5 hover:text-brass-light cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => triggerPdfDownload(activePdfEditorial.pdfFileName)}
                    disabled={isDownloading}
                    className="px-3 py-1.5 bg-brass hover:bg-brass-light rounded flex items-center gap-1.5 transition text-[10px] font-bold cursor-pointer disabled:opacity-40"
                  >
                    {isDownloading ? (
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Download
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-2 hover:bg-brass/20 rounded text-brass-light hover:text-white transition cursor-pointer hidden sm:inline-block"
                    title="Print Document"
                  >
                    <Printer className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setActivePdfEditorial(null)}
                    className="p-2 bg-red-950 hover:bg-red-800 rounded transition border border-red-700 cursor-pointer"
                    title="Close Reader"
                  >
                    <X className="h-4 w-4 text-red-200" />
                  </button>
                </div>
              </div>

              {/* Reader Main Section (Sidebar + Content Workspace) */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* PDF Sidebar (Table of Contents of the paper) */}
                {pdfSidebarOpen && (
                  <div className="w-56 md:w-64 bg-[#1f130a] border-r border-brass/25 text-parchment p-3 select-none flex flex-col justify-between hidden md:flex">
                    <div>
                      <h4 className="font-display text-[10px] font-extrabold tracking-widest text-brass uppercase border-b border-brass/15 pb-2 mb-3">
                        DOCUMENT OUTLINE
                      </h4>
                      <div className="space-y-1 overflow-y-auto max-h-[50vh]">
                        <button
                          onClick={() => scrollToPdfSection(0)}
                          className={`w-full text-left p-2 rounded text-xs transition duration-150 flex items-start gap-1.5 ${pdfActiveSection === 0 ? "bg-brass/40 text-white font-semibold" : "text-brass-light/80 hover:bg-brass/10 hover:text-white"}`}
                        >
                          <Bookmark className="h-3.5 w-3.5 mt-0.5" />
                          <span>Abstract &amp; Introduction</span>
                        </button>
                        {activePdfEditorial.sections.map((sec, idx) => (
                          <button
                            key={idx}
                            onClick={() => scrollToPdfSection(idx + 1)}
                            className={`w-full text-left p-2 rounded text-xs transition duration-150 flex items-start gap-1.5 ${pdfActiveSection === idx + 1 ? "bg-brass/40 text-white font-semibold" : "text-brass-light/80 hover:bg-brass/10 hover:text-white"}`}
                          >
                            <Bookmark className="h-3.5 w-3.5 mt-0.5" />
                            <span>{sec.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/35 p-3 rounded border border-brass/15 text-[10px] text-brass-light">
                      <p className="font-semibold text-parchment mb-1 uppercase tracking-wider">Krithathmika Library</p>
                      <p className="leading-relaxed">This scientific paper has been thoroughly audited by high-school research faculty.</p>
                      <div className="mt-2.5 flex items-center gap-1 text-green-500 font-bold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>VERIFIED DOCUMENT</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content Workspace (Simulated physical PDF page) */}
                <div 
                  id="pdf-scroll-container" 
                  className="flex-1 overflow-y-auto bg-neutral-800 p-4 md:p-8 flex justify-center items-start scrollbar-thin scroll-smooth"
                >
                  <div 
                    style={{ fontSize: `${pdfZoom}%` }}
                    className="bg-white text-neutral-900 w-full max-w-3xl p-8 md:p-14 shadow-2xl rounded border border-neutral-300 relative font-serif text-sm leading-relaxed"
                  >
                    {/* Page header decorations (Skeuomorphic PDF header) */}
                    <div className="absolute top-4 inset-x-8 md:inset-x-14 flex items-center justify-between pb-2 border-b border-neutral-300 text-[10px] font-sans text-neutral-400 select-none uppercase tracking-widest">
                      <span>Krithathmika Journal of Secondary Science</span>
                      <span>Vol. I, July 2026</span>
                    </div>

                    {/* PDF Title Header block */}
                    <div id="pdf-sec-intro" className="pt-6 mb-8">
                      <span className="font-sans text-[10px] font-extrabold tracking-widest text-red-800 uppercase block mb-1">
                        Research Article / High-School Submission
                      </span>
                      <h1 className="font-display font-extrabold text-2xl md:text-3xl text-neutral-950 leading-tight">
                        {activePdfEditorial.title}
                      </h1>
                      <p className="font-sans font-semibold text-xs text-neutral-500 mt-2">
                        Author: {activePdfEditorial.author} • Submitted by {activePdfEditorial.grade}
                      </p>
                      <p className="font-sans text-[11px] text-neutral-400 mt-0.5">
                        Department: {activePdfEditorial.subject}
                      </p>

                      <div className="h-[2px] bg-neutral-900 my-6"></div>

                      {/* Beautifully stylized scientific Abstract */}
                      <div className="border border-neutral-300 bg-neutral-50 p-5 rounded italic mb-8">
                        <span className="font-sans not-italic font-bold text-xs text-neutral-950 uppercase tracking-widest block mb-2">
                          Abstract
                        </span>
                        <p className="text-[12px] text-neutral-700 leading-relaxed">
                          This publication compiles the foundational structures of our investigation regarding {activePdfEditorial.subtitle}. 
                          We review the core natural chemistry or physical dynamics, detail the anthropogenic disruptions or 
                          vulnerabilities, audit the historical milestones, and discuss the pathways for future global secondary-school scientific research.
                        </p>
                      </div>

                      {/* First Section (Abstract & Intro) */}
                      <div className="space-y-4">
                        <h2 className="font-sans font-bold text-base text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-1 mb-4">
                          Introduction
                        </h2>
                        <p className="first-letter:text-4xl first-letter:font-sans first-letter:font-bold first-letter:float-left first-letter:mr-2">
                          {activePdfEditorial.intro}
                        </p>
                        <p>
                          Through the diligent work of our high-school editorial staff and supporting academic coordinators, 
                          this digital edition allows for responsive navigation across these complex topics. 
                          The following segments contain our detailed structural analysis of {activePdfEditorial.subject.toLowerCase()} systems.
                        </p>
                      </div>
                    </div>

                    {/* Subsequent Sections rendered sequentially */}
                    {activePdfEditorial.sections.map((sec, idx) => (
                      <div key={idx} id={`pdf-sec-${idx + 1}`} className="pt-8 mt-8 border-t border-neutral-200 scroll-mt-6">
                        <div className="space-y-4">
                          <h2 className="font-sans font-bold text-base text-neutral-900 uppercase tracking-wide border-b border-neutral-200 pb-1 mb-4">
                            {sec.title}
                          </h2>
                          {sec.paragraphs.map((p, pIdx) => {
                            // Convert raw formulas labeled as "[Equation]" into beautiful equation blocks
                            if (p.startsWith("[Equation]")) {
                              const equationText = p.replace("[Equation]", "").trim();
                              return (
                                <div key={pIdx} className="equation-block font-mono my-4 p-3 bg-neutral-50 border-l-4 border-neutral-700 text-xs text-neutral-800 rounded">
                                  {equationText}
                                </div>
                              );
                            }
                            return (
                              <p key={pIdx} className="text-neutral-800">
                                {p}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* PDF Footer decorations */}
                    <div className="mt-12 pt-4 border-t border-neutral-300 flex items-center justify-between text-[9px] font-sans text-neutral-400 select-none uppercase tracking-widest">
                      <span>Document ID: {activePdfEditorial.pdfFileName}</span>
                      <span>Krithathmika Library Archive</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Footer navigation bar (Continuous reading layout indicators) */}
              <div className="bg-[#2a1b10] text-parchment py-3 px-4 border-t border-brass/40 flex items-center justify-between text-xs font-semibold select-none">
                <span className="text-brass-light tracking-wide uppercase text-[10px] md:text-xs">
                  Continuous Document View • All Sections Loaded
                </span>

                <button
                  onClick={() => {
                    const el = document.getElementById("pdf-scroll-container");
                    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3 py-1.5 bg-brass/30 hover:bg-brass text-white rounded flex items-center gap-1 cursor-pointer transition text-[10px] md:text-xs"
                >
                  Back to Top <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PRISTINE BLACK & WHITE PRINT PAGE DESIGN FOR PRINT-TO-PDF --- */}
      {activePdfEditorial && (
        <div className="hidden print-only font-serif text-sm bg-white text-black p-8">
          <div className="border-b-2 border-black pb-2 mb-6">
            <h1 className="text-xl font-bold uppercase tracking-widest text-center">
              KRITHATHMIKA SCIENCE JOURNAL • VOL I
            </h1>
            <p className="text-center text-xs italic">High-School Secondary Science Submission Archive • Secure Copy</p>
          </div>

          <div className="mb-6">
            <span className="text-xs uppercase font-bold text-neutral-600">RESEARCH PAPER SUBMISSION: {activePdfEditorial.pdfFileName}</span>
            <h2 className="text-2xl font-extrabold text-black mt-2">{activePdfEditorial.title}</h2>
            <p className="text-xs text-neutral-700 mt-1">Submitted by: {activePdfEditorial.author} ({activePdfEditorial.grade})</p>
            <p className="text-xs text-neutral-600">Subject Field: {activePdfEditorial.subject}</p>
          </div>

          <div className="border border-neutral-400 p-4 italic bg-neutral-50 mb-6 text-xs">
            <strong>ABSTRACT:</strong> This document serves as the high-fidelity permanent physical index for {activePdfEditorial.title}. It compiles all stratospheric, atomic, cryptographic, relativistic, oncological, electrochemical, and thermodynamic investigations compiled during the 2026 secondary academic cycle.
          </div>

          <div className="mb-6">
            <h3 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">1. INTRODUCTION</h3>
            <p className="leading-relaxed">{activePdfEditorial.intro}</p>
          </div>

          {activePdfEditorial.sections.map((sec, sIdx) => (
            <div key={sIdx} className="mb-6 page-break-avoid">
              <h3 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{sec.title}</h3>
              {sec.paragraphs.map((p, pIdx) => {
                if (p.startsWith("[Equation]")) {
                  return (
                    <div key={pIdx} className="font-mono my-4 p-3 bg-neutral-100 border-l-4 border-black text-xs">
                      {p.replace("[Equation]", "").trim()}
                    </div>
                  );
                }
                return <p key={pIdx} className="leading-relaxed mb-3">{p}</p>;
              })}
            </div>
          ))}

          <div className="border-t border-black pt-4 mt-8 text-center text-xs">
            <p>© 2026 Krithathmika Science Society. This physical output serves as certified secondary-school academic reference.</p>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple internal helper component for dropdown icon
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
