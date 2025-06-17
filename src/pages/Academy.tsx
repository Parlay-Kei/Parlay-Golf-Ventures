import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Target, ChevronRight, Award, BarChart, Calendar, Search } from "lucide-react";
import { FeatureGate } from "@/components/FeatureGate";
import { FEATURES } from "@/lib/features";
import { VideoPlayer } from "@/components/VideoPlayer";
import { motion } from "framer-motion";
import AcademySearch, { SearchResult } from "@/components/AcademySearch";
import { useState } from "react";
import withErrorBoundary from '@/components/withErrorBoundary';

// Sample video data - replace with your actual video content
const FREE_VIDEOS = [
  {
    videoId: "123456789",
    title: "Golf Basics: Grip and Stance",
    description: "Learn the fundamentals of a proper golf grip and stance.",
    thumbnailUrl: "/images/thumbnails/basics.jpg",
    requiredTier: "driven" as const
  },
  // Add more free videos
];

const PREMIUM_VIDEOS = [
  {
    videoId: "987654321",
    title: "Advanced Short Game Techniques",
    description: "Master advanced techniques for improving your short game.",
    thumbnailUrl: "/images/thumbnails/short-game.jpg",
    requiredTier: "breakthrough" as const
  },
  {
    videoId: "456789123",
    title: "Pro-Level Putting Strategies",
    description: "Learn putting strategies used by professional golfers.",
    thumbnailUrl: "/images/thumbnails/putting.jpg",
    requiredTier: "breakthrough" as const
  },
  // Add more premium videos
];

const Academy = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
    setIsSearchActive(results.length > 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pgv-green-dark via-pgv-green to-pgv-green-light text-white py-24 md:py-32 px-4 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6TTEyIDQyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2em0xMi0xMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] bg-repeat opacity-5"></div>
          
          <div className="container mx-auto max-w-4xl relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-5xl md:text-6xl font-bold mb-4 text-center"
            >
              PGV Academy
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <p className="text-xl md:text-2xl mb-8 text-white/90">Mentorship. Mastery. Momentum. <span className="font-semibold">Your golf development starts here.</span></p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Link to="/academy/dashboard">
                  <Button className="bg-white text-pgv-green hover:bg-white/90 shadow-glow-sm hover:shadow-glow-md transition-all duration-300 rounded-xl px-8 py-6 text-lg font-bold">
                    MY DASHBOARD
                  </Button>
                </Link>
                <Link to="/subscription">
                  <Button className="bg-pgv-green-dark text-white hover:bg-pgv-green-light shadow-medium hover:shadow-hard transition-all duration-300 rounded-xl px-8 py-6 text-lg font-bold border-2 border-white">
                    VIEW MEMBERSHIPS
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
          {/* Search Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-soft p-8 md:p-10 mb-12 border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-pgv-green/5 rounded-full -translate-x-20 -translate-y-20 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="h-1 w-10 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mr-3"></div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-pgv-green">Find Your Perfect Lesson</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Search our extensive library of golf tutorials, lessons, and courses to find exactly what you need to improve your game.
              </p>
              <AcademySearch 
                onResultsChange={handleSearchResults} 
                showResults={true}
                placeholder="Search for swing tips, putting techniques, course management..."
              />
            </div>
          </motion.section>

          {/* Only show the sections below if search is not active */}
          {!isSearchActive && (
            <>
              {/* What is PGV Academy Section */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-soft p-8 md:p-10 mb-12 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-pgv-green/5 rounded-full -translate-x-20 -translate-y-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="h-1 w-10 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mr-3"></div>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-pgv-green">What is PGV Academy?</h2>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    PGV Academy is our free development hub for aspiring golfers. It combines virtual mentorship, 
                    skill progression, and curated learning to help you evolve on and off the course.
                  </p>
                </div>
              </motion.section>

              {/* Program Features Section */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-soft p-8 md:p-10 mb-12 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-pgv-gold/5 rounded-full translate-x-10 translate-y-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="h-1 w-10 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mr-3"></div>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-pgv-green">Program Features</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-pgv-green/10 p-3 rounded-xl mr-4">
                        <Users className="h-6 w-6 text-pgv-green" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Mentorship Portal</h3>
                        <p className="text-gray-700">Connect with experienced golfers and coaches ready to guide your journey.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-pgv-green/10 p-3 rounded-xl mr-4">
                        <BookOpen className="h-6 w-6 text-pgv-green" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Video Clinics</h3>
                        <p className="text-gray-700">Access short-form and long-form instructional content from our network of experts.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-pgv-green/10 p-3 rounded-xl mr-4">
                        <Target className="h-6 w-6 text-pgv-green" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Path-to-Pro Roadmap</h3>
                        <p className="text-gray-700">A structured outline of the steps, habits, and benchmarks required to advance competitively.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-pgv-green/10 p-3 rounded-xl mr-4">
                        <BarChart className="h-6 w-6 text-pgv-green" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Skill Tracking</h3>
                        <p className="text-gray-700">Log rounds, drills, and feedback to monitor your progress over time.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-pgv-green/10 p-3 rounded-xl mr-4">
                        <Calendar className="h-6 w-6 text-pgv-green" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Virtual Office Hours</h3>
                        <p className="text-gray-700">Book time with mentors for reviews, advice, and motivation.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Link to="/signup">
                      <Button className="bg-gradient-to-r from-pgv-green to-pgv-green-light hover:from-pgv-green-light hover:to-pgv-green text-white shadow-glow-sm hover:shadow-glow-md transition-all duration-300 rounded-xl px-8 py-3 text-lg font-bold">
                        SIGN UP FOR PGV ACADEMY
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.section>

              {/* Who Should Join Section */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-soft p-8 md:p-10 mb-12 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-pgv-green/5 rounded-full -translate-x-20 -translate-y-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="h-1 w-10 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mr-3"></div>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-pgv-green">Who Should Join?</h2>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    If you're self-taught, under-resourced, or simply obsessed with getting better at golf—this is your home. 
                    PGV Academy is for dreamers who do the work.
                  </p>
                </div>
              </motion.section>
              
              {/* Course Previews Section */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-soft p-8 md:p-10 mb-12 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-pgv-gold/5 rounded-full translate-x-10 translate-y-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="h-1 w-10 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mr-3"></div>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-pgv-green">Course Previews</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group"
                    >
                      <div className="bg-pgv-green/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-pgv-green/20 transition-colors duration-300">
                        <BookOpen className="h-6 w-6 text-pgv-green" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-pgv-green mb-2 group-hover:text-pgv-green-dark transition-colors duration-300">Breaking Down the Basics</h3>
                      <p className="text-gray-600">A foundational series covering grip, stance, alignment, and posture to build solid fundamentals.</p>
                      <div className="mt-4 text-pgv-gold font-medium flex items-center group-hover:text-pgv-gold-light transition-colors duration-300">
                        View Course <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group"
                    >
                      <Link to="/academy/short-game-secrets" className="block">
                        <div className="bg-pgv-green/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-pgv-green/20 transition-colors duration-300">
                          <Target className="h-6 w-6 text-pgv-green" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-pgv-green mb-2 group-hover:text-pgv-green-dark transition-colors duration-300">Short Game Secrets</h3>
                        <p className="text-gray-600">Improve your chipping, putting, and finesse shots to shave strokes off your game quickly.</p>
                        <div className="mt-4 text-pgv-gold font-medium flex items-center group-hover:text-pgv-gold-light transition-colors duration-300">
                          View Course <ChevronRight className="ml-1 h-4 w-4" />
                        </div>
                      </Link>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group"
                    >
                      <div className="bg-pgv-green/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-pgv-green/20 transition-colors duration-300">
                        <Award className="h-6 w-6 text-pgv-green" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-pgv-green mb-2 group-hover:text-pgv-green-dark transition-colors duration-300">Mastering the Mental Game</h3>
                      <p className="text-gray-600">Learn techniques to manage pressure, stay focused, and develop a winning mindset.</p>
                      <div className="mt-4 text-pgv-gold font-medium flex items-center group-hover:text-pgv-gold-light transition-colors duration-300">
                        View Course <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group"
                    >
                      <div className="bg-pgv-green/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-pgv-green/20 transition-colors duration-300">
                        <Target className="h-6 w-6 text-pgv-green" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-pgv-green mb-2 group-hover:text-pgv-green-dark transition-colors duration-300">Power & Distance</h3>
                      <p className="text-gray-600">Unlock your full swing potential with tips for speed, accuracy, and smart driving.</p>
                      <div className="mt-4 text-pgv-gold font-medium flex items-center group-hover:text-pgv-gold-light transition-colors duration-300">
                        View Course <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group"
                    >
                      <div className="bg-pgv-green/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-pgv-green/20 transition-colors duration-300">
                        <Target className="h-6 w-6 text-pgv-green" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-pgv-green mb-2 group-hover:text-pgv-green-dark transition-colors duration-300">Competitive Strategy</h3>
                      <p className="text-gray-600">Develop strategic play habits for tournaments, match play, and qualifying rounds.</p>
                      <div className="mt-4 text-pgv-gold font-medium flex items-center group-hover:text-pgv-gold-light transition-colors duration-300">
                        View Course <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.section>
            </>
          )}
        </div>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-pgv-green mb-4">Why Choose PGV Academy</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 hover:shadow-medium transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-glow-sm">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green">Professional Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Get detailed feedback on your swing from our experienced mentors.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 hover:shadow-medium transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-glow-sm">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green">Personalized Training</h3>
                <p className="text-gray-600 mb-4">
                  Access custom training programs tailored to your skill level and goals.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 hover:shadow-medium transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-glow-sm">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green">Community Support</h3>
                <p className="text-gray-600 mb-4">
                  Join a supportive community of golfers on the same journey.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Membership CTA */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pgv-green-dark via-pgv-green to-pgv-green-light opacity-90 z-0"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Take Your Game Further?</h2>
              <p className="text-xl text-white/80 mb-8">
                Choose from our flexible membership tiers and start your journey to golf excellence today.
              </p>
              <Link to="/subscription">
                <Button className="bg-white text-pgv-green hover:bg-white/90 shadow-glow-sm hover:shadow-glow-md transition-all duration-300 rounded-xl px-8 py-4 text-lg font-bold">
                  Explore Membership Options <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Free content */}
        <section className="py-16 px-4 container mx-auto max-w-6xl">
          <div className="flex items-center mb-8">
            <div className="h-1 w-10 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mr-3"></div>
            <h2 className="font-serif text-3xl font-bold text-pgv-green">Free Resources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FREE_VIDEOS.map((video) => (
              <VideoPlayer
                key={video.videoId}
                {...video}
              />
            ))}
          </div>
        </section>

        {/* Premium content */}
        <FeatureGate feature="PGV_ACADEMY">
          <section className="py-16 px-4 container mx-auto max-w-6xl">
            <div className="flex items-center mb-8">
              <div className="h-1 w-10 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mr-3"></div>
              <h2 className="font-serif text-3xl font-bold text-pgv-green">Premium Content</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PREMIUM_VIDEOS.map((video) => (
                <VideoPlayer
                  key={video.videoId}
                  {...video}
                />
              ))}
            </div>
          </section>
        </FeatureGate>

        {/* Mentor Reviews section */}
        <FeatureGate feature="MENTOR_REVIEWS">
          <section className="py-16 px-4 container mx-auto max-w-6xl">
            <div className="flex items-center mb-8">
              <div className="h-1 w-10 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mr-3"></div>
              <h2 className="font-serif text-3xl font-bold text-pgv-green">Mentor Reviews</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Schedule a one-on-one review session with our professional mentors.
            </p>
            {/* Add mentor review scheduling component here */}
          </section>
        </FeatureGate>
      </main>
    </div>
  );
};

export default withErrorBoundary(Academy, 'academy');
