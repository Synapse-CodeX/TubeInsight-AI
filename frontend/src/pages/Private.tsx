
import { useEffect } from 'react';
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Privacy = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-screen bg-black">
      <Navbar user={user} onSignOut={handleSignOut} />
      
      <main className="w-full px-4 md:px-16 py-14 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <h1 className="text-white text-3xl md:text-5xl font-normal leading-tight">
                Privacy Policy
              </h1>
              <p className="text-[#7D8187] text-base leading-6">
                Updated March 30, 2026
              </p>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-8 text-[#7D8187]">
              <p className="text-base leading-6">
                TubeInsight respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and disclose your personal information when you use our website and services.
              </p>

              <section>
                <h2 className="text-white text-xl font-normal mb-4">Collection of Personal Information</h2>
                <p className="text-base leading-6">
                  We collect personal information from you when you register for an account on our website or make a payment. The personal information we collect may include your name, email address, and payment information.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl font-normal mb-4">Use of Personal Information</h2>
                <p className="text-base leading-6 mb-4">
                  We use your personal information to provide our services to you, including processing payments and delivering our digital products. We may also use your email address to send you promotional offers and updates about our services.
                </p>
                <p className="text-base leading-6">
                  <strong>Account verification:</strong> Before you can fully utilize your account, we may use your email address to verify the authenticity of your account. This helps us ensure the security and integrity of our platform.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl font-normal mb-4">Disclosure of Personal Information</h2>
                <p className="text-base leading-6 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties.
                </p>
                <p className="text-base leading-6">
                  However, we may disclose your personal information to third-party service providers who help us provide our services, such as our payment processor and hosting provider. We require these service providers to protect your personal information and to only use it for the purposes of providing their services to us.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl font-normal mb-4">Use of Cookies</h2>
                <p className="text-base leading-6">
                  We use cookies to store your login information to provide you with a better user experience. We do not use cookies for any other purpose.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl font-normal mb-4">Security</h2>
                <p className="text-base leading-6">
                  We take reasonable measures to protect your personal information from unauthorized access, disclosure, or modification. However, no method of transmission over the internet, or method of electronic storage, is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-white text-xl font-normal mb-4">Contact Us</h2>
                <p className="text-base leading-6">
                  If you have any questions or concerns about our Privacy Policy, please contact us at support@tubeinsight.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
