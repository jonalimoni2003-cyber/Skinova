import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Icon component for contact details
const InfoIcon = ({ type }: { type: "website" | "phone" | "address" }) => {
  const icons = {
    website: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#9c8468]">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" x2="22" y1="12" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
    phone: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#9c8468]">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    ),
    address: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#9c8468]">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
  };
  return <div className="mr-2 flex-shrink-0">{icons[type]}</div>;
};

// Prop types for the HeroSection component
interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark";
  logo?: {
    url: string;
    alt: string;
    text?: string;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: {
    text: string;
    href: string;
  };
  backgroundImage: string;
  contactInfo: {
    website: string;
    phone: string;
    address: string;
  };
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, logo, slogan, title, subtitle, callToAction, backgroundImage, contactInfo, theme = "light", ...props }, ref) => {
    
    // Animation variants for the container to orchestrate children animations
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.12,
          delayChildren: 0.1,
        },
      },
    };

    // Animation variants for individual text/UI elements
    const itemVariants = {
      hidden: { y: 15, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.6,
          ease: "easeOut",
        },
      },
    };
    
    return (
      <motion.section
        ref={ref}
        className={cn(
          "relative flex w-full flex-col overflow-hidden border md:flex-row rounded-3xl transition-colors duration-300",
          theme === "dark" 
            ? "bg-[#151413] border-neutral-850 text-white" 
            : "bg-[#FAF9F6] border-neutral-200/50 text-neutral-800",
          className
        )}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        {...props}
      >
        {/* Left Side: Content */}
        <div className="flex w-full flex-col justify-between p-8 md:w-1/2 md:p-12 lg:w-3/5 lg:p-16">
            {/* Top Section: Logo & Main Content */}
            <div>
                <motion.header className="mb-12" variants={itemVariants}>
                    {logo && (
                        <div className="flex items-center">
                            <img src={logo.url} alt={logo.alt} className="mr-3 h-8 object-contain rounded-full" />
                            <div>
                                {logo.text && <p className={cn("text-sm font-semibold tracking-wider uppercase font-mono", theme === 'dark' ? "text-white" : "text-neutral-900")}>{logo.text}</p>}
                                {slogan && <p className="text-[10px] tracking-widest text-[#9c8468] uppercase font-mono mt-0.5">{slogan}</p>}
                            </div>
                        </div>
                    )}
                </motion.header>

                <motion.main variants={containerVariants} className="space-y-6">
                    <motion.h1 className={cn("text-3xl sm:text-4xl md:text-5xl font-serif font-light leading-tight", theme === 'dark' ? "text-white" : "text-neutral-900")} variants={itemVariants}>
                        {title}
                    </motion.h1>
                    <motion.div className="h-[1px] w-12 bg-[#9c8468]" variants={itemVariants}></motion.div>
                    <motion.p className={cn("text-sm max-w-md leading-relaxed font-sans", theme === 'dark' ? "text-neutral-350" : "text-neutral-600")} variants={itemVariants}>
                        {subtitle}
                    </motion.p>
                    <motion.div variants={itemVariants} className="pt-2">
                      <a 
                        href={callToAction.href} 
                        className="text-xs font-semibold tracking-widest text-[#9c8468] hover:text-[#e9d6bf] transition-colors border-b border-[#9c8468]/40 pb-1 font-mono uppercase"
                      >
                        {callToAction.text}
                      </a>
                    </motion.div>
                </motion.main>
            </div>

            {/* Bottom Section: Footer Info */}
            <motion.footer className="mt-16 w-full" variants={itemVariants}>
                <div className={cn("grid grid-cols-1 gap-6 text-[10px] tracking-wider uppercase font-mono sm:grid-cols-3 border-t pt-6", theme === 'dark' ? "border-neutral-850 text-neutral-400" : "border-neutral-200/50 text-neutral-500")}>
                    <div className="flex items-center">
                        <InfoIcon type="website" />
                        <span className="truncate">{contactInfo.website}</span>
                    </div>
                    <div className="flex items-center">
                        <InfoIcon type="phone" />
                        <span className="truncate">{contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center">
                        <InfoIcon type="address" />
                        <span className="truncate">{contactInfo.address}</span>
                    </div>
                </div>
            </motion.footer>
        </div>

        {/* Right Side: Image with Clip Path Animation */}
        <motion.div 
          className={cn("w-full min-h-[300px] bg-cover bg-center md:w-1/2 md:min-h-full lg:w-2/5 contrast-[1.05] brightness-[0.98] transition-all", theme === 'dark' ? "grayscale-[0.5] opacity-80" : "grayscale")}
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
          }}
          initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
          animate={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        >
        </motion.div>
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
