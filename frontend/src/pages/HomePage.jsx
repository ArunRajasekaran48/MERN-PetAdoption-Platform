import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Heart,
  ChevronDown,
  LogOut,
  User,
  MapPin,
  Calendar,
  Palette,
  Mail,
  Repeat,
  PlusCircle,
} from "lucide-react"
import { getAllPets } from "../services/petService"
import PetCard from "../components/pets/PetCard"
import { getIncomingAdoptionRequests } from "../services/adoptionService"

const HomePage = () => {
  // Robustly get user from localStorage
  let user = null
  try {
    const userStr = localStorage.getItem("user")
    if (userStr) user = JSON.parse(userStr)
  } catch (e) {
    user = null
  }

  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecies, setSelectedSpecies] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedAge, setSelectedAge] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [hasUnseenIncomingRequests, setHasUnseenIncomingRequests] = useState(false)
  const [pendingIncomingCount, setPendingIncomingCount] = useState(0)

  useEffect(() => {
    fetchPets()
  }, [])

  useEffect(() => {
    // Only fetch if user is logged in
    if (!user) return
    // Get count from localStorage on mount
    const storedCount = Number.parseInt(localStorage.getItem("pendingIncomingCount"), 10) || 0
    setPendingIncomingCount(storedCount)

    const fetchIncoming = async () => {
      const response = await getIncomingAdoptionRequests()
      if (response.success && Array.isArray(response.data)) {
        const pendingCount = response.data.filter((r) => r.status === "pending").length
        setPendingIncomingCount(pendingCount)
        localStorage.setItem("pendingIncomingCount", pendingCount)
      }
    }

    fetchIncoming()
  }, [user])

  // Handler for navigating to incoming requests
  const handleIncomingRequestsClick = () => {
    setPendingIncomingCount(0)
    localStorage.setItem("pendingIncomingCount", 0)
    navigate("/incoming-requests")
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  const fetchPets = async () => {
    try {
      setLoading(true)
      const data = await getAllPets()
      setPets(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch pets. Please try again later.")
      console.error("Error fetching pets:", err)
      setPets([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPets = pets.filter((pet) => {
    if (!pet) return false
    // Exclude pets listed by the current user
    if (user && (pet.owner?._id === user._id || pet.owner === user._id)) return false
    if (showOnlyAvailable && pet.adoptionStatus === "adopted") return false

    const matchesSearch =
      pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecies = !selectedSpecies || pet.species?.toLowerCase() === selectedSpecies.toLowerCase()
    const matchesLocation = !selectedLocation || pet.location?.toLowerCase().includes(selectedLocation.toLowerCase())
    const matchesAge =
      !selectedAge ||
      (selectedAge === "young" && pet.age <= 2) ||
      (selectedAge === "adult" && pet.age > 2 && pet.age <= 7) ||
      (selectedAge === "senior" && pet.age > 7)
    const matchesGender = !selectedGender || pet.gender?.toLowerCase() === selectedGender.toLowerCase()

    return matchesSearch && matchesSpecies && matchesLocation && matchesAge && matchesGender
  })

  // Sort pets: non-adopted first, adopted last
  const sortedPets = [...filteredPets].sort((a, b) => {
    if (a.adoptionStatus === "adopted" && b.adoptionStatus !== "adopted") return 1
    if (a.adoptionStatus !== "adopted" && b.adoptionStatus === "adopted") return -1
    return 0
  })

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedSpecies("")
    setSelectedLocation("")
    setSelectedAge("")
    setSelectedGender("")
    setShowOnlyAvailable(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
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
            <button
              onClick={fetchPets}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Brand Logo */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
                Pawpal
              </h1>
              <p className="text-gray-600 text-sm mt-1 font-medium">Find Your Perfect Companion</p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for your perfect companion..."
                  className="w-full border-2 border-purple-200 rounded-full px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 pl-14 shadow-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-6 w-6 text-purple-400 absolute left-5 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* User Profile */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  onClick={handleProfileClick}
                  title={user?.name || "Profile"}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">{user?.name || "Profile"}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-purple-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      onClick={() => {
                        setShowDropdown(false)
                        navigate("/edit-profile")
                      }}
                    >
                      <User className="w-4 h-4 text-purple-600" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        setShowDropdown(false)
                        handleLogout()
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar for extracted menu items */}
      {user && (
        <div className="bg-white border-b border-purple-100 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center lg:justify-start gap-1">
              <button
                className="flex items-center gap-2 px-6 py-3 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all duration-200 font-medium border-b-2 border-transparent hover:border-purple-300"
                onClick={() => navigate("/my-pets")}
              >
                <Heart className="w-4 h-4" />
                <span>My Pets</span>
              </button>

              <button
                className="flex items-center gap-2 px-6 py-3 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all duration-200 font-medium border-b-2 border-transparent hover:border-purple-300 relative"
                onClick={handleIncomingRequestsClick}
              >
                <Mail className="w-4 h-4" />
                <span>Incoming Requests</span>
                {pendingIncomingCount > 0 && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center">
                    <div className="relative">
                      {/* Main badge - static with subtle glow */}
                      <div className="min-w-[1.25rem] h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-105 transition-all duration-300">
                        <span className="text-white text-xs font-bold px-1">
                          {pendingIncomingCount > 99 ? "99+" : pendingIncomingCount}
                        </span>
                      </div>
                      {/* Very subtle static glow - no animation */}
                      <div className="absolute inset-0 min-w-[1.25rem] h-5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-20 blur-sm -z-10"></div>
                    </div>
                  </div>
                )}
              </button>

              <button
                className="flex items-center gap-2 px-6 py-3 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all duration-200 font-medium border-b-2 border-transparent hover:border-purple-300"
                onClick={() => navigate("/outgoing-requests")}
              >
                <Repeat className="w-4 h-4" />
                <span>Outgoing Requests</span>
              </button>

              <button
                className="flex items-center gap-2 px-6 py-3 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all duration-200 font-medium border-b-2 border-transparent hover:border-purple-300"
                onClick={() => navigate("/list-pet")}
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Pet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Enhanced Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-8 border border-purple-100 backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Your Match</h2>
              </div>

              <div className="space-y-6">
                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    Pet Type
                  </label>
                  <select
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 appearance-none bg-white text-gray-700 font-medium"
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239333ea'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1rem",
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="dog">🐕 Dogs</option>
                    <option value="cat">🐱 Cats</option>
                    <option value="bird">🐦 Birds</option>
                    <option value="rabbit">🐰 Rabbits</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city or area..."
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 text-gray-700"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </div>

                {/* Age Group */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Age Group
                  </label>
                  <select
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 appearance-none bg-white text-gray-700 font-medium"
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239333ea'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1rem",
                    }}
                  >
                    <option value="">All Ages</option>
                    <option value="young">🐣 Young (0-2 years)</option>
                    <option value="adult">🦴 Adult (3-7 years)</option>
                    <option value="senior">👴 Senior (8+ years)</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        selectedGender === "male"
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                      onClick={() => setSelectedGender(selectedGender === "male" ? "" : "male")}
                    >
                      ♂ Male
                    </button>
                    <button
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        selectedGender === "female"
                          ? "bg-pink-500 text-white shadow-lg"
                          : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                      }`}
                      onClick={() => setSelectedGender(selectedGender === "female" ? "" : "female")}
                    >
                      ♀ Female
                    </button>
                  </div>
                </div>

                {/* Show Only Available Pets Option */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                      checked={showOnlyAvailable}
                      onChange={() => setShowOnlyAvailable((prev) => !prev)}
                    />
                    Show only available pets
                  </label>
                </div>

                {/* Quick Actions */}
                <div className="pt-6 border-t border-purple-100">
                  <div className="flex flex-col gap-3">
                    <button
                      className="w-full px-6 py-3 bg-white border-2 border-purple-200 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                      onClick={clearAllFilters}
                    >
                      🔄 Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pet Grid */}
          <div className="flex-1">
            {filteredPets.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-purple-100">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-6">
                  <Search className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No companions found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any pets matching your criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Available Companions</h3>
                    <p className="text-gray-600">
                      {filteredPets.filter((pet) => pet.adoptionStatus !== "adopted").length}{" "}
                      {filteredPets.filter((pet) => pet.adoptionStatus !== "adopted").length === 1 ? "pet" : "pets"}{" "}
                      waiting for their forever home
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {sortedPets.map((pet) => (
                    <div
                      key={pet._id}
                      className="pet-card-container transform hover:scale-105 transition-all duration-300"
                    >
                      <PetCard pet={pet} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
