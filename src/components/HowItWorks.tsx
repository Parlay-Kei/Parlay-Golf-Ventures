
import { Flag, Upload, Users, Heart } from "lucide-react";
import FeatureBlock from "./FeatureBlock";

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform connects talented, underprivileged golfers with resources,
            mentorship, and a community to help them succeed both on and off the course.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureBlock
            icon={<Upload size={40} strokeWidth={1.5} />}
            title="Upload Your Swing"
            description="Submit your golf swing video for feedback and potential opportunities with our network of coaches and mentors."
          />
          <FeatureBlock
            icon={<Users size={40} strokeWidth={1.5} />}
            title="Join the Community"
            description="Connect with other golfers, share experiences, and build relationships with peers and mentors."
          />
          <FeatureBlock
            icon={<Flag size={40} strokeWidth={1.5} />}
            title="Access Resources"
            description="Get access to equipment, training materials, and micro-grants designed to help you advance your golf journey."
          />
          <FeatureBlock
            icon={<Heart size={40} strokeWidth={1.5} />}
            title="Give Back"
            description="As you progress, mentor others and help build a sustainable community of support for the next generation."
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
