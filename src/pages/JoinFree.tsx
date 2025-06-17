import Header from "@/components/Header"
import Footer from "@/components/Footer"
import FreeMemberForm from "@/components/FreeMemberForm"
import { useScrollToTop } from "@/hooks/useScrollToTop"

export default function JoinFree() {
  // Ensure page scrolls to top on navigation
  useScrollToTop();

  return (
    <div className="min-h-screen bg-pgv-green">
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-cinzel text-pgv-gold text-center mb-8">
            Join the PGV Community
          </h1>
          <p className="text-xl text-pgv-white text-center mb-12">
            Start your journey with PGV today. Our free tier gives you access to basic tutorials,
            community events, and the opportunity to connect with fellow golf enthusiasts.
          </p>
          <FreeMemberForm />
        </div>
      </main>
      <Footer />
    </div>
  )
} 