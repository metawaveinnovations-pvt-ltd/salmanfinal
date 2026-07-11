import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  HeartHandshake, 
  UserCheck, 
  ChevronRight, 
  HeartPulse,
  Lock,
  Clock,
  CheckCircle2,
  Sparkles,
  Home,
  Coffee,
  Heart,
  Eye
} from "lucide-react";

// Import our highly polished real-world matched environment images (featuring young people)
import patioGarden from "../assets/images/modern_patio_garden_1783779377103.jpg";
import communalLounge from "../assets/images/modern_communal_lounge_1783779393831.jpg";
import privateBedroom from "../assets/images/modern_private_bedroom_1783779407511.jpg";
import kitchenBaking from "../assets/images/young_adults_kitchen_baking_1783779424981.jpg";

interface HeroProps {
  onNavigate: (sectionId: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [hoveredBlockId, setHoveredBlockId] = useState<number | null>(null);

  const collageBlocks = [
    {
      id: 2,
      src: communalLounge,
      title: "Sleek Lounge",
      tag: "Social Space",
      desc: "Modern dark sofa seating and warm wood-look flooring.",
      detail: "Specially designed low-arousal environments for peer social engagement.",
      icon: Home,
      className: "w-[41%] h-[32%] left-[2%] top-[31%]",
      titleSize: "text-[11px] xs:text-xs sm:text-sm md:text-base font-black text-white leading-tight",
      descSize: "text-[9px] xs:text-[10px] sm:text-[11.5px] text-slate-300 leading-snug font-medium"
    },
    {
      id: 3,
      src: patioGarden,
      title: "Courtyard",
      tag: "Sensory Garden",
      desc: "Bright stone patio with calming weeping willow trees.",
      detail: "Active outdoor areas built for peaceful sensory regulation.",
      icon: Sparkles,
      className: "w-[31%] h-[36%] left-[44%] top-[1%]",
      titleSize: "text-[10.5px] xs:text-xs sm:text-[13px] font-black text-white leading-tight",
      descSize: "text-[8.5px] xs:text-[10px] sm:text-[11px] text-slate-300 leading-snug font-medium"
    },
    {
      id: 4,
      src: kitchenBaking,
      title: "MDT Kitchen",
      tag: "Co-Cooking",
      desc: "Modern open-concept kitchen with safe premium appliances.",
      detail: "Daily culinary skills development supported side-by-side with experts.",
      icon: Coffee,
      className: "w-[37%] h-[28%] right-[1%] top-[21%]",
      titleSize: "text-[11px] xs:text-xs sm:text-sm md:text-base font-black text-white leading-tight",
      descSize: "text-[9px] xs:text-[10px] sm:text-[11.5px] text-slate-300 leading-snug font-medium"
    },
    {
      id: 5,
      src: privateBedroom,
      title: "Cozy Bedroom",
      tag: "Sanctuary",
      desc: "Bright private bedroom with sunlit natural window views.",
      detail: "En-suite bedrooms with sound-buffering finishes for complete peace.",
      icon: ShieldCheck,
      className: "w-[30%] h-[34%] left-[28%] bottom-[2%]",
      titleSize: "text-[10.5px] xs:text-xs sm:text-[13px] font-black text-white leading-tight",
      descSize: "text-[8.5px] xs:text-[10px] sm:text-[11px] text-slate-300 leading-snug font-medium"
    },
    {
      id: 6,
      src: communalLounge,
      title: "Social Hub",
      tag: "Community",
      desc: "Cozy couches built for friendly conversations and group games.",
      detail: "Safe, supportive layout that encourages independence.",
      icon: Heart,
      className: "w-[33%] h-[32%] right-[10%] bottom-[10%]",
      titleSize: "text-[11px] xs:text-xs sm:text-sm md:text-base font-black text-white leading-tight",
      descSize: "text-[9px] xs:text-[10px] sm:text-[11.5px] text-slate-300 leading-snug font-medium"
    },
    {
      id: 7,
      src: privateBedroom,
      title: "Study Desk",
      tag: "Independence",
      desc: "Custom desks supporting quiet hobbies and digital learning.",
      detail: "Integrated tech stations to encourage self-directed daily learning.",
      icon: Eye,
      className: "w-[28%] h-[20%] left-[17%] top-[11%]",
      titleSize: "text-[9.5px] xs:text-[10.5px] sm:text-xs font-black text-white leading-tight",
      descSize: "text-[8px] xs:text-[9px] sm:text-[10px] text-slate-300 leading-snug font-medium"
    },
    {
      id: 8,
      src: patioGarden,
      title: "Green Path",
      tag: "Nature",
      desc: "Calming outdoor green elements and walkways.",
      detail: "Soothing natural plants to facilitate peaceful decompression.",
      icon: HeartPulse,
      className: "w-[19%] h-[19%] left-[10%] bottom-[11%]",
      titleSize: "text-[9px] xs:text-[9.5px] sm:text-[10.5px] font-black text-white leading-none",
      descSize: "text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] text-slate-300 leading-normal font-medium"
    }
  ];

  const activeHoveredBlock = collageBlocks.find(b => b.id === hoveredBlockId);

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-36 sm:pt-40 md:pt-44 lg:pt-48 pb-16 lg:py-24 xl:py-32 flex items-center bg-gradient-to-br from-white via-warm-bg to-care-green/5 overflow-hidden text-slate-800"
    >
      {/* Absolute Decorative Blobs for premium ambiance */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gov-blue/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-care-green/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text and Primary messaging column */}
          <div className="lg:col-span-12 xl:col-span-6 space-y-6 sm:space-y-8">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-gov-blue/[0.04] px-3.5 py-1.5 rounded-full border border-gov-blue/10"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-gov-blue animate-pulse" />
              <span className="text-xs font-semibold text-gov-blue tracking-wide font-sans">
                Registered UK Healthcare Provider • CQC Registration Pending
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-2xl xs:text-3.5xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[48px] 2xl:text-[54px] font-extrabold text-gov-blue tracking-tight leading-tight sm:leading-[1.12] font-sans">
                Creating <span className="text-calm-blue">Homes</span>, Building
                <span className="block text-care-green border-b-2 border-premium-gold/40 pb-0.5 mt-1 sm:mt-2 w-fit lg:inline-block">Meaningful Lives</span>
              </h1>
              
              <div className="space-y-4 text-text-secondary max-w-2xl">
                <p className="text-sm sm:text-base font-medium text-gov-blue/80 leading-relaxed">
                  PRO Care Homes provides high-quality, person-centred support designed to promote independence across our key service areas:
                </p>
                <ul className="space-y-2.5 pl-1">
                  <li className="flex items-start space-x-3 text-sm sm:text-[15px] leading-relaxed text-text-primary">
                    <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-care-green" />
                    <span><strong>Fully compliant specialist residential support</strong> for adults with learning disabilities and autism options.</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm sm:text-[15px] leading-relaxed text-text-primary">
                    <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-calm-blue" />
                    <span><strong>Supported living, independent living and preparation for adulthood.</strong> Supporting our people out and about in their community as well as their homes, through unregulated support.</span>
                  </li>
                </ul>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-base sm:text-lg font-black text-gov-blue tracking-tight">
                    Quick referrals, Caring admissions, Stable placements.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="pt-6 border-t border-slate-100 flex flex-wrap gap-4 sm:gap-6 items-center text-xs text-text-secondary font-sans font-semibold tracking-wide text-slate-500"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                <span>CQC FRAMEWORK PENDING</span>
              </div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div>PBS CERTIFIED STAFF</div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div>PERSONALISED SUPPORT DESIGNS</div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Interactive Wireframe Collage with real high-resolution young adults images */}
          <div className="lg:col-span-12 xl:col-span-6 relative py-6 flex flex-col justify-center items-center w-full" id="referral-framework">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full max-w-[710px]"
            >
              {/* Main Collage Container matching the requested structural diagram layout */}
              <div className="relative w-full aspect-[4/3] bg-transparent select-none">
                
