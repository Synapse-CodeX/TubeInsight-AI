
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate("/dashboard");
  };

  return (
    <section className="min-h-[600px] w-full bg-transparent flex flex-col relative overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center gap-20 px-4 relative z-10">
        <div className="absolute inset-0 bg-black/5 z-0"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 z-[2]" style={{background: 'linear-gradient(to top, transparent, transparent)'}}></div>
        
        <div className="w-full max-w-4xl flex flex-col justify-start items-center gap-6 relative z-10 pt-[150px] pb-[60px]">
          <motion.header 
            className="w-full relative flex flex-col justify-start items-center gap-6 pt-[50px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex justify-center items-center gap-2.5 mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-[7px] h-[7px] bg-red-500 rounded-full animate-pulse"></div>
              <div className="text-muted-foreground text-sm font-mono font-normal uppercase tracking-[1.4px] leading-5">
                AI-POWERED CHANNEL ANALYTICS
              </div>
            </motion.div>
            <motion.div 
              className="w-full text-center flex flex-col justify-center items-center gap-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h1 className="text-foreground font-normal leading-tight text-4xl md:text-6xl lg:text-7xl xl:text-8xl max-w-5xl">
                Master YouTube with AI Insights
              </h1>
            </motion.div>
            <motion.div 
              className="w-full text-center flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-foreground text-base md:text-lg font-normal leading-6 max-w-2xl mx-auto">
                TubeInsight provides deep-dive analysis of your YouTube channel, uncovering growth opportunities with state-of-the-art AI.
              </p>
            </motion.div>
          </motion.header>

          <motion.div 
            className="pt-4 flex justify-center items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Button variant="hero" size="lg" className="px-8 py-4 rounded-full" onClick={handleCTA}>
              START ANALYSIS
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;