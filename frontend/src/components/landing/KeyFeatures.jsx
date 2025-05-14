import React from "react"
import { Search, CheckCircle, MessageCircle, Star, AlertCircle, Heart } from "lucide-react"

const KeyFeatures = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            PawPal offers everything you need to make pet adoption simple and safe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-rose-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Search className="text-rose-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Pet Listing</h3>
            <p className="text-gray-600">
              Create detailed profiles for pets needing homes with our simple listing process
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-violet-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="text-violet-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Seamless Adoption Requests</h3>
            <p className="text-gray-600">
              Our streamlined application process makes adoption requests quick and easy
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Private Messaging System</h3>
            <p className="text-gray-600">Communicate directly with pet owners or potential adopters securely</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Star className="text-amber-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Verified Reviews</h3>
            <p className="text-gray-600">Read and leave honest reviews about adoption experiences</p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Report Issues Easily</h3>
            <p className="text-gray-600">Our reporting system ensures the safety and integrity of our platform</p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Heart className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Success Stories</h3>
            <p className="text-gray-600">Share your adoption journey and inspire others in our community</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default KeyFeatures