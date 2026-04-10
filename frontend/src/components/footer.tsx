
import { Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-transparent px-4 md:px-16 py-14 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-14 md:gap-20">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-16">
          {/* Logo & Socials */}
          <div className="flex-1 lg:max-w-md flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <Link to="/" className="text-white text-2xl font-bold tracking-tight">
                TUBEINSIGHT
              </Link>
              <p className="text-[#7D8187] text-base leading-6 pr-4">
                The ultimate platform for channel and video analysis powered by AI. Scale your YouTube presence with data-driven strategy.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <Twitter className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <Youtube className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-1 flex flex-wrap gap-12 sm:gap-16 lg:gap-24 justify-end">
            <div className="flex flex-col gap-4">
              <p className="text-white text-sm font-bold uppercase tracking-widest">Platform</p>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="text-[#7D8187] text-base hover:text-white transition-colors">Home</Link>
                <Link to="/dashboard" className="text-[#7D8187] text-base hover:text-white transition-colors">Dashboard</Link>
                <Link to="/signup" className="text-[#7D8187] text-base hover:text-white transition-colors">Sign Up</Link>
              </nav>
            </div>
            
            <div className="flex flex-col gap-4">
              <p className="text-white text-sm font-bold uppercase tracking-widest">Resources</p>
              <nav className="flex flex-col gap-3">
                <Link to="/privacy" className="text-[#7D8187] text-base hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="text-[#7D8187] text-base hover:text-white transition-colors">Terms of Use</Link>
              </nav>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#444] text-sm">
            © {new Date().getFullYear()} TubeInsight. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
