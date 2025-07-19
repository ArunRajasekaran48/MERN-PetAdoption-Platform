import { useState, useEffect } from "react"
import {
  Users,
  Heart,
  MessageSquare,
  BarChart3,
  Menu,
  Search,
  UserCheck,
  UserX,
  Trash2,
  ChevronDown,
  User,
  LogOut,
  Edit,
  AlertCircle,
} from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js"
import { Doughnut, Bar } from "react-chartjs-2"

// Import your admin service functions
import {
  fetchDashboardStats,
  getAllUsers,
  getAllPetListings,
  removePetListing,
  getAllReviews,
  deleteReview,
  getAllAdoptionRequests,
  suspendUser,
  banUser,
  unbanUser,
  getAllReports,
  updateReportStatus,
  getAllReviewReports,
  updateReviewReportStatus,
} from "../services/adminService"
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({})
  const [users, setUsers] = useState([])
  const [pets, setPets] = useState([])
  const [reviews, setReviews] = useState([])
  const [adoptionRequests, setAdoptionRequests] = useState([])
  const [reports, setReports] = useState([])
  const [reportFilter, setReportFilter] = useState("all")
  const [resolvingReportId, setResolvingReportId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [suspendUserId, setSuspendUserId] = useState(null);
  const [banUserId, setBanUserId] = useState(null);
  const [suspendDays, setSuspendDays] = useState(5);
  const [banReason, setBanReason] = useState("");
  const [unbanUserId, setUnbanUserId] = useState(null);
  const [reviewReports, setReviewReports] = useState([])
  const [reviewReportFilter, setReviewReportFilter] = useState("all")
  const [resolvingReviewReportId, setResolvingReviewReportId] = useState(null)
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load initial data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [stats, usersData, petsData, reviewsData, adoptionData, reportsData, reviewReportsData] = await Promise.all([
        fetchDashboardStats(),
        getAllUsers(),
        getAllPetListings(),
        getAllReviews(),
        getAllAdoptionRequests(),
        getAllReports(),
        getAllReviewReports(),
      ])

      setDashboardStats(stats)
      setUsers(usersData)
      setPets(petsData)
      setReviews(reviewsData)
      setAdoptionRequests(adoptionData)
      setReports(reportsData)
      setReviewReports(reviewReportsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Calculate breed adoption stats for chart
  const getBreedStats = () => {
    // Use correct field: adoptionStatus
    const adoptedPets = pets.filter((pet) => pet.adoptionStatus === "adopted");
    const breedCounts = {};
    adoptedPets.forEach((pet) => {
      const breed = pet.breed || "Unknown";
      breedCounts[breed] = (breedCounts[breed] || 0) + 1;
    });
    const sortedBreeds = Object.entries(breedCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    return {
      labels: sortedBreeds.map(([breed]) => breed),
      counts: sortedBreeds.map(([, count]) => count),
    };
  };

  const breedStats = getBreedStats();

  // Adoption Requests Bar Chart: use real data
  const statusCounts = { pending: 0, approved: 0, rejected: 0 };
  adoptionRequests.forEach((req) => {
    if (req.status === "pending") statusCounts.pending += 1;
    else if (req.status === "approved") statusCounts.approved += 1;
    else if (req.status === "rejected") statusCounts.rejected += 1;
  });
  const barData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        label: "Adoption Requests",
        data: [statusCounts.pending, statusCounts.approved, statusCounts.rejected],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderWidth: 1,
      },
    ],
  };

  // Chart configurations
  const doughnutData = {
    labels: breedStats.labels,
    datasets: [
      {
        data: breedStats.counts,
        backgroundColor: [
          "#8B5CF6", // Purple
          "#06B6D4", // Cyan
          "#10B981", // Emerald
          "#F59E0B", // Amber
          "#EF4444", // Red
        ],
        borderWidth: 3,
        borderColor: "#ffffff",
        hoverBorderWidth: 4,
        hoverBorderColor: "#ffffff",
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: "#ffffff",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((context.parsed * 100) / total).toFixed(1)
          return `${context.label}: ${context.parsed} (${percentage}%)`
        },
      },
    },
  }

  // Action handlers
  const handleUserAction = async (userId, action) => {
    try {
      if (action === "suspend") {
        setSuspendUserId(userId);
        setSuspendDays(5);
        setShowSuspendModal(true);
      } else if (action === "ban") {
        setBanUserId(userId);
        setBanReason("");
        setShowBanModal(true);
      } else if (action === "unban") {
        setUnbanUserId(userId);
        setShowConfirmModal(true);
      }
    } catch (error) {
      console.error("Error performing user action:", error)
    }
  }

  const handlePetAction = async (petId, action) => {
    if (action === "remove") {
      setConfirmAction(() => async () => {
        try {
          await removePetListing(petId)
          showToast("Pet deleted successfully", "success");
          await loadDashboardData()
        } catch (error) {
          console.error("Error removing pet:", error)
        }
      })
      setShowConfirmModal(true)
    }
  }

  const handleReviewAction = async (reviewId, action) => {
    if (action === "delete") {
      setConfirmAction(() => async () => {
        try {
          await deleteReview(reviewId)
          showToast("Review deleted successfully", "success");
          await loadDashboardData()
        } catch (error) {
          console.error("Error deleting review:", error)
        }
      })
      setShowConfirmModal(true)
    }
  }

  const executeConfirmAction = async () => {
    if (confirmAction) {
      await confirmAction()
      setShowConfirmModal(false)
      setConfirmAction(null)
    }
  }

  const handleSuspendConfirm = async () => {
    try {
      await suspendUser(suspendUserId, suspendDays);
      showToast(`User suspended for ${suspendDays} days`, "success");
      setShowSuspendModal(false);
      setSuspendUserId(null);
      await loadDashboardData();
    } catch (error) {
      showToast("Failed to suspend user", "error");
    }
  };

  const handleBanConfirm = async () => {
    try {
      await banUser(banUserId, banReason);
      showToast("User banned permanently", "success");
      setShowBanModal(false);
      setBanUserId(null);
      await loadDashboardData();
    } catch (error) {
      showToast("Failed to ban user", "error");
    }
  };

  const handleUnbanConfirm = async () => {
    try {
      await unbanUser(unbanUserId);
      showToast("User unbanned/unsuspended", "success");
      setShowConfirmModal(false);
      setUnbanUserId(null);
      await loadDashboardData();
    } catch (error) {
      showToast("Failed to unban/unsuspend user", "error");
    }
  };

  const handleMarkResolved = async (reportId) => {
    setResolvingReportId(reportId)
    try {
      await updateReportStatus(reportId, "resolved")
      showToast("Report marked as resolved", "success")
      // Refresh reports
      const updatedReports = await getAllReports()
      setReports(updatedReports)
    } catch (e) {
      showToast("Failed to update report status", "error")
    } finally {
      setResolvingReportId(null)
    }
  }

  const handleMarkReviewReportResolved = async (reportId) => {
    setResolvingReviewReportId(reportId)
    try {
      await updateReviewReportStatus(reportId, "resolved")
      showToast("Review report marked as resolved", "success")
      // Refresh review reports
      const updatedReviewReports = await getAllReviewReports()
      setReviewReports(updatedReviewReports)
    } catch (e) {
      showToast("Failed to update review report status", "error")
    } finally {
      setResolvingReviewReportId(null)
    }
  }

  // Sidebar navigation items
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    { id: "pets", label: "Pet Management", icon: Heart },
    { id: "reviews", label: "Review Management", icon: MessageSquare },
    { id: "reports", label: "Report Management", icon: AlertCircle },
  ]

  // Filter data based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPets = pets.filter(
    (pet) =>
      pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredReviews = reviews.filter(
    (review) =>
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex h-screen">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">PawPal Admin</h1>}
          </div>
        </div>

        <nav className="flex-1 p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-2 transition-colors ${
                  activeSection === item.id ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 capitalize">
                {activeSection === "dashboard" ? "Dashboard Overview" : `${activeSection} Management`}
              </h2>
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <button
                    onClick={() => {
                      navigate('/edit-profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('user');
                      localStorage.removeItem('token');
                      showToast('Logged out successfully', 'success');
                      navigate('/login');
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 min-h-0 p-6 overflow-y-auto scroll-smooth scrollbar-thin">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{dashboardStats.totalUsers || users.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Pets</p>
                      <p className="text-3xl font-bold">{dashboardStats.totalPets || pets.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Total Reviews</p>
                      <p className="text-3xl font-bold">{dashboardStats.totalReviews || reviews.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Heart className="w-5 h-5 text-purple-600 mr-2" />
                    Most Adopted Breeds
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    {breedStats.labels.length > 0 ? (
                      <Doughnut data={{
                        labels: breedStats.labels,
                        datasets: [
                          {
                            data: breedStats.counts,
                            backgroundColor: [
                              "#8B5CF6",
                              "#06B6D4",
                              "#10B981",
                              "#F59E0B",
                              "#EF4444",
                            ],
                            borderWidth: 3,
                            borderColor: "#ffffff",
                            hoverBorderWidth: 4,
                            hoverBorderColor: "#ffffff",
                          },
                        ],
                      }} options={chartOptions} />
                    ) : (
                      <div className="text-gray-400 text-center">No adoption data available</div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                    Adoption Requests Status
                  </h3>
                  <div className="h-64">
                    <Bar data={barData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isBanned
                                  ? "bg-red-800 text-white"
                                  : user.suspendedUntil && new Date(user.suspendedUntil) > new Date()
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.isBanned
                                ? "Banned"
                                : user.suspendedUntil && new Date(user.suspendedUntil) > new Date()
                                ? `Suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}`
                                : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                            {!user.isBanned && (!user.suspendedUntil || new Date(user.suspendedUntil) <= new Date()) && (
                              <button
                                onClick={() => handleUserAction(user._id, "suspend")}
                                className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm font-medium hover:bg-yellow-200"
                              >
                                Suspend
                              </button>
                            )}
                            {!user.isBanned && (
                              <button
                                onClick={() => handleUserAction(user._id, "ban")}
                                className="inline-flex items-center px-3 py-1 bg-red-800 text-white rounded-md text-sm font-medium hover:bg-red-900"
                              >
                                Ban
                              </button>
                            )}
                            {(user.isBanned || (user.suspendedUntil && new Date(user.suspendedUntil) > new Date())) && (
                              <button
                                onClick={() => handleUserAction(user._id, "unban")}
                                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200"
                              >
                                Unban
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === "pets" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search pets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-thin scroll-smooth" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {filteredPets.slice(0, 50).map((pet) => (
                  <div key={pet._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {pet.images && pet.images[0] ? (
                        <img
                          src={pet.images[0] || "/placeholder.svg"}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Heart className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
                      <p className="text-sm text-gray-600">
                        {pet.breed} • {pet.age} years old
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{pet.description?.substring(0, 100)}...</p>
                      <div className="flex items-center justify-between mt-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            pet.status === "available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {pet.status}
                        </span>
                        <button
                          onClick={() => handlePetAction(pet._id, "remove")}
                          className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border scrollbar-thin scroll-smooth" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="divide-y divide-gray-200">
                  {filteredReviews.slice(0, 50).map((review) => (
                    <div key={review._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{review.userId?.name || "Anonymous"}</h4>
                              <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="mt-3 text-gray-700">{review.comment}</p>
                        </div>
                        <button
                          onClick={() => handleReviewAction(review._id, "delete")}
                          className="ml-4 inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "reports" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                Report Management
              </h2>
              <div className="flex items-center gap-2 mb-2 mt-6">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-700">User Reports</span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <label className="text-sm font-medium text-gray-700">Show:</label>
                <select
                  value={reportFilter}
                  onChange={e => setReportFilter(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>
              <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">No reports found</td></tr>
                    ) : (
                      reports
                        .filter(r => reportFilter === "all" ? true : r.status === "pending")
                        .map((report) => (
                          <tr key={report._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.reportedUser?.name || "-"}</div>
                              <div className="text-xs text-gray-500">{report.reportedUser?.email || "-"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.reportedBy?.name || "-"}</div>
                              <div className="text-xs text-gray-500">{report.reportedBy?.email || "-"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.pet?.name || "-"}</div>
                              <div className="text-xs text-gray-500">{report.pet?.breed || "-"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{report.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                report.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : report.status === "resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                              {report.status === "pending" && (
                                <button
                                  onClick={() => handleMarkResolved(report._id)}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                  disabled={resolvingReportId === report._id}
                                >
                                  {resolvingReportId === report._id ? "Marking..." : "Mark Resolved"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2 mt-10 mb-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <span className="text-xl font-semibold text-gray-800">Review Reports</span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <label className="text-sm font-medium text-gray-700">Show:</label>
                <select
                  value={reviewReportFilter}
                  onChange={e => setReviewReportFilter(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>
              <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviewReports.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">No review reports found</td></tr>
                    ) : (
                      reviewReports
                        .filter(r => reviewReportFilter === "all" ? true : r.status === "pending")
                        .map((report) => (
                          <tr key={report._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.review?.comment || "-"}</div>
                              <div className="text-xs text-gray-500">Rating: {report.review?.rating || "-"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.review?.userId?.name || "-"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.reportedBy?.name || "-"}</div>
                              <div className="text-xs text-gray-500">{report.reportedBy?.email || "-"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{report.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                report.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : report.status === "resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                              {report.status === "pending" && (
                                <button
                                  onClick={() => handleMarkReviewReportResolved(report._id)}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                  disabled={resolvingReviewReportId === report._id}
                                >
                                  {resolvingReviewReportId === report._id ? "Marking..." : "Mark Resolved"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to perform this action? This cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmAction}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspend User</h3>
            <p className="text-gray-600 mb-4">Enter the number of days to suspend this user:</p>
            <input
              type="number"
              min={1}
              value={suspendDays}
              onChange={e => setSuspendDays(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendConfirm}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ban User</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to permanently ban this user?</p>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBanConfirm}
                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && unbanUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unban/Unsuspend User</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to unban or unsuspend this user?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => { setShowConfirmModal(false); setUnbanUserId(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnbanConfirm}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
