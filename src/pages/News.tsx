import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import withErrorBoundary from '@/components/withErrorBoundary';

// Sample news data - in a real app, this would come from an API or CMS
const allNews = [
  {
    id: 1,
    title: "PGV Hosts Inaugural Hybrid Tournament",
    date: "April 5, 2025",
    excerpt: "Join us for our first-ever hybrid tournament combining in-person and simulator play.",
    content: "Parlay Golf Ventures is excited to announce our inaugural Hybrid Tournament, taking place next month. This innovative event combines traditional in-person play with cutting-edge simulator technology, allowing participants to compete from anywhere in the world. The tournament will feature special sponsorship opportunities funding entry fees for underprivileged teams, creating a truly inclusive golf experience.",
    image: "/images/news/tournament.jpg",
    link: "/tournament",
    category: "Events"
  },
  {
    id: 2,
    title: "New IoT-Enabled Clubs Available in Store",
    date: "March 28, 2025",
    excerpt: "Our latest smart clubs with embedded sensors are now available for purchase.",
    content: "We're thrilled to announce the launch of our next-generation IoT-enabled golf clubs. These innovative clubs feature embedded sensors that provide real-time data on swing speed, trajectory, and spin rate. The data syncs seamlessly with our mobile app, offering instant feedback and personalized coaching tips. These clubs represent a significant advancement in golf technology and are now available for purchase in our online store.",
    image: "/images/news/iot-clubs.jpg",
    link: "/store",
    category: "Products"
  },
  {
    id: 3,
    title: "Academy Launches Advanced Training Program",
    date: "March 15, 2025",
    excerpt: "Elevate your game with our new advanced training modules led by PGA professionals.",
    content: "The PGV Academy is proud to introduce our Advanced Training Program, designed for golfers looking to take their skills to the next level. Led by PGA professionals, this comprehensive program combines in-person coaching with virtual training modules accessible from anywhere. Participants will receive personalized feedback, detailed performance analytics, and access to exclusive training resources. Registration is now open with limited spots available.",
    image: "/images/news/academy.jpg",
    link: "/academy",
    category: "Academy"
  },
  {
    id: 4,
    title: "Community Impact: 500 Underprivileged Youth Reached",
    date: "March 10, 2025",
    excerpt: "Our community programs have now provided golf access to over 500 underprivileged youth.",
    content: "We're proud to announce a significant milestone in our community impact initiatives. Through our various programs and partnerships, we've now provided golf access and training to over 500 underprivileged youth across the country. These programs not only introduce young people to the sport but also teach valuable life skills such as discipline, perseverance, and sportsmanship. We're grateful to our sponsors and volunteers who have made this achievement possible.",
    image: "/images/news/community.jpg",
    link: "/community",
    category: "Impact"
  },
  {
    id: 5,
    title: "Partnership Announcement: Major Golf Brand Collaboration",
    date: "February 22, 2025",
    excerpt: "Exciting new partnership to develop next-generation golf technology.",
    content: "Parlay Golf Ventures is excited to announce a strategic partnership with a leading golf equipment manufacturer to develop next-generation golf technology. This collaboration will focus on creating innovative products that enhance player performance and experience. The partnership combines PGV's expertise in IoT and data analytics with our partner's manufacturing excellence. Stay tuned for exciting product announcements in the coming months.",
    image: "/images/news/partnership.jpg",
    link: "/partnerships",
    category: "Business"
  },
  {
    id: 6,
    title: "Virtual Reality Training Now Available",
    date: "February 15, 2025",
    excerpt: "Experience our new VR training modules for an immersive learning experience.",
    content: "We're excited to introduce our new Virtual Reality Training modules, offering an immersive and interactive way to improve your golf skills. These state-of-the-art VR experiences provide realistic simulations of various courses and conditions, allowing you to practice in any environment. The system includes detailed analytics and real-time feedback to help you identify areas for improvement. VR training sessions are now available for booking through our academy portal.",
    image: "/images/news/vr-training.jpg",
    link: "/academy/vr",
    category: "Technology"
  },
  {
    id: 7,
    title: "PGV Expands International Presence",
    date: "January 30, 2025",
    excerpt: "New partnerships established in Europe and Asia to bring our innovative approach globally.",
    content: "Parlay Golf Ventures is proud to announce the expansion of our international presence with new partnerships in Europe and Asia. These strategic collaborations will bring our innovative approach to golf technology and training to a global audience. The expansion includes localized versions of our digital platforms, region-specific training programs, and international tournament opportunities. This marks an important milestone in our mission to transform the game of golf worldwide.",
    image: "/images/news/global.jpg",
    link: "/about/global",
    category: "Business"
  },
  {
    id: 8,
    title: "Annual Charity Tournament Raises $250,000",
    date: "January 15, 2025",
    excerpt: "Record-breaking fundraising at our annual charity event supporting youth programs.",
    content: "Our annual charity tournament has raised a record-breaking $250,000 to support youth golf programs in underserved communities. The event, which featured both professional and amateur golfers, included a silent auction, sponsored challenges, and community activities. All proceeds will go directly to providing equipment, training, and access to golf facilities for young people who might otherwise not have the opportunity to experience the sport. We extend our heartfelt thanks to all participants, sponsors, and volunteers who made this success possible.",
    image: "/images/news/charity.jpg",
    link: "/events/charity",
    category: "Events"
  }
];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  useScrollToTop();

  // Extract unique categories
  const categories = Array.from(new Set(allNews.map(item => item.category)));

  // Filter news based on category and search term
  const filteredNews = allNews.filter(item => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch = searchTerm
      ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section - Full width green banner */}
      <section className="bg-pgv-green text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">News & Updates</h1>
          <p className="text-lg md:text-xl opacity-90">
            Stay informed about the latest developments, events, and innovations at Parlay Golf Ventures.
          </p>
        </div>
      </section>

      <main className="flex-grow">
        {/* Filters Section */}
        <section className="bg-gray-50 py-8 px-4 border-b border-gray-200">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                className={selectedCategory === null ? "bg-pgv-green hover:bg-pgv-green/90" : "border-pgv-green text-pgv-green hover:bg-pgv-green/10"}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={selectedCategory === category ? "bg-pgv-green hover:bg-pgv-green/90" : "border-pgv-green text-pgv-green hover:bg-pgv-green/10"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search news..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pgv-green/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {/* Use actual image with fallback */}
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-pgv-green/20 flex items-center justify-center">
                          <span className="text-pgv-green font-bold">{item.category}</span>
                        </div>
                      )}
                      <div className="absolute top-0 right-0 m-2">
                        <span className="inline-flex items-center text-xs font-medium bg-pgv-green text-white px-2 py-1 rounded">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center text-xs text-gray-500">
                          <Calendar size={14} className="mr-1" /> {item.date}
                        </span>
                      </div>
                      <h2 className="font-serif text-xl font-bold mb-3 text-gray-800">{item.title}</h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                      <Link to={item.link} className="inline-flex items-center text-pgv-green font-medium hover:underline">
                        Read more <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                <Button 
                  className="mt-4 bg-pgv-green hover:bg-pgv-green/90"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchTerm("");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default withErrorBoundary(News, 'news');
