import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Search, 
  Award, 
  FileText, 
  Image as ImageIcon, 
  BookOpen, 
  Filter, 
  Calendar, 
  User, 
  Maximize2, 
  ChevronRight, 
  Compass, 
  BookMarked, 
  Sparkles, 
  ChevronUp,
  ZoomIn,
  ZoomOut,
  X,
  Volume2,
  VolumeX,
  ArrowRight
} from "lucide-react";
import { Editorial, Painting, EDITORIALS, PAINTINGS } from "../data";

interface WebsiteViewProps {
  onOpenEditorial: (ed: Editorial) => void;
  onSwitchToFlipbook: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function WebsiteView({ 
  onOpenEditorial, 
  onSwitchToFlipbook, 
  isMuted, 
  onToggleMute 
}: WebsiteViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [activePainting, setActivePainting] = useState<Painting | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(100);

  // Extract unique subject categories for filters
  const subjects = useMemo(() => {
    const subs = new Set<string>();
    EDITORIALS.forEach(ed => subs.add(ed.subject));
    return ["All", ...Array.from(subs)];
  }, []);

  // Filtered Editorials
  const filteredEditorials = useMemo(() => {
    return EDITORIALS.filter(ed => {
      const matchesSearch = 
        ed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ed.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ed.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ed.intro.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = selectedSubject === "All" || ed.subject === selectedSubject;
      
      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, selectedSubject]);

  // Smooth scroll to element
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-950">
      
      {/* Premium Header Nav */}
      <header className="sticky top-0 z-30 bg-[#1e130c] border-b border-[#3d2414] text-stone-100 px-4 py-3 shadow-lg select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 text-left hover:opacity-90 transition group"
            id="brand-logo"
          >
            <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center text-stone-100 border border-amber-400/40 group-hover:scale-105 transition">
              <Award className="h-5.5 w-5.5 text-stone-100" />
            </div>
            <div>
              <span className="font-serif text-lg tracking-widest font-bold block text-amber-100 leading-none">KRITHATHMIKA</span>
              <span className="font-sans text-[10px] tracking-wider text-amber-400/80 block uppercase font-semibold mt-0.5">High-School Science Society</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-bold text-stone-300">
            <button 
              onClick={() => scrollToId("intro-welcome")} 
              className="hover:text-amber-300 transition duration-150 cursor-pointer"
            >
              Overview
            </button>
            <button 
              onClick={() => scrollToId("research-library")} 
              className="hover:text-amber-300 transition duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Papers
            </button>
            <button 
              onClick={() => scrollToId("fine-arts-salon")} 
              className="hover:text-amber-300 transition duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Arts Gallery
            </button>
          </nav>

          {/* Special Experience Toggle: Enter Interactive Flip-Book */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onToggleMute} 
              className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-stone-100 transition duration-150"
              title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
            >
              {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={onSwitchToFlipbook}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-100 font-sans text-xs font-bold rounded-md shadow-md hover:shadow-lg transition duration-200 flex items-center gap-2 group border border-amber-500/40 cursor-pointer"
              id="switch-flipbook-btn"
            >
              <BookMarked className="h-4 w-4 animate-pulse" />
              <span>3D Flip-Book Edition</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition duration-150" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Area */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1c120a] to-[#2c1a0e] text-stone-100 py-16 md:py-24 px-4 shadow-xl border-b border-amber-900/30">
        {/* Background decorative overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent)]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Emblem */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-3 bg-amber-950/40 px-4 py-2 rounded-full border border-amber-500/25 text-amber-300">
              <GraduationCap className="h-5 w-5" />
              <span className="font-sans text-[11px] uppercase tracking-widest font-bold">Annual Digital Publication 2026</span>
            </div>
          </motion.div>

          {/* Grand Scholarly Title */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl font-extrabold tracking-widest text-stone-100 uppercase leading-tight drop-shadow-md"
          >
            KRITHATHMIKA
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif italic text-lg md:text-2xl text-amber-200 mt-4 tracking-wide font-medium"
          >
            "The Awakened Mind"
          </motion.p>
          
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-8"></div>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto font-sans text-stone-300 text-sm md:text-base leading-relaxed tracking-wide font-light"
          >
            A prestigious high-school collection fusing empirical scientific research and creative visual art. Under the advisement of academic departments, we present Volume I of our independent student contributions.
          </motion.p>

          {/* Navigation Action Hub */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-wider"
          >
            <button
              onClick={() => scrollToId("research-library")}
              className="px-6 py-3 bg-[#e2bd89] hover:bg-amber-200 text-stone-950 rounded-md transition duration-150 cursor-pointer shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Read Research Papers
            </button>
            <button
              onClick={() => scrollToId("fine-arts-salon")}
              className="px-6 py-3 bg-stone-800/80 hover:bg-stone-700/80 text-stone-100 rounded-md transition duration-150 border border-amber-500/20 cursor-pointer hover:-translate-y-0.5 flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4 text-amber-400" />
              Explore Fine Arts Gallery
            </button>
          </motion.div>

          {/* Quick Stat Panel */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 bg-black/30 border border-amber-900/40 p-6 rounded-lg max-w-3xl mx-auto text-left"
          >
            <div className="border-r border-stone-800/80 pr-2">
              <span className="text-2xl md:text-3xl font-serif font-extrabold text-amber-400 block">8</span>
              <span className="text-[10px] text-stone-400 tracking-wider uppercase font-bold block mt-1">Research Submissions</span>
            </div>
            <div className="md:border-r border-stone-800/80 pr-2 md:pl-2">
              <span className="text-2xl md:text-3xl font-serif font-extrabold text-amber-400 block">8</span>
              <span className="text-[10px] text-stone-400 tracking-wider uppercase font-bold block mt-1">Fine Art Paintings</span>
            </div>
            <div className="border-r border-stone-800/80 pr-2 pl-0 md:pl-2">
              <span className="text-2xl md:text-3xl font-serif font-extrabold text-amber-400 block">16</span>
              <span className="text-[10px] text-stone-400 tracking-wider uppercase font-bold block mt-1">Student Scholars</span>
            </div>
            <div className="pl-2">
              <span className="text-2xl md:text-3xl font-serif font-extrabold text-amber-400 block">Grade 10-12</span>
              <span className="text-[10px] text-stone-400 tracking-wider uppercase font-bold block mt-1">Academic Cohorts</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Intro Welcome block */}
      <section id="intro-welcome" className="py-16 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        
        {/* Editor note panel */}
        <div className="lg:col-span-8 bg-white border border-stone-200/80 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-3">
            <Sparkles className="h-4 w-4" />
            <span>Foreword by the Editor-in-Chief</span>
          </div>
          
          <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight leading-tight mb-5">
            Empirical Rigor Meets Creative Resonance
          </h2>
          
          <div className="font-serif text-stone-700 text-base leading-relaxed space-y-4">
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-extrabold first-letter:float-left first-letter:mr-3 first-letter:text-amber-800 first-letter:leading-none">
              Welcome to the digital edition of <strong className="text-stone-900 font-semibold font-sans">Krithathmika</strong>, the official peer-vetted publication of the High-School Science Society in coordination with the Fine Arts Guild. Our title translates to <em className="italic font-medium">"The Awakened Mind"</em>—an objective we strive toward by exploring topics ranging from macro-scale atmospheric chemistry and structural oncology to micro-scale quantum cryptographies and biological synapses.
            </p>
            <p>
              In parallel, our digital gallery displays a curated sequence of eight oil, acrylic, and watercolor compositions from our student artists. These visual projects serve as artistic echoes of the surrounding material environment, capturing the dynamic atmosphere, ocean trenches, and pristine peaks referenced in the literature.
            </p>
            <p>
              By translating this work into a premium digital space, we ensure every formula, citation, and brushstroke remains sharp and accessible for secondary researchers around the world. We invite you to read, download, and share our collective findings.
            </p>
          </div>

          {/* Signature and metadata */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-serif font-bold text-stone-900 text-sm">Hridjay</p>
              <p className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">Editor-in-Chief &amp; Layout Architect</p>
            </div>
            
            <div className="text-right">
              <p className="font-sans font-semibold text-stone-700 text-xs">Krithathmika Science Department</p>
              <p className="text-[10px] text-stone-400">Published Affiliation ESTD 2026</p>
            </div>
          </div>
        </div>

        {/* Society card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#f2efe9] border border-[#dacfc0] rounded-xl p-6 shadow-inner text-stone-800">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-3 tracking-wide uppercase border-b border-stone-300 pb-2">
              DEPARTMENT ADVISORS
            </h3>
            <ul className="space-y-4 text-xs leading-relaxed">
              <li>
                <strong className="text-stone-900 block font-semibold text-sm">Dr. Elizabeth Thomas</strong>
                <span className="text-stone-500">Department of Chemistry &amp; Faculty Lead</span>
              </li>
              <li>
                <strong className="text-stone-900 block font-semibold text-sm">Prof. K. G. Rajendran</strong>
                <span className="text-stone-500">Advisory Board in Theoretical Physics</span>
              </li>
              <li>
                <strong className="text-stone-900 block font-semibold text-sm">Mrs. Mini Paul</strong>
                <span className="text-stone-500">Exhibition Coordinator &amp; Curator of Fine Arts Club</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-amber-900 to-amber-950 rounded-xl p-6 text-stone-100 shadow-md">
            <h4 className="font-sans text-[11px] font-bold tracking-widest uppercase text-amber-400 mb-2">Continuous PDF Format</h4>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              All editorial articles can be fully expanded in standard academic double-column PDF style. You can read, print, and save them in real-time.
            </p>
            <button
              onClick={() => scrollToId("research-library")}
              className="text-xs text-amber-200 hover:text-white font-bold flex items-center gap-1 group cursor-pointer"
            >
              Browse the library <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition duration-150" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 1: Research Papers Grid */}
      <section id="research-library" className="py-20 bg-stone-100 border-t border-b border-stone-200/60 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-2">
                <FileText className="h-4 w-4" />
                <span>SCIENTIFIC ARCHIVES</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight leading-none">
                Research Library
              </h2>
              <p className="text-stone-500 text-xs md:text-sm mt-3 tracking-wide">
                Vetted high-school secondary research papers compiled into Vol. I
              </p>
            </div>

            {/* Live Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search papers or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-stone-900 pl-9 pr-4 py-2 text-xs rounded border border-stone-300/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Subject dropdown */}
              <div className="flex items-center gap-1.5 bg-white border border-stone-300/80 rounded px-2.5 py-1.5 text-xs text-stone-700">
                <Filter className="h-3.5 w-3.5 text-stone-500" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-transparent border-none outline-none font-medium cursor-pointer"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub === "All" ? "All Subjects" : sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Papers Grid */}
          <AnimatePresence mode="popLayout">
            {filteredEditorials.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredEditorials.map((ed) => (
                  <motion.div
                    key={ed.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-stone-200/80 rounded-lg p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Subject Tag */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/30">
                          {ed.subject}
                        </span>
                        <span className="font-mono text-[10px] text-stone-400 font-bold">Paper #{ed.id}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug hover:text-amber-800 transition">
                        {ed.title}
                      </h3>

                      {/* Author */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-3 font-medium">
                        <User className="h-3.5 w-3.5 text-stone-400" />
                        <span>{ed.author} ({ed.grade})</span>
                      </div>

                      {/* Teaser Abstract */}
                      <p className="font-serif italic text-xs text-stone-600/90 leading-relaxed mt-4 bg-stone-50 p-3 rounded border-l-2 border-stone-300 line-clamp-4">
                        {ed.intro}
                      </p>
                    </div>

                    {/* Action Panel */}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-stone-400">
                        {ed.pdfFileName}
                      </span>
                      
                      <button
                        onClick={() => onOpenEditorial(ed)}
                        className="px-4 py-2 bg-stone-900 hover:bg-amber-700 text-white hover:text-stone-100 text-xs font-bold rounded flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Read Full Paper</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg border border-stone-200/80 p-12 text-center text-stone-500 max-w-md mx-auto shadow-sm"
              >
                <Compass className="h-8 w-8 text-stone-300 mx-auto mb-3" />
                <p className="font-serif text-sm italic">No research papers match your search parameters.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedSubject("All"); }}
                  className="mt-4 text-xs font-bold text-amber-700 hover:text-amber-600 underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* Section 2: Virtual Fine Arts Gallery */}
      <section id="fine-arts-salon" className="py-20 px-4 max-w-7xl mx-auto">
        <div>
          
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-2">
              <ImageIcon className="h-4 w-4" />
              <span>CREATIVE GALLERY</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight leading-none">
              Virtual Fine Arts Salon
            </h2>
            <p className="text-stone-500 text-xs md:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              Acrylic and watercolor masterpieces rendered by student members of the Krithathmika Fine Arts Club. Each piece echoes a theme of environmental harmony.
            </p>
          </div>

          {/* Gallery Paintings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {PAINTINGS.map((p) => (
              <div 
                key={p.id}
                className="flex flex-col justify-between"
              >
                {/* Framed Artwork Container */}
                <div 
                  onClick={() => {
                    setActivePainting(p);
                    setLightboxZoom(100);
                  }}
                  className="p-2.5 bg-stone-900 shadow-xl border-4 border-[#2c1a0e] rounded relative group cursor-pointer transition transform hover:-translate-y-1 hover:shadow-2xl duration-300"
                >
                  <div className="absolute inset-0 border border-amber-600/20 pointer-events-none"></div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-black relative">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-2 bg-stone-950/80 rounded-full border border-amber-500/30 text-amber-300">
                        <Maximize2 className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Museum Placard */}
                <div className="mt-4 bg-stone-50 border border-stone-200/80 p-4 rounded text-center relative max-w-xs mx-auto shadow-sm w-full">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-stone-100 border border-stone-300 text-[8px] uppercase tracking-widest text-stone-500 px-2 py-0.5 rounded font-bold">
                    Exhibit #{p.id}
                  </span>
                  
                  <h3 className="font-serif text-sm font-bold text-stone-950 tracking-wide mt-1">
                    "{p.title}"
                  </h3>
                  
                  <p className="font-sans text-[10px] text-amber-800 font-bold mt-0.5 uppercase tracking-wider">
                    by {p.artist}
                  </p>
                  
                  <p className="font-mono text-[9px] text-stone-400 font-semibold uppercase mt-0.5">
                    {p.grade}
                  </p>

                  <p className="font-serif text-[11px] text-stone-600 leading-relaxed mt-2.5 italic border-t border-stone-200/50 pt-2">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Spectacular Lightbox Modal for Art Zoom */}
      <AnimatePresence>
        {activePainting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md p-4 flex flex-col justify-between"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between text-stone-300 max-w-7xl mx-auto w-full py-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-amber-500" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-100">"{activePainting.title}"</h4>
                  <p className="text-[10px] text-stone-400">Exhibited by {activePainting.artist} • {activePainting.grade}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Zoom tools */}
                <div className="flex items-center bg-stone-900 border border-stone-800 rounded px-1">
                  <button 
                    onClick={() => setLightboxZoom(Math.max(50, lightboxZoom - 25))}
                    className="p-1.5 hover:text-white transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-xs text-stone-400 px-2 select-none">{lightboxZoom}%</span>
                  <button 
                    onClick={() => setLightboxZoom(Math.min(250, lightboxZoom + 25))}
                    className="p-1.5 hover:text-white transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setActivePainting(null)}
                  className="p-2 bg-stone-900 hover:bg-stone-800 rounded border border-stone-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Interactive Zoomable Viewport */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <motion.div 
                style={{ scale: lightboxZoom / 100 }}
                className="transition-transform duration-150 max-w-5xl w-full max-h-[75vh]"
              >
                <img
                  src={activePainting.imageUrl}
                  alt={activePainting.title}
                  referrerPolicy="no-referrer"
                  className="mx-auto rounded-lg shadow-2xl border-4 border-stone-950 object-contain max-h-[70vh]"
                />
              </motion.div>
            </div>

            {/* Bottom placards description */}
            <div className="max-w-2xl mx-auto w-full text-center py-4 border-t border-stone-800">
              <p className="font-serif italic text-stone-300 text-xs md:text-sm leading-relaxed max-w-xl mx-auto">
                "{activePainting.description}"
              </p>
              <div className="mt-3 text-[10px] tracking-widest font-bold uppercase text-amber-500">
                Krithathmika Fine Arts Guild curation
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Area */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 border-t border-stone-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
              <GraduationCap className="h-4 w-4" />
              <span>KRITHATHMIKA</span>
            </div>
            <p className="text-[11px] text-stone-500 uppercase tracking-widest">
              Digital Journal of High-School Science &amp; Fine Arts
            </p>
          </div>

          <div className="text-[10px] text-stone-500 flex flex-col md:items-end gap-1">
            <p>© 2026 Krithathmika Science Society. All rights reserved.</p>
            <p>Developed &amp; Designed in affiliation with the Science Department.</p>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            Back to Top <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </footer>

    </div>
  );
}
