import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getIncomingAdoptionRequests, updateAdoptionRequestStatus } from '../services/adoptionService';
import { ArrowLeft, MessageSquare, Mail } from 'lucide-react';

const IncomingRequestsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const fetchIncomingRequests = async () => {
    try {
      setLoading(true);
      const response = await getIncomingAdoptionRequests();
      if (response.success) {
        setRequests(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to fetch incoming requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await updateAdoptionRequestStatus(requestId, newStatus);
      if (response.success) {
        showToast(`Request ${newStatus.toLowerCase()} successfully`);
        // Refresh the requests list
        fetchIncomingRequests();
      } else {
        showToast(response.message || 'Failed to update request status', 'error');
      }
    } catch (error) {
      showToast('Failed to update request status', 'error');
    }
  };

  // Find all petIds that have an approved request
  const adoptedPetIds = new Set(requests.filter(r => r.status === 'approved').map(r => r.petId?._id));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-full shadow hover:bg-purple-50 hover:text-purple-900 transition-all group"
        >
          <ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Incoming Requests</h1>
        <div className="w-24"></div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No incoming requests yet</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6 relative">
              {/* Contact User Icon at top right */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => {
                    const phone = request.userId?.phone?.replace(/\D/g, "");
                    const email = request.userId?.email;
                    if (phone) {
                      const waPhone = phone.length === 10 ? `91${phone}` : phone;
                      window.open(`https://wa.me/${waPhone}`);
                    } else if (email) {
                      window.open(`mailto:${email}`);
                    }
                  }}
                  disabled={!request.userId?.phone && !request.userId?.email}
                  className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#A6786D] bg-[#8E531F] shadow-none border-none ${
                    request.userId?.phone || request.userId?.email
                      ? 'text-white hover:text-black hover:bg-[#CADBEB]'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Contact User"
                >
                  {request.userId?.phone ? (
                    <MessageSquare size={20} />
                  ) : (
                    <Mail size={20} />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={request.petId?.images?.[0] || '/placeholder-pet.jpg'}
                  alt={request.petId?.name || 'Pet'}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{request.petId?.name || 'Unknown Pet'}</h3>
                  <p className="text-gray-600">{request.petId?.breed || ''}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">Requested by:</span> {request.userId?.name || 'Unknown'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`capitalize ${
                    request.status === 'pending' ? 'text-yellow-600' :
                    request.status === 'accepted' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {request.status}
                  </span>
                </p>
              </div>

              {/* Only show Accept/Reject if no other request for this pet is approved */}
              {request.status === 'pending' && adoptedPetIds.has(request.petId?._id) ? (
                <div className="text-center text-gray-500 font-medium py-2 border rounded bg-gray-50">Pet already adopted</div>
              ) : request.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'approved')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'rejected')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingRequestsPage; 