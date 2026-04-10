import { X } from "lucide-react";
import { useState } from "react";

const TopBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="text-white py-2 px-4 relative" style={{ background: 'linear-gradient(147deg, #4B73FF 0%, #FF66F4 27%, #FF0105 66%)' }}>
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm font-medium">
          Special Offer: 60% OFF – Ends in 48 Hours! Use code: <span className="font-bold">LAUNCH60</span> at checkout.
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        aria-label="Close banner"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default TopBanner;