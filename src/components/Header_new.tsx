import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Menu, X, ChevronDown } from "lucide-react";
import { User } from "@supabase/supabase-js";

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect for transparent header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Get initial user state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isHomePage = location.pathname === '/';
  // Changed bg-transparent to bg-pgv-green for better visibility
  const headerClass = `fixed w-full z-50 transition-all duration-400 ${isScrolled || !isHomePage || isMenuOpen ? 'bg-white py-2 shadow-soft' : 'bg-pgv-green py-3'}${isMenuOpen ? ' bg-white shadow-medium' : ''}`;

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center transition-transform duration-300 hover:scale-105"
          >
            <span className={`font-serif font-bold text-xl md:text-2xl ${isScrolled || !isHomePage || isMenuOpen ? 'text-pgv-green' : 'text-white'}`}>
              PGV
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className={`md:hidden p-2 rounded-md focus:outline-none transition-colors ${isScrolled || !isHomePage || isMenuOpen ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className={`h-6 w-6 ${isScrolled || !isHomePage || isMenuOpen ? 'text-gray-600' : 'text-white'}`} />
          ) : (
            <Menu className={`h-6 w-6 ${isScrolled || !isHomePage || isMenuOpen ? 'text-gray-600' : 'text-white'}`} />
          )}
        </button>

        {/* Desktop Navigation - increased spacing from space-x-2 to space-x-4 */}
        <nav className="hidden md:flex items-center space-x-4">
          <div className="relative group">
            <button 
              onClick={() => toggleDropdown('academy')} 
              className={`flex items-center font-medium text-sm ${isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'} hover:text-pgv-green transition-colors duration-200`}
            >
              ACADEMY
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 ${activeDropdown === 'academy' ? 'rotate-180' : ''}" />
            </button>
            <div className={`absolute left-0 mt-2 w-48 rounded-md shadow-medium bg-white overflow-hidden transition-all duration-200 ${activeDropdown === 'academy' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <div className="py-1">
                <Link to="/academy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pgv-green hover:text-white transition-colors duration-200">Overview</Link>
                <Link to="/academy/short-game-secrets" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pgv-green hover:text-white transition-colors duration-200">Short Game Secrets</Link>
                <Link to="/academy/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pgv-green hover:text-white transition-colors duration-200">Dashboard</Link>
                <Link to="/academy/schedule-review" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pgv-green hover:text-white transition-colors duration-200">Schedule Review</Link>
              </div>
            </div>
          </div>
          
          <Link 
            to="/upload" 
            className={`font-medium text-sm ${isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'} hover:text-pgv-green transition-colors duration-200 border-b-2 border-transparent hover:border-pgv-green pb-1`}
          >
            UPLOAD SWING
          </Link>
          
          <Link 
            to="/tournament" 
            className={`font-medium text-sm ${isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'} hover:text-pgv-green transition-colors duration-200 border-b-2 border-transparent hover:border-pgv-green pb-1`}
          >
            TOURNAMENT
          </Link>
          
          <Link 
            to="/news" 
            className={`font-medium text-sm ${isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'} hover:text-pgv-green transition-colors duration-200 border-b-2 border-transparent hover:border-pgv-green pb-1`}
          >
            NEWS
          </Link>
          
          <div className="relative group">
            <button 
              onClick={() => toggleDropdown('more')} 
              className={`flex items-center font-medium text-sm ${isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'} hover:text-pgv-green transition-colors duration-200`}
            >
              MORE
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 ${activeDropdown === 'more' ? 'rotate-180' : ''}" />
            </button>
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-medium bg-white overflow-hidden transition-all duration-200 ${activeDropdown === 'more' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <div className="py-1">
                <Link to="/community" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pgv-green hover:text-white transition-colors duration-200">Community</Link>
                <Link to="/membership" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pgv-green hover:text-white transition-colors duration-200">Membership</Link>
                <Link to="/store" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pgv-green hover:text-white transition-colors duration-200">Store</Link>
              </div>
            </div>
          </div>
          
          {isDevelopment && (
            <Link 
              to="/admin/academy" 
              className="text-amber-600 hover:text-amber-800 font-medium text-sm transition-colors duration-200 border-b-2 border-transparent hover:border-amber-600 pb-1"
            >
              ADMIN
            </Link>
          )}
          
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button 
                  variant={isScrolled || !isHomePage ? "outline" : "secondary"} 
                  className={`btn-hover-float text-sm py-1 px-4 ${isScrolled || !isHomePage ? "border-pgv-green text-pgv-green hover:bg-pgv-green/10" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"}`}
                >
                  DASHBOARD
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className={`hover:text-pgv-green text-sm py-1 px-4 ${isScrolled || !isHomePage ? 'text-gray-700' : 'text-white hover:text-white'}`}
                onClick={handleSignOut}
              >
                SIGN OUT
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button 
                  variant={isScrolled || !isHomePage ? "outline" : "secondary"} 
                  className={`btn-hover-float text-sm py-1 px-4 ${isScrolled || !isHomePage ? "border-pgv-green text-pgv-green hover:bg-pgv-green/10" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"}`}
                >
                  LOG IN
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  className={`btn-lightspeed text-sm py-1 px-4 ${isScrolled || !isHomePage 
                    ? "bg-pgv-green text-white hover:bg-pgv-green-dark" 
                    : "bg-pgv-gold text-pgv-green hover:bg-pgv-gold-dark"}`}
                >
                  SIGN UP
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-medium md:hidden">
            <div className="container mx-auto px-4 py-4">
              <nav className="space-y-4">
                <div>
                  <button 
                    onClick={() => toggleDropdown('mobile-academy')} 
                    className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-pgv-green transition-colors duration-200"
                  >
                    ACADEMY
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'mobile-academy' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'mobile-academy' && (
                    <div className="mt-2 ml-4 space-y-2">
                      <Link to="/academy" className="block text-sm text-gray-600 hover:text-pgv-green transition-colors duration-200">Overview</Link>
                      <Link to="/academy/short-game-secrets" className="block text-sm text-gray-600 hover:text-pgv-green transition-colors duration-200">Short Game Secrets</Link>
                      <Link to="/academy/dashboard" className="block text-sm text-gray-600 hover:text-pgv-green transition-colors duration-200">Dashboard</Link>
                      <Link to="/academy/schedule-review" className="block text-sm text-gray-600 hover:text-pgv-green transition-colors duration-200">Schedule Review</Link>
                    </div>
                  )}
                </div>
                
                <Link to="/upload" className="block font-medium text-gray-700 hover:text-pgv-green transition-colors duration-200">
                  UPLOAD SWING
                </Link>
                
                <Link to="/tournament" className="block font-medium text-gray-700 hover:text-pgv-green transition-colors duration-200">
                  TOURNAMENT
                </Link>
                
                <Link to="/news" className="block font-medium text-gray-700 hover:text-pgv-green transition-colors duration-200">
                  NEWS
                </Link>
                
                <div>
                  <button 
                    onClick={() => toggleDropdown('mobile-more')} 
                    className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-pgv-green transition-colors duration-200"
                  >
                    MORE
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'mobile-more' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === 'mobile-more' && (
                    <div className="mt-2 ml-4 space-y-2">
                      <Link to="/community" className="block text-sm text-gray-600 hover:text-pgv-green transition-colors duration-200">Community</Link>
                      <Link to="/membership" className="block text-sm text-gray-600 hover:text-pgv-green transition-colors duration-200">Membership</Link>
                      <Link to="/store" className="block text-sm text-gray-600 hover:text-pgv-green transition-colors duration-200">Store</Link>
                    </div>
                  )}
                </div>
                
                {isDevelopment && (
                  <Link to="/admin/academy" className="block font-medium text-amber-600 hover:text-amber-800 transition-colors duration-200">
                    ADMIN
                  </Link>
                )}
                
                {user ? (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <Link to="/dashboard">
                      <Button className="w-full btn-hover-float bg-pgv-green text-white hover:bg-pgv-green-dark">
                        DASHBOARD
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full hover:text-pgv-green"
                      onClick={handleSignOut}
                    >
                      SIGN OUT
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <Link to="/login">
                      <Button variant="outline" className="w-full btn-hover-float border-pgv-green text-pgv-green hover:bg-pgv-green/10">
                        LOG IN
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full btn-lightspeed bg-pgv-green text-white hover:bg-pgv-green-dark">
                        SIGN UP
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
