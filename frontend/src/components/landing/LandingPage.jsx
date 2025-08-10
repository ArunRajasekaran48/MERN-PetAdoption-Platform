import Header from "./Header"
import HeroSection from "./HeroSection"
import HowItWorks from "./HowItWorks"
import Testimonials from "./Testimonials"
import Footer from "./Footer"

const LandingPage = () => {
  return (
    <div className="min-h-screen font-sans text-gray-800">
      <Header />
      <HeroSection />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  )
}
export default LandingPage