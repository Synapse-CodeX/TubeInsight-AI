
interface ProductImagesProps {
  product: {
    name: string;
    thumbnail_url: string | null;
    image_1_url: string | null;
    image_2_url: string | null;
  };
}

const ProductImages = ({ product }: ProductImagesProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 mb-8 sm:mb-12 lg:mb-16">
      {/* Main image - takes full width on mobile/tablet */}
      <div className="w-full lg:flex-1 h-[250px] sm:h-[350px] md:h-[450px] lg:h-[600px]">
        <img 
          src={product.thumbnail_url || "https://placehold.co/800x600"}
          alt={product.name}
          className="w-full h-full object-cover rounded-xl sm:rounded-2xl lg:rounded-3xl"
        />
      </div>
      {/* Side images - stack below main image on mobile/tablet */}
      <div className="w-full lg:w-[300px] xl:w-[365px] flex flex-row lg:flex-col gap-2 sm:gap-3">
        <div className="flex-1 h-[120px] sm:h-[170px] md:h-[220px] lg:h-[294px]">
          <img 
            src={product.image_1_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=365&h=294&fit=crop&crop=center"}
            alt="Product screenshot 1"
            className="w-full h-full object-cover rounded-xl sm:rounded-2xl lg:rounded-3xl"
          />
        </div>
        <div className="flex-1 h-[120px] sm:h-[170px] md:h-[220px] lg:h-[294px]">
          <img 
            src={product.image_2_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=365&h=294&fit=crop&crop=center"}
            alt="Product screenshot 2"
            className="w-full h-full object-cover rounded-xl sm:rounded-2xl lg:rounded-3xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
