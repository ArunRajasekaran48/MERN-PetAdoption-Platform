import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../context/ToastContext"
import { getOutgoingAdoptionRequests, cancelAdoptionRequest, submitAdoptionReview } from "../services/adoptionService"
import { getAllReviews, updateReview } from '../services/petService'
import { ArrowLeft, Heart, Star, X, Check, MessageSquare, AlertCircle } from "lucide-react"
import ConfirmationModal from '../components/common/ConfirmationModal'

const OutgoingRequestsPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [reviewForm, setReviewForm] = useState({
    requestId: null,
    rating: 0,
    comment: "",
    reviewId: null,
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState(null)
  const [editingReview, setEditingReview] = useState(false)
  const [showDeleteReviewModal, setShowDeleteReviewModal] = useState(false)
  const [requestToDeleteReview, setRequestToDeleteReview] = useState(null)

  const fetchOutgoingRequests = async () => {
    try {
      setLoading(true)
      const response = await getOutgoingAdoptionRequests()
      let validRequests = []
      if (response.success) {
        validRequests = response.data.filter(req => req.petId)
      } else {
        setError(response.message)
      }
      // Fetch all reviews for the current user
      const allReviews = await getAllReviews();
      const user = JSON.parse(localStorage.getItem('user'));
      // Attach review to each request if exists
      const requestsWithReviews = validRequests.map(req => {
        const review = allReviews.find(r => r.petId?._id === req.petId._id && r.userId?._id === user?._id);
        return { ...req, review };
      });
      setRequests(requestsWithReviews)
    } catch (error) {
      setError("Failed to fetch outgoing requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true;
    
    const loadRequests = async () => {
      if (isMounted) {
        await fetchOutgoingRequests();
      }
    };

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [])

  const handleCancel = async (requestId) => {
    setRequestToCancel(requestId)
    setShowCancelModal(true)
  }

  const confirmCancel = async () => {
    if (!requestToCancel) return
    setCancellingId(requestToCancel)
    const response = await cancelAdoptionRequest(requestToCancel)
    if (response.success) {
      showToast("Adoption request cancelled successfully")
      fetchOutgoingRequests()
    } else {
      showToast(response.message || "Failed to cancel request", "error")
    }
    setCancellingId(null)
    setShowCancelModal(false)
    setRequestToCancel(null)
  }

  const openReviewForm = (requestId, review = null) => {
    setReviewForm({
      requestId,
      rating: review ? review.rating : 0,
      comment: review ? review.comment : "",
      reviewId: review ? review._id : null,
    })
    setEditingReview(!!review)
  }

  const closeReviewForm = () => {
    setReviewForm({
      requestId: null,
      rating: 0,
      comment: "",
      reviewId: null,
    })
  }

  const handleRatingChange = (rating) => {
    setReviewForm({
      ...reviewForm,
      rating,
    })
  }

  const handleCommentChange = (e) => {
    setReviewForm({
      ...reviewForm,
      comment: e.target.value,
    })
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (reviewForm.rating === 0) {
      showToast("Please select a rating", "error")
      return
    }
    setSubmittingReview(true)
    try {
      const request = requests.find(req => req._id === reviewForm.requestId)
      if (!request || !request.petId) {
        showToast("Could not find pet information", "error")
        return
      }
      let response;
      if (reviewForm.reviewId) {
        // Edit existing review
        response = await updateReview(reviewForm.reviewId, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
      } else {
        // Add new review
        response = await submitAdoptionReview(reviewForm.requestId, {
          petId: request.petId._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
      }
      if (response.success) {
        showToast(editingReview ? "Review updated successfully" : "Review submitted successfully")
        closeReviewForm()
        fetchOutgoingRequests()
      } else {
        showToast(response.message || "Failed to submit review", "error")
      }
    } catch (error) {
      showToast("An error occurred while submitting your review", "error")
    } finally {
      setSubmittingReview(false)
      setEditingReview(false)
    }
  }

  // Handler to open delete review modal
  const handleDeleteReview = (request) => {
    setRequestToDeleteReview(request);
    setShowDeleteReviewModal(true);
  };

  // Handler to actually delete the review
  const confirmDeleteReview = async () => {
    if (!requestToDeleteReview) return;
    try {
      setSubmittingReview(true);
      const response = await submitAdoptionReview(requestToDeleteReview._id, { petId: requestToDeleteReview.petId._id, delete: true, reviewId: requestToDeleteReview.review._id });
      if (response.success) {
        showToast("Review deleted successfully");
        fetchOutgoingRequests();
      } else {
        showToast(response.message || "Failed to delete review", "error");
      }
    } catch (error) {
      showToast("An error occurred while deleting your review", "error");
    } finally {
      setSubmittingReview(false);
      setShowDeleteReviewModal(false);
      setRequestToDeleteReview(null);
    }
  };

  const cancelDeleteReview = () => {
    setShowDeleteReviewModal(false);
    setRequestToDeleteReview(null);
  };

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

  if (error) {
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
            <p className="mt-2">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-full shadow hover:bg-purple-50 hover:text-purple-900 transition-all group"
          >
            <ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-purple-800">Your Adoption Requests</h1>
          <div className="w-24"></div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No requests yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any adoption requests yet.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              Find Pets
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={request.petId?.images?.[0] || "/placeholder-pet.jpg"}
                    alt={request.petId?.name || "Pet"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-xl text-white">{request.petId?.name || "Unknown Pet"}</h3>
                    <p className="text-white/80">{request.petId?.breed || ""}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-700 flex items-center gap-2">
                      <span className="font-medium">Owner:</span>
                      <span>{request.petId?.owner?.name || "Unknown"}</span>
                    </p>

                    <p className="text-gray-700 flex items-center gap-2">
                      <span className="font-medium">Requested:</span>
                      <span>
                        {request.requestedAt ? (
                          new Date(request.requestedAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          'Date not available'
                        )}
                      </span>
                    </p>

                    {request.review && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1 mb-2">
                          <span className="font-medium text-gray-700">Your Review:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= request.review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm italic">"{request.review.comment}"</p>
                      </div>
                    )}
                  </div>

                  {request.status === "pending" && (
                    <button
                      onClick={() => handleCancel(request._id)}
                      disabled={cancellingId === request._id}
                      className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {cancellingId === request._id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          <span>Cancel Request</span>
                        </>
                      )}
                    </button>
                  )}

                  {request.status === "approved" && (
                    !request.review ? (
                      <button
                        onClick={() => openReviewForm(request._id)}
                        className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Leave a Review</span>
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => openReviewForm(request._id, request.review)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          Edit Review
                        </button>
                        <button
                          onClick={() => handleDeleteReview(request)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 transition-colors"
                        >
                          Delete Review
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewForm.requestId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{editingReview ? "Edit Review" : "Leave a Review"}</h3>
                <button onClick={closeReviewForm} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={submitReview}>
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">How was your adoption experience?</label>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= reviewForm.rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {reviewForm.rating === 1 && "Poor"}
                    {reviewForm.rating === 2 && "Fair"}
                    {reviewForm.rating === 3 && "Good"}
                    {reviewForm.rating === 4 && "Very Good"}
                    {reviewForm.rating === 5 && "Excellent"}
                    {reviewForm.rating === 0 && "Select a rating"}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Your comments (optional)</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={handleCommentChange}
                    placeholder="Share your experience with the adoption process..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeReviewForm}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || reviewForm.rating === 0}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>{editingReview ? "Update Review" : "Submit Review"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Cancel Adoption Request</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to cancel this adoption request? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setRequestToCancel(null)
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Keep Request
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancellingId === requestToCancel}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {cancellingId === requestToCancel ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span>Cancel Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={showDeleteReviewModal}
          onClose={cancelDeleteReview}
          onConfirm={confirmDeleteReview}
          title="Delete Review"
          message="Are you sure you want to delete your review? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  )
}

export default OutgoingRequestsPage