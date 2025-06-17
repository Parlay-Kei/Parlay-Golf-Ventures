import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="bg-pgv-green py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
          Whether you're a talented golfer looking for opportunities or someone who wants to
          support our mission, there's a place for you in the Parlay Golf community.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-white text-pgv-green hover:bg-white/90 border-2 border-white">
            <Link to="/upload">Upload Your Swing</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10">
            <Link to="/support">Support Our Mission</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
