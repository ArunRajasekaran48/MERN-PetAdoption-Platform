import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { resetPassword } from "../../services/authService"
import dogImage from '../../assets/dog1.jpg'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isTokenValid, setIsTokenValid] = useState(true)

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (!token) {
      setSubmitError("Reset token is missing")
      setIsTokenValid(false)
    } else if (error === "invalid_token") {
      setSubmitError("Invalid or expired reset token")
      setIsTokenValid(false)
    } else if (error === "server_error") {
      setSubmitError("Server error occurred. Please try again")
      setIsTokenValid(false)
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    if (formData.password.length < 6) {
      setSubmitError("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setSubmitError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError("")
    setSuccessMessage("")

    const token = searchParams.get("token")
    if (!token) {
      setSubmitError("Invalid or missing reset token")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await resetPassword(token, formData.password)
      if (response.success) {
        setSuccessMessage("Password has been reset successfully!")
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        setSubmitError(response.message || "Failed to reset password")
      }
    } catch (error) {
      setSubmitError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] relative overflow-hidden">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">{submitError}</p>
            <Link
              to="/forgot-password"
              className="inline-block px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100 rounded-full z-0" style={{ filter: 'blur(8px)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-200 rounded-full z-0" style={{ filter: 'blur(12px)' }} />
      <div className="w-full max-w-3xl flex bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Left: Form */}
        <div className="w-full md:w-1/2 px-8 py-10 flex flex-col justify-center">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 21c4.5 0 8-2.5 8-6 0-2.5-2-4-4-4-.7 0-1.4.2-2 .6-.6-.4-1.3-.6-2-.6-2 0-4 1.5-4 4 0 3.5 3.5 6 8 6zM7 7a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0zM7.5 3A1.5 1.5 0 119 4.5 1.5 1.5 0 017.5 3zm9 0A1.5 1.5 0 1118 4.5 1.5 1.5 0 0116.5 3z" fill="#EF4444"/></svg>
              </span>
              <span className="text-2xl font-bold text-red-600">PawPal</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>

          {submitError && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <div className="text-sm text-center">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
                  Back to login
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

export default ResetPassword 