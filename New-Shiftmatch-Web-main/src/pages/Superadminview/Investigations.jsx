import React, { useState, useEffect } from "react";
import {
  FaGavel,
  FaSearch,
  FaPlus,
  FaFilter,
  FaSortAmountDown,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List as ListIcon,
  Folder,
  Building2,
  User,
  Calendar,
} from "lucide-react";
import { urls, baseUrl } from "../../constants/config";
import AdvancedPeopleLoader from "../../components/AdvancedPeopleLoader";

const Investigations = () => {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchInvestigations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}${urls.investigation.getAll}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setInvestigations(data.data?.investigations || data.data || []);
      }
    } catch (error) {
      console.error("Error fetching investigations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const filteredInvestigations = investigations.filter((item) => {
    const searchString = JSON.stringify(item).toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredInvestigations.length / itemsPerPage);
  const paginatedInvestigations = filteredInvestigations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTheme = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "closed") {
      return {
        border: "border-t-slate-400",
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-600",
        dot: "bg-slate-400",
        label: "CLOSED",
      };
    }
    if (s === "urgent") {
      return {
        border: "border-t-red-500",
        badgeBg: "bg-red-50",
        badgeText: "text-red-600",
        dot: "bg-red-500",
        label: "URGENT",
      };
    }
    if (s === "under review") {
      return {
        border: "border-t-amber-500",
        badgeBg: "bg-amber-50",
        badgeText: "text-amber-600",
        dot: "bg-amber-500",
        label: "UNDER REVIEW",
      };
    }
    // Default / Open
    return {
      border: "border-t-emerald-500",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-600",
      dot: "bg-emerald-500",
      label: "OPEN",
    };
  };

  const getAvatarColor = (name) => {
    const palette = [
      { bg: "bg-indigo-100", text: "text-indigo-700" },
      { bg: "bg-amber-100", text: "text-amber-700" },
      { bg: "bg-emerald-100", text: "text-emerald-700" },
      { bg: "bg-rose-100", text: "text-rose-700" },
    ];
    if (!name) return { bg: "bg-slate-100", text: "text-slate-600" };
    const idx = name.charCodeAt(0) % palette.length;
    return palette[idx];
  };

  // Mock stats
  const stats = [
    {
      title: "Total Investigations",
      value: "24",
      icon: <FileText size={20} className="text-[#4039AD]" />,
      iconBg: "bg-[#4039AD]/10",
      trend: "All time",
      isGraph: true,
    },
    {
      title: "Open",
      value: "12",
      icon: <CheckCircle2 size={20} className="text-emerald-600" />,
      iconBg: "bg-emerald-100",
      trend: "8% from last month",
      trendUp: true,
      trendColor: "text-emerald-600",
    },
    {
      title: "Under Review",
      value: "7",
      icon: <Clock size={20} className="text-amber-600" />,
      iconBg: "bg-amber-100",
      trend: "3% from last month",
      trendUp: true,
      trendColor: "text-amber-600",
    },
    {
      title: "Urgent",
      value: "3",
      icon: <AlertTriangle size={20} className="text-red-600" />,
      iconBg: "bg-red-100",
      trend: "2% from last month",
      trendUp: true,
      trendColor: "text-red-600",
    },
    {
      title: "Closed",
      value: "2",
      icon: <CheckCircle2 size={20} className="text-slate-600" />,
      iconBg: "bg-slate-200",
      trend: "5% from last month",
      trendUp: false,
      trendColor: "text-slate-500",
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-8 flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4039AD] flex items-center justify-center shadow-md shadow-[#4039AD]/20">
            <FaGavel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Investigations
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Monitor and manage all workplace investigations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-[300px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search investigations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40 focus:border-[#4039AD]/40 transition-all shadow-sm"
            />
          </div>

          <button className="px-4 py-2.5 bg-[#4039AD] hover:bg-[#342e8f] text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#4039AD]/20 ml-2">
            <FaPlus size={12} />
            New Investigation
          </button>
        </div>
      </div>



      {/* List Header */}
      <div className="flex justify-between items-end mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">All Investigations</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Showing {filteredInvestigations.length} investigations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">View:</span>
          <div className="flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                viewMode === "cards"
                  ? "bg-indigo-50 text-[#4039AD]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={16} />
              Cards
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-indigo-50 text-[#4039AD]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ListIcon size={16} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <AdvancedPeopleLoader />
          </div>
        ) : filteredInvestigations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
               <FaGavel className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-slate-700 font-bold text-lg">No investigations found</p>
             <p className="text-slate-400 text-sm font-medium mt-1">
               {searchQuery ? "Try a different search term" : "New investigations will appear here"}
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {paginatedInvestigations.map((item, idx) => {
              const theme = getTheme(item.status);
              const avatar = getAvatarColor(item.healthcareWorker?.fullName);

              return (
                <div
                  key={item._id || idx}
                  className={`bg-white rounded-xl border border-slate-200 border-t-[3px] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden ${theme.border}`}
                >
                  {/* Card Header */}
                  <div className="p-5 pb-4 flex justify-between items-start border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50/50 flex items-center justify-center shrink-0 border border-indigo-100/50">
                        <Folder size={18} className="text-[#4039AD]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-800 tracking-wide">
                          {item.investigationId || "INV-NEW"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                          Created on{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric", year: "numeric" }
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 shrink-0 ${theme.badgeBg} ${theme.badgeText}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></div>
                      {theme.label}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 pt-4 flex-1 flex flex-col gap-4">
                    {/* Hospital */}
                    <div className="flex items-start gap-3">
                      <Building2
                        size={16}
                        className="text-slate-900 mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Hospital
                        </span>
                        <span className="text-[13px] font-bold text-slate-700 mt-0.5 leading-tight">
                          {item.hospitalAdmin?.fullName || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Incidents */}
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={16}
                        className="text-slate-900 mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Incident Types
                        </span>
                        <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                          {item.incidentTypes && item.incidentTypes.length > 0 ? (
                            <>
                              <span className="text-[13px] font-medium text-slate-700 truncate max-w-[200px]">
                                {item.incidentTypes[0]}
                                {item.incidentTypes.length > 1 && ","}
                              </span>
                              {item.incidentTypes.length > 1 && (
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[#4039AD] text-[10px] font-bold shrink-0">
                                  +{item.incidentTypes.length - 1} More
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[13px] text-slate-400 italic">None</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Assigned To */}
                    <div className="flex items-start gap-3">
                      <User size={16} className="text-slate-900 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Assigned To
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${avatar.bg} ${avatar.text}`}
                          >
                            {item.healthcareWorker?.fullName
                              ? item.healthcareWorker.fullName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-800 leading-tight">
                              {item.healthcareWorker?.fullName || "Unassigned"}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {item.healthcareWorker?.roleName || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shift */}
                    <div className="flex items-start gap-3">
                      <Calendar
                        size={16}
                        className="text-slate-900 mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Shift Initiated On
                        </span>
                        <span className="text-[13px] font-medium text-slate-700 mt-0.5">
                           {item.shift?.shiftStartDate ? new Date(item.shift.shiftStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                           {" • "}
                           {item.shift?.startTime || "N/A"}
                           {item.shift?.endTime ? ` - ${item.shift.endTime}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-[#4039AD]">
                      View Details
                    </span>
                    <FaChevronRight size={12} className="text-[#4039AD] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && filteredInvestigations.length > 0 && (
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm font-medium text-slate-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvestigations.length)} of {filteredInvestigations.length} results
          </p>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <FaChevronLeft size={10} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-semibold shadow-sm transition-colors ${
                  currentPage === page
                    ? "bg-[#4039AD] text-white border-transparent shadow-[#4039AD]/20"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <FaChevronRight size={10} />
            </button>
          </div>


        </div>
      )}
    </div>
  );
};

export default Investigations;
