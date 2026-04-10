
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const ProductsSection = () => {
  const navigate = useNavigate();

  // Mocked products data for pure frontend
  const products = [
    {
      id: "1",
      name: "Channel Deep Dive",
      description: "Complete analysis of your YouTube channel metrics, trends, and growth opportunities.",
      thumbnail_url: "/images/image6.png",
      price_type: "Premium",
      display_order: 1
    },
    {
      id: "2",
      name: "Video Evolution AI",
      description: "AI-driven analysis for specific videos to improve audience retention and engagement.",
      thumbnail_url: "/images/image7.png",
      price_type: "Pro",
      display_order: 2
    },
    {
      id: "3",
      name: "SEO Strategy Builder",
      description: "Automated tools to maximize your video reach and search visibility on YouTube.",
      thumbnail_url: "/images/image8.png",
      price_type: "Essential",
      display_order: 3
    }
  ];

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleExploreMore = () => {
    navigate('/signup');
  };

  return (
    <section id="products-section" className="w-full h-full px-4 md:px-16 py-14 md:py-28 bg-transparent overflow-hidden flex flex-col justify-start items-center gap-12 md:gap-20">
      <div className="self-stretch flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 max-w-7xl mx-auto w-full">
        <div className="w-full md:w-96 flex-col justify-start items-start gap-4 inline-flex">
          <div className="text-[#7D8187] text-sm font-mono font-normal uppercase tracking-[1.4px] leading-5">
            [ Analysis Tools ]
          </div>
          <div className="self-stretch flex-col justify-start items-center gap-4 flex">
            <div className="self-stretch justify-center flex flex-col text-white text-3xl md:text-5xl font-normal leading-tight md:leading-12">
              Our Capabilities
            </div>
          </div>
        </div>
        <Button variant="outline" className="px-6 py-3 rounded-full border border-[#404040] justify-center items-center gap-2 flex" onClick={handleExploreMore}>
          <div className="text-center justify-center flex flex-col text-white text-sm font-mono font-normal uppercase tracking-[1.4px] leading-5">
            Explore more
          </div>
        </Button>
      </div>

      <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 max-w-7xl mx-auto w-full">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group flex flex-col gap-6 cursor-pointer"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="aspect-video relative overflow-hidden rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
              <img 
                src={product.thumbnail_url} 
                alt={product.name} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white/50 text-[10px] font-mono uppercase tracking-widest border border-white/5">
                  {product.price_type}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 px-2">
              <h3 className="text-white text-xl font-normal group-hover:text-red-500 transition-colors">{product.name}</h3>
              <p className="text-[#7D8187] text-sm leading-relaxed">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;