                {/* 1. CENTRAL CIRLCE SHAPE - white-bordered circle clip */}
                <div 
                  className="absolute w-[29%] aspect-square rounded-full bg-white border-[8px] md:border-[10px] border-white shadow-[0_15px_45px_rgba(0,0,0,0.25)] z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-all duration-300"
                  id="collage-center-circle"
                >
                  <AnimatePresence mode="wait">
                    {activeHoveredBlock ? (
                      <motion.div
                        key={activeHoveredBlock.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        className="w-full h-full relative"
                      >
                        <img 
                          src={activeHoveredBlock.src} 
                          alt="" 
                          className="w-full h-full object-cover scale-110" 
                          referrerPolicy="no-referrer"
                        />
                        {/* Elegant overlay badge inside centre circle */}
                        <div className="absolute inset-0 bg-gov-blue/20 flex items-center justify-center">
                          <div className="bg-white/90 p-1.5 rounded-full shadow-md">
                            {React.createElement(activeHoveredBlock.icon, { className: "w-4 h-4 text-care-green" })}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full bg-gradient-to-br from-gov-blue via-slate-900 to-care-green flex flex-col items-center justify-center p-2 relative overflow-hidden"
                      >
                        {/* Slow spinning aesthetic ring */}
                        <div className="absolute inset-0.5 border border-dashed border-white/20 rounded-full animate-[spin_20s_linear_infinite]" />
                        
                        <HeartPulse className="w-6 h-6 text-emerald-400 animate-pulse relative z-10" />
                        <span className="text-[7.5px] text-white/90 font-mono font-bold tracking-widest uppercase mt-1 relative z-10 text-center leading-none">
                          PRO CARE
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. COLLAGE PIECES - Absolute positioned to precisely match the reference wireframe layout */}
                {collageBlocks.map((block) => {
                  return (
                    <div
                      key={block.id}
                      className={`absolute ${block.className} rounded-lg overflow-hidden border-[8px] md:border-[10px] border-white shadow-[0_12px_35px_rgba(0,0,0,0.16)] transition-all duration-500 ease-out cursor-pointer z-10 hover:z-30 hover:scale-[1.05] hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)] group`}
                      onMouseEnter={() => setHoveredBlockId(block.id)}
                      onMouseLeave={() => setHoveredBlockId(null)}
                      id={`collage-shape-${block.id}`}
                    >
                      {/* Front Layer: High Quality Image */}
                      <img
                        src={block.src}
                        alt={block.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />

                      {/* Behind Layer revealed smoothly on hover - clean title and description fitted perfectly */}
                      <div className="absolute inset-0 bg-slate-950/95 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center p-2 text-left border border-white/10 overflow-hidden">
                        <div className="space-y-0.5 xs:space-y-1">
                          <h5 className={block.titleSize}>
                            {block.title}
                          </h5>
                          <p className={block.descSize}>
                            {block.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Informative visual label under the custom diagram structure */}
              <div className="flex items-center justify-between text-[10px] px-2 font-sans font-medium text-slate-400 mt-2">
                <span className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-care-green animate-ping" />
                  <span>Hover any collage segment to reveal specifications behind</span>
                </span>
                <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Layout: Interactive Wireframe
                </span>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
