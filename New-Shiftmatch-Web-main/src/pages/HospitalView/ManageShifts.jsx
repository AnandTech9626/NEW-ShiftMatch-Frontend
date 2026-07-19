import React from "react";
import { Search } from "lucide-react";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaUserNurse,
  FaClock,
  FaEdit,
} from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { notify } from "../../constants/config";

const ManageShifts = ({
  shiftSearchQuery,
  setShiftSearchQuery,
  currentPage,
  setCurrentPage,
  totalPages,
  totalShifts,
  isUserVerified,
  setShowPostShiftModal,
  shifts,
  loadingShifts,
  shiftApplicantCounts,
  setSelectedShiftPayRate,
  setSelectedShiftDate,
  setSelectedShiftId,
  fetchShiftApplications,
  setDashboardView,
  handleShiftStatusChange,
}) => {
  return (
    <>
      {/* Sticky Header and Filter Wrapper */}
      <div className="sticky top-0 bg-gray-100 z-20 pb-4 pt-3 border-b border-slate-200/50">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">
            Manage Shifts
          </h2>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-800">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search shifts..."
                value={shiftSearchQuery}
                onChange={(e) => {
                  setShiftSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset page on search
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#4039AD]/50 transition-all"
              />
            </div>

            <button
              onClick={() => {
                if (!isUserVerified) {
                  notify(
                    false,
                    "Your application is still under review. Please contact Super admin.",
                  );
                  return;
                }
                setShowPostShiftModal(true);
              }}
              className="bg-[#0D215C] hover:bg-[#08153A] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 flex-shrink-0"
            >
              <span>+</span> Post New Shift
            </button>
          </div>
        </div>

        {/* Header / Filter Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-bold rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-2">
              <FaClipboardList className="text-[#4039AD]" size={13} />
              <span>Filter By Role</span>
            </div>
            <div className="px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-bold rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-2">
              <FaCalendarAlt className="text-[#4039AD]" size={12} />
              <span>Date Range</span>
            </div>
          </div>

          {/* Status breakdown pills */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0F9D58]" />
              {shifts.filter((s) => s.status === "Open").length} Open
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0066D6]" />
              {
                shifts.filter(
                  (s) => s.status === "Closed" || s.status === "Completed"
                ).length
              }{" "}
              Closed
            </span>
            <span className="text-slate-800">
              Total: <strong>{totalShifts || shifts.length} Shifts</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Shift list table wrapper with dynamic flex height and vertical scrolling */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm mt-6 overflow-y-auto flex-1 pb-2 w-full">
        <table className="w-full table-fixed text-left border-collapse">
          <thead>
            <tr className="text-black text-[10px] font-bold uppercase tracking-wider">
              <th className="sticky top-0 bg-slate-50 z-10 pl-8 pr-4 py-4 font-semibold text-left border-b border-slate-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)] w-[20%] whitespace-nowrap">
                Role / Designation
              </th>
              <th className="sticky top-0 bg-slate-50 z-10 px-6 py-4 font-semibold text-left border-b border-slate-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)] w-[18%] whitespace-nowrap">
                Department & Location
              </th>
              <th className="sticky top-0 bg-slate-50 z-10 px-6 py-4 font-semibold text-left border-b border-slate-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)] w-[20%] whitespace-nowrap">
                Date & Schedule
              </th>
              <th className="sticky top-0 bg-slate-50 z-10 px-6 py-4 font-semibold text-left border-b border-slate-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)] w-[10%] whitespace-nowrap">
                Hourly Pay
              </th>
              <th className="sticky top-0 bg-slate-50 z-10 px-6 py-4 font-semibold text-left border-b border-slate-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)] w-[8%] whitespace-nowrap">
                Applicants
              </th>
              <th className="sticky top-0 bg-slate-50 z-10 px-6 py-4 font-semibold text-center border-b border-slate-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)] w-[10%] whitespace-nowrap">
                Status
              </th>
              <th className="sticky top-0 bg-slate-50 z-10 pl-4 pr-8 py-4 font-semibold text-right border-b border-slate-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)] w-[14%] whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {loadingShifts ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-slate-500 font-medium px-6"
                >
                  Loading shifts...
                </td>
              </tr>
            ) : shifts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-slate-500 font-medium px-6"
                >
                  No shifts posted yet
                </td>
              </tr>
            ) : (
              shifts
                .filter((s) => {
                  if (!shiftSearchQuery) return true;
                  return (
                    (s.designationName || "")
                      .toLowerCase()
                      .startsWith(shiftSearchQuery.toLowerCase()) ||
                    (s.departmentName || "")
                      .toLowerCase()
                      .startsWith(shiftSearchQuery.toLowerCase())
                  );
                })
                .map((shift, index) => {
                  const startDateObj = new Date(
                    shift.shiftStartDate || shift.shiftDate
                  );
                  const isClosed =
                    shift.status === "Closed" ||
                    shift.status === "Completed" ||
                    shift.status === "Cancelled";

                  const statusBg = isClosed
                    ? shift.status === "Cancelled"
                      ? "bg-slate-150 text-slate-500"
                      : "bg-[#E5F1FF] text-[#0066D6]"
                    : "bg-[#E8F8F0] text-[#0F9D58]";
                  const statusLabel = (shift.status || "Open").toUpperCase();

                  const subtitleText = `${shift.departmentName} • ${
                    shift.duties && shift.duties.length < 15
                      ? shift.duties
                      : "General Ward"
                  }`;
                  const exactTime = `${shift.startTime} - ${shift.endTime}`;
                  const formattedDate = startDateObj.toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <tr
                      key={shift._id}
                      className="hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      {/* Role / Designation */}
                      <td className="pl-8 pr-4 py-5 align-middle text-left min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 text-black flex-shrink-0">
                            <FaUserNurse size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                              {shift.designationName}
                            </p>
                            <p className="text-[10px] text-black mt-0.5 font-semibold truncate">
                              Posted recently
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Location */}
                      <td className="px-6 py-5 align-middle text-left min-w-0">
                        <div className="min-w-0">
                          <p className="font-bold text-black text-xs truncate">
                            {subtitleText}
                          </p>
                          <p className="text-[10px] text-slate-700 font-semibold mt-0.5 flex items-center gap-1 min-w-0">
                            <IoLocationSharp
                              className="text-rose-500 flex-shrink-0"
                              size={12}
                            />
                            <span className="truncate">
                              {shift.locationName || "Facility Area"}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Date & Schedule */}
                      <td className="px-6 py-5 align-middle text-left min-w-0">
                        <div className="min-w-0">
                          <p className="font-bold text-black text-xs truncate">
                            {formattedDate}
                          </p>
                          <p className="text-[10px] text-slate-700 mt-0.5 flex items-center gap-1.5 font-bold truncate">
                            <FaClock
                              className="text-slate-700 flex-shrink-0"
                              size={10}
                            />
                            <span className="truncate">{exactTime}</span>
                          </p>
                        </div>
                      </td>

                      {/* Hourly Pay */}
                      <td className="px-6 py-5 align-middle text-left">
                        <p className="font-medium text-slate-700 text-sm flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-[#0D215C] text-xs">💵</span>
                          <span>
                            ₹ {shift.payRate?.toLocaleString("en-IN")}
                          </span>
                        </p>
                      </td>

                      {/* Applicants */}
                      <td className="px-6 py-5 align-middle text-left">
                        <span className="font-medium text-slate-700 text-sm flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-[#0D215C] text-xs">👥</span>
                          <span>
                            {shiftApplicantCounts[shift._id] !== undefined
                              ? shiftApplicantCounts[shift._id]
                              : "..."}
                          </span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 align-middle text-center">
                        <span
                          className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider whitespace-nowrap ${statusBg}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="pl-4 pr-8 py-5 align-middle text-right">
                        <div className="flex gap-2 items-center justify-end">
                          {isClosed ? (
                            <button
                              onClick={() => {
                                setSelectedShiftPayRate(shift.payRate);
                                setSelectedShiftDate(
                                  shift.shiftStartDate || shift.shiftDate
                                );
                                setSelectedShiftId(shift._id || shift.id);
                                fetchShiftApplications(shift._id || shift.id);
                                setDashboardView("applicants");
                              }}
                              className="bg-[#DCE7FC] hover:bg-[#C9D9FB] text-[#002D62] text-xs font-bold h-8 px-4 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                            >
                              History
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedShiftPayRate(shift.payRate);
                                setSelectedShiftDate(
                                  shift.shiftStartDate || shift.shiftDate
                                );
                                setSelectedShiftId(shift._id || shift.id);
                                fetchShiftApplications(shift._id || shift.id);
                                setDashboardView("applicants");
                              }}
                              className="h-7 px-3 bg-[#0D215C] hover:bg-[#08153A] text-white text-xs font-semibold rounded-lg whitespace-nowrap flex items-center justify-center transition-all cursor-pointer"
                            >
                              View Details
                            </button>
                          )}

                          {/* Status change dropover */}
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <select
                              value={shift.status || "Open"}
                              onChange={(e) =>
                                handleShiftStatusChange(
                                  shift._id,
                                  e.target.value
                                )
                              }
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            >
                              <option value="Open">Open</option>
                              <option value="Closed">Closed</option>
                              <option value="Cancelled">Cancel</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <button className="w-8 h-8 rounded-xl bg-slate-100 text-slate-655 hover:bg-slate-200 flex items-center justify-center transition-all border border-slate-200/40">
                              <FaEdit size={12} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination block exact clone of design */}
      {totalPages >= 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm mt-4">
          <p className="text-xs text-slate-500 font-semibold">
            Showing {shifts.length} of {totalShifts || shifts.length} entries
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all border
                      ${
                        currentPage === 1
                          ? "bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100"
                          : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 cursor-pointer"
                      }
                    `}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, idx) => {
              const pageNum = idx + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                            ${
                              currentPage === pageNum
                                ? "bg-[#0D215C] text-white"
                                : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200 cursor-pointer"
                            }
                          `}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === 2 ||
                pageNum === totalPages - 1
              ) {
                return (
                  <span
                    key={pageNum}
                    className="text-slate-400 text-xs px-1 select-none"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all border
                      ${
                        currentPage === totalPages
                          ? "bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100"
                          : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 cursor-pointer"
                      }
                    `}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageShifts;