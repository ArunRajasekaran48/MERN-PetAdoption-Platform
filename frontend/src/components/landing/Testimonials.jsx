import React, { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { getAllReviews } from "../../services/petService"

const Testimonials = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const data = await getAllReviews()
        setReviews(data)
        setError(null)
      } catch (err) {
        setError("Failed to load reviews.")
        setReviews([])
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from pet owners and adopters who found their perfect match on PawPal
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No reviews yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.slice(0, 3).map((review) => (
              <div key={review._id} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-purple-100 flex items-center justify-center">
                    <span className="font-bold text-purple-700 text-lg">{review.userId?.name?.[0] || "U"}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{review.userId?.name || "Anonymous"}</h4>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={16} fill={star <= review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{review.comment}"</p>
                <div className="rounded-lg overflow-hidden h-32 flex flex-col items-center justify-center bg-white">
                  {review.petId?.images && review.petId.images.length > 0 && (
                    <img
                      src={review.petId.images[0]}
                      alt={review.petId.name}
                      className="w-16 h-16 object-cover rounded-full mb-2 border-2 border-purple-200"
                    />
                  )}
                  <span className="text-xs text-purple-600 font-semibold">
                    {review.petId?.name ? `Pet: ${review.petId.name}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Testimonials