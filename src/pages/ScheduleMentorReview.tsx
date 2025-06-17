
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReviewRequestForm } from "@/components/mentor-review/ReviewRequestForm";

const ScheduleMentorReview = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-pgv-green text-white py-12 md:py-16 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Schedule Mentor Review</h1>
            <p className="text-lg">Choose a time and share details for your one-on-one session.</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10 md:py-12 max-w-lg">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <ReviewRequestForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ScheduleMentorReview;
