import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative bg-pgv-forest">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pgv-forest to-pgv-forest/70 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
          alt="Golf course" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      <div className="relative z-20 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-text-inverse mb-6 animate-slide-in" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            For the Driven, <span className="text-pgv-gold">by the Unseen</span>
          </h1>
          <p className="text-xl text-text-inverse/90 mb-8 md:pr-12 animate-slide-in" style={{animationDelay: "0.1s"}}>
            <span className="relative z-10 bg-gradient-to-r from-pgv-forest/80 to-transparent p-1 rounded font-headline font-semibold">Parlay Golf Ventures</span> is committed to making golf accessible to everyone,
            regardless of background or resources. Upload your swing, join our community,
            and start your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-in" style={{animationDelay: "0.2s"}}>
            <Button asChild size="lg" className="bg-pgv-gold text-pgv-forest hover:bg-pgv-rust font-bold border-2 border-pgv-gold shadow-button-hover transition-all duration-300">
              <Link to="/signup">JOIN THE MOVEMENT</Link>
            </Button>
            <Link to="/academy" className="button-secondary inline-flex items-center justify-center text-base font-medium uppercase tracking-wide">
              EXPLORE ACADEMY
            </Link>
            <Button asChild variant="outline" size="lg" className="border-2 border-pgv-cream text-pgv-cream hover:bg-pgv-cream/10">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
