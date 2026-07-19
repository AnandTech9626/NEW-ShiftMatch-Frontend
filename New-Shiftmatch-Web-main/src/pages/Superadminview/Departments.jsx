import React, { useEffect, useState } from "react";
import { baseUrl, notify, urls } from "../../constants/config";
import AdvancedPeopleLoader from "../../components/AdvancedPeopleLoader";
import { FaEdit } from "react-icons/fa";
import { Calendar, Search, Building2 } from "lucide-react";
import { departmentSchema } from "../../schemas/adminSchema";
import GridTable from "../../components/Table/GridTable";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptStatus, setNewDeptStatus] = useState(true);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [deptError, setDeptError] = useState("");

  // Departments Pagination
  const [departmentsPage, setDepartmentsPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const filteredDepartments = departments.filter((d) =>
    (d.departmentName || "").toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const departmentsIndexOfLast = departmentsPage * itemsPerPage;
  const departmentsIndexOfFirst = departmentsIndexOfLast - itemsPerPage;
  const currentDepartments = filteredDepartments.slice(
    departmentsIndexOfFirst,
    departmentsIndexOfLast
  );
  const departmentsTotalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const res = await fetch(`${baseUrl}${urls?.department?.departmentGetAll}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        notify(false, data.message || "Failed to fetch departments");
        return;
      }
      setDepartments((data.data || []).reverse());
    } catch (err) {
      notify(false, "Error fetching departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleSaveDepartment = async () => {
    // ── Zod validation ──
    const result = departmentSchema.safeParse({ departmentName: newDeptName });
    if (!result.success) {
      setDeptError(result.error.flatten().fieldErrors.departmentName?.[0] || "");
      return;
    }
    setDeptError("");
    try {
      setIsCreatingDept(true);
      const isEdit = !!editingDeptId;
      const endpoint = isEdit
        ? `${baseUrl}${urls?.department?.updateDepartment}`
        : `${baseUrl}${urls?.department?.createDepartment}`;

      const body = isEdit
        ? { id: editingDeptId, departmentName: newDeptName, isActive: newDeptStatus }
        : { departmentName: newDeptName, isActive: newDeptStatus };

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
        notify(false, data.message || "Failed to save department");
        return;
      }
      notify(true, isEdit ? "Department updated successfully" : "Department created successfully");
      setShowCreateDept(false);
      setEditingDeptId(null);
      setNewDeptName("");
      setNewDeptStatus(true);
      fetchDepartments();
    } catch (err) {
      notify(false, "Error saving department");
    } finally {
      setIsCreatingDept(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-0 m-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 flex-shrink-0 gap-4 flex-wrap">
        <h2 className="text-lg font-semibold text-gray-800">Departments List</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDepartmentsPage(1); // Reset page on search
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/50 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setEditingDeptId(null);
              setNewDeptName("");
              setNewDeptStatus(true);
              setShowCreateDept(true);
            }}
            className="px-4 py-2 bg-[#4039AD] text-white rounded-xl text-sm font-medium hover:bg-[#332d8f] transition whitespace-nowrap shadow-md"
          >
            + Add Department
          </button>
        </div>
      </div>

      {/* Table Body via GridTable */}
      <GridTable
        columns={[
          { label: "Department Name", fraction: "2.5fr" },
          { label: "Created At", fraction: "2.0fr" },
          { label: "Updated At", fraction: "2.0fr" },
          { label: "Status", fraction: "1.5fr" },
          { label: "Action", fraction: "1.2fr" },
        ]}
        data={currentDepartments}
        isLoading={loadingDepartments}
        emptyMessage="No departments found"
        renderRow={(dept, index) => (
          <>
            <div className="flex items-center gap-2 text-slate-800 font-semibold truncate">
              <Building2 size={16} className="text-[#4039AD] flex-shrink-0" />
              <span className="truncate">{dept.departmentName}</span>
            </div>
            <div className="text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-800 flex-shrink-0" />
                <span>{new Date(dept.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-800 flex-shrink-0" />
                <span>{new Date(dept.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  dept.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {dept.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <button
                onClick={() => {
                  setEditingDeptId(dept._id);
                  setNewDeptName(dept.departmentName);
                  setNewDeptStatus(dept.isActive);
                  setShowCreateDept(true);
                }}
                className="flex items-center gap-1.5 text-blue-600 text-sm hover:underline"
              >
                <FaEdit className="text-black flex-shrink-0" size={14} />
                <span>Edit</span>
              </button>
            </div>
          </>
        )}
      />

      {/* FOOTER: Count + Pagination */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-1.5 flex items-center justify-between text-sm text-slate-500 flex-shrink-0">
        <span>{departments.length} department{departments.length !== 1 ? "s" : ""} total</span>
        {departmentsTotalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDepartmentsPage((p) => Math.max(1, p - 1))}
              disabled={departmentsPage === 1}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors
                  bg-[#0f172a] text-white hover:bg-slate-800
                  disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Previous
            </button>
            <span className="text-xs font-medium">
              Page {departmentsPage} of {departmentsTotalPages}
            </span>
            <button
              onClick={() => setDepartmentsPage((p) => Math.min(departmentsTotalPages, p + 1))}
              disabled={departmentsPage === departmentsTotalPages}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors
                  bg-[#0f172a] text-white hover:bg-slate-800
                  disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showCreateDept && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingDeptId ? "Edit Department" : "Add Department"}
            </h3>

            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">Department Name</label>
              <input
                type="text"
                placeholder="Enter department name"
                value={newDeptName}
                onChange={(e) => { setNewDeptName(e.target.value); setDeptError(""); }}
                className={`border w-full px-3 py-2 rounded-lg ${deptError ? "border-red-400 ring-2 ring-red-400" : ""}`}
              />
              {deptError && <p className="text-red-500 text-xs mt-1 pl-1">{deptError}</p>}
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-600 block mb-1">Status</label>
              <select
                value={newDeptStatus ? "Active" : "Inactive"}
                onChange={(e) => setNewDeptStatus(e.target.value === "Active")}
                className="border w-full px-3 py-2 rounded-lg"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateDept(false);
                  setEditingDeptId(null);
                  setNewDeptName("");
                  setNewDeptStatus(true);
                }}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDepartment}
                disabled={isCreatingDept}
                className="px-4 py-2 bg-[#4039AD] text-white rounded-lg text-sm disabled:opacity-60"
              >
                {isCreatingDept ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    Saving...
                  </span>
                ) : editingDeptId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
