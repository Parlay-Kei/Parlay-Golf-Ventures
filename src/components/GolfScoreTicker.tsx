import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Trophy, ExternalLink, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define types for our golf score data
interface GolferScore {
  id: string;
  name: string;
  position: string;
  score: string;
  today: string;
  thru?: string;
}

interface Tournament {
  id: string;
  name: string;
  location: string;
  date: string;
  source: string;
  sourceUrl: string;
  tour: string;
  scores: GolferScore[];
}

// In a real application, this would come from an API
const mockTournaments: Tournament[] = [
  {
    id: 'pga-1',
    name: 'Masters Tournament',
    location: 'Augusta National',
    date: 'April 5-11, 2025',
    source: 'PGA Tour',
    sourceUrl: 'https://www.pgatour.com',
    tour: 'PGA Tour',
    scores: [
      { id: 'p1', name: 'Scottie Scheffler', position: '1', score: '-8', today: '-3', thru: 'F' },
      { id: 'p2', name: 'Xander Schauffele', position: '2', score: '-6', today: '-4', thru: 'F' },
      { id: 'p3', name: 'Collin Morikawa', position: '3', score: '-5', today: '-2', thru: 'F' },
      { id: 'p4', name: 'Rory McIlroy', position: 'T4', score: '-4', today: '-1', thru: 'F' },
      { id: 'p5', name: 'Jon Rahm', position: 'T4', score: '-4', today: 'E', thru: 'F' },
      { id: 'p6', name: 'Viktor Hovland', position: 'T6', score: '-3', today: '-2', thru: 'F' },
      { id: 'p7', name: 'Brooks Koepka', position: 'T6', score: '-3', today: '-1', thru: 'F' },
      { id: 'p8', name: 'Justin Thomas', position: '8', score: '-2', today: 'E', thru: 'F' },
      { id: 'p9', name: 'Cameron Smith', position: 'T9', score: '-1', today: '+1', thru: 'F' },
      { id: 'p10', name: 'Patrick Cantlay', position: 'T9', score: '-1', today: '-1', thru: 'F' },
    ]
  },
  {
    id: 'lpga-1',
    name: 'LPGA Championship',
    location: 'Mission Hills',
    date: 'April 3-9, 2025',
    source: 'LPGA',
    sourceUrl: 'https://www.lpga.com',
    tour: 'LPGA Tour',
    scores: [
      { id: 'l1', name: 'Nelly Korda', position: '1', score: '-10', today: '-5', thru: 'F' },
      { id: 'l2', name: 'Jin Young Ko', position: '2', score: '-8', today: '-3', thru: 'F' },
      { id: 'l3', name: 'Lydia Ko', position: '3', score: '-7', today: '-2', thru: 'F' },
      { id: 'l4', name: 'Lexi Thompson', position: 'T4', score: '-5', today: '-1', thru: 'F' },
      { id: 'l5', name: 'Brooke Henderson', position: 'T4', score: '-5', today: 'E', thru: 'F' },
      { id: 'l6', name: 'Inbee Park', position: 'T6', score: '-4', today: '-2', thru: 'F' },
      { id: 'l7', name: 'Danielle Kang', position: 'T6', score: '-4', today: '-1', thru: 'F' },
      { id: 'l8', name: 'Hannah Green', position: '8', score: '-3', today: 'E', thru: 'F' },
      { id: 'l9', name: 'Sei Young Kim', position: 'T9', score: '-2', today: '+1', thru: 'F' },
      { id: 'l10', name: 'Minjee Lee', position: 'T9', score: '-2', today: '-2', thru: 'F' },
    ]
  },
  {
    id: 'dp-1',
    name: 'DP World Tour Championship',
    location: 'Jumeirah Golf Estates',
    date: 'April 4-10, 2025',
    source: 'DP World Tour',
    sourceUrl: 'https://www.europeantour.com',
    tour: 'DP World Tour',
    scores: [
      { id: 'd1', name: 'Tommy Fleetwood', position: '1', score: '-9', today: '-4', thru: 'F' },
      { id: 'd2', name: 'Matt Fitzpatrick', position: '2', score: '-7', today: '-3', thru: 'F' },
      { id: 'd3', name: 'Tyrrell Hatton', position: '3', score: '-6', today: '-2', thru: 'F' },
      { id: 'd4', name: 'Shane Lowry', position: 'T4', score: '-5', today: '-3', thru: 'F' },
      { id: 'd5', name: 'Robert MacIntyre', position: 'T4', score: '-5', today: '-1', thru: 'F' },
      { id: 'd6', name: 'Thomas Detry', position: 'T6', score: '-4', today: '-2', thru: 'F' },
      { id: 'd7', name: 'Rasmus Højgaard', position: 'T6', score: '-4', today: 'E', thru: 'F' },
      { id: 'd8', name: 'Adrian Meronk', position: '8', score: '-3', today: '-1', thru: 'F' },
      { id: 'd9', name: 'Guido Migliozzi', position: 'T9', score: '-2', today: '+1', thru: 'F' },
      { id: 'd10', name: 'Nicolai Højgaard', position: 'T9', score: '-2', today: '-2', thru: 'F' },
    ]
  },
  {
    id: 'korn-1',
    name: 'Korn Ferry Tour Championship',
    location: 'Victoria National GC',
    date: 'April 6-12, 2025',
    source: 'Korn Ferry Tour',
    sourceUrl: 'https://www.pgatour.com/korn-ferry-tour',
    tour: 'Korn Ferry Tour',
    scores: [
      { id: 'k1', name: 'Taylor Montgomery', position: '1', score: '-7', today: '-4', thru: 'F' },
      { id: 'k2', name: 'Brandon Wu', position: '2', score: '-6', today: '-3', thru: 'F' },
      { id: 'k3', name: 'Davis Thompson', position: '3', score: '-5', today: '-2', thru: 'F' },
      { id: 'k4', name: 'Justin Suh', position: 'T4', score: '-4', today: '-1', thru: 'F' },
      { id: 'k5', name: 'Nick Hardy', position: 'T4', score: '-4', today: 'E', thru: 'F' },
      { id: 'k6', name: 'Carl Yuan', position: 'T6', score: '-3', today: '-2', thru: 'F' },
      { id: 'k7', name: 'MJ Daffue', position: 'T6', score: '-3', today: '-1', thru: 'F' },
      { id: 'k8', name: 'Akshay Bhatia', position: '8', score: '-2', today: 'E', thru: 'F' },
      { id: 'k9', name: 'Trevor Werbylo', position: 'T9', score: '-1', today: '+1', thru: 'F' },
      { id: 'k10', name: 'Seonghyeon Kim', position: 'T9', score: '-1', today: '-1', thru: 'F' },
    ]
  },
  {
    id: 'champions-1',
    name: 'Regions Tradition',
    location: 'Greystone G&CC',
    date: 'April 5-9, 2025',
    source: 'PGA Tour Champions',
    sourceUrl: 'https://www.pgatour.com/champions',
    tour: 'PGA Tour Champions',
    scores: [
      { id: 'c1', name: 'Steven Alker', position: '1', score: '-8', today: '-3', thru: 'F' },
      { id: 'c2', name: 'Bernhard Langer', position: '2', score: '-7', today: '-4', thru: 'F' },
      { id: 'c3', name: 'Padraig Harrington', position: '3', score: '-6', today: '-2', thru: 'F' },
      { id: 'c4', name: 'Ernie Els', position: 'T4', score: '-5', today: '-3', thru: 'F' },
      { id: 'c5', name: 'Miguel Angel Jimenez', position: 'T4', score: '-5', today: '-1', thru: 'F' },
      { id: 'c6', name: 'Steve Stricker', position: 'T6', score: '-4', today: '-2', thru: 'F' },
      { id: 'c7', name: 'Jim Furyk', position: 'T6', score: '-4', today: 'E', thru: 'F' },
      { id: 'c8', name: 'Retief Goosen', position: '8', score: '-3', today: '-1', thru: 'F' },
      { id: 'c9', name: 'Vijay Singh', position: 'T9', score: '-2', today: '+1', thru: 'F' },
      { id: 'c10', name: 'Colin Montgomerie', position: 'T9', score: '-2', today: '-2', thru: 'F' },
    ]
  },
  {
    id: 'local-1',
    name: 'PGV Hybrid Tournament',
    location: 'Parlay Golf Club',
    date: 'April 5-8, 2025',
    source: 'PGV',
    sourceUrl: '/tournament',
    tour: 'PGV Tour',
    scores: [
      { id: 'h1', name: 'Michael Johnson', position: '1', score: '-6', today: '-2', thru: 'F' },
      { id: 'h2', name: 'Sarah Williams', position: '2', score: '-4', today: '-1', thru: 'F' },
      { id: 'h3', name: 'David Thompson', position: '3', score: '-3', today: 'E', thru: 'F' },
      { id: 'h4', name: 'Emma Rodriguez', position: 'T4', score: '-2', today: '+1', thru: 'F' },
      { id: 'h5', name: 'James Wilson', position: 'T4', score: '-2', today: '-2', thru: 'F' },
      { id: 'h6', name: 'Olivia Martinez', position: 'T6', score: '-1', today: '-1', thru: 'F' },
      { id: 'h7', name: 'Daniel Garcia', position: 'T6', score: '-1', today: 'E', thru: 'F' },
      { id: 'h8', name: 'Sophia Lee', position: '8', score: 'E', today: '-2', thru: 'F' },
      { id: 'h9', name: 'William Brown', position: 'T9', score: '+1', today: '+2', thru: 'F' },
      { id: 'h10', name: 'Ava Taylor', position: 'T9', score: '+1', today: '-1', thru: 'F' },
    ]
  }
];

