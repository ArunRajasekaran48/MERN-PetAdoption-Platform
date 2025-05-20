import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { createPet } from "../services/petService"
import { useToast } from '../context/ToastContext';

const ListPetPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { showToast } = useToast();

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

  const speciesOptions = ["dog", "cat", "bird", "other"]
  const genderOptions = ["male", "female"]

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
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user._id) {
        formData.append('owner', user._id);
      }

      // Add images
      imageFiles.forEach((file) => {
        formData.append("images", file)
      })

      // Submit to API
      const response = await createPet(formData)

      // Show confirmation toast
      showToast('✅ Pet listed successfully!');
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/home');
      }, 1500);
      // If you want to also navigate to the pet detail page, you can do so after the toast or as an alternative
      // navigate(`/pet/${response.data._id}`)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-amber-500 p-6">
          <h1 className="text-2xl font-bold text-white">List Your Pet</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.form && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {errors.form}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pet Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Pet Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={petData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={petData.location}
                onChange={handleInputChange}
                placeholder="City, State"
                className={`w-full px-3 py-2 border rounded-md ${errors.location ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age (0-30) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                max="30"
                value={petData.age}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.age ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
            </div>

            {/* Breed */}
            <div className="space-y-2">
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                Breed <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={petData.breed}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.breed ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.breed && <p className="text-sm text-red-600">{errors.breed}</p>}
            </div>

            {/* Species */}
            <div className="space-y-2">
              <label htmlFor="species" className="block text-sm font-medium text-gray-700">
                Species <span className="text-red-500">*</span>
              </label>
              <select
                id="species"
                name="species"
                value={petData.species}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.species ? "border-red-500" : "border-gray-300"}`}
              >
                {speciesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
              {errors.species && <p className="text-sm text-red-600">{errors.species}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={petData.gender}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.gender ? "border-red-500" : "border-gray-300"}`}
              >
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
              {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={petData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Tell us about your pet..."
            ></textarea>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pet Photos <span className="text-red-500">*</span>
              <span className="text-gray-500 text-xs ml-2">(Max 5 images)</span>
            </label>

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none"
                  >
                    <span>Upload images</span>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                      disabled={images.length >= 5}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Image Previews:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add more images button */}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-amber-500"
                    >
                      <span className="text-3xl text-gray-400">+</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {isSubmitting ? "Listing..." : "List Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ListPetPage 