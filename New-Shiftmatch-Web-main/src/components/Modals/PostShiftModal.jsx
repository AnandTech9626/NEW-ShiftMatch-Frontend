import React, { useState } from "react";
import { 
  BadgePlus, 
} from "lucide-react";
import { 
  FaRegBuilding, 
  FaUserTie, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaClipboardList, 
  FaEraser, 
  FaPaperPlane 
} from "react-icons/fa";
import { baseUrl, urls, notify } from "../../constants/config";

const PostShiftModal = ({ 
  isOpen, 
  onClose, 
  location, 
  locationId, 
  currentUser, 
  onSuccess 
}) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  
  const [designations, setDesignations] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedDesignationId, setSelectedDesignationId] = useState("");
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requiredStaff, setRequiredStaff] = useState("");
  const [pay, setPay] = useState("");
  const [duties, setDuties] = useState("");
  const [isCreatingShift, setIsCreatingShift] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${baseUrl}${urls?.department?.departmentGetAll}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setDepartments(data.data || []);
      }
    } catch (err) {
      console.error("Department fetch failed", err);
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await fetch(
        `${baseUrl}${urls?.designations?.getAllDesignations}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setDesignations(data.data || []);
      }
    } catch (err) {
      console.error("Designation fetch error", err);
    }
  };

  const handleCreateShift = async () => {
    if (isCreatingShift) return;

    if (
      !selectedDepartmentId ||
      !selectedDesignationId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !requiredStaff ||
      !pay ||
      !locationId
    ) {
      alert("Please fill all required fields");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      notify(false, "Start Date must be before or equal to End Date");
      return;
    }

    try {
      setIsCreatingShift(true);

      const formatTo12Hour = (time) =>
        new Date(`1970-01-01T${time}`)
          .toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .toUpperCase();

      const payload = {
        hospitalId: sessionStorage.getItem("userId"),
        hospitalName: currentUser?.fullName || "",
        departmentId: selectedDepartmentId,
        departmentName: selectedDepartment,
        designationId: selectedDesignationId,
        designationName: selectedDesignation,
        locationId: locationId,
        locationName: location,
        shiftStartDate: new Date(startDate).toISOString(),
        shiftEndDate: new Date(endDate).toISOString(),
        startTime: formatTo12Hour(startTime),
        endTime: formatTo12Hour(endTime),
        requiredStaff: Number(requiredStaff),
        payRate: Number(pay),
        duties: duties,
        status: "Open",
      };

      const res = await fetch(
        `${baseUrl}${urls?.shift?.create}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        notify(true, "Shift Created Successfully!");
        
        // Reset form
        setTitle("");
        setDescription("");
        setSelectedDepartment("");
        setSelectedDepartmentId("");
        setSelectedDesignation("");
        setSelectedDesignationId("");
        setStartDate("");
        setEndDate("");
        setStartTime("");
        setEndTime("");
        setRequiredStaff("");
        setPay("");
        setDuties("");
        
        onClose();
        if(onSuccess) onSuccess();
      } else {
        notify(false, data.message || "Failed to create shift");
      }
    } catch (err) {
      console.error(err);
      notify(false, "An error occurred");
    } finally {
      setIsCreatingShift(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] p-8 animate-in fade-in zoom-in duration-200 relative no-scrollbar border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 cursor-pointer transition"
        >
          ✕
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <BadgePlus size={24} className="text-black flex-shrink-0" />
            <span>Post New Shift</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 pl-8">
            Create a new service entry for the {location || "selected"} location.
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Department Selector */}
          <div className="relative">
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Department</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-black">
                <FaRegBuilding size={16} />
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowDeptDropdown(!showDeptDropdown);
                  if (departments.length === 0) fetchDepartments();
                }}
                className="pl-10 pr-10 py-2.5 w-full text-left border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white flex justify-between items-center cursor-pointer shadow-sm hover:border-slate-300"
              >
                <span>{selectedDepartment || "Select Department"}</span>
                <span className={`transform transition-transform duration-200 text-slate-400 text-xs ${showDeptDropdown ? "rotate-180" : ""}`}>▼</span>
              </button>
              {showDeptDropdown && (
                <div className="absolute z-50 w-full bg-white border border-slate-100 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-xl py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {departments.map((dept) => (
                    <div
                      key={dept._id}
                      onClick={() => {
                        setSelectedDepartment(dept.departmentName);
                        setSelectedDepartmentId(dept._id);
                        setShowDeptDropdown(false);
                      }}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700 transition"
                    >
                      {dept.departmentName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Designation Selector */}
          <div className="relative">
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Designation</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-black">
                <FaUserTie size={16} />
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowDesignationDropdown(!showDesignationDropdown);
                  if (designations.length === 0) fetchDesignations();
                }}
                className="pl-10 pr-10 py-2.5 w-full text-left border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white flex justify-between items-center cursor-pointer shadow-sm hover:border-slate-300"
              >
                <span>{selectedDesignation || "Select Designation"}</span>
                <span className={`transform transition-transform duration-200 text-slate-400 text-xs ${showDesignationDropdown ? "rotate-180" : ""}`}>▼</span>
              </button>
              {showDesignationDropdown && (
                <div className="absolute z-50 w-full bg-white border border-slate-100 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-xl py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {designations.map((desig) => (
                    <div
                      key={desig._id}
                      onClick={() => {
                        setSelectedDesignation(desig.designationName);
                        setSelectedDesignationId(desig._id);
                        setShowDesignationDropdown(false);
                      }}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700 transition"
                    >
                      {desig.designationName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* START DATE */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Start Date</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-black">
                <FaCalendarAlt size={16} />
              </span>
              <input
                type="date"
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white shadow-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* END DATE */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">End Date</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-black">
                <FaCalendarAlt size={16} />
              </span>
              <input
                type="date"
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white shadow-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* START TIME */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Start Time</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-black">
                <FaClock size={16} />
              </span>
              <input
                type="time"
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white shadow-sm"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            {startTime && (
              <p className="text-[10px] text-slate-400 mt-1 font-semibold pl-1 uppercase tracking-wider">
                {new Date(`1970-01-01T${startTime}`)
                  .toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
              </p>
            )}
          </div>

          {/* END TIME */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">End Time</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-black">
                <FaClock size={16} />
              </span>
              <input
                type="time"
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white shadow-sm"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            {endTime && (
              <p className="text-[10px] text-slate-400 mt-1 font-semibold pl-1 uppercase tracking-wider">
                {new Date(`1970-01-01T${endTime}`)
                  .toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .toUpperCase()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Required Staff</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-black">
                <FaUsers size={16} />
              </span>
              <input
                type="number"
                min="1"
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white shadow-sm"
                placeholder="e.g. 5"
                value={requiredStaff}
                onChange={(e) => setRequiredStaff(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Pay Rate (Hourly)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-black text-[13px] font-bold">
                ZAR
              </span>
              <input
                type="number"
                min="0"
                className="pl-12 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white shadow-sm"
                placeholder="0.00"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Location</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-[#4039AD]">
              <FaMapMarkerAlt size={16} />
            </span>
            <input
              className="pl-10 pr-4 py-2.5 w-full border border-[#4039AD]/20 rounded-xl outline-none text-slate-700 text-sm bg-[#4039AD]/5 cursor-not-allowed font-medium"
              placeholder="Location"
              value={location}
              readOnly
            />
          </div>
          <p className="text-[10px] text-slate-400 italic mt-1.5 pl-1">
            Location is locked based on your current organization profile.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">Duties / Notes</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-black">
              <FaClipboardList size={16} />
            </span>
            <textarea
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition duration-150 outline-none text-slate-700 text-sm bg-white shadow-sm resize-none"
              placeholder="Briefly describe responsibilities, required certifications, or special instructions..."
              rows={3}
              value={duties}
              onChange={(e) => setDuties(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition font-semibold flex items-center gap-2"
            onClick={() => {
              setTitle("");
              setDescription("");
              setSelectedDepartment("");
              setSelectedDepartmentId("");
              setSelectedDesignation("");
              setSelectedDesignationId("");
              setStartDate("");
              setEndDate("");
              setStartTime("");
              setEndTime("");
              setRequiredStaff("");
              setPay("");
              setDuties("");
            }}
          >
            <FaEraser size={14} className="text-slate-600" />
            <span>Clear Form</span>
          </button>

          <button
            onClick={handleCreateShift}
            disabled={isCreatingShift}
            className={`px-6 py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2 cursor-pointer transition font-semibold
              ${isCreatingShift ? "bg-slate-300 cursor-not-allowed" : "bg-[#4039AD] hover:bg-[#322c91] shadow-lg shadow-[#4039AD]/20"}
            `}
          >
            {isCreatingShift ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <FaPaperPlane size={13} className="text-white" />
            )}
            <span>{isCreatingShift ? "Posting..." : "Post Shift"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostShiftModal;
