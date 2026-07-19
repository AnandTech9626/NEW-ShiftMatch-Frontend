import React from "react";
import {
  FolderOpen,
  AlertCircle,
  FileText,
  XCircle,
  CheckCircle2,
  Clock,
  History,
  Building2,
  Calendar,
  Hourglass,
  CloudUpload,
} from "lucide-react";
import { LuUpload, LuEye } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { IoCloudUpload } from "react-icons/io5";

const DocumentsView = ({
  documents,
  getUploadedDocByType,
  selectedDocument,
  setSelectedDocument,
  getDocumentIcon,
  selectedUploadedDoc,
  setIsEditMode,
  setUploadDrawerDoc,
  setIssuedBy,
  setIssueDate,
  setExpiryDate,
  setSelectedFile,
  handleViewFile,
  fetchDocumentTimeline,
  formatDate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* LEFT PANEL */}
      <div className="col-span-5 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-slate-100/80">
        {/* Elegant white list header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Required Documents
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Please upload all compliance documents below
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[#4039AD] text-[10px] font-bold">
            {documents.length} Total
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30 no-scrollbar">
          {documents.map((doc) => {
            const uploadedDoc = getUploadedDocByType(doc._id);
            const isSelected = selectedDocument?._id === doc._id;
            const isRejected =
              uploadedDoc?.verificationStatus === "Rejected";
            const isVerified =
              uploadedDoc?.verificationStatus === "Verified";

            return (
              <div
                key={doc._id}
                onClick={() => setSelectedDocument(doc)}
                className={`flex items-center justify-between rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-white border-2 border-[#4039AD] shadow-md shadow-[#4039AD]/5"
                    : "bg-white border border-slate-100 hover:border-[#4039AD]/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#4039AD] text-white"
                        : "bg-indigo-50 text-[#4039AD]"
                    }`}
                  >
                    <span className="text-sm">
                      {getDocumentIcon(doc.name || doc.documentName)}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-semibold truncate transition-colors ${
                      isSelected ? "text-[#4039AD]" : "text-slate-700"
                    }`}
                  >
                    {doc.name || doc.documentName}
                  </p>
                </div>
                {uploadedDoc ? (
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${
                      isRejected
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : isVerified
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-indigo-50 text-[#4039AD] border border-indigo-100"
                    }`}
                  >
                    {isRejected
                      ? "Rejected"
                      : isVerified
                      ? "Verified"
                      : "Uploaded"}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 flex-shrink-0 ml-2">
                    Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="col-span-7 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-slate-100">
        {!selectedDocument ? (
          <div className="h-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-slate-50 to-white">
            <div className="flex items-center justify-center mb-4">
              <FolderOpen size={64} className="text-[#4039AD]" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              No document selected
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Select a document from the list to preview details
            </p>
          </div>
        ) : !selectedUploadedDoc ? (
          <div className="h-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-slate-50 to-white">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 text-[#4039AD]">
              <AlertCircle size={28} className="text-amber-500" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              {selectedDocument.name || selectedDocument.documentName}
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-5 text-center max-w-[240px]">
              This document has not been uploaded yet. Please click upload
              below to submit.
            </p>
            <button
              onClick={() => {
                setIsEditMode(false);
                setUploadDrawerDoc(selectedDocument);
                setIssuedBy("");
                setIssueDate("");
                setExpiryDate("");
                setSelectedFile(null);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg shadow-[#4039AD]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, #4039AD 0%, #6c63d8 100%)",
              }}
            >
              <LuUpload size={13} />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Branded corporate header */}
            <div
              className="relative px-7 pt-6 pb-6 flex-shrink-0 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #4039AD 0%, #5a51df 100%)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-10 w-16 h-16 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white flex-shrink-0 border border-white/20 shadow-md">
                    <FileText size={22} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base leading-tight truncate">
                      {selectedUploadedDoc.documentName}
                    </h3>
                    <span
                      className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${
                        selectedUploadedDoc.verificationStatus === "Rejected"
                          ? "bg-rose-500/10 text-rose-200 border-rose-500/30"
                          : selectedUploadedDoc.verificationStatus ===
                            "Verified"
                          ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-200 border-amber-500/30"
                      }`}
                    >
                      {selectedUploadedDoc.verificationStatus ===
                        "Rejected" && <XCircle size={10} />}
                      {selectedUploadedDoc.verificationStatus ===
                        "Verified" && <CheckCircle2 size={10} />}
                      {(!selectedUploadedDoc.verificationStatus ||
                        selectedUploadedDoc.verificationStatus ===
                          "Pending") && (
                        <Clock size={10} className="animate-pulse" />
                      )}
                      {selectedUploadedDoc.verificationStatus || "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={handleViewFile}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                  >
                    <LuEye size={12} />
                    View File
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(true);
                      setUploadDrawerDoc(selectedUploadedDoc);
                      setIssuedBy(selectedUploadedDoc.issuedBy || "");
                      setIssueDate(
                        selectedUploadedDoc.issueDate
                          ? selectedUploadedDoc.issueDate.split("T")[0]
                          : ""
                      );
                      setExpiryDate(
                        selectedUploadedDoc.expiryDate
                          ? selectedUploadedDoc.expiryDate.split("T")[0]
                          : ""
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                  >
                    <FaEdit size={11} />
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      fetchDocumentTimeline(selectedUploadedDoc._id)
                    }
                    title="Document History"
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                  >
                    <History size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Details body */}
            <div className="flex-1 p-6 bg-gradient-to-b from-slate-50/50 to-white overflow-y-auto space-y-5 no-scrollbar">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  {
                    label: "Issued By",
                    value: selectedUploadedDoc.issuedBy || "--",
                    icon: <Building2 size={16} />,
                  },
                  {
                    label: "Issue Date",
                    value: formatDate(selectedUploadedDoc.issueDate),
                    icon: <Calendar size={16} />,
                  },
                  {
                    label: "Expiry Date",
                    value: formatDate(selectedUploadedDoc.expiryDate),
                    icon: <Hourglass size={16} />,
                  },
                  {
                    label: "Uploaded On",
                    value: formatDate(selectedUploadedDoc.createdAt),
                    icon: <CloudUpload size={16} />,
                  },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md hover:border-[#4039AD]/20 transition-all flex items-start gap-3.5 group"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-800 group-hover:bg-slate-100 transition-colors flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#4039AD] transition-colors">
                        {label}
                      </p>
                      <p className="font-bold text-slate-700 text-xs mt-0.5 leading-snug">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Alert Banner */}
              <div
                className={`flex items-start gap-4 px-6 py-5 rounded-2xl border ${
                  selectedUploadedDoc.verificationStatus === "Rejected"
                    ? "bg-rose-500/5 border-rose-100 text-rose-800"
                    : selectedUploadedDoc.verificationStatus === "Verified"
                    ? "bg-emerald-500/5 border-emerald-100 text-emerald-800"
                    : "bg-amber-500/5 border-amber-100 text-amber-800"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    selectedUploadedDoc.verificationStatus === "Rejected"
                      ? "bg-rose-100 text-rose-600"
                      : selectedUploadedDoc.verificationStatus === "Verified"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {selectedUploadedDoc.verificationStatus === "Rejected" && (
                    <XCircle size={18} />
                  )}
                  {selectedUploadedDoc.verificationStatus === "Verified" && (
                    <CheckCircle2 size={18} />
                  )}
                  {(!selectedUploadedDoc.verificationStatus ||
                    selectedUploadedDoc.verificationStatus === "Pending") && (
                    <Clock size={18} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {selectedUploadedDoc.verificationStatus === "Rejected"
                      ? "Document Rejected"
                      : selectedUploadedDoc.verificationStatus === "Verified"
                      ? "Document Verified"
                      : "Verification Pending"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {selectedUploadedDoc.verificationStatus === "Rejected"
                      ? "This document was rejected during review. Please upload a correct copy to re-submit."
                      : selectedUploadedDoc.verificationStatus === "Verified"
                      ? "This document has been successfully verified by administration."
                      : "Your document is currently under review by our admin team."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsView;
