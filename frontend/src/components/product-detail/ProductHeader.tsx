import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProductHeaderProps {
  product: {
    name: string;
    created_at: string;
    page_type: string | null;
    price_type: string | null;
    preview_url: string | null;
    remix_url: string | null;
  };
}

const ProductHeader = ({ product }: ProductHeaderProps) => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const getMainButtonText = () => {
    if (product.price_type === 'Premium') {
      return subscription.subscribed ? "Get the Remix Link" : "Upgrade to Premium";
    }
    return "Get the Remix Link";
  };

  const handleMainButtonClick = () => {
    // If user is not signed up, redirect to sign up page
    if (!user) {
      navigate('/signup');
      return;
    }
    
    // If user is signed up but product is premium
    if (product.price_type === 'Premium') {
      navigate('/dashboard');
      return;
    }
    
    // User is authenticated and has access - open the remix link
    if (product.remix_url) {
      window.open(product.remix_url, '_blank');
      toast({
        title: "Opening Remix Link",
        description: "The template is now opening in a new tab.",
      });
    } else {
      toast({
        title: "Remix Link Not Available",
        description: "The remix link for this template is not yet configured.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewClick = () => {
    // Preview should work for everyone regardless of auth status
    if (product.preview_url) {
      window.open(product.preview_url, '_blank');
      toast({
        title: "Opening Preview",
        description: "The preview is now opening in a new tab.",
      });
    } else {
      toast({
        title: "Preview Not Available",
        description: "The preview link for this template is not yet configured.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 sm:mb-12">
      <div className="flex flex-col gap-4 sm:gap-6 max-w-2xl w-full">
        <div className="flex items-center gap-2">
          <img 
            src="/images/image.png" 
            alt="Made for Lovable" 
            className="h-6 sm:h-8"
          />
        </div>
        
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight">
          {product.name}
        </h1>
        
        <div className="text-[#7D8187] text-sm sm:text-base font-normal">
          {new Date(product.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} ∙ {product.page_type || 'Web Application'}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button 
          variant="outline" 
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full border-[#404040] bg-transparent text-white text-xs sm:text-sm font-mono uppercase tracking-[1.4px] hover:bg-white/10 w-full sm:w-auto"
          onClick={handlePreviewClick}
        >
          Preview
        </Button>
        <Button 
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white text-black text-xs sm:text-sm font-mono uppercase tracking-[1.4px] hover:bg-gray-200 w-full sm:w-auto"
          onClick={handleMainButtonClick}
        >
          {getMainButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default ProductHeader;
