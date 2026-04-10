
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      text: "These AI startup templates saved me weeks of development time. I launched my MVP in just 3 days!",
      author: "Sarah Chen",
      role: "AI Startup Founder",
      avatar: "/images/image9.png"
    },
    {
      id: 2,
      text: "The quality of these templates is outstanding. Perfect for building AI-powered applications quickly.",
      author: "Marcus Rodriguez",
      role: "Full Stack Developer",
      avatar: "/images/image10.png"
    },
    {
      id: 3,
      text: "Finally, templates designed specifically for AI startups. The components are modern and well-architected.",
      author: "Emily Watson",
      role: "Product Manager",
      avatar: "/images/image11.png"
    },
    {
      id: 4,
      text: "I've used many template libraries, but these AI-focused ones are exactly what I needed for my machine learning startup.",
      author: "David Kim",
      role: "ML Engineer",
      avatar: "/images/image12.png"
    },
    {
      id: 5,
      text: "The responsive design and clean code made it easy to customize for our AI chatbot platform.",
      author: "Jessica Park",
      role: "Frontend Developer",
      avatar: "/images/image13.png"
    },
    {
      id: 6,
      text: "These templates understand the unique needs of AI companies. Highly recommended for rapid prototyping.",
      author: "Alex Thompson",
      role: "Tech Lead",
      avatar: "/images/image14.png"
    },
    {
      id: 7,
      text: "Perfect for non-technical founders like me. I built a professional-looking AI startup landing page in hours.",
      author: "Rachel Green",
      role: "CEO & Founder",
      avatar: "/images/image15.png"
    },
    {
      id: 8,
      text: "The integration capabilities with AI APIs made our development process incredibly smooth.",
      author: "Tom Wilson",
      role: "Backend Developer",
      avatar: "/images/image16.png"
    },
    {
      id: 9,
      text: "These templates helped us validate our AI product idea quickly with a professional-looking interface.",
      author: "Lisa Zhang",
      role: "Product Designer",
      avatar: "/images/image17.png"
    },
  ];

  // Double the testimonials array for seamless looping
  const doubledTestimonials = [...testimonials, ...testimonials];

  // Split testimonials into 3 columns for desktop, 1 column for mobile
  const column1 = doubledTestimonials.filter((_, index) => index % 3 === 0);
  const column2 = doubledTestimonials.filter((_, index) => index % 3 === 1);
  const column3 = doubledTestimonials.filter((_, index) => index % 3 === 2);

  type Testimonial = typeof testimonials[0];

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <div className="w-full max-w-[320px] sm:max-w-[350px] md:max-w-[384px] min-w-[280px] p-4 sm:p-6 md:p-8 rounded-2xl border border-[#1F2228] bg-black mb-4 sm:mb-6 md:mb-8 mx-auto">
      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
        {/* Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        {/* Testimonial Text */}
        <p className="text-[#E5E7EB] text-sm sm:text-base font-normal leading-5 sm:leading-6">
          "{testimonial.text}"
        </p>
        
        {/* Author */}
        <div className="flex items-center gap-3">
          <img 
            src={testimonial.avatar} 
            alt={testimonial.author}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 object-cover"
          />
          <div className="flex flex-col min-w-0">
            <div className="text-[#F9FAFB] text-xs sm:text-sm font-semibold leading-4 sm:leading-5 truncate">
              {testimonial.author}
            </div>
            <div className="text-[#E5E7EB] text-xs sm:text-sm font-normal leading-4 sm:leading-5 truncate">
              {testimonial.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AnimatedColumn = ({ 
    testimonials: columnTestimonials, 
    delay = 0,
    duration = 20
  }: { 
    testimonials: Testimonial[]; 
    delay?: number;
    duration?: number;
  }) => (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        y: [0, '-50%']
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: {
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          delay: delay + 0.5
        }
      }}
    >
      {columnTestimonials.map((testimonial, index) => (
        <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
      ))}
    </motion.div>
  );

  return (
    <section className="w-full bg-black overflow-hidden px-4 sm:px-8 md:px-16 py-12 sm:py-16 md:py-28">
      <div className="flex flex-col items-center gap-8 sm:gap-12 md:gap-20">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="text-[#7D8187] text-xs sm:text-sm font-mono font-normal uppercase tracking-[1.4px] leading-4 sm:leading-5 text-center">
            [ happy developers ]
          </div>
          <div className="max-w-[90%] sm:max-w-[560px] text-center text-white text-2xl sm:text-3xl md:text-5xl font-normal leading-tight md:leading-[48px] px-4">
            What developers are saying
          </div>
        </div>

        {/* Testimonials Grid with Animation */}
        <div className="relative w-full max-w-[320px] sm:max-w-[700px] md:max-w-[1216px] h-[500px] sm:h-[600px] md:h-[800px] overflow-hidden">
          {/* Top gradient fade */}
          <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 md:h-55 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
          
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 md:h-55 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

          {/* Animated Grid Container */}
          <div className="flex justify-center gap-2 sm:gap-4 md:gap-8 h-full">
            {/* Mobile: Single column */}
            <div className="w-full max-w-[320px] overflow-hidden block sm:hidden">
              <AnimatedColumn testimonials={[...column1, ...column2, ...column3]} delay={0} duration={30} />
            </div>

            {/* Tablet: Two columns */}
            <div className="hidden sm:flex md:hidden justify-center gap-4 w-full">
              <div className="w-full max-w-[350px] overflow-hidden">
                <AnimatedColumn testimonials={[...column1, ...column3]} delay={0} duration={25} />
              </div>
              <div className="w-full max-w-[350px] overflow-hidden">
                <AnimatedColumn testimonials={column2} delay={0.3} duration={35} />
              </div>
            </div>

            {/* Desktop: Three columns */}
            <div className="hidden md:flex justify-center gap-8 w-full">
              {/* Column 1 - normal speed */}
              <div className="w-full max-w-[384px] overflow-hidden">
                <AnimatedColumn testimonials={column1} delay={0} duration={20} />
              </div>

              {/* Column 2 - slower speed */}
              <div className="w-full max-w-[384px] overflow-hidden">
                <AnimatedColumn testimonials={column2} delay={0.2} duration={30} />
              </div>

              {/* Column 3 - normal speed */}
              <div className="w-full max-w-[384px] overflow-hidden">
                <AnimatedColumn testimonials={column3} delay={0.4} duration={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
