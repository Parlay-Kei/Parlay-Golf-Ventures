import { Link } from "react-router-dom";
import NewsBulletin from "@/components/NewsBulletin";
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-text-light pt-20 pb-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6TTEyIDQyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2em0xMi0xMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
      
      {/* Wave divider at the top */}
      <div className="absolute top-0 left-0 w-full h-12 pgv-wave-divider pgv-wave-divider-gold transform rotate-180"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter signup */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="pgv-glass-card p-8 rounded-2xl border border-white/10 shadow-card">
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl md:text-3xl font-bold pgv-gold-text mb-2">Stay in the Loop</h3>
              <p className="text-text-light">Subscribe to our newsletter for the latest updates and opportunities.</p>
            </div>
            <form className="flex flex-col md:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow bg-white/10 text-text-light placeholder-text-light/50 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all duration-300"
              />
              <Button 
                className="pgv-button" 
              >
                Subscribe <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div>
            <div className="mb-4">
              <img src="/images/pgv-logo.png" alt="Parlay Golf Ventures" className="h-14" />
            </div>
            <h3 className="font-serif text-xl font-bold pgv-gold-text mb-4">Parlay Golf Ventures</h3>
            <p className="text-text-light/80 mb-6">
              Creating pathways for underprivileged golfers to pursue their passion and reach their full potential.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-text-light/60 hover:text-secondary transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-text-light/60 hover:text-secondary transition-colors duration-300">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-light/60 hover:text-secondary transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-text-light/60 hover:text-secondary transition-colors duration-300">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-text-light mb-6 text-lg">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/contribute/hub" className="text-text-light/80 hover:text-secondary transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                  Upload Your Swing
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-text-light/80 hover:text-secondary transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                  Featured Golfers
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-text-light/80 hover:text-secondary transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-text-light/80 hover:text-secondary transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                  Hybrid Tournament
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-text-light mb-6 text-lg">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/academy" className="text-text-light/80 hover:text-secondary transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                  Academy
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-text-light/80 hover:text-secondary transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                  News & Updates
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-text-light/80 hover:text-secondary transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-text-light/80 hover:text-secondary transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                  Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="pgv-glass-card p-6 rounded-xl border border-white/5">
            <NewsBulletin variant="footer" maxItems={3} showDate={true} showCategory={false} showDismissButton={false} />
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-light/60 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Parlay Golf Ventures. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/coming-soon" className="text-text-light/60 hover:text-text-light text-sm transition-colors duration-300">Privacy Policy</Link>
              <Link to="/coming-soon" className="text-text-light/60 hover:text-text-light text-sm transition-colors duration-300">Terms of Service</Link>
              <Link to="/coming-soon" className="text-text-light/60 hover:text-text-light text-sm transition-colors duration-300">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
