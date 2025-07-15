import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../context/ToastContext"
import { getIncomingAdoptionRequests, updateAdoptionRequestStatus } from "../services/adoptionService"
import { ArrowLeft, MessageSquare, Mail, Clock, CheckCircle, XCircle, User, Heart } from "lucide-react"

const IncomingRequestsPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchIncomingRequests()
  }, [])

  const fetchIncomingRequests = async () => {
    try {
      setLoading(true)
      const response = await getIncomingAdoptionRequests()
      if (response.success) {
        setRequests(response.data)
      } else {
        setError(response.message)
      }
    } catch (error) {
      setError("Failed to fetch incoming requests")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await updateAdoptionRequestStatus(requestId, newStatus)
      if (response.success) {
        showToast(`Request ${newStatus.toLowerCase()} successfully`)
        fetchIncomingRequests()
      } else {
        showToast(response.message || "Failed to update request status", "error")
      }
    } catch (error) {
      showToast("Failed to update request status", "error")
    }
  }

  const adoptedPetIds = new Set(requests.filter((r) => r.status === "approved").map((r) => r.petId?._id))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <Heart className="absolute inset-0 m-auto h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center text-white">
                <XCircle className="h-6 w-6 mr-3" />
                <h3 className="font-semibold text-lg">Error</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Incoming Requests
            </h1>
            <p className="text-slate-600 mt-2">Manage adoption requests for your pets</p>
          </div>

          <div className="w-24"></div>
        </div>

        {requests.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Requests Yet</h3>
            <p className="text-slate-600">You haven't received any adoption requests for your pets.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <div
                key={request._id}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100"
              >
                <div className="p-6">
                  {/* Pet Info Header - Improved Layout */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <img
                        src={request.petId?.images?.[0] || "/placeholder-pet.jpg"}
                        alt={request.petId?.name || "Pet"}
                        className="w-16 h-16 rounded-2xl object-cover shadow-md ring-2 ring-slate-100"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">
                        {request.petId?.name || "Unknown Pet"}
                      </h3>
                      <p className="text-slate-600 font-medium text-sm">{request.petId?.breed || "Mixed Breed"}</p>
                    </div>
                  </div>

                  {/* Requester Info - Better Alignment */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 mb-4">
                    {/* Requester Name Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Requested by
                          </span>
                          <span className="text-sm font-bold text-slate-800">{request.userId?.name || "Unknown"}</span>
                        </div>
                      </div>

                      {/* Contact Button - Better Positioned */}
                      <button
                        onClick={() => {
                          const phone = request.userId?.phone?.replace(/\D/g, "")
                          const email = request.userId?.email
                          if (phone) {
                            const waPhone = phone.length === 10 ? `91${phone}` : phone
                            window.open(`https://wa.me/${waPhone}`)
                          } else if (email) {
                            window.open(`mailto:${email}`)
                          }
                        }}
                        disabled={!request.userId?.phone && !request.userId?.email}
                        className={`p-2 rounded-xl transition-all duration-300 shadow-sm ${
                          request.userId?.phone || request.userId?.email
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:scale-105 hover:shadow-md"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                        title="Contact User"
                      >
                        {request.userId?.phone ? <MessageSquare size={16} /> : <Mail size={16} />}
                      </button>
                    </div>

                    {/* Status Row - Improved Design */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span className="text-xs text-slate-600 font-medium">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.status === "pending"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : request.status === "accepted" || request.status === "approved"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Improved Spacing and Design */}
                  {request.status === "pending" && adoptedPetIds.has(request.petId?._id) ? (
                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-2xl text-center border-2 border-dashed border-slate-300 text-sm">
                      Pet Already Adopted
                    </div>
                  ) : (
                    request.status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStatusUpdate(request._id, "approved")}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request._id, "rejected")}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )
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

export default IncomingRequestsPage
