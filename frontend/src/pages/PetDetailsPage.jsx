"use client"

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
  MessageCircle,
  Check,
  Star,
  Edit2,
  Trash2,
  X,
} from "lucide-react"
import { createReport } from "../services/adminService"
import { createReviewReport } from "../services/adminService"

const PetDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isOwner, setIsOwner] = useState(false)
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
  const [showReportMenu, setShowReportMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportLoading, setReportLoading] = useState(false)
  const [showReviewReportModal, setShowReviewReportModal] = useState(false)
  const [reviewToReport, setReviewToReport] = useState(null)
  const [reviewReportReason, setReviewReportReason] = useState("")
  const [reviewReportLoading, setReviewReportLoading] = useState(false)
  const { showToast } = useToast()

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
          const count = response.data.requests.filter((r) => r.userId !== user?._id).length
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
          const extracted = reviewsArr.map((r) => ({
            _id: r._id,
            userId: r.userId?._id,
            name: r.userId?.name || "Anonymous",
            rating: r.rating,
            comment: r.comment,
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
      showToast("Adoption request sent successfully!")
    } else {
      showToast(response.message || "Failed to send adoption request", "error")
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setEditForm({
      rating: review.rating,
      comment: review.comment,
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
        setReviews(reviews.map((r) => (r._id === editingReview._id ? { ...r, ...editForm } : r)))
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
        setReviews(reviews.filter((r) => r._id !== reviewToDelete._id))
        showToast("Review deleted successfully")
        setShowDeleteModal(false)
      }
    } catch (error) {
      showToast(error.message || "Failed to delete review", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReportUser = () => {
    setShowReportMenu(false)
    setShowReportModal(true)
  }

  const submitReport = async () => {
    if (!reportReason.trim()) return
    setReportLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      await createReport({
        reportedUser: pet.owner._id || pet.owner,
        pet: pet._id,
        reason: reportReason.trim(),
      })
      showToast("Report submitted to admin", "success")
      setShowReportModal(false)
      setReportReason("")
    } catch (e) {
      showToast("Failed to submit report", "error")
    } finally {
      setReportLoading(false)
    }
  }

  const handleReportReview = (review) => {
    setReviewToReport(review)
    setReviewReportReason("")
    setShowReviewReportModal(true)
  }

  const submitReviewReport = async () => {
    if (!reviewReportReason.trim() || !reviewToReport) return
    setReviewReportLoading(true)
    try {
      await createReviewReport({
        review: reviewToReport._id,
        reason: reviewReportReason.trim(),
      })
      showToast("Review report submitted to admin", "success")
      setShowReviewReportModal(false)
      setReviewToReport(null)
      setReviewReportReason("")
    } catch (e) {
      showToast("Failed to submit review report", "error")
    } finally {
      setReviewReportLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-48">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="text-emerald-600 h-6 w-6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        <div className="container mx-auto px-4 py-8">
          <div
            className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border border-red-200 text-red-800 p-6 rounded-xl shadow-lg"
            role="alert"
          >
            <div className="flex items-center mb-3">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Oops! Something went wrong</h3>
            </div>
            <p className="mb-4 text-red-700">{error || "Pet not found."}</p>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
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
        return "bg-emerald-500 text-white"
      case "pending":
        return "bg-amber-500 text-white"
      case "adopted":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Header with consistent background */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 py-3">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm text-emerald-700 border border-emerald-200 rounded-lg shadow-md hover:bg-emerald-50 hover:text-emerald-900 transition-all group text-sm"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to pets</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="relative mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="lg:flex">
              {/* Image Section */}
              <div className="lg:w-3/5 relative">
                <div className="aspect-[4/3] lg:aspect-[3/2] overflow-hidden">
                  {pet.images?.length === 1 ? (
                    <img
                      src={pet.images[0] || "/placeholder.svg"}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Slider {...sliderSettings} className="h-full">
                      {pet.images?.map((image, idx) => (
                        <div key={idx} className="h-full">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${pet.name} - Image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </Slider>
                  )}
                </div>

                {/* Image Navigation */}
                {pet.images?.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                    {pet.images?.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentSlide === idx ? "bg-white w-6" : "bg-white/60 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg ${getStatusColor(pet.adoptionStatus)}`}
                  >
                    {pet.adoptionStatus || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Pet Info Section */}
              <div className="lg:w-2/5 p-6 lg:p-8 relative">
                {/* Report Button - Moved to details section top right */}
                {!isOwner && (
                  <button
                    className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-xs font-medium flex items-center gap-1"
                    onClick={handleReportUser}
                    title="Report User"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Report
                  </button>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1 rounded-full">
                      <Heart className="text-white h-4 w-4" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">{pet.name}</h1>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                      <Paw className="h-3 w-3" />
                      <span className="font-medium">{pet.species}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">{pet.age} years</span>
                    </div>
                    <div className="flex items-center gap-1 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                      {pet.gender?.toLowerCase() === "male" ? (
                        <Male className="h-3 w-3" />
                      ) : (
                        <Female className="h-3 w-3" />
                      )}
                      <span className="font-medium">{pet.gender}</span>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-emerald-600" />
                    About {pet.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                    {pet.description || "No description available."}
                  </p>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-100">
                    <h3 className="font-semibold text-emerald-800 mb-1 flex items-center gap-1 text-sm">
                      <Activity className="h-3 w-3" />
                      Breed Information
                    </h3>
                    <p className="text-emerald-700 text-sm">{pet.breed || "Mixed Breed"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {pet.owner && pet.owner.phone && !isOwner && (
                    <button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
                      onClick={handleWhatsAppClick}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Owner
                    </button>
                  )}

                  {!isOwner && pet.adoptionStatus !== "adopted" && (
                    <button
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none text-sm"
                      onClick={handleAdoptionRequest}
                      disabled={adoptionLoading || adoptionSuccess}
                    >
                      {adoptionLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Request...</span>
                        </>
                      ) : adoptionSuccess ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Request Sent!</span>
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4" />
                          <span>Request Adoption</span>
                        </>
                      )}
                    </button>
                  )}

                  {isOwner && (
                    <button
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
                      onClick={() => navigate("/my-pets")}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Pet Details</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-1 rounded-full">
                <Star className="h-4 w-4 text-white" />
              </div>
              Reviews & Feedback
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const currentUserId = JSON.parse(localStorage.getItem("user"))?._id
                const isUserReview = review.userId === currentUserId
                return (
                  <div
                    key={review._id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 w-8 h-8 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{review.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 text-sm">{review.name}</span>
                          <div className="flex mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= review.rating ? "text-amber-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isUserReview && (
                          <>
                            <button
                              onClick={() => handleEditReview(review)}
                              className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                              title="Edit Review"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review)}
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                              title="Delete Review"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        {!isUserReview && (
                          <button
                            onClick={() => handleReportReview(review)}
                            className="bg-amber-100 text-amber-700 p-1 rounded-full hover:bg-amber-200 transition-colors"
                            title="Report Review"
                          >
                            <AlertCircle className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* All Modals with reduced sizing */}
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Adoption Request</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                There are already <span className="font-bold text-emerald-600">{pendingReqCount}</span> requests for
                this pet. The owner will review all applications and choose the best match.
                <br />
                <br />
                Would you like to proceed with your application?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  doCreateAdoptionRequest()
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-lg text-sm"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Your Review</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitEditReview}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= editForm.rating ? "text-amber-400 fill-current" : "text-gray-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Your Review</label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors min-h-[100px] resize-none text-sm"
                  placeholder="Share your thoughts about this pet..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || editForm.rating === 0}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all font-medium shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete Review</h3>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed text-sm">
              Are you sure you want to delete your review? This action cannot be undone and your feedback will be
              permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all font-medium shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3" />
                    <span>Delete Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report User Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Report User</h3>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed text-sm">
              Please provide a detailed reason for reporting this user:
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors min-h-[80px] resize-none mb-4 text-sm"
              placeholder="Describe the issue..."
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setReportReason("")
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                disabled={reportLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={reportLoading || !reportReason.trim()}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all font-medium shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                {reportLoading ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Reporting...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Review Modal */}
      {showReviewReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Report Review</h3>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed text-sm">
              Please provide a reason for reporting this review:
            </p>
            <textarea
              value={reviewReportReason}
              onChange={(e) => setReviewReportReason(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors min-h-[80px] resize-none mb-4 text-sm"
              placeholder="Describe why this review should be reported..."
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReviewReportModal(false)
                  setReviewToReport(null)
                  setReviewReportReason("")
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                disabled={reviewReportLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitReviewReport}
                disabled={reviewReportLoading || !reviewReportReason.trim()}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all font-medium shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                {reviewReportLoading ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Reporting...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>Submit Report</span>
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
