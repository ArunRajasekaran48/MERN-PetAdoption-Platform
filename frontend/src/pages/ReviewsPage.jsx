import { useEffect, useState } from "react"
import { getAllReviews } from "../services/petService"
import { Star, Heart, MessageCircle, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={`${
              star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
            } transition-colors duration-200`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <MessageCircle className="absolute inset-0 m-auto h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Error Loading Reviews</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </button>
        </div>
        
        {/* Header */}
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-lg mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Pet Reviews
              </h1>
              <p className="text-slate-600">What our community says</p>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Reviews Yet</h3>
            <p className="text-slate-600">Be the first to share your adoption experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-purple-200"
              >
                <div className="p-8">
                  {/* Reviewer Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {review.userId?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800">{review.userId?.name || "Anonymous"}</h3>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-slate-500 ml-1">({review.rating}/5)</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 relative">
                      <div className="absolute top-4 left-4 text-4xl text-slate-300 font-serif">"</div>
                      <p className="text-slate-700 leading-relaxed pl-8 pr-4 italic">{review.comment}</p>
                      <div className="absolute bottom-4 right-4 text-4xl text-slate-300 font-serif rotate-180">"</div>
                    </div>
                  </div>

                  {/* Pet Information */}
                  {review.petId && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                      <div className="flex items-center gap-4">
                        {review.petId.images && review.petId.images.length > 0 && (
                          <div className="relative">
                            <img
                              src={review.petId.images[0] || "/placeholder.svg"}
                              alt={review.petId.name}
                              className="w-16 h-16 object-cover rounded-2xl shadow-lg ring-2 ring-white"
                            />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <Star className="h-3 w-3 text-white fill-white" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-600 mb-1">Featured Pet</p>
                          <p className="font-bold text-slate-800">{review.petId.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsPage
