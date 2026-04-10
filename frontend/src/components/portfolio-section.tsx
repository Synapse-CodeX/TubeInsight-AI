const PortfolioSection = () => {
  const portfolioItems = [
    {
      title: "Audience Retention Analytics",
      description: "Deep dive into where your viewers are dropping off and why. Optimize your content for maximum watch time."
    },
    {
      title: "Content Strategy Planner", 
      description: "AI-driven content recommendations based on trending topics in your niche and competitor performance."
    },
    {
      title: "SEO Optimization Engine",
      description: "Automated titles, tags, and descriptions generated from your video transcript to boost search visibility."
    },
    {
      title: "Channel Growth Metrics",
      description: "Comprehensive dashboard tracking your subscriber growth, engagement rates, and revenue projections."
    }
  ];

  return (
    <section className="w-full bg-transparent py-16 md:py-28 px-4 md:px-16 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-12 md:gap-20">
        {/* Header */}
        <div className="w-full max-w-3xl flex flex-col items-center gap-4">
          <div className="flex items-center">
            <span className="text-muted-foreground text-sm font-mono font-normal uppercase tracking-widest">
              Portfolio
            </span>
          </div>
          <div className="w-full flex flex-col items-center gap-6">
            <h2 className="text-foreground text-center text-3xl md:text-4xl lg:text-5xl font-normal leading-tight">
              Works that build trust
            </h2>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="w-full flex flex-col gap-12 md:gap-16">
          {/* First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {portfolioItems.slice(0, 2).map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col gap-6"
              >
                {/* Image */}
                <img 
                  src={index === 0 ? "/images/image2.png" : "/images/image3.png"}
                  alt={item.title}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg"
                />
                
                {/* Content */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-foreground text-lg font-normal leading-7">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-base font-normal leading-6">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {portfolioItems.slice(2, 4).map((item, index) => (
              <div 
                key={index + 2} 
                className="flex flex-col gap-6"
              >
                {/* Image */}
                <img 
                  src={index === 0 ? "/images/image4.png" : "/images/image5.png"}
                  alt={item.title}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg"
                />
                
                {/* Content */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-foreground text-lg font-normal leading-7">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-base font-normal leading-6">
                      {item.description}
                    </p>
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

export default PortfolioSection;