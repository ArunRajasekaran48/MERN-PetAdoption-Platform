import { useState, useEffect } from "react"
import {
  ArrowLeft, User, Lock, Mail, Phone,
  Eye, EyeOff, Check, AlertCircle
} from "lucide-react"
import { useToast } from "../context/ToastContext"
import { changeCurrentPassword, updateAccountDetails } from "../services/authService"

export default function EditProfile() {
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [activeTab, setActiveTab] = useState("account")
  const { showToast } = useToast()

  const [accountDetails, setAccountDetails] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [passwordDetails, setPasswordDetails] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const userData = JSON.parse(userStr)
          setAccountDetails({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          })
        }
      } catch (error) {
        showToast("Failed to load user data", "error")
      }
    }

    fetchUserData()
  }, [])

  const validatePasswordForm = () => {
    const newErrors = {}
    if (!passwordDetails.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }
    if (!passwordDetails.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwordDetails.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }
    if (passwordDetails.newPassword !== passwordDetails.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAccountForm = () => {
    const newErrors = {}
    if (!accountDetails.name) {
      newErrors.name = "Name is required"
    }
    if (!accountDetails.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(accountDetails.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!accountDetails.phone) {
      newErrors.phone = "Phone number is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!validatePasswordForm()) return
    try {
      setLoading(true)
      setSuccessMessage("")
      const response = await changeCurrentPassword({
        oldPassword: passwordDetails.currentPassword,
        newPassword: passwordDetails.newPassword,
      })
      if (response.success) {
        setSuccessMessage("✅ Password updated successfully!")
        setPasswordDetails({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setErrors({})
        showToast("Password updated successfully", "success")
      } else {
        showToast(response.message || "Failed to update password", "error")
      }
    } catch (error) {
      showToast(error.message || "Failed to update password", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleAccountUpdate = async (e) => {
    e.preventDefault()
    if (!validateAccountForm()) return
    try {
      setLoading(true)
      setSuccessMessage("")
      const response = await updateAccountDetails(accountDetails)
      if (response.success) {
        setSuccessMessage("✅ Profile updated successfully!")
        setErrors({})
        showToast("Profile updated successfully", "success")

        const userStr = localStorage.getItem("user")
        if (userStr) {
          const userData = JSON.parse(userStr)
          localStorage.setItem("user", JSON.stringify({ ...userData, ...response.data }))
        }
      } else {
        showToast(response.message || "Failed to update profile", "error")
      }
    } catch (error) {
      showToast(error.message || "Failed to update profile", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <button
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-full shadow hover:bg-purple-50 hover:text-purple-900 transition-all group"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Edit Profile</h1>
            <p className="text-slate-600">Manage your account settings and preferences</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 border border-green-200 bg-green-50 rounded-lg p-4 flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        <div className="shadow-xl rounded-2xl bg-white/80 backdrop-blur-sm p-6">
          <div className="flex mb-8 border-b">
            <button
              className={`flex-1 px-4 py-2 font-medium text-lg transition-colors ${activeTab === 'account' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('account')}
            >
              <User className="h-4 w-4 inline mr-2" />
              Account Details
            </button>
            <button
              className={`flex-1 px-4 py-2 font-medium text-lg transition-colors ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('password')}
            >
              <Lock className="h-4 w-4 inline mr-2" />
              Change Password
            </button>
          </div>

          {activeTab === 'account' && (
            <form onSubmit={handleAccountUpdate} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={accountDetails.name}
                      onChange={(e) => setAccountDetails({ ...accountDetails, name: e.target.value })}
                      className={`pl-10 py-2 w-full rounded border ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:outline-none`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={accountDetails.phone}
                      onChange={(e) => setAccountDetails({ ...accountDetails, phone: e.target.value })}
                      className={`pl-10 py-2 w-full rounded border ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:outline-none`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={accountDetails.email}
                    onChange={(e) => setAccountDetails({ ...accountDetails, email: e.target.value })}
                    className={`pl-10 py-2 w-full rounded border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:outline-none`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-medium rounded"
              >
                {loading ? "Updating Profile..." : "Update Profile"}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordDetails.currentPassword}
                    onChange={(e) => setPasswordDetails({ ...passwordDetails, currentPassword: e.target.value })}
                    className={`pl-3 pr-10 py-2 w-full rounded border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordDetails.newPassword}
                      onChange={(e) => setPasswordDetails({ ...passwordDetails, newPassword: e.target.value })}
                      className={`pl-3 pr-10 py-2 w-full rounded border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordDetails.confirmPassword}
                      onChange={(e) => setPasswordDetails({ ...passwordDetails, confirmPassword: e.target.value })}
                      className={`pl-3 pr-10 py-2 w-full rounded border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 text-lg font-medium rounded"
              >
                {loading ? "Updating Password..." : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
