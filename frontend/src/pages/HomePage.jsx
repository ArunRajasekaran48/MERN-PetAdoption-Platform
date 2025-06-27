import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter, Heart, ChevronDown, LogOut, User, MessageSquare, Package } from "lucide-react"
import { getAllPets } from "../services/petService"
import PetCard from "../components/pets/PetCard"

const HomePage = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecies, setSelectedSpecies] = useState("")
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchPets()
  }, [])

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

  // Robustly get user from localStorage
  let user = null
  try {
    const userStr = localStorage.getItem("user")
    if (userStr) user = JSON.parse(userStr)
  } catch (e) {
    user = null
  }

  const filteredPets = pets.filter((pet) => {
    if (!pet) return false
    // Exclude pets listed by the current user
    if (user && (pet.owner?._id === user._id || pet.owner === user._id)) return false;
    const matchesSearch =
      pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
    const matchesSpecies = !selectedSpecies || pet.species?.toLowerCase() === selectedSpecies.toLowerCase()
    return matchesSearch && matchesSpecies
  })

  // Sort pets: non-adopted first, adopted last
  const sortedPets = [...filteredPets].sort((a, b) => {
    if (a.adoptionStatus === 'adopted' && b.adoptionStatus !== 'adopted') return 1;
    if (a.adoptionStatus !== 'adopted' && b.adoptionStatus === 'adopted') return -1;
    return 0;
  });

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-purple-800 mb-2">Find Your Perfect Companion</h1>
            <p className="text-gray-600 max-w-md">Discover pets waiting for their forever homes</p>
          </div>
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                onClick={handleProfileClick}
                title={user?.name || "Profile"}
              >
                <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-700" />
                </div>
                <span>{user?.name || "Profile"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-purple-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-purple-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                    onClick={() => {
                      setShowDropdown(false)
                      navigate("/my-pets")
                    }}
                  >
                    <Heart className="w-4 h-4 text-purple-600" />
                    <span>My Pets</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                    onClick={() => {
                      setShowDropdown(false)
                      navigate("/incoming-requests")
                    }}
                  >
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span>Incoming Requests</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                    onClick={() => {
                      setShowDropdown(false)
                      navigate("/outgoing-requests")
                    }}
                  >
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Outgoing Requests</span>
                  </button>
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border border-purple-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-800">
                <Filter className="h-5 w-5" />
                Find Pets
              </h2>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Search className="h-4 w-4 text-purple-600" />
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search pets..."
                      className="w-full border border-purple-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                {/* Species Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
                  <select
                    className="w-full border border-purple-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239333ea'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1rem",
                    }}
                  >
                    <option value="">All Species</option>
                    <option value="dog">Dogs</option>
                    <option value="cat">Cats</option>
                    <option value="bird">Birds</option>
                  </select>
                </div>

                {/* Additional filters could go here */}
                <div className="pt-4 border-t border-purple-100">
                  <p className="text-xs text-gray-500 mb-3">Quick Filters</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                      onClick={() => setSelectedSpecies("dog")}
                    >
                      Dogs
                    </button>
                    <button
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                      onClick={() => setSelectedSpecies("cat")}
                    >
                      Cats
                    </button>
                    <button
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                      onClick={() => setSelectedSpecies("bird")}
                    >
                      Birds
                    </button>
                    <button
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                      onClick={() => {
                        setSelectedSpecies("")
                        setSearchTerm("")
                      }}
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {filteredPets.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                  <Search className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No pets found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedSpecies("")
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPets.map((pet) => (
                  <div key={pet._id} className="pet-card-container">
                    <PetCard pet={pet} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
