import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createAdoptionRequest } from '../../services/adoptionService';
import ConfirmationModal from '../common/ConfirmationModal';

const PetCard = ({ pet }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isOwner, setIsOwner] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if current user is the owner
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && pet.owner) {
      // Check if the user's ID matches the pet owner's ID
      setIsOwner(user._id === pet.owner._id || user._id === pet.owner);
    }
  }, [pet.owner]);

  const handleAdoptClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking adopt button
    if (isOwner) {
      showToast('You cannot adopt your own pet', 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleCardClick = () => {
    navigate(`/pet/${pet._id}`);
  };

  const handleConfirmAdoption = async () => {
    try {
      setLoading(true);
      const response = await createAdoptionRequest(pet._id);
      
      if (response.success) {
        showToast('✅ Adoption request sent successfully');
        setHasRequested(true);
      } else {
        showToast(response.message || 'Failed to send adoption request', 'error');
      }
    } catch (error) {
      showToast('Failed to send adoption request', 'error');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const renderAdoptButton = () => {
    if (isOwner) {
      return (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-md cursor-not-allowed"
          title="You cannot adopt your own pet"
        >
          Your Pet
        </button>
      );
    }

    if (hasRequested) {
      return (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-md cursor-not-allowed"
        >
          Request Sent
        </button>
      );
    }

    return (
      <button
        onClick={handleAdoptClick}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Adopt'}
      </button>
    );
  };

  // WhatsApp chat handler
  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    if (isOwner) return;
    if (pet.owner && pet.owner.phone) {
      let phone = pet.owner.phone.replace(/\D/g, '');
      // If phone does not start with a country code (assuming 10 digits), prepend '91' (India) as default
      if (phone.length === 10) {
        phone = '91' + phone;
      }
      const waLink = `https://wa.me/${phone}`;
      console.log('Opening WhatsApp chat:', waLink);
      window.open(waLink, '_blank');
    }
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img
            src={pet.images?.[0] || '/placeholder-pet.jpg'}
            alt={pet.name}
            className="w-full h-48 object-cover"
          />
          {/* WhatsApp Icon - top left, always visible, disabled for own pets */}
          {pet.owner && pet.owner.phone && (
            <button
              className={`absolute top-2 left-2 p-2 rounded-full shadow-md focus:outline-none ${isOwner ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-green-100'}`}
              title={isOwner ? 'This is your pet' : 'Chat with owner on WhatsApp'}
              onClick={isOwner ? (e) => e.stopPropagation() : handleWhatsAppClick}
              disabled={isOwner ? true : false}
              style={{ opacity: 1 }}
            >
              <MessageCircle className={`w-5 h-5 ${isOwner ? 'text-gray-400' : 'text-green-600'}`} />
            </button>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{pet.name}</h3>
          <p className="text-gray-600 mb-4">{pet.breed}</p>
          <div className="flex justify-between items-center">
            <span className="text-blue-600 font-semibold">{pet.price || ''}</span>
            {renderAdoptButton()}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAdoption}
        title="Confirm Adoption Request"
        message={`Are you sure you want to request to adopt ${pet.name}?`}
        confirmText="Yes, Request Adoption"
        cancelText="Cancel"
      />
    </>
  );
};

export default PetCard; 