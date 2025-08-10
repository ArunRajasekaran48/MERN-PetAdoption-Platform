import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { createPet } from "../services/petService"
import { useToast } from "../context/ToastContext"
import { Camera, Upload, X, MapPin, Calendar, Heart, Sparkles, PlusCircle, ArrowLeft } from "lucide-react"

const ListPetPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { showToast } = useToast()

  const [petData, setPetData] = useState({
    name: "",
    age: "",
    breed: "",
    species: "dog",
    gender: "male",
    description: "",
    location: "",
  })

  const [images, setImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const speciesOptions = [
    { value: "dog", label: "🐕 Dog", emoji: "🐕" },
    { value: "cat", label: "🐱 Cat", emoji: "🐱" },
    { value: "bird", label: "🐦 Bird", emoji: "🐦" },
    { value: "rabbit", label: "🐰 Rabbit", emoji: "🐰" },
    { value: "other", label: "🐾 Other", emoji: "🐾" },
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!petData.name.trim()) newErrors.name = "Pet name is required"
    if (!petData.age) {
      newErrors.age = "Age is required"
    } else if (isNaN(petData.age) || petData.age < 0 || petData.age > 30) {
      newErrors.age = "Age must be a number between 0 and 30"
    }
    if (!petData.breed.trim()) newErrors.breed = "Breed is required"
    if (!petData.species) newErrors.species = "Species is required"
    if (!petData.gender) newErrors.gender = "Gender is required"
    if (!petData.location.trim()) newErrors.location = "Location is required"
    if (images.length === 0) newErrors.images = "At least one image is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPetData({ ...petData, [name]: value })
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      // Limit to 5 images total
      const newFiles = files.slice(0, 5 - images.length)
      if (newFiles.length > 0) {
        // Create preview URLs
        const newImagePreviews = newFiles.map((file) => URL.createObjectURL(file))
        setImages([...images, ...newImagePreviews])
        setImageFiles([...imageFiles, ...newFiles])
        // Clear any image-related errors
        if (errors.images) {
          setErrors({ ...errors, images: null })
        }
      }
    }
  }

  const removeImage = (index) => {
    const updatedImages = [...images]
    const updatedFiles = [...imageFiles]
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(images[index])
    updatedImages.splice(index, 1)
    updatedFiles.splice(index, 1)
    setImages(updatedImages)
    setImageFiles(updatedFiles)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData()
      // Add pet details
      Object.keys(petData).forEach((key) => {
        formData.append(key, petData[key])
      })

      // Add owner field
      const user = JSON.parse(localStorage.getItem("user"))
      if (user && user._id) {
        formData.append("owner", user._id)
      }

      // Add images
      imageFiles.forEach((file) => {
        formData.append("images", file)
      })

      // Submit to API
      const response = await createPet(formData)

      // Show confirmation toast
      showToast("✅ Pet listed successfully!")

      // Redirect to home after a short delay
      setTimeout(() => {
        navigate("/home")
      }, 1500)
    } catch (error) {
      console.error("Error listing pet:", error)
      // Handle API validation errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({
          form: error.response?.data?.message || "Failed to list your pet. Please try again.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSpecies = speciesOptions.find((option) => option.value === petData.species)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-purple-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                List Your Pet
              </h1>
              <p className="text-gray-600 mt-1">Help your furry friend find their perfect home</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errors.form && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">{errors.form}</p>
                  </div>
                </div>
              </div>
            )}

            

            {/* Pet Details Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pet Details</h2>
                <p className="text-gray-600">Tell us about your wonderful companion</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Pet Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Pet Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={petData.name}
                    onChange={handleInputChange}
                    placeholder="What's your pet's name?"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 ${
                      errors.name ? "border-red-500 focus:border-red-500" : "border-purple-200 focus:border-purple-400"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={petData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 ${
                      errors.location
                        ? "border-red-500 focus:border-red-500"
                        : "border-purple-200 focus:border-purple-400"
                    }`}
                  />
                  {errors.location && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Age (years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="0"
                    max="30"
                    value={petData.age}
                    onChange={handleInputChange}
                    placeholder="How old is your pet?"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 ${
                      errors.age ? "border-red-500 focus:border-red-500" : "border-purple-200 focus:border-purple-400"
                    }`}
                  />
                  {errors.age && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {errors.age}
                    </p>
                  )}
                </div>

                {/* Breed */}
                <div className="space-y-2">
                  <label htmlFor="breed" className="block text-sm font-semibold text-gray-700">
                    Breed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="breed"
                    name="breed"
                    value={petData.breed}
                    onChange={handleInputChange}
                    placeholder="What breed is your pet?"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 ${
                      errors.breed ? "border-red-500 focus:border-red-500" : "border-purple-200 focus:border-purple-400"
                    }`}
                  />
                  {errors.breed && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {errors.breed}
                    </p>
                  )}
                </div>

                {/* Species */}
                <div className="space-y-2">
                  <label htmlFor="species" className="block text-sm font-semibold text-gray-700">
                    Pet Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="species"
                      name="species"
                      value={petData.species}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 appearance-none bg-white ${
                        errors.species
                          ? "border-red-500 focus:border-red-500"
                          : "border-purple-200 focus:border-purple-400"
                      }`}
                    >
                      {speciesOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="text-2xl">{selectedSpecies?.emoji}</div>
                    </div>
                  </div>
                  {errors.species && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {errors.species}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 border-2 ${
                        petData.gender === "male"
                          ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                      }`}
                      onClick={() => {
                        setPetData({ ...petData, gender: "male" })
                        if (errors.gender) setErrors({ ...errors, gender: null })
                      }}
                    >
                      ♂ Male
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 border-2 ${
                        petData.gender === "female"
                          ? "bg-pink-500 text-white border-pink-500 shadow-lg"
                          : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 hover:border-pink-300"
                      }`}
                      onClick={() => {
                        setPetData({ ...petData, gender: "female" })
                        if (errors.gender) setErrors({ ...errors, gender: null })
                      }}
                    >
                      ♀ Female
                    </button>
                  </div>
                  {errors.gender && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                  Tell us about your pet
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={petData.description}
                  onChange={handleInputChange}
                  placeholder="Share your pet's personality, favorite activities, special needs, or anything that would help them find the perfect home..."
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 resize-none"
                ></textarea>
                {/* Pet Photos Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4">
                  <Camera className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Show Off Your Pet</h2>
                <p className="text-gray-600">Upload beautiful photos to help your pet find their perfect match</p>
              </div>

              <div className="space-y-6">
                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    images.length >= 5
                      ? "border-gray-200 bg-gray-50"
                      : "border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={images.length >= 5}
                  />

                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {images.length >= 5 ? "Maximum photos reached" : "Upload Pet Photos"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {images.length >= 5
                          ? "You can upload up to 5 photos maximum"
                          : "Drag and drop your photos here, or click to browse"}
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <span>PNG, JPG, GIF</span>
                        <span>•</span>
                        <span>Up to 10MB each</span>
                        <span>•</span>
                        <span>{images.length}/5 photos</span>
                      </div>
                    </div>
                  </div>
                </div>

                {errors.images && (
                  <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {errors.images}
                  </p>
                )}

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Photo Preview
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add more button */}
                      {images.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                        >
                          <PlusCircle className="w-8 h-8 text-purple-400 group-hover:text-purple-600" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Listing Your Pet...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      List My Pet
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ListPetPage
