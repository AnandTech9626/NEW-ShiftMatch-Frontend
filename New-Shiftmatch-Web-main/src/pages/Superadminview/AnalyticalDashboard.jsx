import React, { useState, useEffect } from "react";
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  XCircle,
  Activity,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  User,
  MoreHorizontal,
  Building2,
  Users,
  FolderPlus,
  MapPin,
  UserCheck,
  Link
} from "lucide-react";
import { urls } from "../../constants/config";

const getInitials = (name) => {
  if (!name) return "HP";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarBg = (index) => {
  const bgs = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-sky-100 text-sky-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
  ];
  return bgs[index % bgs.length];
};

const formatAppliedTime = (dateStr) => {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  
  return `${day} ${month} ${year} • ${timeStr}`;
};


const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return "bg-green-50 text-green-700 border-green-100";
    case "Rejected":
      return "bg-rose-50 text-rose-700 border-rose-100";
    case "Reviewed":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "Applied":
    default:
      return "bg-amber-50 text-amber-700 border-amber-100";
  }
};

const AnalyticalDashboard = () => {
  const isSuperAdmin = window.location.pathname.includes("dashboard2") || String(sessionStorage.getItem("roleId")) === "1";

  const [stats, setStats] = useState(
    isSuperAdmin
      ? {
          hospitals: { total: 0, Pending: 0, Verified: 0, Rejected: 0 },
          healthcareworkers: { total: 0, Pending: 0, Verified: 0, Rejected: 0 },
          departments: 0,
          designations: 0,
          documentTypes: 0,
          locations: 0
        }
      : { total: 0, Open: 0, Closed: 0, Cancelled: 0, Completed: 0 }
  );
  const [debugRawStats, setDebugRawStats] = useState(null);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentUploads = async (token, baseUrl) => {
    try {
      const endpoint = urls?.documentActivity?.activities || urls?.documentActivity?.getActivities || "api/documentActivity/activities";
      
      let res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        // Fallback to GET just in case the backend only supports GET
        res = await fetch(`${baseUrl}${endpoint}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (!res.ok) return [];

      const responseData = await res.json();
      if (responseData.success && responseData.data) {
        if (Array.isArray(responseData.data.activities)) {
          return responseData.data.activities.slice(0, 6);
        } else if (Array.isArray(responseData.data)) {
          return responseData.data.slice(0, 6);
        }
      }
      return [];
    } catch (err) {
      console.error("Error fetching recent document uploads:", err);
      return [];
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");
      const roleId = sessionStorage.getItem("roleId");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      if (!id || !token) {
        throw new Error("Session expired. Please log in again.");
      }

      // Robust check checking both window URL path (/dashboard2) and session roleId
      const isSuperAdmin = window.location.pathname.includes("dashboard2") || String(roleId) === "1";
      const statsApiUrl = isSuperAdmin ? urls.superAdmin.getAnalytics : urls.shift.getDashboard;

      console.log("DEBUG: isSuperAdmin =", isSuperAdmin, "statsApiUrl =", statsApiUrl);

      // Perform primary dashboard metrics calls
      const [statsRes, applicantsRes] = await Promise.all([
        fetch(`${baseUrl}${statsApiUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        }),
        isSuperAdmin
          ? Promise.resolve(null) // Super Admin dashboard renders uploaded documents instead of applicants
          : fetch(`${baseUrl}${urls.shiftApplicant.getRecentApplicants}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ id }),
            }).catch(err => {
              console.error("Failed to fetch recent applicants:", err);
              return null;
            })
      ]);

      if (!statsRes.ok) {
        throw new Error(`Failed to fetch stats: ${statsRes.statusText}`);
      }

      const statsData = await statsRes.json();
      if (statsData.success) {
        setDebugRawStats(statsData.data);
        setStats(statsData.data || {});
      } else {
        throw new Error(statsData.message || "Failed to retrieve analytics data.");
      }

      if (isSuperAdmin) {
        const uploads = await fetchRecentUploads(token, baseUrl);
        setRecentUploads(uploads);
      } else if (applicantsRes && applicantsRes.ok) {
        const applicantsData = await applicantsRes.json();
        if (applicantsData.success && Array.isArray(applicantsData.data)) {
          setRecentApplicants(applicantsData.data);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalShifts = isSuperAdmin ? 0 : (stats?.total || 0);

  const hasData = isSuperAdmin
    ? ((stats?.hospitals?.total || 0) > 0 || (stats?.healthcareWorkers?.total || stats?.healthcareworkers?.total || 0) > 0)
    : ((stats?.total || 0) > 0);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-200 rounded w-64" />
          </div>
          <div className="h-10 bg-slate-200 rounded-lg w-28" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-slate-100 rounded-2xl h-80 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto my-16 p-8 bg-white border border-rose-100 rounded-2xl shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Failed to Load Dashboard</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchStats}
          className="px-5 py-2.5 bg-[#4039AD] text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:bg-[#322c93] transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const hcwData = stats?.healthcareWorkers || stats?.healthcareworkers;

  const locationsValue = typeof stats?.locations === "object"
    ? ((stats?.locations?.provinces || 0) + (stats?.locations?.cities || 0))
    : (stats?.locations || 0);

  const locationsDesc = typeof stats?.locations === "object"
    ? `${stats?.locations?.provinces || 0} Provinces • ${stats?.locations?.cities || 0} Cities`
    : "Coverage areas registered";

  const cardData = isSuperAdmin
    ? [
        {
          icon: <Building2 size={24} />,
          label: "Total Facilities",
          value: stats?.hospitals?.total || 0,
          desc: `${stats?.hospitals?.Verified || 0} Verified • ${stats?.hospitals?.Pending || 0} Pending`,
          color: "from-violet-500 to-indigo-500 shadow-indigo-500/10",
        },
        {
          icon: <Users size={24} />,
          label: "Healthcare Workers",
          value: hcwData?.total || 0,
          desc: `${hcwData?.Verified || 0} Verified • ${hcwData?.Pending || 0} Pending`,
          color: "from-emerald-500 to-teal-400 shadow-teal-500/10",
        },
        {
          icon: <FolderPlus size={24} />,
          label: "Departments",
          value: stats?.departments || 0,
          desc: "Active categories registered",
          color: "from-sky-500 to-cyan-400 shadow-blue-500/10",
        },
        {
          icon: <MapPin size={22} />,
          label: "Locations",
          value: locationsValue,
          desc: locationsDesc,
          color: "from-amber-500 to-orange-400 shadow-amber-500/10",
        },
        {
          icon: <UserCheck size={24} />,
          label: "Designations",
          value: stats?.designations || 0,
          desc: "Professional staff roles",
          color: "from-rose-500 to-pink-400 shadow-rose-500/10",
        },
      ]
    : [
        {
          icon: <Calendar size={24} />,
          label: "Total Shifts",
          value: stats?.total || 0,
          desc: "All shifts posted to date",
          color: "from-violet-500 to-indigo-500 shadow-indigo-500/10",
        },
        {
          icon: <Activity size={24} />,
          label: "Open Shifts",
          value: stats?.Open || 0,
          desc: "Calculating...",
          color: "from-emerald-500 to-teal-400 shadow-teal-500/10",
        },
        {
          icon: <CheckCircle2 size={24} />,
          label: "Completed Shifts",
          value: stats?.Completed || 0,
          desc: "Calculating...",
          color: "from-sky-500 to-cyan-400 shadow-blue-500/10",
        },
        {
          icon: <Lock size={22} />,
          label: "Closed Shifts",
          value: stats?.Closed || 0,
          desc: "Calculating...",
          color: "from-amber-500 to-orange-400 shadow-amber-500/10",
        },
        {
          icon: <XCircle size={24} />,
          label: "Cancelled Shifts",
          value: stats?.Cancelled || 0,
          desc: "Calculating...",
          color: "from-rose-500 to-pink-400 shadow-rose-500/10",
        },
      ];

  const statusItems = isSuperAdmin
    ? [
        { label: "Facilities", count: stats?.hospitals?.total || 0, color: "bg-indigo-500" },
        { label: "Workers", count: hcwData?.total || 0, color: "bg-emerald-500" },
        { label: "Locations", count: locationsValue, color: "bg-amber-500" },
        { label: "Departments", count: stats?.departments || 0, color: "bg-sky-500" },
      ]
    : [
        { label: "Open", count: stats?.Open || 0, color: "bg-emerald-500" },
        { label: "Completed", count: stats?.Completed || 0, color: "bg-sky-500" },
        { label: "Closed", count: stats?.Closed || 0, color: "bg-amber-500" },
        { label: "Cancelled", count: stats?.Cancelled || 0, color: "bg-rose-500" },
      ];

  const statusItemsSum = statusItems.reduce((acc, item) => acc + item.count, 0);

  const getPercentage = (value) => {
    if (statusItemsSum === 0) return 0;
    return Math.round((value / statusItemsSum) * 100);
  };

  if (!isSuperAdmin) {
    cardData[1].desc = `${getPercentage(stats?.Open || 0)}% of total shifts`;
    cardData[2].desc = `${getPercentage(stats?.Completed || 0)}% of total shifts`;
    cardData[3].desc = `${getPercentage(stats?.Closed || 0)}% of total shifts`;
    cardData[4].desc = `${getPercentage(stats?.Cancelled || 0)}% of total shifts`;
  }

  const chartMax = Math.max(...statusItems.map(item => item.count), 1);

  return (
    <div className="w-full p-6 space-y-8 animate-fadeIn">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Live metrics and performance indicators for your facility shifts.</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl shadow-sm transition-all"
        >
          <RefreshCw size={15} className="text-gray-500" /> Refresh Data
        </button>
      </div>



      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cardData.map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-4 flex flex-col gap-2 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300`}
          >
            <div className="bg-white/20 w-9 h-9 rounded-lg flex items-center justify-center">
              {React.cloneElement(card.icon, { size: 18 })}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{card.label}</p>
              <h3 className="text-2xl font-extrabold mt-0.5">{card.value}</h3>
              <p className="text-[10px] font-medium text-white/80 mt-1 flex items-center gap-1">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity / Applications Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              {isSuperAdmin ? "Recent Document Uploads" : "Recent Applicants"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isSuperAdmin 
                ? "Recently uploaded documents by facilities awaiting verification"
                : "Healthcare professionals who applied recently to your open shifts"}
            </p>
          </div>
          <button className="text-xs font-semibold text-[#4039AD] hover:text-[#322c93] hover:underline flex items-center gap-1 transition-all">
            {isSuperAdmin ? "View Facilities" : "View All Applications"} <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap">
                {isSuperAdmin ? (
                  <>
                    <th className="w-[28%] pl-4 pr-3 pb-3 font-semibold text-left">Facility (Hospital)</th>
                    <th className="w-[24%] px-3 pb-3 font-semibold text-left">Document Type</th>
                    <th className="w-[22%] px-3 pb-3 font-semibold text-left">Uploaded Time</th>
                    <th className="w-[14%] px-3 pb-3 font-semibold text-left">Status</th>
                    <th className="w-[12%] px-3 pb-3 font-semibold text-right">Action</th>
                  </>
                ) : (
                  <>
                    <th className="w-[28%] pl-6 pr-4 pb-3 font-semibold text-left">Applicant</th>
                    <th className="w-[22%] px-4 pb-3 font-semibold text-left">Applied Shift</th>
                    <th className="w-[10%] px-4 pb-3 font-semibold text-left">Pay Rate</th>
                    <th className="w-[22%] px-4 pb-3 font-semibold text-left">Applied Time</th>
                    <th className="w-[10%] px-4 pb-3 font-semibold text-left">Status</th>
                    <th className="w-[8%] pl-4 pr-6 pb-3 font-semibold text-right">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isSuperAdmin ? (
                recentUploads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 font-medium px-6">
                      No recent document uploads found
                    </td>
                  </tr>
                ) : (
                  recentUploads.map((doc, index) => {
                    const hospitalName =
                      doc.hospitalName ||
                      doc.userId?.fullName ||
                      doc.userData?.fullName ||
                      doc.workerId?.fullName ||
                      doc.fullName ||
                      doc.facilityName ||
                      doc.facility?.fullName ||
                      doc.actionByData?.fullName ||
                      "NetCare Hospital";
                    const email =
                      doc.email ||
                      doc.userId?.email ||
                      doc.userData?.email ||
                      doc.workerId?.email ||
                      doc.facility?.email ||
                      doc.actionByData?.email ||
                      (doc.actionByData?.fullName ? `${doc.actionByData.fullName.toLowerCase().replace(/\s+/g, "")}@gmail.com` : "facility@netcare.com");
                    const docName =
                      doc.documentName ||
                      doc.documentId?.documentName ||
                      doc.documentType?.documentName ||
                      "Registration Certificate";
                    const initials = getInitials(hospitalName);
                    const avatarBg = getAvatarBg(index);
                    const uploadedTime = formatAppliedTime(doc.updatedAt || doc.createdAt);
                    const exactDate = formatDate(doc.updatedAt || doc.createdAt);
                    const status = doc.document?.verificationStatus || doc.verificationStatus || doc.status || "Pending";
                    const statusColor = getStatusColor(status);
                    const issuedBy = doc.issuedBy || doc.documentId?.issuedBy || doc.documentType?.issuedBy || "Authorities";
                    const rawUrl = doc.documentUrl || doc.document?.documentUrl || doc.fileUrl || doc.url;
                    const fileUrl = rawUrl
                      ? (typeof rawUrl === "object"
                        ? rawUrl.url
                        : (typeof rawUrl === "string" && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
                          ? rawUrl
                          : `${import.meta.env.VITE_API_BASE_URL.endsWith("/") ? import.meta.env.VITE_API_BASE_URL.slice(0, -1) : import.meta.env.VITE_API_BASE_URL}/uploads/${rawUrl}`))
                      : "";

                    return (
                      <tr key={doc._id || index} className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="w-[28%] pl-4 pr-3 py-3.5 align-middle text-left">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${avatarBg}`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate max-w-[160px]">{hospitalName}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[160px]">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="w-[24%] px-3 py-3.5 align-middle text-left">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-700 truncate max-w-[160px]">{docName}</p>
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-black hover:text-[#4039AD] transition-colors flex-shrink-0"
                                title="View Document"
                              >
                                <Link size={14} />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">Issued by {issuedBy}</p>
                        </td>
                        <td className="w-[22%] px-3 py-3.5 align-middle text-left">
                          <p className="font-medium text-gray-700 whitespace-nowrap">{exactDate}</p>
                          <p className="text-xs text-gray-400 whitespace-nowrap">{uploadedTime}</p>
                        </td>
                        <td className="w-[14%] px-3 py-3.5 align-middle text-left">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                        <td className="w-[12%] px-3 py-3.5 align-middle text-right">
                          <button 
                            onClick={() => {
                              if (fileUrl) {
                                window.open(fileUrl, "_blank");
                              }
                            }}
                            className="px-3 py-1.5 bg-[#4039AD]/10 hover:bg-[#4039AD] text-[#4039AD] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/5 whitespace-nowrap"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )
              ) : (
                recentApplicants.map((applicant, index) => {
                  const name = applicant.applicant?.fullName || applicant.userData?.fullName || applicant.workerId?.fullName || applicant.fullName || "Healthcare Professional";
                  const initials = getInitials(name);
                  const avatarBg = getAvatarBg(index);
                  const role = applicant.designation?.designationName || applicant.applicant?.designationName || applicant.userData?.designationName || applicant.workerId?.designationName || applicant.designationName || applicant.userData?.role || "Registered Nurse (RN)";
                  const shiftName = applicant.department?.departmentName || applicant.shift?.designationName || applicant.shiftId?.designationName || applicant.shiftData?.designationName || applicant.shiftName || "General Ward Medicine";
                  const payRate = applicant.shift?.payRate || applicant.shiftId?.payRate || applicant.shiftData?.payRate || applicant.payRate || "65";
                  const appliedTime = formatAppliedTime(applicant.createdAt);
                  const exactDate = formatDate(applicant.createdAt);
                  const status = applicant.status || "Pending";
                  const statusColor = getStatusColor(status);

                  return (
                    <tr key={applicant._id || applicant.id || index} className="hover:bg-slate-50/50 transition-colors duration-150 whitespace-nowrap">
                      <td className="w-[28%] pl-6 pr-4 py-3.5 align-middle text-left">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${avatarBg}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 whitespace-nowrap">{name}</p>
                            <p className="text-xs text-gray-400 whitespace-nowrap">{role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="w-[22%] px-4 py-3.5 align-middle text-left">
                        <p className="font-medium text-gray-700 whitespace-nowrap">{shiftName}</p>
                      </td>
                      <td className="w-[10%] px-4 py-3.5 align-middle text-left">
                        <span className="font-semibold text-gray-800 whitespace-nowrap">${payRate}/hr</span>
                      </td>
                      <td className="w-[22%] px-4 py-3.5 align-middle text-left">
                        <p className="font-medium text-gray-700 whitespace-nowrap">{exactDate}</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">{appliedTime}</p>
                      </td>
                      <td className="w-[10%] px-4 py-3.5 align-middle text-left">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="w-[8%] pl-4 pr-6 py-3.5 align-middle text-right">
                        <button className="px-3 py-1.5 bg-[#4039AD]/10 hover:bg-[#4039AD] text-[#4039AD] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/5 whitespace-nowrap">
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Bar Chart Card */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {isSuperAdmin ? "Platform Entity Breakdown" : "Shift Volume Status Breakdown"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isSuperAdmin ? "Overview of registered users and locations" : "Visual representation of shift activity"}
              </p>
            </div>
            <BarChart2 size={18} className="text-gray-400" />
          </div>

          {!hasData ? (
            <div className="h-60 flex flex-col items-center justify-center text-center">
              <FileSpreadsheet size={36} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">
                {isSuperAdmin ? "No platform data available" : "No shift data available"}
              </p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                {isSuperAdmin 
                  ? "Facilities and healthcare workers will appear here once they register on the platform."
                  : "Post some shifts in the \"Manage Shifts\" tab to generate analytical insights."}
              </p>
            </div>
          ) : (
            <div className="h-60 flex items-end justify-around gap-4 px-2 pb-2">
              {statusItems.map((item, i) => {
                const heightPercent = (item.count / chartMax) * 85 + 5; // scaled from 5% to 90%
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    <span className="text-xs font-semibold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.count}
                    </span>
                    <div className="w-16 sm:w-20 bg-slate-50 hover:bg-slate-100/80 rounded-xl h-44 flex items-end overflow-hidden transition-all">
                      <div
                        className={`w-full rounded-t-xl ${item.color} transition-all duration-1000 ease-out origin-bottom scale-y-100`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 mt-1">{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Legends / Stats Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-5">
              {isSuperAdmin ? "Platform Proportions" : "Status Proportions"}
            </h3>
            <div className="space-y-4">
              {statusItems.map((item, i) => {
                const pct = getPercentage(item.count);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-5 border-t border-gray-100 mt-5">
            <div className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-100/50 flex gap-3 items-start">
              <div className="bg-indigo-500 text-white rounded-lg p-1.5 mt-0.5">
                <Calendar size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-900">
                  {isSuperAdmin ? "Pro-Tip for Super Admins" : "Pro-Tip for Admins"}
                </h4>
                <p className="text-[11px] leading-relaxed text-indigo-700 mt-1">
                  {isSuperAdmin 
                    ? "Keep the system compliant! Regularly check pending hospital registrations and document verifications."
                    : "Keep shifts updated! Review and resolve application entries promptly to maintain high matching ratios."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AnalyticalDashboard;
