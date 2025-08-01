import { useState } from "react"
import { Link } from "react-router-dom"
import { registerUser } from "../../services/authService"
import dogImage from '../../assets/dog1.jpg'

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "User",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required"
    }else if(formData.phone.length !== 10){
      newErrors.phone = "Enter a valid phone number"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true)
      setSubmitError("")

      try {
        const response = await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
        })

        if (response.success) {
          // Redirect to login page or dashboard
          window.location.href = "/login"
        } else {
          setSubmitError(response.message || "Registration failed. Please try again.")
        }
      } catch (error) {
        setSubmitError("Registration failed. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] relative overflow-hidden">
      {/* Decorative background shapes (optional, for extra polish) */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100 rounded-full z-0" style={{ filter: 'blur(8px)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-200 rounded-full z-0" style={{ filter: 'blur(12px)' }} />
      <div className="w-full max-w-3xl flex bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Left: Form */}
        <div className="w-full md:w-1/2 px-8 py-10 flex flex-col justify-center">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                {/* Simple pet icon SVG */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 21c4.5 0 8-2.5 8-6 0-2.5-2-4-4-4-.7 0-1.4.2-2 .6-.6-.4-1.3-.6-2-.6-2 0-4 1.5-4 4 0 3.5 3.5 6 8 6zM7 7a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0zM7.5 3A1.5 1.5 0 119 4.5 1.5 1.5 0 017.5 3zm9 0A1.5 1.5 0 1118 4.5 1.5 1.5 0 0116.5 3z" fill="#EF4444"/></svg>
              </span>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-[#8B4513] via-[#800000] to-red-500 bg-clip-text text-transparent">PawPal</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          </div>
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.name ? "border-red-300" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.email ? "border-red-300" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.phone ? "border-red-300" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.password ? "border-red-300" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.confirmPassword ? "border-red-300" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              {/* <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  User Type
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div> */}
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
            <div className="text-sm text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
        {/* Right: Pet Image */}
        <div className="hidden md:block md:w-1/2 bg-red-600 relative">
          <img src={dogImage} alt="Pet dog" className="object-cover w-full h-full" />
        </div>
      </div>
    </div>
  )
}

export default RegisterForm 