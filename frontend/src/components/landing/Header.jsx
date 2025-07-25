import React, { useState, useEffect, useRef } from "react"
import { Menu, X,Settings,LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { getCurrentUser, logoutUser } from "../../services/authService"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate()
  const dropdownRef = useRef(null);

  // Get user from localStorage
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    user = null;
  }

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

  useEffect(() => {
    const user = getCurrentUser()
    setIsLoggedIn(!!user)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    logoutUser()
    setIsLoggedIn(false)
    navigate("/")
  }

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-orange-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-[#8B4513] via-[#800000] to-red-500 bg-clip-text text-transparent">
                Pawpal
          </h1>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          
          <button
            className="font-medium hover:text-rose-600 transition-colors bg-transparent border-none outline-none cursor-pointer"
            onClick={() => navigate(isLoggedIn ? '/home' : '/login')}
          >
            Browse Pets
          </button>
          <button
            className="font-medium hover:text-rose-600 transition-colors bg-transparent border-none outline-none cursor-pointer"
            onClick={() => navigate(isLoggedIn ? '/list-pet' : '/login', { state: { from: '/list-pet' } })}
          >
            List a Pet
          </button>
          <button
            className="font-medium hover:text-rose-600 transition-colors bg-transparent border-none outline-none cursor-pointer"
            onClick={() => navigate('/reviews')}
          >
            Reviews
          </button>
          {isLoggedIn && user?.role === 'Admin' && (
            <button
             className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
              onClick={() => navigate('/admin')}
            >
              Admin Dashboard
            </button>
          )}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
              >
                {user?.name || 'Profile'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/edit-profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 transition-all duration-200 font-medium text-base group"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 group-hover:bg-rose-100 rounded-lg flex items-center justify-center transition-colors duration-200">
                      <Settings size={14} className="text-gray-600 group-hover:text-rose-600" />
                    </div>
                    <span className="group-hover:text-rose-400">Edit Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowDropdown(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200 font-medium text-base group"
                  >
                    <div className="w-8 h-8 bg-gray-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200">
                      <LogOut size={16} className="text-gray-600 group-hover:text-red-600" />
                    </div>
                    <span className="group-hover:text-red-700">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="font-medium text-rose-600 hover:text-rose-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-md">
          <nav className="flex flex-col space-y-4">
            <button
              className="font-medium hover:text-rose-600 transition-colors bg-transparent border-none outline-none cursor-pointer text-left"
              onClick={() => { setIsMenuOpen(false); navigate(isLoggedIn ? '/home' : '/login'); }}
            >
              Home
            </button>
            <button
              className="font-medium hover:text-rose-600 transition-colors bg-transparent border-none outline-none cursor-pointer text-left"
              onClick={() => { setIsMenuOpen(false); navigate(isLoggedIn ? '/home' : '/login'); }}
            >
              Browse Pets
            </button>
            <button
              className="font-medium hover:text-rose-600 transition-colors bg-transparent border-none outline-none cursor-pointer text-left"
              onClick={() => { setIsMenuOpen(false); navigate(isLoggedIn ? '/list-pet' : '/login', { state: { from: '/list-pet' } }); }}
            >
              List a Pet
            </button>
            <button
              className="font-medium hover:text-rose-600 transition-colors bg-transparent border-none outline-none cursor-pointer text-left"
              onClick={() => { setIsMenuOpen(false); navigate('/reviews'); }}
            >
              Reviews
            </button>
            {isLoggedIn && user?.role === 'Admin' && (
              <button
                className="font-medium hover:text-blue-700 text-blue-600 border border-blue-200 bg-blue-50 px-4 py-2 rounded-full transition-colors text-left"
                onClick={() => { setIsMenuOpen(false); navigate('/admin'); }}
              >
                Admin Dashboard
              </button>
            )}
            {isLoggedIn ? (
              <>
                <Link to="/my-pets" className="font-medium hover:text-rose-600 transition-colors">
                  My Pets
                </Link>
                <Link to="/incoming-requests" className="font-medium hover:text-rose-600 transition-colors">
                  Incoming Requests
                </Link>
                <Link to="/edit-profile" className="font-medium hover:text-rose-600 transition-colors">
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-medium transition-colors w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-medium transition-colors w-full text-center"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header