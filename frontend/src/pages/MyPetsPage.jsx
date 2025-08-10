import { useEffect, useState } from "react"
import { getPetsByOwner, deletePet, updatePet, updatePetImages } from "../services/petService"
import PetCard from "../components/pets/PetCard"
import { useNavigate } from "react-router-dom"
import { Edit, Trash2, ImageIcon, X, ArrowLeft, Heart, Plus, Camera, Save, AlertCircle } from "lucide-react"
import { useToast } from "../context/ToastContext"
import ConfirmationModal from "../components/common/ConfirmationModal"

const MyPetsPage = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingPet, setEditingPet] = useState(null)
  const [showImageUpload, setShowImageUpload] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [petToDelete, setPetToDelete] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  let user = null
  try {
    const userStr = localStorage.getItem("user")
    if (userStr) user = JSON.parse(userStr)
  } catch (e) {
    user = null
  }
  const ownerId = user?._id

  useEffect(() => {
    if (!ownerId) {
      setError("You must be logged in to view your pets.")
      setLoading(false)
      return
    }
    fetchPets()
  }, [ownerId])

  const fetchPets = async () => {
    try {
      setLoading(true)
      const data = await getPetsByOwner(ownerId)
      setPets(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch your pets.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (petId) => {
    setPetToDelete(petId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!petToDelete) return
    try {
      await deletePet(petToDelete)
      setPets(pets.filter((pet) => pet._id !== petToDelete))
      setShowDeleteModal(false)
      setPetToDelete(null)
      showToast("Pet deleted successfully")
    } catch (err) {
      setError("Failed to delete pet.")
      setShowDeleteModal(false)
      setPetToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setPetToDelete(null)
  }

  const handleUpdate = async (petId, updatedData) => {
    try {
      await updatePet(petId, updatedData)
      setPets(pets.map((pet) => (pet._id === petId ? { ...pet, ...updatedData } : pet)))
      setEditingPet(null)
      showToast("✅ Pet details updated successfully")
    } catch (err) {
      setError("Failed to update pet.")
      showToast("Failed to update pet details", "error")
    }
  }

  const handleImageUpdate = async (petId, event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    if (files.length > 5) {
      setError("Maximum 5 images allowed")
      return
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      setError("Only JPG, JPEG, and PNG files are allowed")
      return
    }

    try {
      setUploading(true)
      const updatedPet = await updatePetImages(petId, files, true)

      setPets(pets.map((pet) => (pet._id === petId ? { ...pet, images: updatedPet.images } : pet)))
      setShowImageUpload(null)
      setError(null)
      showToast("✅ Update successful – your changes have been saved.")
    } catch (err) {
      setError(err.message || "Failed to update pet images.")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <Heart className="absolute inset-0 m-auto h-6 w-6 text-purple-600" />
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
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Access Required</h3>
            <p className="text-slate-600 mb-8">{error}</p>
            <button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
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
              My Listed Pets
            </h1>
            <p className="text-slate-600 mt-2">Manage your pet listings</p>
          </div>

          <div className="w-24"></div>
        </div>

        {pets.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Pets Listed Yet</h3>
            <p className="text-slate-600 mb-8">Start by listing your first pet for adoption.</p>
            <button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => navigate("/list-pet")}
            >
              List a Pet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100"
              >
                <PetCard
                  pet={{
                    ...pet,
                    imageUrl: pet.images?.[0] || "",
                    images: pet.images || [],
                    _id: pet._id,
                  }}
                />

                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={() => setEditingPet(pet)}
                    className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    title="Edit Pet Details"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setShowImageUpload(pet._id)}
                    className="bg-emerald-600 text-white p-3 rounded-2xl hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    title="Update Images"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(pet._id)}
                    className="bg-red-600 text-white p-3 rounded-2xl hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    title="Delete Pet"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Image Upload Modal */}
                {showImageUpload === pet._id && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800">Update Pet Images</h3>
                        </div>
                        <button
                          onClick={() => setShowImageUpload(null)}
                          className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                          <p className="text-slate-700 leading-relaxed">
                            Upload up to <span className="font-semibold text-emerald-600">5 high-quality images</span>{" "}
                            (JPG, JPEG, or PNG). These will replace your existing images.
                          </p>
                        </div>

                        <div className="relative">
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) => handleImageUpdate(pet._id, e)}
                            className="w-full p-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-emerald-400 focus:border-emerald-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                            disabled={uploading}
                          />
                        </div>

                        {uploading && (
                          <div className="flex items-center justify-center py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                              <span className="text-slate-600 font-medium">Uploading images...</span>
                            </div>
                          </div>
                        )}

                        {error && (
                          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <p className="text-red-700 font-medium">{error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Modal */}
                {editingPet?._id === pet._id && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                            <Edit className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800">Edit Pet Details</h3>
                        </div>
                        <button
                          onClick={() => setEditingPet(null)}
                          className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.target)
                          const updatedData = {
                            name: formData.get("name"),
                            breed: formData.get("breed"),
                            age: formData.get("age"),
                            species: formData.get("species"),
                            gender: formData.get("gender"),
                            description: formData.get("description"),
                          }
                          handleUpdate(pet._id, updatedData)
                        }}
                      >
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-slate-700 font-semibold mb-2 text-lg">Pet Name</label>
                              <input
                                type="text"
                                name="name"
                                defaultValue={pet.name}
                                className="w-full border-2 border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-semibold mb-2 text-lg">Breed</label>
                              <input
                                type="text"
                                name="breed"
                                defaultValue={pet.breed}
                                className="w-full border-2 border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block text-slate-700 font-semibold mb-2 text-lg">Age</label>
                              <input
                                type="number"
                                name="age"
                                defaultValue={pet.age}
                                className="w-full border-2 border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg"
                                min="0"
                                max="30"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-semibold mb-2 text-lg">Species</label>
                              <select
                                name="species"
                                defaultValue={pet.species}
                                className="w-full border-2 border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg"
                              >
                                <option value="dog">Dog</option>
                                <option value="cat">Cat</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-700 font-semibold mb-2 text-lg">Gender</label>
                              <select
                                name="gender"
                                defaultValue={pet.gender}
                                className="w-full border-2 border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg"
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold mb-2 text-lg">Description</label>
                            <textarea
                              name="description"
                              defaultValue={pet.description}
                              rows="4"
                              className="w-full border-2 border-slate-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg resize-none"
                              placeholder="Tell us about this pet's personality, habits, and what makes them special..."
                            />
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button
                              type="button"
                              onClick={() => setEditingPet(null)}
                              className="flex-1 border-2 border-slate-300 text-slate-700 py-3 px-6 rounded-2xl hover:bg-slate-50 font-semibold transition-colors text-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-colors shadow-lg flex items-center justify-center gap-2 text-lg"
                            >
                              <Save className="h-5 w-5" />
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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Pet"
          message="Are you sure you want to delete this pet? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  )
}

export default MyPetsPage
