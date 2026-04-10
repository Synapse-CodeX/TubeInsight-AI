
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';

interface ProductHighlightsProps {
  product: {
    id: string;
    price_type: string | null;
  };
}

const ProductHighlights = ({ product }: ProductHighlightsProps) => {
  const { data: highlights, isLoading } = useQuery({
    queryKey: ['product-highlights', product.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_highlights')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fallback highlights if none exist in database
  const fallbackHighlights = [
    { id: 'fallback-1', title: 'Modern Design', icon_type: 'checkmark' },
    { id: 'fallback-2', title: product.price_type || 'Free', icon_type: 'checkmark' },
    { id: 'fallback-3', title: 'Easy to Use', icon_type: 'checkmark' }
  ];

  const displayHighlights = highlights && highlights.length > 0 ? highlights : fallbackHighlights;

  if (isLoading) {
    return (
      <div className="w-full lg:w-[300px] xl:w-[365px] mt-6 lg:mt-0">
        <h3 className="text-[#F1F1F1] text-xl sm:text-2xl md:text-3xl font-semibold leading-tight mb-4 sm:mb-6 lg:mb-8">
          Highlights
        </h3>
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3 sm:py-4 lg:py-5 border-b border-[#282828] flex items-center gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-600 rounded-sm flex-shrink-0 animate-pulse" />
              <div className="h-4 bg-gray-600 rounded flex-1 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[300px] xl:w-[365px] mt-6 lg:mt-0">
      <h3 className="text-[#F1F1F1] text-xl sm:text-2xl md:text-3xl font-semibold leading-tight mb-4 sm:mb-6 lg:mb-8">
        Highlights
      </h3>
      <div className="space-y-0">
        {displayHighlights.map((highlight, index) => (
          <div key={highlight.id || index} className="py-3 sm:py-4 lg:py-5 border-b border-[#282828] flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <Checkbox 
                checked={true}
                className="w-4 h-4 sm:w-5 sm:h-5 border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
            </div>
            <span className="text-[#F1F1F1] text-base sm:text-lg font-medium">
              {highlight.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductHighlights;
