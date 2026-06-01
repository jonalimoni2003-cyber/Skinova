import { Warp } from "@paper-design/shaders-react";

interface WarpShaderHeroProps {
  onGetStarted?: () => void;
  onViewExamples?: () => void;
}

export default function WarpShaderHero({ onGetStarted, onViewExamples }: WarpShaderHeroProps) {
  return (
    <main className="relative min-h-[90vh] md:min-h-screen overflow-hidden w-full bg-slate-950 flex flex-col items-center justify-center">
      {/* Background Warp Shader */}
      <div className="absolute inset-0 opacity-50 md:opacity-70 pointer-events-none">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={["#FAF6F0", "#FFEFE6", "#FFD2C0", "#E3F2FD"]} // Soft skincare cosmetics palette (cream, beige, soft rose, sky blue)
        />
      </div>

      {/* Grid overlay for elegant modern alignment */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 min-h-[90vh] md:min-h-screen flex items-center justify-center px-4 md:px-8 max-w-5xl mx-auto">
        <div className="w-full text-center space-y-8 py-16">
          <h1 className="text-white text-4.5xl sm:text-5xl md:text-7xl font-serif font-medium text-balance leading-tight tracking-wide">
            <span className="block text-[11px] sm:text-xs uppercase font-mono tracking-[0.4em] text-[#E6C79C] mb-6 font-semibold opacity-90">SKINOVA LABS</span>
            AI Skin Analyzer & <br/>
            <span className="italic font-light text-gradient bg-clip-text text-transparent bg-gradient-to-r from-amber-100 via-[#FFDFC9] to-[#E6C79C] font-serif">
              Personalized Care
            </span>
          </h1>

          <p className="text-white/85 text-sm sm:text-base md:text-lg font-serif italic leading-relaxed max-w-2.5 max-w-2xl mx-auto opacity-90">
            Scan your skin in seconds using artificial intelligence. Evaluate acne, wrinkles, pores, and dark circles to draft a dermatological-grade morning & night routine tailored just for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-white/5 cursor-pointer"
            >
              Scan Your Skin
            </button>
            <button 
              onClick={onViewExamples}
              className="w-full sm:w-auto px-8 py-4 bg-white rounded-full text-neutral-800 font-medium hover:bg-neutral-50 hover:scale-105 transition-all duration-300 active:scale-95 shadow-lg shadow-black/10 cursor-pointer"
            >
              Explore Products
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
