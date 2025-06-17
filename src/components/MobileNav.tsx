import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react"; // Or any icons you prefer
import { useFocusTrap } from "@/hooks/useFocusTrap";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ContentPageFallback } from "@/components/fallbacks";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const MobileNavContent = () => {
  const [open, setOpen] = useState(false);
  const navRef = useFocusTrap<HTMLDivElement>(open, () => setOpen(false));
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const menuItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Arrow key navigation handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!navRef.current) return;
      const focusable = menuItemRefs.current.filter(Boolean);
      if (focusable.length === 0) return;
      const currentIndex = focusable.findIndex(el => el === document.activeElement);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
        focusable[prevIndex]?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Define navigation items with status indicators
  const navItems = [
    { label: "Home", path: "/", status: "complete" },
    { label: "Dashboard", path: "/dashboard", status: "inProgress" },
    { label: "Academy", path: "/academy", status: "inProgress" },
    { label: "Upload Swing", path: "/upload-swing", status: "inProgress" },
    { label: "Community", path: "/community", status: "inProgress" },
    { label: "Membership", path: "/membership", status: "complete" },
    { label: "Contribute", path: "/contribute", status: "inProgress" },
  ];

  // Filter items based on authentication status
  const filteredNavItems = navItems.filter(item => {
    // Only show Dashboard to logged in users
    if (item.path === "/dashboard" && !user) return false;
    return true;
  });

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    return path !== "/" && location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className="md:hidden p-3 text-pgv-gold hover:text-pgv-gold-dark focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50 rounded-md"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Nav Panel */}
      <div
        id="mobile-menu"
        ref={navRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-pgv-forest text-white z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-pgv-gold">
          <span className="text-xl font-bold text-pgv-gold">Menu</span>
          <button 
            onClick={() => setOpen(false)}
            className="text-pgv-gold hover:text-pgv-gold-dark focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50 rounded-md p-1"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex flex-col p-6 gap-6">
          {filteredNavItems.map((item, idx) => (
            <Link
              key={item.path}
              to={item.path}
              ref={el => menuItemRefs.current[idx] = el}
              className={cn(
                "relative flex items-center justify-between transition-colors duration-200 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50 rounded-md p-2",
                isActive(item.path)
                  ? "text-pgv-gold font-semibold pl-4"
                  : "text-white hover:text-pgv-gold-light"
              )}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              <div className="flex items-center">
                {isActive(item.path) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-pgv-gold rounded-r-md" />
                )}
                {item.label}
              </div>
              {item.status === "inProgress" && (
                <span className="text-xs px-1.5 py-0.5 bg-yellow-600/30 text-yellow-300 rounded-md ml-2" title="In progress">⚠️</span>
              )}
            </Link>
          ))}
          
          {isAdmin && (
            <Link 
              to="/admin" 
              className={cn(
                "relative flex items-center transition-colors duration-200 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50 rounded-md p-2",
                isActive("/admin")
                  ? "text-pgv-rust font-semibold pl-4"
                  : "text-pgv-rust hover:text-pgv-rust/80"
              )}
              onClick={() => setOpen(false)}
            >
              {isActive("/admin") && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-pgv-rust rounded-r-md" />
              )}
              Admin
            </Link>
          )}

          <div className="pt-4 mt-4 border-t border-pgv-gold">
            {!user ? (
              <div className="flex flex-col gap-3">
                <Link 
                  to="/login" 
                  className={cn(
                    "text-sm text-pgv-gold hover:text-pgv-gold-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50 rounded-md p-2",
                    isActive("/login") && "font-semibold"
                  )}
                  onClick={() => setOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block text-center bg-pgv-gold text-pgv-forest font-bold py-2 rounded hover:bg-pgv-gold-dark transition focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50"
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  to="/dashboard" 
                  className={cn(
                    "text-sm text-pgv-gold hover:text-pgv-gold-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50 rounded-md p-2",
                    isActive("/dashboard") && "font-semibold"
                  )}
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={cn(
                    "text-sm text-pgv-gold hover:text-pgv-gold-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50 rounded-md p-2",
                    isActive("/profile") && "font-semibold"
                  )}
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/profile/settings" 
                  className={cn(
                    "text-sm text-pgv-gold hover:text-pgv-gold-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pgv-gold focus:ring-opacity-50 rounded-md p-2",
                    isActive("/profile/settings") && "font-semibold"
                  )}
                  onClick={() => setOpen(false)}
                >
                  Settings
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
      
      {/* Overlay to capture clicks outside the menu */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default function MobileNav() {
  return (
    <ErrorBoundary 
      routeName="mobile-navigation" 
      fallback={<div className="md:hidden"><Menu size={24} className="text-pgv-gold" /></div>}
    >
      <MobileNavContent />
    </ErrorBoundary>
  );
}