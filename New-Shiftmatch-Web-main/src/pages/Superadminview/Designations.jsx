import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { baseUrl, notify, urls } from "../../constants/config";
import { getStatusColor } from "../../utils/statusColors";
import { Calendar, Search, Building2, User, Layers, Monitor, HeartPulse } from "lucide-react";
import { designationSchema } from "../../schemas/adminSchema";

const getIconForIndex = (index) => {
  const icons = [
    { Icon: Building2, bg: "bg-purple-100", text: "text-purple-600" },
    { Icon: User, bg: "bg-blue-100", text: "text-blue-600" },
    { Icon: Layers, bg: "bg-orange-100", text: "text-orange-500" },
    { Icon: Monitor, bg: "bg-teal-100", text: "text-teal-600" },
    { Icon: HeartPulse, bg: "bg-rose-100", text: "text-rose-500" },
  ];
  return icons[index % icons.length];
};

const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [showAddDesignation, setShowAddDesignation] = useState(false);
  const [newDesignation, setNewDesignation] = useState("");
  const [designationStatus, setDesignationStatus] = useState("Active");
  const [editingDesignationId, setEditingDesignationId] = useState(null);
  const [designError, setDesignError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [designationsPage, setDesignationsPage] = useState(1);
  const itemsPerPage = 10;

  const filteredDesignations = designations.filter((d) =>
    (d.designationName || "").toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const designationsTotalPages = Math.ceil(filteredDesignations.length / itemsPerPage);
  const designationsIndexOfLast = designationsPage * itemsPerPage;
  const designationsIndexOfFirst = designationsIndexOfLast - itemsPerPage;
  const currentDesignations = filteredDesignations.slice(
    designationsIndexOfFirst,
    designationsIndexOfLast
  );

  const fetchDesignations = async () => {
    try {
      const res = await fetch(
        `${baseUrl}${urls?.designations?.getAllDesignations}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      const success = data.success;

      if (!success) {
        notify(false, data.message || "Failed to fetch designations");
        return;
      }

      setDesignations((data.data || []).reverse());
    } catch (err) {
      notify(false, "Error fetching designations");
    }
  };

  const handleSaveDesignation = async () => {
    // ── Zod validation ──
    const result = designationSchema.safeParse({ designationName: newDesignation });
    if (!result.success) {
      setDesignError(result.error.flatten().fieldErrors.designationName?.[0] || "");
      return;
    }
    setDesignError("");

    try {
      const isEdit = !!editingDesignationId;
      const endpoint = isEdit
        ? `${baseUrl}${urls?.designations?.updateDesignations}`
        : `${baseUrl}${urls?.designations?.createDesignations}`;

      const body = isEdit
        ? { id: editingDesignationId, designationName: newDesignation, status: designationStatus }
        : { designationName: newDesignation, status: designationStatus };

      const fetchMethod = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method: fetchMethod,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        notify(false, data.message || "Failed to save designation");
        return;
      }

      notify(true, isEdit ? "Designation updated" : "Designation created");
      setShowAddDesignation(false);
      setEditingDesignationId(null);
      setNewDesignation("");
      setDesignationStatus("Active");
      fetchDesignations();
    } catch (err) {
      notify(false, "Error saving designation");
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-0 m-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 gap-4 flex-wrap">
        <h2 className="text-lg font-semibold text-gray-800">Designations List</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search designations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/50 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setEditingDesignationId(null);
              setNewDesignation("");
              setDesignationStatus("Active");
              setShowAddDesignation(true);
            }}
            className="px-4 py-2 bg-[#4039AD] text-white rounded-xl text-sm font-medium hover:bg-[#332d8f] transition whitespace-nowrap shadow-md"
          >
            + Add Designation
          </button>
        </div>
      </div>

      {/* Fixed Table Header */}
      <div className="flex-shrink-0">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="w-[35%] pl-2 pr-6 py-3 text-left">Designation Name</th>
              <th className="w-[20%] px-6 py-3 text-left">Created Date</th>
              <th className="w-[20%] px-6 py-3 text-left">Updated Date</th>
              <th className="w-[15%] px-6 py-3 text-left">Status</th>
              <th className="w-[10%] px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm table-fixed">
          <tbody className="divide-y divide-gray-100">
            {currentDesignations.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium">
                  No designations found
                </td>
              </tr>
            ) : (
              currentDesignations.map((item, index) => {
                const { Icon, bg, text } = getIconForIndex(index);
                return (
                  <tr key={item._id} className="hover:bg-gray-50 align-middle transition">
                    <td className="w-[35%] pl-2 pr-6 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${text} flex-shrink-0`}>
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        {item.designationName}
                      </div>
                    </td>
                  <td className="w-[20%] px-6 py-3 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-800 flex-shrink-0" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="w-[20%] px-6 py-3 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-800 flex-shrink-0" />
                      <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="w-[15%] px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="w-[10%] px-6 py-3">
                    <button
                      onClick={() => {
                        setEditingDesignationId(item._id);
                        setNewDesignation(item.designationName);
                        setDesignationStatus(item.status);
                        setShowAddDesignation(true);
                      }}
                      className="flex items-center gap-1.5 text-blue-600 text-sm hover:underline"
                    >
                      <FaEdit className="text-black flex-shrink-0" size={14} />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {/* FOOTER: Count + Pagination */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-1.5 flex items-center justify-between text-sm text-slate-500 flex-shrink-0">
        <span>{designations.length} designation{designations.length !== 1 ? "s" : ""} total</span>
        {designationsTotalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDesignationsPage((p) => Math.max(1, p - 1))}
              disabled={designationsPage === 1}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-[#0f172a] text-white hover:bg-slate-800 disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Previous
            </button>
            <span className="text-xs font-medium">
              Page {designationsPage} of {designationsTotalPages}
            </span>
            <button
              onClick={() => setDesignationsPage((p) => Math.min(designationsTotalPages, p + 1))}
              disabled={designationsPage === designationsTotalPages}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-[#0f172a] text-white hover:bg-slate-800 disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddDesignation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingDesignationId ? "Edit Designation" : "Add Designation"}
            </h3>

            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">Designation Name</label>
              <input
                type="text"
                placeholder="Enter designation name"
                value={newDesignation}
                onChange={(e) => { setNewDesignation(e.target.value); setDesignError(""); }}
                className={`border w-full px-3 py-2 rounded-lg ${designError ? "border-red-400 ring-2 ring-red-400" : ""}`}
              />
              {designError && <p className="text-red-500 text-xs mt-1 pl-1">{designError}</p>}
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-600 block mb-1">Status</label>
              <select
                value={designationStatus}
                onChange={(e) => setDesignationStatus(e.target.value)}
                className="border w-full px-3 py-2 rounded-lg"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddDesignation(false);
                  setEditingDesignationId(null);
                  setNewDesignation("");
                  setDesignationStatus("Active");
                }}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDesignation}
                className="px-4 py-2 bg-[#4039AD] text-white rounded-lg text-sm"
              >
                {editingDesignationId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designations;
