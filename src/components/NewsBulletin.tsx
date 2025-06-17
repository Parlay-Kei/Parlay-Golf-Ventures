import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { Link } from "react-router-dom";

// Sample news data - in a real app, this would come from an API or CMS
const defaultNews = [
  {
    id: 1,
    title: "PGV Hosts Inaugural Hybrid Tournament",
    date: "April 5, 2025",
    excerpt: "Join us for our first-ever hybrid tournament combining in-person and simulator play.",
    link: "/tournament",
    category: "Events"
  },
  {
    id: 2,
    title: "New IoT-Enabled Clubs Available in Store",
    date: "March 28, 2025",
    excerpt: "Our latest smart clubs with embedded sensors are now available for purchase.",
    link: "/store",
    category: "Products"
  },
  {
    id: 3,
    title: "Academy Launches Advanced Training Program",
    date: "March 15, 2025",
    excerpt: "Elevate your game with our new advanced training modules led by PGA professionals.",
    link: "/academy",
    category: "Academy"
  },
  {
    id: 4,
    title: "Community Impact: 500 Underprivileged Youth Reached",
    date: "March 10, 2025",
    excerpt: "Our community programs have now provided golf access to over 500 underprivileged youth.",
    link: "/community",
    category: "Impact"
  },
  {
    id: 5,
    title: "Partnership Announcement: Major Golf Brand Collaboration",
    date: "February 22, 2025",
    excerpt: "Exciting new partnership to develop next-generation golf technology.",
    link: "/partnerships",
    category: "Business"
  }
];

type NewsBulletinProps = {
  news?: typeof defaultNews;
  showDismissButton?: boolean;
  variant?: "banner" | "sidebar" | "footer";
  maxItems?: number;
  showDate?: boolean;
  showCategory?: boolean;
  className?: string;
};

const NewsBulletin = ({
  news = defaultNews,
  showDismissButton = true,
  variant = "banner",
  maxItems = 3,
  showDate = true,
  showCategory = true,
  className = "",
}: NewsBulletinProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const visibleNews = news.slice(0, maxItems);
  
  // Determine which items to show based on the current index and maxItems
  const displayedNews = variant === "banner" 
    ? [news[currentIndex]] 
    : visibleNews;

  const nextNews = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const prevNews = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  // Different layouts based on variant
  if (variant === "banner") {
    return (
      <div className={`bg-pgv-green-light/90 text-white py-3 px-4 relative ${className}`}>
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <button 
            onClick={prevNews} 
            className="text-white/80 hover:text-white p-1 rounded-full transition-colors"
            aria-label="Previous news"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex-1 mx-4 text-center md:text-left">
            {displayedNews.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center md:gap-3">
                {showCategory && (
                  <span className="bg-pgv-gold text-pgv-green text-xs font-bold px-2 py-0.5 rounded inline-block mb-1 md:mb-0 whitespace-nowrap">
                    {item.category}
                  </span>
                )}
                <div className="flex-1 truncate flex items-center">
                  {item.category === "Events" && (
                    <span className="mr-2 hidden md:inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pgv-gold">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </span>
                  )}
                  <Link to={item.link} className="font-bold hover:underline pgv-gold-foil-text">
                    {item.title}
                  </Link>
                  {showDate && <span className="text-xs text-white/70 ml-2">{item.date}</span>}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center">
            <Link 
              to={displayedNews[0]?.link || "/news"}
              className="hidden sm:block text-sm text-white hover:text-pgv-gold hover:underline mr-4 whitespace-nowrap transition-colors duration-200 font-medium"
            >
              Learn More <span className="ml-1">→</span>
            </Link>
            <button 
              onClick={nextNews} 
              className="text-white/80 hover:text-white p-1 rounded-full transition-colors"
              aria-label="Next news"
            >
              <ChevronRight size={18} />
            </button>
            
            {showDismissButton && (
              <button 
                onClick={() => setIsDismissed(true)} 
                className="ml-2 text-white/80 hover:text-white p-1 rounded-full transition-colors"
                aria-label="Dismiss news"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-xl text-pgv-green">Latest News</h3>
          {showDismissButton && (
            <button 
              onClick={() => setIsDismissed(true)} 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              aria-label="Dismiss news"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {displayedNews.map((item) => (
            <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start gap-2 mb-1">
                {showCategory && (
                  <span className="bg-pgv-green/10 text-pgv-green text-xs font-bold px-2 py-1 rounded inline-block shrink-0">
                    {item.category}
                  </span>
                )}
                <Link to={item.link} className="font-bold text-gray-800 hover:text-pgv-green">
                  {item.title}
                </Link>
              </div>
              {showDate && <p className="text-xs text-gray-500 mb-2">{item.date}</p>}
              <p className="text-sm text-gray-600">{item.excerpt}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/news">
            <Button variant="outline" className="text-pgv-green border-pgv-green hover:bg-pgv-green/10 text-sm">
              View All News
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Footer variant
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-xl text-white">Latest Updates</h3>
        {showDismissButton && (
          <button 
            onClick={() => setIsDismissed(true)} 
            className="text-white/70 hover:text-white p-1 rounded-full transition-colors"
            aria-label="Dismiss news"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {displayedNews.map((item) => (
          <div key={item.id} className="border-b border-white/10 pb-2 last:border-0 last:pb-0">
            <Link to={item.link} className="font-bold text-white hover:text-pgv-gold">
              {item.title}
            </Link>
            {showDate && <p className="text-xs text-white/70">{item.date}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsBulletin;
