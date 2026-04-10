
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="w-full px-4 md:px-16 py-14 md:py-20 overflow-hidden relative min-h-[400px] flex items-center justify-center" style={{
      backgroundImage: `url('/images/image.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center gap-10 max-w-4xl mx-auto text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-normal leading-tight">
            Ready to grow your channel?
          </h2>
          <p className="max-w-xl text-[#7D8187] text-lg md:text-xl font-normal leading-relaxed">
            Join thousands of creators using TubeInsight to master their YouTube strategy with AI-powered analytics.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            variant="hero" 
            size="lg" 
            className="px-8 py-4 rounded-full"
            onClick={() => navigate('/dashboard')}
          >
            START ANALYSIS NOW
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-4 rounded-full border-white/20 hover:bg-white/5 text-white"
            onClick={() => navigate('/dashboard')}
          >
            FREE DASHBOARD
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;