interface GolfScoreTickerProps {
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const GolfScoreTicker = ({ className = '', onClose, showCloseButton = false }: GolfScoreTickerProps) => {
  const [activeTournamentIndex, setActiveTournamentIndex] = useState(0);
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [visibleScores, setVisibleScores] = useState(5);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Filter tournaments by active tour
  const filteredTournaments = activeTour 
    ? tournaments.filter(t => t.tour === activeTour)
    : tournaments;
  
  // Reset tournament index when changing tours
  useEffect(() => {
    setActiveTournamentIndex(0);
  }, [activeTour]);
  
  // In a real application, you would fetch data from an API here
  useEffect(() => {
    // Simulating data refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      refreshScores();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  const refreshScores = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // This would be replaced with an actual API call
      console.log('Refreshing golf scores...');
      // For now, we're just using the mock data
      setTournaments([...mockTournaments]);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };
  
  const nextTournament = () => {
    if (filteredTournaments.length <= 1) return;
    
    setActiveTournamentIndex((prev) => 
      prev === filteredTournaments.length - 1 ? 0 : prev + 1
    );
    
    // Scroll back to top when changing tournaments
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };
  
  const prevTournament = () => {
    if (filteredTournaments.length <= 1) return;
    
    setActiveTournamentIndex((prev) => 
      prev === 0 ? filteredTournaments.length - 1 : prev - 1
    );
    
    // Scroll back to top when changing tournaments
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };
  
  const toggleScoresView = () => {
    setVisibleScores(prev => prev === 5 ? 10 : 5);
  };
  
  // Get unique tour names
  const tours = Array.from(new Set(tournaments.map(t => t.tour)));
  
  // Get active tournament
  const activeTournament = filteredTournaments[activeTournamentIndex];
  
  if (!activeTournament) return null;
  
  return (
    <div className={`pgv-card pgv-glass-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden rounded-xl ${className}`}>
      {/* Tour filter tabs */}
      <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent bg-background/80 backdrop-blur-sm border-b border-accent/20">
        <button 
          onClick={() => setActiveTour(null)}
          className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${activeTour === null ? 'bg-primary text-text-light pgv-gold-foil-text' : 'text-text-dark hover:bg-accent/10'}`}
        >
          All Tours
        </button>
        {tours.map(tour => (
          <button
            key={tour}
            onClick={() => setActiveTour(tour)}
            className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${activeTour === tour ? 'bg-primary text-text-light pgv-gold-foil-text' : 'text-text-dark hover:bg-accent/10'}`}
          >
            {tour}
          </button>
        ))}
      </div>
      
      {/* Tournament header */}
      <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-text-light p-4 rounded-t-xl relative overflow-hidden">
        {/* Wave pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/wave-divider.svg')] bg-repeat-x bg-contain"></div>
        </div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-3">
            <img src="/images/pgv-logo.png" alt="PGV Logo" className="h-7" />
            <div>
              <h3 className="pgv-gold-foil-text text-lg font-bold">{activeTournament.name}</h3>
              <p className="text-sm opacity-80">{activeTournament.date}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">{activeTournament.location}</p>
            <p className="text-xs opacity-70">{activeTournament.source}</p>
          </div>
        </div>
      </div>
      
      {/* Scores table */}
      <div 
        className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100"
        ref={scrollRef}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-text-dark/70 uppercase tracking-wider">Pos</th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-text-dark/70 uppercase tracking-wider">Player</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-text-dark/70 uppercase tracking-wider">Score</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-text-dark/70 uppercase tracking-wider">Today</th>
              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-text-dark/70 uppercase tracking-wider">Thru</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeTournament.scores.slice(0, visibleScores).map((golfer) => (
              <tr key={golfer.id} className="hover:bg-accent/5 transition-colors group">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-text-dark group-hover:pgv-gold-foil-text transition-all duration-300">{golfer.position}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-text-dark/80 group-hover:text-text-dark transition-all duration-300">{golfer.name}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-medium text-text-dark group-hover:pgv-gold-foil-text transition-all duration-300">{golfer.score}</td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-center font-medium transition-all duration-300 ${golfer.today.startsWith('-') ? 'text-green-600 group-hover:text-green-700' : golfer.today.startsWith('+') ? 'text-red-600 group-hover:text-red-700' : 'text-text-dark/50 group-hover:text-text-dark/70'}`}>
                  {golfer.today}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-text-dark/50 group-hover:text-text-dark/70 transition-all duration-300">{golfer.thru}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Tournament navigation controls */}
      <div className="bg-gray-50/80 backdrop-blur-sm p-2 flex justify-between items-center border-t border-accent/10">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 hover:bg-primary/10 text-text-dark/70 hover:text-primary transition-colors"
            onClick={prevTournament}
            disabled={filteredTournaments.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 hover:bg-primary/10 text-text-dark/70 hover:text-primary transition-colors"
            onClick={nextTournament}
            disabled={filteredTournaments.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <span className="text-xs text-text-dark/50">
            {activeTournamentIndex + 1} / {filteredTournaments.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 hover:bg-primary/10 text-text-dark/70 hover:text-primary transition-colors"
            onClick={toggleScoresView}
          >
            <Trophy className="h-4 w-4" />
            <span className="text-xs">{visibleScores === 5 ? 'Show More' : 'Show Less'}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 hover:bg-primary/10 text-text-dark/70 hover:text-primary transition-colors group"
            onClick={refreshScores}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </Button>
          
          {activeTournament.sourceUrl && (
            <a 
              href={activeTournament.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1 rounded-md hover:bg-primary/10 text-text-dark/70 hover:text-primary transition-colors inline-flex items-center"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          
          {showCloseButton && onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 hover:bg-red-100 text-text-dark/70 hover:text-red-500 transition-colors ml-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-text-light p-3 rounded-b-xl flex justify-between items-center relative overflow-hidden">
        {/* Wave pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-full h-full bg-[url('/images/wave-divider.svg')] bg-repeat-x bg-contain transform rotate-180"></div>
        </div>
        
        <div className="flex items-center space-x-2 relative z-10">
          <img src="/images/pgv-logo.png" alt="PGV Logo" className="h-6 opacity-90" />
          <span className="text-xs opacity-70 pgv-gold-foil-text">Live Scores</span>
        </div>
        <div className="text-xs opacity-70 relative z-10">
          Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  
        </div>
      </div>
    </div>
  );
};

export default GolfScoreTicker;
