
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const ProductLessonsSection = () => {
  const navigate = useNavigate();
  
  const handleBrowseTemplates = () => {
    navigate('/', { replace: false });
    // Scroll to products section after navigation
    setTimeout(() => {
      const productsSection = document.querySelector('[data-section="products"]');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  const steps = [
    {
      id: 1,
      image: "/images/image.png",
      step: "Step 1",
      title: "Browse the library",
      description: "Discover premium templates and sections for every type of founder and project—each crafted for clarity, speed, and conversion.",
      hasButton: true,
      buttonText: "Browse the templates"
    },
    {
      id: 2,
      image: "/images/image.png",
      step: "Step 2",
      title: "Duplicate & Remix",
      description: "One click takes you straight to Lovable, where you can remix any template with AI-powered prompts. Make it yours in seconds: change text, images, structure—no design skills needed.",
      hasButton: false
    },
    {
      id: 3,
      image: "/images/image.png",
      step: "Step 3",
      title: "Launch fast with Lovable",
      description: "Connect your domain, and go live—all in record time. Spend less time building, more time growing.",
      hasButton: false
    }
  ];

  return (
    <section className="w-full bg-black px-4 md:px-16 py-14 md:py-28 overflow-hidden">
      <div className="flex flex-col items-center gap-10 md:gap-20">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="max-w-[686px] text-center text-white text-3xl md:text-5xl font-normal leading-tight md:leading-[48px]">
            How it Works
          </div>
        </div>

        {/* Steps */}
        <div className="w-full max-w-7xl flex flex-col gap-8 md:gap-0">
          {steps.map((step) => (
            <div 
              key={step.id}
              className="w-full pt-8 md:pt-14 border-t border-[#1F2228] flex flex-col lg:flex-row items-start gap-6 lg:gap-8"
            >
              {/* Image */}
              <div className="w-full lg:flex-1 aspect-video rounded-lg overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="w-full lg:flex-1 p-6 md:p-12 flex flex-col justify-center items-start gap-6">
                <div className="w-full flex flex-col gap-6">
                  <div className="text-[#7D8187] text-xs font-mono font-normal uppercase tracking-[1.2px] leading-6">
                    {step.step}
                  </div>
                  <div className="text-white text-lg md:text-xl font-normal leading-6">
                    {step.title}
                  </div>
                  <div className="text-[#7D8187] text-base font-normal leading-6">
                    {step.description}
                  </div>
                </div>
                {step.hasButton && (
                  <Button
                    variant="outline"
                    onClick={handleBrowseTemplates}
                    className="px-6 py-3 rounded-full border-[#404040] text-white text-sm font-mono font-normal uppercase tracking-[1.4px] leading-5 hover:bg-[#404040] transition-colors duration-200"
                  >
                    {step.buttonText}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductLessonsSection;
