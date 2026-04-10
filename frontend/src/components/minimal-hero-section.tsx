import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Hls from "hls.js";
import TextType from "@/components/ui/TextType";
const MinimalHeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/0f2f7fe2f6a205894f4e9747e26a7341/manifest/video.m3u8";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    }
  }, []);

  return <section className="min-h-screen w-full bg-background flex flex-col relative">
      <div className="absolute inset-0 z-[1]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          aria-label="Background video showcasing AI technology and web development"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center gap-20 px-4 relative">
        <div className="absolute inset-0 bg-background opacity-70 z-0"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 z-[2]" style={{
        background: 'linear-gradient(to top, black, transparent)'
      }}></div>
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-black rounded-full z-[8]" style={{
        filter: 'blur(60px)',
        transform: 'translateX(-50%) translateY(calc(-50% + 50px))'
      }}></div>
        
        <div className="w-full max-w-4xl flex flex-col justify-center items-center relative z-10">
          <motion.div className="w-full max-w-screen-2xl text-center flex flex-col justify-center items-center" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }}>
            <TextType 
              text="Step 3"
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              className="text-foreground font-normal leading-tight break-words text-4xl md:text-6xl lg:text-7xl xl:text-8xl"
            />
          </motion.div>
        </div>
      </div>
    </section>;
};
export default MinimalHeroSection;