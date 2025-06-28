import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { getAllPets, getPetReviews, updateReview, deleteReview } from "../services/petService"
import { createAdoptionRequest, countPendingRequestsForPet } from "../services/adoptionService"
import { useToast } from "../context/ToastContext"
import {
  ArrowLeft,
  Heart,
  Calendar,
  PawPrintIcon as Paw,
  UserIcon as Male,
  UserIcon as Female,
  Info,
  Activity,
  AlertCircle,
  Award,
  MessageCircle,
  Check,
  Star,
  Edit2,
  Trash2,
  X,
} from "lucide-react"

const PetDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isOwner, setIsOwner] = useState(false)
  const { showToast } = useToast ? useToast() : { showToast: () => {} }
  const [adoptionLoading, setAdoptionLoading] = useState(false)
  const [adoptionSuccess, setAdoptionSuccess] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingReqCount, setPendingReqCount] = useState(0)
  const [proceedAdoption, setProceedAdoption] = useState(false)
  const [reviews, setReviews] = useState([])
  const [editingReview, setEditingReview] = useState(null)
  const [editForm, setEditForm] = useState({ rating: 0, comment: "" })
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true)
        const pets = await getAllPets()
        const foundPet = pets.find((p) => p._id === id)
        setPet(foundPet)

        // Check if current user is the owner
        const user = JSON.parse(localStorage.getItem("user"))
        if (user && foundPet && foundPet.owner) {
          setIsOwner(user._id === foundPet.owner._id || user._id === foundPet.owner)
        }

        setError(null)
      } catch (err) {
        setError("Failed to fetch pet details.")
      } finally {
        setLoading(false)
      }
    }
    fetchPet()
  }, [id])

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!pet?._id) return
      try {
        const user = JSON.parse(localStorage.getItem("user"))
        const response = await getAllAdoptionRequests({ petId: pet._id, status: "pending" })
        if (response.success && Array.isArray(response.data?.requests)) {
          // Exclude requests made by the current user
          const count = response.data.requests.filter(r => r.userId !== user?._id).length
          setPendingCount(count)
        }
      } catch (e) {
        setPendingCount(0)
      }
    }
    fetchPendingRequests()
  }, [pet])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!pet?._id) return
      try {
        const reviewsRes = await getPetReviews(pet._id)
        let reviewsArr = []
        if (reviewsRes.success) {
          if (Array.isArray(reviewsRes.message)) {
            reviewsArr = reviewsRes.message
          } else if (Array.isArray(reviewsRes.data)) {
            reviewsArr = reviewsRes.data
          }
        }
        if (reviewsArr.length > 0) {
          const extracted = reviewsArr.map(r => ({
            _id: r._id,
            userId: r.userId?._id,
            name: r.userId?.name || "Anonymous",
            rating: r.rating,
            comment: r.comment
          }))
          setReviews(extracted)
        } else {
          setReviews([])
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
      }
    }
    fetchReviews()
  }, [pet])

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    beforeChange: (current, next) => setCurrentSlide(next),
    arrows: false,
  }

  // WhatsApp chat handler
  const handleWhatsAppClick = () => {
    if (isOwner) return
    if (pet.owner && pet.owner.phone) {
      let phone = pet.owner.phone.replace(/\D/g, "")
      // If phone does not start with a country code (assuming 10 digits), prepend '91' (India) as default
      if (phone.length === 10) {
        phone = "91" + phone
      }
      const waLink = `https://wa.me/${phone}`
      window.open(waLink, "_blank")
    }
  }

  const handleAdoptionRequest = async () => {
    setAdoptionLoading(true)
    // Count pending requests for this pet
    const pendingRes = await countPendingRequestsForPet(pet._id)
    setAdoptionLoading(false)
    if (pendingRes.success && pendingRes.count > 0) {
      setPendingReqCount(pendingRes.count)
      setShowConfirmModal(true)
      return
    }
    doCreateAdoptionRequest()
  }

  const doCreateAdoptionRequest = async () => {
    setAdoptionLoading(true)
    const response = await createAdoptionRequest(pet._id)
    setAdoptionLoading(false)
    if (response.success) {
      setAdoptionSuccess(true)
      showToast && showToast("Adoption request sent successfully!", "success")
    } else {
      showToast && showToast(response.message || "Failed to send adoption request", "error")
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setEditForm({
      rating: review.rating,
      comment: review.comment
    })
    setShowEditModal(true)
  }

  const handleDeleteReview = (review) => {
    setReviewToDelete(review)
    setShowDeleteModal(true)
  }

  const submitEditReview = async (e) => {
    e.preventDefault()
    if (!editingReview) return

    setIsSubmitting(true)
    try {
      const response = await updateReview(editingReview._id, editForm)
      if (response.success) {
        setReviews(reviews.map(r => 
          r._id === editingReview._id ? { ...r, ...editForm } : r
        ))
        showToast("Review updated successfully")
        setShowEditModal(false)
      }
    } catch (error) {
      showToast(error.message || "Failed to update review", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return

    setIsSubmitting(true)
    try {
      const response = await deleteReview(reviewToDelete._id)
      if (response.success) {
        setReviews(reviews.filter(r => r._id !== reviewToDelete._id))
        showToast("Review deleted successfully")
        setShowDeleteModal(false)
      }
    } catch (error) {
      showToast(error.message || "Failed to delete review", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Heart className="text-purple-600 h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md" role="alert">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="font-bold">Error!</p>
            </div>
            <p className="mt-2">{error || "Pet not found."}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "adopted":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-full shadow hover:bg-purple-50 hover:text-purple-900 transition-all mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to pets</span>
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Image Slider Section */}
              <div className="md:w-1/2 relative">
                <div className="h-full">
                  {pet.images?.length === 1 ? (
                    <div className="h-[400px] flex items-center justify-center">
                      <img
                        src={pet.images[0]}
                        alt={pet.name}
                        className="object-cover w-full h-full rounded-xl shadow"
                        style={{ maxHeight: '400px', maxWidth: '100%' }}
                      />
                    </div>
                  ) : (
                    <Slider {...sliderSettings} className="h-full">
                      {pet.images?.map((image, idx) => (
                        <div key={idx} className="h-[400px]">
                          <div
                            className="w-full h-full bg-center bg-cover rounded-xl shadow"
                            style={{ backgroundImage: `url(${image})` }}
                          ></div>
                        </div>
                      ))}
                    </Slider>
                  )}
                </div>

                {/* Image Navigation Dots */}
                {pet.images?.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {pet.images?.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentSlide === idx ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pet.adoptionStatus)}`}
                  >
                    {pet.adoptionStatus || "Unknown Status"}
                  </span>
                </div>
              </div>

              {/* Pet Details Section */}
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="text-red-500 h-6 w-6 fill-current" />
                  <h1 className="text-3xl font-bold text-gray-800">Meet {pet.name}</h1>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                    <Paw className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">{pet.species}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">{pet.age} years</span>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                    {pet.gender?.toLowerCase() === "male" ? (
                      <Male className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Female className="h-4 w-4 text-pink-600" />
                    )}
                    <span className="text-sm font-medium text-purple-800">{pet.gender}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Info className="h-5 w-5 text-purple-600" />
                      About
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{pet.description || "No description available."}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <h3 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Breed
                      </h3>
                      <p className="text-gray-700">{pet.breed || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  {pet.owner && pet.owner.phone && !isOwner && (
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
                      onClick={handleWhatsAppClick}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Contact Owner
                    </button>
                  )}

                  {!isOwner && pet.adoptionStatus !== "adopted" && (
                    <button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50"
                      onClick={handleAdoptionRequest}
                      disabled={adoptionLoading || adoptionSuccess}
                    >
                      {adoptionLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Requesting...</span>
                        </>
                      ) : adoptionSuccess ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span>Request Sent</span>
                        </>
                      ) : (
                        <>
                          <Heart className="h-5 w-5" />
                          Request Adoption
                        </>
                      )}
                    </button>
                  )}

                  {isOwner && (
                    <button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
                      onClick={() => navigate('/my-pets')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit Pet
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
                Reviews
              </h2>
            </div>

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => {
                  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id
                  const isUserReview = review.userId === currentUserId
                  return (
                    <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{review.name}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {isUserReview && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                              title="Edit Review"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review)}
                              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                              title="Delete Review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Adoption Request</h3>
              <p className="text-gray-700">There are already <span className="font-semibold">{pendingReqCount}</span> requests for this pet. It's up to the owner to choose you.<br/>Do you want to proceed?</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); doCreateAdoptionRequest(); }}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Review</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitEditReview}>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= editForm.rating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300 hover:text-yellow-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Comment</label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || editForm.rating === 0}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Review Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete Review</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your review? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PetDetailsPage