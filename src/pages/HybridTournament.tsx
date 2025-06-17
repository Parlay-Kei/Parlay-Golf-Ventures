import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Trophy, Target, Users, Calendar, DollarSign, 
  Heart, Monitor, Megaphone, ShieldCheck, ArrowRight,
  Layers, Zap, PieChart, Briefcase, Globe, ChevronDown
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const HybridTournament = () => {
  const observerRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pgv-green-dark via-pgv-green to-pgv-green-light text-white py-28 md:py-36 px-4 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6TTEyIDQyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2em0xMi0xMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
          </div>
          
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-3/5 text-center md:text-left">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="font-serif text-5xl md:text-6xl font-bold mb-6"
                >
                  <span className="block">Hybrid</span>
                  <span className="text-pgv-gold">Tournament</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl md:text-2xl mb-8 max-w-3xl text-white/90"
                >
                  Bridging physical and virtual golf experiences through innovative tournament structures that combine in-person play with cutting-edge simulators.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row"
                >
                  <Link to="/tournament/register" className="w-full md:w-auto">
                    <Button className="btn-lightspeed bg-pgv-gold text-pgv-green hover:bg-pgv-gold-light text-lg px-8 py-6 w-full md:w-auto shadow-glow-sm hover:shadow-glow-md transition-all duration-300 font-bold rounded-xl">
                      REGISTER NOW
                    </Button>
                  </Link>
                  <Link to="/tournament/sponsor" className="w-full md:w-auto">
                    <Button className="bg-white text-pgv-green hover:bg-gray-100 text-lg px-8 py-6 w-full md:w-auto shadow-medium hover:shadow-hard transition-all duration-300 font-bold rounded-xl border-2 border-white">
                      BECOME A SPONSOR
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="md:w-2/5 hidden md:block"
              >
                <div className="relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-pgv-gold/30 rounded-full blur-3xl animate-float"></div>
                  <div className="shape-blob-2 bg-white/10 backdrop-blur-sm p-6 border border-white/20 shadow-glow-sm hover:shadow-glow-md transition-all duration-500 animate-float" style={{ animationDelay: '1s' }}>
                    <img src="/images/tournament-illustration.svg" alt="Tournament Illustration" className="w-full h-auto" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pgv-gold/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block"
          >
            <ChevronDown className="h-8 w-8 text-white/70" />
          </motion.div>
        </section>

        {/* Tournament Structure Section */}
        <section id="tournament-structure" className="py-24 px-4 bg-pgv-gray" ref={(el) => addToRefs(el, 0)}>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="container mx-auto max-w-6xl"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-pgv-green">Tournament Structure</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto">Our innovative hybrid format combines the best of physical and virtual golf experiences.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                variants={fadeIn}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">Hybrid Design</h3>
                <p className="text-gray-600 mb-4">
                  Seamless integration of in-person and simulator play, allowing participants to compete across physical and virtual environments.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Synchronized scoring systems across platforms</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Balanced competition format ensuring fairness</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Real-time leaderboards accessible to all participants</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">In-Person Logistics</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive management of physical tournament components, ensuring a premium experience for on-site participants.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Premium venue selection with professional setup</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>State-of-the-art equipment and technical support</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Dedicated staff for participant assistance</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <Monitor className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">Simulator Play Rules</h3>
                <p className="text-gray-600 mb-4">
                  Structured guidelines for virtual participation, ensuring consistency and fairness across digital platforms.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Integration with leading online simulators</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Standardized rules for virtual gameplay</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Real-time synchronization with in-person events</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">Scheduling & Registration</h3>
                <p className="text-gray-600 mb-4">
                  Streamlined processes for participant enrollment and tournament scheduling, maximizing convenience and accessibility.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>User-friendly online registration platform</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Flexible scheduling options for participants</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Automated communication and reminders</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Sponsorship and Funding Section */}
        <section id="sponsorship-funding" className="py-24 px-4" ref={(el) => addToRefs(el, 1)}>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="container mx-auto max-w-6xl"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-pgv-green">Sponsorship & Funding</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto">Strategic partnerships that drive impact while offering exceptional value to sponsors.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">Sponsor Identification</h3>
                <p className="text-gray-600">
                  Strategic outreach to potential sponsors aligned with tournament goals and values, focusing on organizations committed to community impact and innovation.
                </p>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <DollarSign className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">Sponsorship Packages</h3>
                <p className="text-gray-600">
                  Customized sponsorship opportunities offering tiered benefits including branding exposure, media coverage, participant engagement, and impact reporting.
                </p>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <PieChart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">Funding Logistics</h3>
                <p className="text-gray-600">
                  Transparent management of sponsor contributions, with structured allocation for entry fee waivers, equipment provision, and comprehensive financial reporting.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Underprivileged Teams Section */}
        <section id="underprivileged-teams" className="py-24 px-4 bg-pgv-gray" ref={(el) => addToRefs(el, 2)}>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="container mx-auto max-w-6xl"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-pgv-green">Underprivileged Teams</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto">Creating pathways to participation for underserved communities through targeted support and resources.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div 
                variants={fadeIn}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">Team Selection</h3>
                <p className="text-gray-600 mb-4">
                  Structured process for identifying and engaging underprivileged teams, ensuring diverse representation and meaningful impact.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Partnerships with community organizations</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Transparent selection criteria</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Focus on long-term engagement</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="modern-card bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-pgv-green to-pgv-green-light p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">Support Services</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive resources provided to underprivileged teams, ensuring they have the tools and support needed for successful participation.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Equipment provision and technical support</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Transportation and logistics assistance</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pgv-green rounded-full mr-3 mt-2" />
                    <span>Mentorship and coaching programs</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <section id="cta" className="relative py-24 px-4 bg-gradient-to-br from-pgv-green-dark via-pgv-green to-pgv-green-light text-white overflow-hidden" ref={(el) => addToRefs(el, 3)}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6TTEyIDQyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2em0xMi0xMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC06IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pgv-gold/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="container mx-auto max-w-4xl relative z-10 text-center"
          >
            <motion.h2 
              variants={fadeIn}
              className="font-serif text-4xl md:text-5xl font-bold mb-6"
            >
              Ready to Join the Tournament?
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl mb-8 max-w-3xl mx-auto text-white/90"
            >
              Whether you're a player, sponsor, or volunteer, there's a place for you in our hybrid tournament community.
            </motion.p>
            <motion.div 
              variants={fadeIn}
              className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 justify-center"
            >
              <Link to="/tournament/register" className="w-full md:w-auto">
                <Button className="btn-lightspeed bg-pgv-gold text-pgv-green hover:bg-pgv-gold-light text-lg px-8 py-6 w-full md:w-auto shadow-glow-sm hover:shadow-glow-md transition-all duration-300 font-bold rounded-xl">
                  Register Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/tournament/learn-more" className="w-full md:w-auto">
                <Button className="bg-white text-pgv-green hover:bg-gray-100 text-lg px-8 py-6 w-full md:w-auto shadow-medium hover:shadow-hard transition-all duration-300 font-bold rounded-xl border-2 border-white">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HybridTournament;
