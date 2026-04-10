
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarProps {
  user: User | null;
  onSignOut?: () => void;
}

const Navbar = ({
  user,
  onSignOut
}: NavbarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBrowseClick = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('products-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById('products-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGetStartedClick = () => {
    navigate('/dashboard');
  };

  const handleAccountClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleSignInClick = () => {
    navigate('/signin');
  };

  const linkStyles = "text-white/50 text-sm font-mono font-normal uppercase tracking-[1.4px] leading-5 hover:text-white/70 transition-colors cursor-pointer";

  return (
    <nav className="w-full bg-transparent backdrop-blur-sm px-4 md:px-16 py-4 absolute z-20 top-0 left-0 right-0">
      <div className="flex justify-between items-center gap-8">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <Link to="/" className="text-white text-xl font-bold tracking-tight">
            TUBEINSIGHT
          </Link>
        </div>

        {/* Links & Auth */}
        <div className="flex items-center gap-8">
          {!isMobile && (
            <div className="flex items-center gap-8">
              <span onClick={handleBrowseClick} className={linkStyles}>
                ANALYSIS
              </span>
              {user ? (
                <>
                  <span onClick={handleAccountClick} className={linkStyles}>
                    DASHBOARD
                  </span>
                  <span onClick={onSignOut} className={linkStyles}>
                    SIGN OUT
                  </span>
                </>
              ) : (
                <span onClick={handleSignInClick} className={linkStyles}>
                  SIGN IN
                </span>
              )}
            </div>
          )}

          {/* Mobile Menu / Get Started Button */}
          <div className="flex items-center gap-4">
            {!user && (
              <Button 
                variant="hero" 
                size="default" 
                className="text-white/50 text-sm font-mono font-normal uppercase tracking-[1.4px] leading-5" 
                onClick={handleGetStartedClick}
              >
                GET STARTED
              </Button>
            )}

            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black border-white/10">
                  <nav className="flex flex-col gap-4 mt-8">
                    <span onClick={handleBrowseClick} className="text-white/70 hover:text-white cursor-pointer py-2 uppercase font-mono tracking-wider">
                      Analysis
                    </span>
                    {user ? (
                      <>
                        <Link to="/dashboard" className="text-white/70 hover:text-white cursor-pointer py-2 uppercase font-mono tracking-wider">
                          Dashboard
                        </Link>
                        <span onClick={onSignOut} className="text-white/70 hover:text-white cursor-pointer py-2 uppercase font-mono tracking-wider">
                          Sign Out
                        </span>
                      </>
                    ) : (
                      <Link to="/signin" className="text-white/70 hover:text-white cursor-pointer py-2 uppercase font-mono tracking-wider">
                        Sign In
                      </Link>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;