import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Target, Users, BarChart, Globe, Shield, ChevronDown, Beaker } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import InfoTicker from "@/components/InfoTicker";
import { BetaSignupForm } from "@/components/beta/BetaSignupForm";
import { betaService } from "@/lib/services/betaService";
import withErrorBoundary from '@/components/withErrorBoundary';

const Index = () => {
  const observerRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isBetaMode, setIsBetaMode] = useState(false);
  useScrollToTop();

  useEffect(() => {
    // Check if beta mode is enabled
    setIsBetaMode(betaService.isBetaMode());
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-animate', 'visible');
            const sectionId = entry.target.getAttribute('id');
            if (sectionId) setActiveSection(sectionId);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "-100px 0px" }
    );

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    const refsAtSetup = [...observerRefs.current];
    return () => {
      refsAtSetup.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const addToRefs = (el: HTMLElement | null, index: number) => {
    if (el && !observerRefs.current.includes(el)) {
      observerRefs.current[index] = el;
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full overflow-hidden">
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pgv-green-dark via-pgv-green to-pgv-green-light text-white py-32 md:py-48 px-4 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6TTEyIDQyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2em0xMi0xMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2klLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
          </div>
          
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-3/5">
                <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-slide-in-top opacity-100">
                  <span className="block">Parlay Golf</span>
                  <span className="text-pgv-gold">Ventures</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-100 animate-slide-in-top" style={{ animationDelay: '0.2s' }}>
                  Transforming golf through technology, community, and social impact.
                </p>
                {isBetaMode && (
                  <div className="flex items-center mb-8 bg-blue-600/20 p-2 pl-3 rounded-full border border-blue-300/30 animate-slide-in-top" style={{ animationDelay: '0.3s' }}>
                    <Beaker className="h-5 w-5 text-blue-300 mr-2" />
                    <span className="text-blue-100 text-sm">Currently in beta - Limited access</span>
                  </div>
                )}
                <div className="mt-8 space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row opacity-100 animate-slide-in-top" style={{ animationDelay: '0.4s' }}>
                  <Link to="/signup" className="w-full md:w-auto">
                    <Button className="btn-lightspeed bg-pgv-gold text-pgv-green hover:bg-pgv-gold-light text-lg px-8 py-6 w-full md:w-auto shadow-medium hover:shadow-hard transition-all duration-300 font-bold rounded-xl border-2 border-pgv-gold">
                      JOIN THE MOVEMENT
                    </Button>
                  </Link>
                  <Link to="/academy" className="w-full md:w-auto">
                    <Button className="bg-pgv-green-dark text-white hover:bg-pgv-green-light text-lg px-8 py-6 w-full md:w-auto shadow-medium hover:shadow-hard transition-all duration-300 font-bold rounded-xl border-2 border-white">
                      EXPLORE ACADEMY
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-2/5 hidden md:block">
                <div className="relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-pgv-gold/30 rounded-full blur-3xl animate-float"></div>
                  <div className="shape-blob bg-white/10 backdrop-blur-sm p-6 border border-white/20 shadow-medium animate-float" style={{ animationDelay: '1s' }}>
                    <img src="/images/golf-illustration.svg" alt="Golf Illustration" className="w-full h-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pgv-gold/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
            <ChevronDown className="h-8 w-8 text-white/70" />
          </div>
        </section>

        {/* Beta Signup Section - Only shown when in beta mode */}
        {isBetaMode && (
          <section className="py-16 px-4 bg-white border-b border-gray-200">
            <div className="container mx-auto max-w-4xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="md:w-1/2">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-800">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 text-sm uppercase">Beta</span>
                    Get Early Access
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Parlay Golf Ventures is currently in beta testing. Join our exclusive group of early adopters and help shape the future of golf technology and community.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mt-1 mr-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      </div>
                      <span className="text-gray-700">Access exclusive beta features</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mt-1 mr-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      </div>
                      <span className="text-gray-700">Provide feedback to shape the platform</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mt-1 mr-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      </div>
                      <span className="text-gray-700">Connect with other golf enthusiasts</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <BetaSignupForm />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Market Insights Section */}
        <section id="market-insights" className="py-24 px-4 bg-pgv-gray section-animate" ref={(el) => addToRefs(el, 0)}>
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-gradient">Market Insights</h2>
              <div className="w-24 h-1 bg-pgv-green mx-auto rounded-full mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">Discover the latest trends and opportunities in the golf industry</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="modern-card bg-white p-8 rounded-xl shadow-soft">
                <div className="bg-pgv-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <BarChart className="w-8 h-8 text-pgv-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">Growing Market</h3>
                <p className="text-gray-600">
                  The golf club market is growing at 4.6% CAGR, driven by demand for personalized equipment and tech integration.
                </p>
              </div>
              <div className="modern-card bg-white p-8 rounded-xl shadow-soft">
                <div className="bg-pgv-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Trophy className="w-8 h-8 text-pgv-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">Virtual Tournaments</h3>
                <p className="text-gray-600">
                  Hosting virtual tournaments for beneficiaries attracts sponsors seeking visibility in esports-adjacent spaces.
                </p>
              </div>
              <div className="modern-card bg-white p-8 rounded-xl shadow-soft">
                <div className="bg-pgv-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-pgv-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">IoT Innovation</h3>
                <p className="text-gray-600">
                  IoT-enabled clubs and balls with embedded sensors provide real-time data on swing speed, trajectory, and spin rate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsorship Innovation Section */}
        <section id="sponsorship" className="py-24 px-4 section-animate" ref={(el) => addToRefs(el, 1)}>
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-gradient">Sponsorship Innovation</h2>
              <div className="w-24 h-1 bg-pgv-green mx-auto rounded-full mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">Reimagining partnerships for maximum impact and engagement</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="modern-card bg-white p-8 rounded-xl shadow-soft">
                <div className="bg-pgv-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-pgv-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">Impact-Driven Partnerships</h3>
                <p className="text-gray-600 mb-4">
                  Sponsors increasingly seek measurable social ROI. Our tiered packages fund specific outcomes like "Sponsor a Smart Club" with IoT sensors that track beneficiary progress.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3" />
                    <span>Transparent impact reporting via blockchain</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3" />
                    <span>Real-time progress tracking</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3" />
                    <span>Measurable social impact metrics</span>
                  </li>
                </ul>
              </div>
              <div className="modern-card bg-white p-8 rounded-xl shadow-soft">
                <div className="bg-pgv-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Globe className="w-8 h-8 text-pgv-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">Tech-Enabled Engagement</h3>
                <p className="text-gray-600 mb-4">
                  Cutting-edge technology enhances sponsor engagement and creates new revenue streams.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3" />
                    <span>AR activations for branded course overlays</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3" />
                    <span>Data monetization for equipment R&D</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3" />
                    <span>Virtual training modules</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Community Events Section */}
        <section id="community" className="py-24 px-4 bg-pgv-gray section-animate" ref={(el) => addToRefs(el, 2)}>
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-gradient">Community-Driven Events</h2>
              <div className="w-24 h-1 bg-pgv-green mx-auto rounded-full mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">Join our community-driven events and be part of the golf revolution</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="modern-card bg-white p-8 rounded-xl shadow-soft">
                <div className="bg-pgv-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-pgv-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">Hybrid Tournaments</h3>
                <p className="text-gray-600">
                  We host hybrid tournaments combining in-person and simulator play, with sponsors funding entry fees for underprivileged teams.
                </p>
              </div>
              <div className="modern-card bg-white p-8 rounded-xl shadow-soft">
                <div className="bg-pgv-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Trophy className="w-8 h-8 text-pgv-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">Influencer Collaborations</h3>
                <p className="text-gray-600">
                  Collaborate with influencers to livestream events, amplifying sponsor reach and community engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="call-to-action" className="relative py-24 px-4 bg-pgv-green text-white overflow-hidden section-animate" ref={(el) => addToRefs(el, 3)}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6TTEyIDQyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2em0xMi0xMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2klLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pgv-gold/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pgv-blue/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Join the Future of Golf</h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto">
              Be part of a movement that combines technology, community, and social impact to transform the game of golf.
            </p>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 justify-center">
              <Link to="/join-free" className="w-full md:w-auto">
                <Button className="btn-lightspeed bg-pgv-gold text-pgv-green hover:bg-pgv-gold-light text-lg px-8 py-6 w-full md:w-auto shadow-medium hover:shadow-hard transition-all duration-300 font-bold rounded-xl border-2 border-pgv-gold">
                  Join Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/membership" className="w-full md:w-auto">
                <Button className="bg-white text-pgv-green hover:bg-gray-100 text-lg px-8 py-6 w-full md:w-auto shadow-medium hover:shadow-hard transition-all duration-300 font-bold rounded-xl border-2 border-white">
                  View All Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Latest News Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl font-bold text-gray-800 mb-4">Latest News & Updates</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">Stay informed about the latest developments, events, and innovations at Parlay Golf Ventures.</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <InfoTicker variant="sidebar" maxItems={3} className="mb-8" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default withErrorBoundary(Index, 'index');
