import React from "react"
import { useNavigate } from "react-router-dom"
import { Heart, MapPin } from "lucide-react"

const PetCard = ({ pet }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/pet/${pet._id}`)
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={pet.images?.[0] || "https://placehold.co/400x300?text=No+Image"}
          alt={pet.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {pet.adoptionStatus === 'adopted' && (
          <span className="absolute top-2 left-2 bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
            Adopted
          </span>
        )}
        {/* <div className="absolute top-3 right-3">
          <button 
            className="p-2 bg-white rounded-full shadow-md hover:bg-purple-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // Add to favorites functionality can be added here
            }}
          >
            <Heart className="w-5 h-5 text-purple-600" />
          </button>
        </div> */}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            {pet.species}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{pet.breed}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{pet.location || "Location not specified"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Age:</span>
            <span className="text-sm text-gray-600">{pet.age || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Gender:</span>
            <span className="text-sm text-gray-600">{pet.gender || "Not specified"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PetCard
