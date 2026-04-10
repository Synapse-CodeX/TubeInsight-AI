
const BenefitsSection = () => {
  const benefits = [{
    title: "AI Video Insights",
    description: "Our advanced AI analyzes your video performance, identifying key areas for improvement and highlighting what resonates with your audience.",
    icon: "/images/image13.png"
  }, {
    title: "Channel Growth Strategy",
    description: "Get personalized recommendations based on your channel's unique data, helping you to scale your YouTube presence effectively.",
    icon: "/images/image14.png"
  }, {
    title: "Competitor Benchmarking",
    description: "Compare your performance with leaders in your niche, gaining valuable insights into their successful strategies and content styles.",
    icon: "/images/image15.png"
  }, {
    title: "Real-time Metrics",
    description: "Track your progress with a comprehensive dashboard that displays real-time analytics for all your YouTube channels.",
    icon: "/images/image16.png"
  }, {
    title: "Automated SEO Optimization",
    description: "Maximize your video reach with AI-driven SEO suggestions, including metadata, tags, and descriptions.",
    icon: "/images/image17.png"
  }, {
    title: "Audience Retention Analysis",
    description: "Understand exactly where viewers drop off to create more engaging content that keeps your audience watching longer.",
    icon: "/images/image.png"
  }];

  return (
    <section className="w-full bg-transparent pt-[200px] pb-16 md:pb-28 px-4 md:px-16 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-12 md:gap-20">
        {/* Header */}
        <div className="w-full max-w-3xl flex flex-col items-center gap-4 text-center">
          <div className="flex items-center">
            <span className="text-muted-foreground text-sm font-mono font-normal uppercase tracking-widest">
              POWERFUL, AI-DRIVEN, ANALYTICS
            </span>
          </div>
          <div className="w-full flex flex-col items-center gap-6">
            <h2 className="text-foreground text-center text-3xl md:text-4xl lg:text-5xl font-normal leading-tight">
              Grow Your YouTube Channel with Confidence
            </h2>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex-1 pb-8 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden hover:border-red-500/30 transition-all duration-300">
                <div className="p-8 flex flex-col gap-6">
                  <div className="flex flex-col gap-9">
                    {/* Icon placeholder or template icon */}
                    <img src={benefit.icon} alt={benefit.title} className="w-[100px] h-[100px] object-contain opacity-80" />
                    <div className="flex flex-col gap-4">
                      <h3 className="text-foreground text-xl font-normal leading-6">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-base font-normal leading-6">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;