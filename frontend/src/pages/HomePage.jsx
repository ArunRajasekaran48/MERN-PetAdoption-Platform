import React, { useState, useEffect, useRef } from 'react';
import PetCard from '../components/pets/PetCard';
import { getAllPets } from '../services/petService';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

const HomePage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const data = await getAllPets();
      setPets(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pets. Please try again later.');
      console.error('Error fetching pets:', err);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = pets.filter(pet => {
    if (!pet) return false;
    const matchesSearch = 
      (pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesSpecies = !selectedSpecies || 
      (pet.species?.toLowerCase() === selectedSpecies.toLowerCase());
    return matchesSearch && matchesSpecies;
  });

  // Robustly get user from localStorage
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    user = null;
  }

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

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
          <button 
            onClick={fetchPets}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Available Pets</h1>
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
              onClick={handleProfileClick}
              title={user?.name || 'Profile'}
            >
              {user?.name || 'Profile'}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => { setShowDropdown(false); navigate('/my-pets'); }}
                >
                  My Pets
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => { setShowDropdown(false); navigate('/incoming-requests'); }}
                >
                  Incoming Requests
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => { setShowDropdown(false); navigate('/outgoing-requests'); }}
                >
                  Outgoing Requests
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => { setShowDropdown(false); navigate('/edit-profile'); }}
                >
                  Edit Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => { setShowDropdown(false); handleLogout(); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filters
            </h2>
            
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Search size={16} />
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search pets..."
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Species Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species
                </label>
                <select 
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                >
                  <option value="">All Species</option>
                  <option value="dog">Dogs</option>
                  <option value="cat">Cats</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {filteredPets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No pets found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map((pet) => (
                <PetCard 
                  key={pet._id} 
                  pet={{
                    ...pet,
                    imageUrl: pet.images?.[0] || '', // Use the first image from the images array
                    images: pet.images || [], // Ensure images array is passed
                    _id: pet._id // Ensure _id is passed
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
