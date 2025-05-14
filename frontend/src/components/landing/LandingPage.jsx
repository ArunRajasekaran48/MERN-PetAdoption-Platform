import React from "react"
import Header from "./Header"
import HeroSection from "./HeroSection"
import HowItWorks from "./HowItWorks"
import KeyFeatures from "./KeyFeatures"
import Testimonials from "./Testimonials"
import CallToAction from "./CallToAction"
import Footer from "./Footer"

const LandingPage = () => {
  return (
    <div className="min-h-screen font-sans text-gray-800">
      <Header />
      <HeroSection />
      <HowItWorks />
      <KeyFeatures />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  )
}
export default LandingPage