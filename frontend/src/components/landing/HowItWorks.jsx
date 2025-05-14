import React from "react"
import { Search, MessageCircle, CheckCircle, Heart } from "lucide-react"

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How PawPal Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our simple process makes finding or listing a pet easy and stress-free
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-violet-600" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Browse</h3>
            <p className="text-gray-600">Search through our database of pets looking for homes</p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-blue-600" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Connect</h3>
            <p className="text-gray-600">Message pet owners and ask questions</p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-amber-600" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Apply</h3>
            <p className="text-gray-600">Submit your adoption request through our platform</p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-rose-600" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Adopt</h3>
            <p className="text-gray-600">Welcome your new family member home</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks