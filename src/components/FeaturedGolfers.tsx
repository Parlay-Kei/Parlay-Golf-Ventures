
import { Card, CardContent } from "@/components/ui/card";

interface GolferProps {
  name: string;
  location: string;
  image: string;
  story: string;
}

const featuredGolfers: GolferProps[] = [
  {
    name: "Jamal Wright",
    location: "Detroit, MI",
    image: "https://images.unsplash.com/photo-1603384149281-adbc15d3a589?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    story: "Started playing at a community program at 14, now on track for a college scholarship."
  },
  {
    name: "Maya Johnson",
    location: "Atlanta, GA",
    image: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    story: "Self-taught golfer who caught the eye of a PGV scout at a local driving range."
  },
  {
    name: "Carlos Rodriguez",
    location: "Phoenix, AZ",
    image: "https://images.unsplash.com/photo-1564417947365-8dbc9d0e7976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    story: "Received a PGV micro-grant for equipment and now competes statewide."
  }
];

const FeaturedGolfers = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Featured Golfers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet some of the talented golfers who are part of the PGV community. 
            Each has a unique story and path to success.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredGolfers.map((golfer, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-64 overflow-hidden">
                <img
                  src={golfer.image}
                  alt={golfer.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-semibold mb-1">{golfer.name}</h3>
                <p className="text-gray-500 mb-3">{golfer.location}</p>
                <p className="text-gray-700">{golfer.story}</p>
                <button className="mt-4 text-pgv-green font-medium hover:underline">
                  Read full story →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="text-pgv-green font-medium hover:underline text-lg">
            View All Featured Golfers →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGolfers;
