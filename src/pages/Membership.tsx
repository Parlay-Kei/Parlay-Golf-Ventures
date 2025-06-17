import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Trophy, Target, Users, Calendar, Video, ArrowRight, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useScrollToTop } from "@/hooks/useScrollToTop"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const features = [
  {
    icon: <Video className="h-6 w-6 text-white" />,
    title: "AI-Powered Swing Analysis",
    description: "Get instant feedback on your swing mechanics using our advanced AI technology."
  },
  {
    icon: <Users className="h-6 w-6 text-white" />,
    title: "Expert Mentorship",
    description: "Connect with experienced golf mentors who are committed to your success."
  },
  {
    icon: <Target className="h-6 w-6 text-white" />,
    title: "Personalized Training",
    description: "Follow custom training programs designed for your skill level and goals."
  },
  {
    icon: <Calendar className="h-6 w-6 text-white" />,
    title: "Regular Check-ins",
    description: "Stay on track with scheduled progress reviews and adjustments."
  }
]

const tiers = [
  {
    name: "Free",
    description: "Perfect for those who want to try out our platform",
    price: "$0",
    period: "/month",
    color: "from-blue-500 to-blue-600",
    benefits: [
      "Basic access to our platform",
      "Limited access to tutorials",
      "Community forum access"
    ]
  },
  {
    name: "Driven",
    description: "Perfect for beginners looking to build a strong foundation",
    price: "$49",
    period: "/month",
    color: "from-blue-500 to-blue-600",
    benefits: [
      "Basic swing analysis",
      "Monthly practice plans",
      "Access to beginner tutorials",
      "Community forum access"
    ]
  },
  {
    name: "Aspiring",
    description: "For dedicated golfers ready to elevate their game",
    price: "$99",
    period: "/month",
    color: "from-pgv-green to-pgv-green-dark",
    popular: true,
    benefits: [
      "Advanced swing analysis",
      "Weekly practice plans",
      "1-on-1 virtual coaching",
      "Priority support"
    ]
  },
  {
    name: "Breakthrough",
    description: "For serious players aiming for excellence",
    price: "$199",
    period: "/month",
    color: "from-pgv-gold to-pgv-gold-light",
    benefits: [
      "Professional swing analysis",
      "Daily practice plans",
      "Weekly coaching sessions",
      "Tournament preparation"
    ]
  }
]

export default function Membership() {
  const navigate = useNavigate()
  useScrollToTop()

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pgv-green-dark via-pgv-green to-pgv-green-light text-white py-28 md:py-36 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6TTEyIDQyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2em0xMi0xMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2klLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] bg-repeat opacity-5"></div>
          
          <div className="relative container mx-auto px-4 text-center z-10">
            <motion.h1 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Transform Your Golf Game
            </motion.h1>
            <motion.p 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90"
            >
              Join PGV Academy and get access to professional coaching, personalized training,
              and a supportive community dedicated to your success.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Button 
                size="lg"
                className="bg-white text-pgv-green hover:bg-white/90 shadow-glow-sm hover:shadow-glow-md transition-all duration-300 rounded-xl px-8 py-6 text-lg font-bold"
                onClick={() => {
                  console.log('View Membership Plans button clicked');
                  navigate('/subscription-new');
                }}
              >
                View Membership Plans <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                className="ml-4 bg-pgv-green-dark text-white hover:bg-pgv-green-light shadow-medium hover:shadow-hard transition-all duration-300 rounded-xl px-8 py-6 text-lg font-bold border-2 border-white"
                onClick={() => {
                  console.log('Join Free Community button clicked');
                  navigate('/signup'); // Changed to existing route
                }}
              >
                Join Free Community <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <h2 className="text-4xl font-bold mb-4 text-pgv-green">
                  Everything You Need to Succeed
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mx-auto"></div>
              </motion.div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300 h-full overflow-hidden group">
                    <CardHeader>
                      <div className="mb-6 bg-gradient-to-br from-pgv-green to-pgv-green-light w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl font-bold text-pgv-green group-hover:text-pgv-green-dark transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Membership Tiers Preview */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <h2 className="text-4xl font-bold mb-4 text-pgv-green">Choose Your Path</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mx-auto mb-6"></div>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Select the membership tier that best fits your goals and commitment level.
                  Each tier is designed to provide the right level of support and resources.
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {tiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <Card className={`text-center h-full border-none shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden ${tier.popular ? 'ring-2 ring-pgv-gold' : ''}`}>
                    {tier.popular && (
                      <div className="absolute top-0 right-0 bg-pgv-gold text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                        Most Popular
                      </div>
                    )}
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${tier.color}`}></div>
                    <CardHeader className="pt-8">
                      <CardTitle className="text-2xl font-bold mb-2">{tier.name}</CardTitle>
                      <p className="text-gray-600 mb-4">{tier.description}</p>
                      <div className="text-3xl font-bold text-pgv-green mb-1">{tier.price}</div>
                      <div className="text-gray-500 mb-6">{tier.period}</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-pgv-green flex-shrink-0 mt-0.5" />
                            <span className="text-left">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full mt-8 bg-gradient-to-r from-pgv-green to-pgv-green-light hover:from-pgv-green-light hover:to-pgv-green text-white shadow-glow-sm hover:shadow-glow-md transition-all duration-300 rounded-xl py-6"
                        onClick={() => navigate(tier.name === "Free" ? '/signup' : '/subscription-new')}
                      >
                        Get Started <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pgv-green-dark via-pgv-green to-pgv-green-light opacity-90"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full mb-8">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 text-white">Join Our Success Stories</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                Our members have seen remarkable improvements in their game through dedicated
                practice and expert guidance. You could be next.
              </p>
              <Button 
                size="lg"
                className="bg-white text-pgv-green hover:bg-white/90 shadow-glow-sm hover:shadow-glow-md transition-all duration-300 rounded-xl px-8 py-6 text-lg font-bold"
                onClick={() => navigate('/subscription-new')}
              >
                Start Your Journey Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <h2 className="text-4xl font-bold mb-4 text-pgv-green">Frequently Asked Questions</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-pgv-gold to-pgv-gold-light rounded-full mx-auto"></div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-white p-6 rounded-2xl shadow-soft"
              >
                <h3 className="text-xl font-bold mb-3 text-pgv-green">How do I get started?</h3>
                <p className="text-gray-600">Simply sign up for a membership tier that matches your goals and commitment level. Once you've joined, you'll get immediate access to our platform and resources.</p>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-white p-6 rounded-2xl shadow-soft"
              >
                <h3 className="text-xl font-bold mb-3 text-pgv-green">Can I change my membership tier?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your membership at any time. Changes will take effect at the start of your next billing cycle.</p>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-white p-6 rounded-2xl shadow-soft"
              >
                <h3 className="text-xl font-bold mb-3 text-pgv-green">Is there a minimum commitment period?</h3>
                <p className="text-gray-600">No, all our memberships are month-to-month with no long-term contracts. You can cancel at any time.</p>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-white p-6 rounded-2xl shadow-soft"
              >
                <h3 className="text-xl font-bold mb-3 text-pgv-green">How do the coaching sessions work?</h3>
                <p className="text-gray-600">Coaching sessions are conducted virtually through our platform. You'll be matched with a mentor based on your goals and schedule sessions at times that work for you.</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
