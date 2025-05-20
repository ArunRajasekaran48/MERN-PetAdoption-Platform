import React from "react"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../../services/authService"

const CallToAction = () => {
  const navigate = useNavigate()
  const isLoggedIn = !!getCurrentUser()

  const handleListPetClick = () => {
    navigate(isLoggedIn ? '/list-pet' : '/login', { state: { from: '/list-pet' } })
  }

  const handleStartAdoptingClick = () => {
    navigate(isLoggedIn ? '/home' : '/login', { state: { from: '/home' } })
  }

  return (
    <section className="py-20 bg-gradient-to-r from-violet-600 to-rose-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Companion?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of happy pet owners and adopters on PawPal today
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="bg-white text-rose-600 hover:bg-gray-100 px-8 py-3 rounded-full font-medium text-lg transition-colors"
              onClick={handleListPetClick}
            >
              List a Pet
            </button>
            <button 
              className="bg-rose-700 hover:bg-rose-800 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors"
              onClick={handleStartAdoptingClick}
            >
              Start Adopting
            </button>
          </div>
        </div>
      </section>
  )
}

export default CallToAction