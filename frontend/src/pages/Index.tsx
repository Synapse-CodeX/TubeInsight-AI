
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/use-page-meta';


import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import { AnimatedGallerySection } from "@/components/animated-gallery-section";
import BenefitsSection from "@/components/benefits-section";
import PortfolioSection from "@/components/portfolio-section";

import ContactFormSection from "@/components/contact-form-section";

import ProductsSection from "@/components/products-section";


import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const Index = () => {
  usePageMeta({
    title: "TubeInsight - AI-Powered Video Analysis",
    description: "TubeInsight provides deep insights into YouTube channels and videos using advanced AI analysis.",
    keywords: "youtube analysis, ai video insights, channel growth, tubeinsight",
    canonical: "https://tubeinsight.com/",
    ogImage: ""
  });
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <SchemaMarkup type="organization" />
      <SchemaMarkup type="website" />
      
      
      <Navbar user={user} onSignOut={handleSignOut} />
      <main>
        <HeroSection />
        <AnimatedGallerySection />
        <BenefitsSection />
        <PortfolioSection />

        <ContactFormSection />
        <ProductsSection />
        
        
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
