import React, { useEffect, useState } from 'react';
import { getPetsByOwner, deletePet, updatePet, updatePetImages } from '../services/petService';
import PetCard from '../components/pets/PetCard';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Image, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const MyPetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Robustly get user from localStorage
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    user = null;
  }
  const ownerId = user?._id;

  useEffect(() => {
    if (!ownerId) {
      setError('You must be logged in to view your pets.');
      setLoading(false);
      return;
    }
    fetchPets();
  }, [ownerId]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const data = await getPetsByOwner(ownerId);
      setPets(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your pets.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (petId) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await deletePet(petId);
        setPets(pets.filter(pet => pet._id !== petId));
      } catch (err) {
        setError('Failed to delete pet.');
      }
    }
  };

  const handleUpdate = async (petId, updatedData) => {
    try {
      await updatePet(petId, updatedData);
      setPets(pets.map(pet => 
        pet._id === petId ? { ...pet, ...updatedData } : pet
      ));
      setEditingPet(null);
      showToast('✅ Pet details updated successfully');
    } catch (err) {
      setError('Failed to update pet.');
      showToast('Failed to update pet details', 'error');
    }
  };

  const handleImageUpdate = async (petId, event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate file count
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    try {
      setUploading(true);
      const updatedPet = await updatePetImages(petId, files, true); // true to replace existing images
      
      // Update local state with the new images
      setPets(pets.map(pet => 
        pet._id === petId ? { ...pet, images: updatedPet.images } : pet
      ));
      setShowImageUpload(null);
      setError(null);
      showToast('✅ Update successful – your changes have been saved.');
    } catch (err) {
      setError(err.message || 'Failed to update pet images.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        {error}
        <div className="mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">My Listed Pets</h1>
        <div className="w-24"></div> {/* Spacer for flex alignment */}
      </div>
      {pets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg mb-4">You haven't listed any pets yet.</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate('/list-pet')}
          >
            List a Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet._id} className="relative group">
              <PetCard 
                pet={{ 
                  ...pet, 
                  imageUrl: pet.images?.[0] || '', 
                  images: pet.images || [], 
                  _id: pet._id 
                }} 
              />
              
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingPet(pet)}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  title="Edit Pet"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setShowImageUpload(pet._id)}
                  className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                  title="Update Images"
                >
                  <Image size={16} />
                </button>
                <button
                  onClick={() => handleDelete(pet._id)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  title="Delete Pet"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Image Upload Modal */}
              {showImageUpload === pet._id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Update Pet Images</h3>
                      <button
                        onClick={() => setShowImageUpload(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Upload up to 5 images (JPG, JPEG, or PNG). These will replace the existing images.
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => handleImageUpdate(pet._id, e)}
                        className="w-full"
                        disabled={uploading}
                      />
                      {uploading && (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                        </div>
                      )}
                      {error && (
                        <p className="text-sm text-red-600">{error}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Modal */}
              {editingPet?._id === pet._id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Edit Pet Details</h3>
                      <button
                        onClick={() => setEditingPet(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const updatedData = {
                        name: formData.get('name'),
                        breed: formData.get('breed'),
                        age: formData.get('age'),
                        species: formData.get('species'),
                        gender: formData.get('gender'),
                        description: formData.get('description'),
                      };
                      handleUpdate(pet._id, updatedData);
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={pet.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Breed</label>
                          <input
                            type="text"
                            name="breed"
                            defaultValue={pet.breed}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Age</label>
                          <input
                            type="number"
                            name="age"
                            defaultValue={pet.age}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Species</label>
                          <select
                            name="species"
                            defaultValue={pet.species}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gender</label>
                          <select
                            name="gender"
                            defaultValue={pet.gender}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            name="description"
                            defaultValue={pet.description}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPet(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPetsPage; 