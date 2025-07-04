import React, { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
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
          <Link to="/" className="flex items-center">
            <img src="/src/assets/pawpal_logo-r.png" alt="PawPal Logo" className="h-20 w-32" />
          </Link>
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
                    to="/my-pets"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    My Pets
                  </Link>
                  <Link
                    to="/incoming-requests"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Incoming Requests
                  </Link>
                  <Link
                    to="/edit-profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
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