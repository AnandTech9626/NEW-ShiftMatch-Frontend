import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDashboardCustomize,
  MdLogout,
} from "react-icons/md";
import {
  FaRegBuilding,
  FaUserNurse,
  FaMapMarkerAlt,
  FaUserTie,
  FaSitemap,
  FaFileAlt,
  FaEdit,
  FaEye,
  FaCamera,
  FaGavel,
} from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addressSchema } from "../schemas/addressSchema";
import { baseUrl, notify, urls } from "../constants/config";
// Import the split components
import AnalyticalDashboard from "./Superadminview/AnalyticalDashboard";
import Hospital from "./Superadminview/Hospital";
import HealthcareWorkers from "./Superadminview/HealthcareWorkers";
import Locations from "./Superadminview/Locations";
import Designations from "./Superadminview/Designations";
import Departments from "./Superadminview/Departments";
import Investigations from "./Superadminview/Investigations";
import Documents from "./Superadminview/Documents";
import DocumentTypes from "./Superadminview/DocumentTypes";
import EditProfileModal from "../components/Modals/EditProfileModal";

const Dashboard2 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Profile Edit States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  

  const avatarColors = [
    "bg-indigo-100 text-indigo-600",
    "bg-emerald-100 text-emerald-600",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
    "bg-sky-100 text-sky-600",
    "bg-purple-100 text-purple-600",
  ];

  const getAvatarColor = (name = "") => {
    const charCode = name.charCodeAt(0) || 0;
    return avatarColors[charCode % avatarColors.length];
  };

  // Define sidebar menu items matching original icons
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboardCustomize size={18} className="flex-shrink-0" /> },
    { id: "Investigations", label: "Investigations", icon: <FaGavel size={16} className="flex-shrink-0" /> },
    { id: "workers", label: "Healthcare Workers", icon: <FaUserNurse size={16} className="flex-shrink-0" /> },
    { id: "facilities", label: "Facilities", icon: <FaRegBuilding size={16} className="flex-shrink-0" /> },
    { id: "designations", label: "Designations", icon: <FaUserTie size={16} className="flex-shrink-0" /> },
    { id: "locations", label: "Locations", icon: <FaMapMarkerAlt size={16} className="flex-shrink-0" /> },
    { id: "allDocuments", label: "Documents", icon: <FaFileAlt size={16} className="flex-shrink-0" /> },
    { id: "documents", label: "Document Types", icon: <FaFileAlt size={16} className="flex-shrink-0" /> },
    { id: "departments", label: "Departments", icon: <FaSitemap size={16} className="flex-shrink-0" /> },

  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AnalyticalDashboard />;
      case "facilities":
        return <Hospital />;
      case "workers":
        return <HealthcareWorkers />;
      case "locations":
        return <Locations />;
      case "designations":
        return <Designations />;
      case "departments":
        return <Departments />;
      case "allDocuments":
        return <Documents />;
      case "documents":
        return <DocumentTypes />;
      case "Investigations":
        return <Investigations />;
      default:
        return <AnalyticalDashboard />;
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(
        `${baseUrl}${urls?.users?.getCurrentUser}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data.data) && data.data.length > 0) {
        const user = data.data[0];
        setCurrentUser(user);
      }
    } catch (err) {
      console.error("Fetch current user error:", err);
    }
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const token = sessionStorage.getItem("token");
      const fcmToken = sessionStorage.getItem("fcmToken");

      if (fcmToken && token) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_HEALTHCARE_WORKER_UPDATE_FCM_API}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fcm: fcmToken,
              type: "Logout",
            }),
          },
        );
      }

      sessionStorage.clear();

      notify(true, "Logged out successfully");
      setShowLogoutModal(false);

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (err) {
      console.error("Logout FCM error:", err);
      notify(false, "Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden font-sans">
      <aside
        className={`
          bg-[#4039AD] text-white flex flex-col h-screen fixed left-0 top-0 z-50
          transform transition-all duration-300
          ${sidebarOpen ? "translate-x-0 w-[240px]" : "-translate-x-full w-[240px]"}
          md:translate-x-0 ${isSidebarCollapsed ? 'md:w-[80px]' : 'md:w-[260px]'}
        `}
      >
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hidden md:flex absolute ${isSidebarCollapsed ? 'top-8' : 'top-10'} -right-3 z-40 bg-[#4039AD] border border-white/30 text-white rounded-full w-6 h-6 items-center justify-center hover:bg-[#524ac9] transition-all shadow-md focus:outline-none cursor-pointer`}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'} pt-6 transition-all duration-300 relative`}>
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Logo"
                className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-14 h-14'} object-contain flex-shrink-0 transition-all duration-300`}
              />
              {!isSidebarCollapsed && (
                <h1 className="text-lg font-bold text-white whitespace-nowrap transition-all duration-300">
                  Super Admin
                </h1>
              )}
            </div>
            <button
              className="md:hidden text-white text-xl absolute right-4 top-6"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <nav className="mt-8 text-sm">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-3 cursor-pointer flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-2' : 'px-6 gap-3'
                  } ${activeTab === item.id ? "bg-white/10" : "opacity-80 hover:bg-white/5"
                  }`}
                title={isSidebarCollapsed ? item.label : ""}
              >
                {item.icon}
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </div>
            ))}
          </nav>
        </div>

        <div className={`mx-2 mb-6 bg-white/10 rounded-lg text-xs mt-auto transition-all duration-300 ${isSidebarCollapsed ? 'p-2 flex flex-col items-center gap-3' : 'mx-4 p-4'}`}>
          {isSidebarCollapsed ? (
            <>
              {currentUser?.imageUrl ? (
                <img
                  src={typeof currentUser.imageUrl === 'object' ? currentUser.imageUrl.url : `${baseUrl}/uploads/${currentUser.imageUrl}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  title={currentUser.fullName || "Super Admin"}
                />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${currentUser ? getAvatarColor(currentUser.fullName) : "bg-green-500 text-white"}`} title={currentUser?.fullName || "Super Admin"}>
                  {(currentUser?.fullName || "Super Admin").charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="text-yellow-300 hover:scale-110 transition-transform"
                title="Edit Profile"
              >
                <FaEdit size={16} />
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-yellow-300 hover:scale-110 transition-transform"
                title="Logout"
              >
                <MdLogout size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {currentUser?.imageUrl ? (
                  <img
                    src={typeof currentUser.imageUrl === 'object' ? currentUser.imageUrl.url : `${baseUrl}/uploads/${currentUser.imageUrl}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    title={currentUser.fullName || "Super Admin"}
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${currentUser ? getAvatarColor(currentUser.fullName) : "bg-green-500 text-white"}`} title={currentUser?.fullName || "Super Admin"}>
                    {(currentUser?.fullName || "Super Admin").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <div className="font-semibold text-white truncate">
                    {currentUser?.fullName || "Super Admin"}
                  </div>
                  <div className="text-yellow-300 mt-1 text-xs truncate">
                    {currentUser?.roleName || "Super Administrator"}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="flex items-center gap-1 text-yellow-300 hover:underline"
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-1 text-yellow-300 hover:underline"
                >
                  <MdLogout className="text-sm" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      <main className={`flex-1 ${isSidebarCollapsed ? 'md:ml-[80px] md:max-w-[calc(100%-80px)]' : 'md:ml-[260px] md:max-w-[calc(100%-260px)]'} p-4 md:p-8 overflow-y-auto min-h-screen transition-all duration-300`}>
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-[#4039AD]"
          >
            ☰
          </button>
          <img src="/logo.png" className="w-28" />
        </div>

        {renderContent()}
      </main>

      {showEditProfileModal && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          currentUser={currentUser}
          onSuccess={fetchCurrentUser}
        />
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center text-gray-800">
            <div className="flex items-center justify-center">
              <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <MdLogout className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-4">
              Are you sure you want to logout?
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              You'll need to log back in to manage your system.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2
                  ${isLoggingOut
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }
                `}
              >
                {isLoggingOut && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {isLoggingOut ? "Logging out..." : "Log Out →"}
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="w-full border border-gray-300 text-blue-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard2;
