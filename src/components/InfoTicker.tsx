import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, Info, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import GolfScoreTicker from "./GolfScoreTicker";

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

type InfoTickerProps = {
  news?: typeof defaultNews;
  showDismissButton?: boolean;
  variant?: "banner" | "sidebar" | "footer";
  maxItems?: number;
  className?: string;
};

const InfoTicker = ({
  news = defaultNews,
  showDismissButton = true,
  variant = "banner",
  maxItems = 3,
  className = "",
}: InfoTickerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'scores'>('news');

  if (isDismissed) return null;

  const nextNews = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const prevNews = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };
  
  const handleCloseScores = () => {
    setActiveTab('news');
  };

  return (
    <div className={`relative shadow-sm ${className} z-[1000]`}>
      {/* Tabs */}
      <div className="flex bg-pgv-forest text-text-inverse">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center space-x-1 py-2 px-4 ${activeTab === 'news' ? 'bg-pgv-forest/80' : 'hover:bg-pgv-forest/50'} transition-colors`}
        >
          <Info size={16} />
          <span className="font-headline font-medium text-sm text-pgv-gold">News</span>
        </button>
        <button
          onClick={() => setActiveTab('scores')}
          className={`flex items-center space-x-1 py-2 px-4 ${activeTab === 'scores' ? 'bg-pgv-forest/80' : 'hover:bg-pgv-forest/50'} transition-colors`}
        >
          <Trophy size={16} />
          <span className="font-headline font-medium text-sm text-pgv-gold">Live Scores</span>
        </button>
        
        {showDismissButton && (
          <button
            onClick={() => setIsDismissed(true)}
            className="ml-auto text-text-inverse hover:text-pgv-gold p-2 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Content */}
      {activeTab === 'news' ? (
        <div className="bg-pgv-forest/90 text-text-inverse py-3 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <button 
              onClick={prevNews} 
              className="text-text-inverse hover:text-pgv-gold p-1 rounded-full transition-colors"
              aria-label="Previous news"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex-1 mx-4 text-center">
              <div className="inline-flex items-center">
                <span className="bg-pgv-gold text-pgv-forest text-xs font-bold px-2 py-0.5 rounded mr-2">
                  {news[currentIndex].category}
                </span>
                <span className="text-sm md:text-base font-headline font-medium text-text-inverse">
                  {news[currentIndex].title}
                </span>
                <Link 
                  to={news[currentIndex].link} 
                  className="ml-2 text-pgv-gold hover:text-pgv-rust transition-colors"
                >
                  <span className="hidden md:inline">Learn More</span>
                  <ChevronRight size={16} className="inline" />
                </Link>
              </div>
            </div>
            
            <button 
              onClick={nextNews} 
              className="text-text-inverse hover:text-pgv-gold p-1 rounded-full transition-colors"
              aria-label="Next news"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ) : (
        <GolfScoreTicker showCloseButton={true} onClose={handleCloseScores} />
      )}
    </div>
  );
};

export default InfoTicker;
