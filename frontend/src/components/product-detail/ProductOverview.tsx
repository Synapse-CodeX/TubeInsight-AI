
interface ProductOverviewProps {
  product: {
    description: string | null;
  };
}

const ProductOverview = ({ product }: ProductOverviewProps) => {
  return (
    <div className="flex-1">
      <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight mb-4 sm:mb-6 lg:mb-8">
        Overview
      </h2>
      <p className="text-white text-sm sm:text-base font-normal leading-6 sm:leading-7">
        {product.description || "This is an amazing product that will help you build better applications faster. Stay tuned for more details about its features and capabilities."}
      </p>
    </div>
  );
};

export default ProductOverview;
