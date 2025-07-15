"use client"

import { useEffect, useState } from "react"
import { Star, Heart, Quote } from "lucide-react"
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

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin"></div>
        <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-500 animate-pulse" />
      </div>
      <p className="mt-4 text-gray-600 font-medium">Loading heartwarming stories...</p>
    </div>
  )

  const ErrorState = () => (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-red-500 max-w-md mx-auto">{error}</p>
    </div>
  )

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Quote className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Stories Yet</h3>
      <p className="text-gray-500 max-w-md mx-auto">Be the first to share your amazing pet adoption story!</p>
    </div>
  )

  const StarRating = ({ rating }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={18}
          className={`transition-colors duration-200 ${
            star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">({rating}/5)</span>
    </div>
  )

  const TestimonialCard = ({ review }) => (
    <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Quote icon */}
      <div className="relative z-10">
        <Quote className="w-8 h-8 text-purple-400 mb-4 opacity-60" />

        {/* Review content */}
        <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">"{review.comment}"</p>

        {/* Rating */}
        <div className="mb-6">
          <StarRating rating={review.rating} />
        </div>

        {/* User info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-xl">{review.userId?.name?.[0] || "U"}</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{review.userId?.name || "Anonymous"}</h4>
              <p className="text-gray-500 text-sm">Pet Parent</p>
            </div>
          </div>

          {/* Pet info */}
          {review.petId?.images && review.petId.images.length > 0 && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-lg">
                <img
                  src={review.petId.images[0] || "/placeholder.svg"}
                  alt={review.petId.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {review.petId?.name && (
                <span className="text-xs text-purple-600 font-semibold mt-2 bg-purple-100 px-2 py-1 rounded-full">
                  {review.petId.name}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <section
      id="testimonials"
      className="py-24 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Success Stories
          </h2>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState />
        ) : reviews.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {reviews.slice(0, 3).map((review) => (
              <TestimonialCard key={review._id} review={review} />
            ))}
          </div>
        )}

        
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}

export default Testimonials
