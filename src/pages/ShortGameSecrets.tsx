import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import withErrorBoundary from '@/components/withErrorBoundary';

const ShortGameSecrets = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-pgv-green text-white py-16 md:py-20 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Short Game Secrets</h1>
            <p className="text-lg md:text-xl">Master the shots that matter most — your path to a sharper short game starts here.</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          {/* Course Overview Section */}
          <section className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-pgv-green mb-4">Course Overview</h2>
            <p className="text-gray-700">
              This course will improve your scoring from inside 50 yards. You'll learn elite-level chipping, pitching, bunker play, 
              and putting strategies used by the pros — broken down for real-life conditions and accessible tools.
            </p>
          </section>

          {/* Included Lessons Section */}
          <section className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-pgv-green mb-4">Included Lessons</h2>
            <ul className="space-y-3 text-gray-700 list-disc pl-5">
              <li>Proper Setup for Chipping and Pitching</li>
              <li>Reading Greens and Putting Lines</li>
              <li>Bunker Escapes Made Simple</li>
              <li>Controlling Distance with Feel</li>
              <li>Drills to Build Short Game Confidence</li>
            </ul>
          </section>

          {/* Featured Video Section */}
          <section className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-pgv-green mb-4">Featured Video Lesson</h2>
            <div className="bg-gray-200 w-full h-[200px] md:h-[320px] rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-600">[ Video Player Placeholder ]</span>
            </div>
            <p className="text-gray-700">
              <strong>Tip:</strong> Use alignment rods and a towel to practice distance control at home or on the green.
            </p>
          </section>

          {/* Next Steps Section */}
          <section className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-pgv-green mb-4">Next Steps</h2>
            <p className="text-gray-700 mb-6">
              Track your progress in your Academy dashboard, schedule a virtual feedback session, 
              or join the next community challenge to put your short game to the test.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/academy/dashboard">
                <Button className="bg-pgv-green hover:bg-pgv-green/90">
                  LOG PROGRESS
                </Button>
              </Link>
              <Link to="/academy/schedule-review">
                <Button className="bg-pgv-green hover:bg-pgv-green/90">
                  BOOK MENTOR REVIEW
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default withErrorBoundary(ShortGameSecrets, 'short-game-secrets');
