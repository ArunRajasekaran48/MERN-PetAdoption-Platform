import React from "react"
import { Star } from "lucide-react"

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from pet owners and adopters who found their perfect match on PawPal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img
                  src="/src/assets/cust2-balan.jpg?height=48&width=48"
                  alt="Balan."
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold">Balan RS.</h4>
                <div className="flex text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              "Finding Max on PawPal was the best thing that happened to our family. The process was so smooth, and we
              were able to message his previous owner to learn all about him before adopting."
            </p>
            <div className="rounded-lg overflow-hidden h-40">
              <img
                src="/src/assets/dog1.jpg?height=160&width=300"
                alt="Happy dog with family"
                className="w-48 h-48 object-cover"
              />
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img
                  src="/src/assets/cust1.jpg?height=48&width=48"
                  alt="Aravinth ."
                  className="w-28 h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold">Aravinthan V.</h4>
                <div className="flex text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              "When I needed to find a new home for my cat due to a move, PawPal made it easy to find a loving family.
              I could vet potential adopters and stay in touch even after the adoption."
            </p>
            <div className="rounded-lg overflow-hidden h-40">
              <img
                src="/src/assets/cat11.jpg?height=160&width=300"
                alt="Cat with new owner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img
                  src="/src/assets/cust-abi.jpg?height=48&width=48"
                  alt="Abirami ."
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold">Abirami T.</h4>
                <div className="flex text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              "After months of searching, I found my perfect rabbit companion on PawPal. The messaging feature helped
              me ask all the right questions before meeting him in person."
            </p>
            <div className="rounded-lg overflow-hidden h-40">
              <img
                src="/src/assets/rabit.jpg?height=160&width=300"
                alt="Rabbit with owner"
                className="w-74 h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials