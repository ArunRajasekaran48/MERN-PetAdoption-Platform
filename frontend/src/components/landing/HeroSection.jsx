import React from "react"
import { Heart, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom";
import dogBlack from '../../assets/dog-black.jpg'

const HeroSection = () => {
  const navigate = useNavigate();
  const handleFindCompanion = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };
  return (
    <section className="relative bg-gradient-to-r from-blue-100 to-orange-100 py-20 md:py-32">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Connecting Pets With <span className="text-rose-600">Loving Homes</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-lg">
            PawPal helps you find your perfect companion or find a loving home for a pet in need. Join our community
            of pet lovers today.
          </p>
          <button
            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors inline-flex items-center"
            onClick={handleFindCompanion}
          >
            Find Your Companion
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
        <div className="md:w-1/2">
          <div className="relative">
            <img
              src={dogBlack}
              alt="Happy pets with their owners"
              className="rounded-lg shadow-xl object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Heart className="text-rose-600" size={24} />
                </div>
                <div>
                  <p className="font-bold">100+</p>
                  <p className="text-sm text-gray-600">Successful Adoptions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection