import React, { useEffect, useState } from "react";
import { baseUrl, notify, urls } from "../../constants/config";
import { FaEdit } from "react-icons/fa";
import { Calendar, Search, FileText } from "lucide-react";
import { documentTypeSchema } from "../../schemas/adminSchema";
import GridTable from "../../components/Table/GridTable";

const DocumentTypes = () => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDocTypeModal, setShowDocTypeModal] = useState(false);
  const [docTypeName, setDocTypeName] = useState("");
  const [docTypeExpiry, setDocTypeExpiry] = useState(true);
  const [referTo, setReferTo] = useState(1);
  const [editingDocTypeId, setEditingDocTypeId] = useState(null);
  const [isCreatingDocType, setIsCreatingDocType] = useState(false);
  const [docTypeError, setDocTypeError] = useState("");

  // Pagination states
  const [documentTypesPage, setDocumentTypesPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const documentTypesPerPage = 10;

  const filteredDocumentTypes = documentTypes.filter((d) =>
    (d.documentName || "").toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const indexOfLastDoc = documentTypesPage * documentTypesPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentTypesPerPage;
  const currentDocumentTypes = filteredDocumentTypes.slice(indexOfFirstDoc, indexOfLastDoc);
  const documentTypesTotalPages = Math.ceil(filteredDocumentTypes.length / documentTypesPerPage);

  const fetchDocumentTypes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}${urls?.documentType?.documentGetAll}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ referTo }),
      });
      const data = await res.json();
      if (!data.success) {
        notify(false, data.message || "Failed to fetch document types");
        return;
      }
      setDocumentTypes((data.data || []).reverse());
    } catch (err) {
      notify(false, "Error fetching document types");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDocType = async () => {
    // ── Zod validation ──
    const result = documentTypeSchema.safeParse({ documentName: docTypeName });
    if (!result.success) {
      setDocTypeError(result.error.flatten().fieldErrors.documentName?.[0] || "");
      return;
    }
    setDocTypeError("");
    try {
      setIsCreatingDocType(true);
      const isEdit = !!editingDocTypeId;
      const endpoint = isEdit
        ? `${baseUrl}${urls?.documentType?.updateDocumentType}`
        : `${baseUrl}${urls?.documentType?.createDocumentType}`;

      const body = isEdit
        ? { id: editingDocTypeId, documentName: docTypeName, isExipreDate: docTypeExpiry, referTo }
        : { documentName: docTypeName, isExipreDate: docTypeExpiry, referTo };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        notify(false, data.message || "Failed to save document type");
        return;
      }

      notify(true, isEdit ? "Document type updated" : "Document type created");
      setShowDocTypeModal(false);
      setEditingDocTypeId(null);
      setDocTypeName("");
      setDocTypeExpiry(true);
      fetchDocumentTypes();
    } catch (err) {
      notify(false, "Error saving document type");
    } finally {
      setIsCreatingDocType(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, [referTo]);

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-0 m-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 flex-shrink-0 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Document Types</h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setReferTo(1)}
              className={`px-3 py-1 text-sm rounded-md transition ${referTo === 1 ? 'bg-[#4039AD] shadow-sm font-medium text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Hospital
            </button>
            <button
              onClick={() => setReferTo(2)}
              className={`px-3 py-1 text-sm rounded-md transition ${referTo === 2 ? 'bg-[#4039AD] shadow-sm font-medium text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Worker
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDocumentTypesPage(1); // Reset page on search
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/50 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setIsCreatingDocType(false);
              setEditingDocTypeId(null);
              setDocTypeName("");
              setDocTypeExpiry(true);
              setShowDocTypeModal(true);
            }}
            className="px-4 py-2 bg-[#4039AD] text-white rounded-xl text-sm font-medium hover:bg-[#332d8f] transition whitespace-nowrap shadow-md"
          >
            + Create Document Type
          </button>
        </div>
      </div>

      {/* Table Body via GridTable */}
      <GridTable
        columns={[
          { label: "Document Name", fraction: "4.0fr" },
          { label: "Expiry Required", fraction: "2.0fr" },
          { label: "Created At", fraction: "2.0fr" },
          { label: "Action", fraction: "2.0fr", className: "text-center" },
        ]}
        data={currentDocumentTypes}
        isLoading={isLoading}
        emptyMessage="No documents found"
        renderRow={(doc) => (
          <>
            <div className="flex items-center gap-2 font-semibold text-slate-800 truncate">
              <FileText size={16} className="text-[#4039AD] flex-shrink-0" />
              <span className="truncate">{doc.documentName}</span>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  doc.isExipreDate
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {doc.isExipreDate ? "Yes" : "No"}
              </span>
            </div>
            <div className="text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-800 flex-shrink-0" />
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={() => {
                  setEditingDocTypeId(doc._id);
                  setDocTypeName(doc.documentName);
                  setDocTypeExpiry(doc.isExipreDate);
                  setReferTo(doc.referTo || 1);
                  setShowDocTypeModal(true);
                }}
                className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline"
              >
                <FaEdit className="text-black text-sm" />
                <span>Edit</span>
              </button>
            </div>
          </>
        )}
      />

      {/* Footer: count + pagination */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-1.5 flex items-center justify-between text-sm text-slate-500 flex-shrink-0">
        <div className="text-sm text-slate-500">
          Showing {indexOfFirstDoc + 1} to {Math.min(indexOfLastDoc, filteredDocumentTypes.length)} of {filteredDocumentTypes.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDocumentTypesPage((p) => Math.max(1, p - 1))}
            disabled={documentTypesPage === 1}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors
                bg-[#0f172a] text-white hover:bg-slate-800
                disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            Previous
          </button>
          <span className="text-xs font-medium">
            Page {documentTypesPage} of {documentTypesTotalPages || 1}
          </span>
          <button
            onClick={() => setDocumentTypesPage((p) => Math.min(documentTypesTotalPages, p + 1))}
            disabled={documentTypesPage === documentTypesTotalPages || documentTypesTotalPages === 0}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors
                bg-[#0f172a] text-white hover:bg-slate-800
                disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showDocTypeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[440px] rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingDocTypeId ? "Edit Document Type" : "Create Document Type"}
            </h3>

            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">Document Name</label>
              <input
                type="text"
                placeholder="Enter document name"
                value={docTypeName}
                onChange={(e) => { setDocTypeName(e.target.value); setDocTypeError(""); }}
                className={`border w-full px-3 py-2 rounded-lg ${docTypeError ? "border-red-400 ring-2 ring-red-400" : ""}`}
              />
              {docTypeError && <p className="text-red-500 text-xs mt-1 pl-1">{docTypeError}</p>}
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">Expiry Required</label>
              <select
                value={docTypeExpiry ? "yes" : "no"}
                onChange={(e) => setDocTypeExpiry(e.target.value === "yes")}
                className="border w-full px-3 py-2 rounded-lg"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-600 block mb-1">Refer To</label>
              <select
                value={referTo}
                onChange={(e) => setReferTo(Number(e.target.value))}
                className="border w-full px-3 py-2 rounded-lg"
              >
                <option value={1}>Hospital</option>
                <option value={2}>Healthcare Worker</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDocTypeModal(false);
                  setEditingDocTypeId(null);
                  setDocTypeName("");
                  setDocTypeExpiry(true);
                }}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDocType}
                disabled={isCreatingDocType}
                className="px-4 py-2 bg-[#4039AD] text-white rounded-lg text-sm disabled:opacity-60"
              >
                {isCreatingDocType ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    Saving...
                  </span>
                ) : editingDocTypeId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTypes;
