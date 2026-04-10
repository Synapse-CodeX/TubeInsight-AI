
import ProductOverview from "./ProductOverview";
import ProductHighlights from "./ProductHighlights";

interface ProductContentProps {
  product: {
    id: string;
    description: string | null;
    price_type: string | null;
  };
}

const ProductContent = ({ product }: ProductContentProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16">
      <ProductOverview product={product} />
      <ProductHighlights product={product} />
    </div>
  );
};

export default ProductContent;
