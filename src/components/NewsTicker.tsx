import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NewsItem {
  id: string;
  text: string;
  type: "news" | "score" | "update";
  link?: string;
}

const SAMPLE_NEWS: NewsItem[] = [
  { id: "1", text: "PGV Announces New Membership Tiers for 2025", type: "news" },
  { id: "2", text: "LIVE: Parlay Open - Round 2 Underway", type: "score" },
  { id: "3", text: "Registration Open for Summer Junior Camp Series", type: "update" },
  { id: "4", text: "SCORES: Johnson (-6) leads after first round at Augusta", type: "score" },
  { id: "5", text: "New Short Game Tutorial Series Released Today", type: "news" },
];

export default function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>(SAMPLE_NEWS);
  const [paused, setPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (paused || !tickerRef.current) return;

    const scrollSpeed = 1; // pixels per frame
    const tickerElement = tickerRef.current;
    let animationFrameId: number;
    let lastTimestamp: number;

    const scroll = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;

      if (elapsed > 16) { // roughly 60fps
        lastTimestamp = timestamp;
        tickerElement.scrollLeft += scrollSpeed;

        // Reset scroll position when reaching the end
        if (tickerElement.scrollLeft >= tickerElement.scrollWidth - tickerElement.clientWidth) {
          tickerElement.scrollLeft = 0;
        }
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [paused]);

  const handlePause = () => {
    setPaused(!paused);
  };

  const handleNext = () => {
    if (tickerRef.current) {
      tickerRef.current.scrollLeft += 200;
    }
  };

  const handlePrev = () => {
    if (tickerRef.current) {
      tickerRef.current.scrollLeft -= 200;
    }
  };

  // In a real app, you would fetch news from an API
  useEffect(() => {
    // Simulating API fetch
    const fetchNews = async () => {
      // In a real app, this would be an API call
      // const response = await fetch('/api/news');
      // const data = await response.json();
      // setNews(data);
    };

    fetchNews();
  }, []);

  return (
    <div className="bg-pgv-green-dark text-white py-1 overflow-hidden relative">
      <div className="container mx-auto px-4 flex items-center">
        <div className="flex-shrink-0 mr-4 font-bold text-pgv-gold text-sm uppercase tracking-wider">
          PGV Live:
        </div>
        
        <div 
          ref={tickerRef}
          className="flex-1 overflow-x-hidden whitespace-nowrap scrollbar-hide"
          style={{ scrollBehavior: paused ? 'auto' : 'smooth' }}
        >
          <div className="inline-flex space-x-8 whitespace-nowrap">
            {news.map((item) => (
              <div key={item.id} className="inline-flex items-center space-x-2">
                <span 
                  className={`h-2 w-2 rounded-full ${item.type === 'score' ? 'bg-red-500 animate-pulse' : item.type === 'update' ? 'bg-blue-400' : 'bg-pgv-gold'}`}
                ></span>
                <span className="text-sm">
                  {item.link ? (
                    <a href={item.link} className="hover:underline">{item.text}</a>
                  ) : (
                    item.text
                  )}
                </span>
              </div>
            ))}
            
            {/* Duplicate items for continuous scrolling effect */}
            {news.map((item) => (
              <div key={`dup-${item.id}`} className="inline-flex items-center space-x-2">
                <span 
                  className={`h-2 w-2 rounded-full ${item.type === 'score' ? 'bg-red-500 animate-pulse' : item.type === 'update' ? 'bg-blue-400' : 'bg-pgv-gold'}`}
                ></span>
                <span className="text-sm">
                  {item.link ? (
                    <a href={item.link} className="hover:underline">{item.text}</a>
                  ) : (
                    item.text
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-4 flex space-x-2">
          <button 
            onClick={handlePrev}
            className="p-1 hover:bg-pgv-green rounded-full transition-colors"
            aria-label="Previous news"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={handlePause}
            className="p-1 hover:bg-pgv-green rounded-full transition-colors"
            aria-label={paused ? "Resume" : "Pause"}
          >
            {paused ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button 
            onClick={handleNext}
            className="p-1 hover:bg-pgv-green rounded-full transition-colors"
            aria-label="Next news"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
