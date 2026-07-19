import React, { useState, useEffect, useRef } from 'react';
import { baseUrl, notify, urls } from '../../constants/config';
import {
  FileText, Building2, Calendar, Hourglass, CloudUpload, Clock,
  CheckCircle2, XCircle, History, FolderOpen, AlertCircle,
  BadgeCheck, Flame, ClipboardCheck, FileBadge, BadgePlus, Stethoscope, Briefcase
} from 'lucide-react';
import { FaEdit } from 'react-icons/fa';
import { LuEye, LuUpload } from 'react-icons/lu';
import { IoCloudUpload } from 'react-icons/io5';

const getDocumentIcon = (name) => {
  if (!name) return <FileText />;
  if (name.includes('License')) return <FileText />;
  if (name.includes('Certificate')) return <BadgeCheck />;
  if (name.includes('Safety') || name.includes('Fire')) return <Flame />;
  if (name.includes('Registration')) return <ClipboardCheck />;
  if (name.includes('Number') || name.includes('Practice')) return <FileBadge />;
  if (name.includes('Approval')) return <BadgePlus />;
  if (name.includes('Medical') || name.includes('Waste')) return <Stethoscope />;
  if (name.includes('Tax') || name.includes('Business')) return <Briefcase />;
  return <FileText />;
};

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadDrawerDoc, setUploadDrawerDoc] = useState(null);
  const [issuedBy, setIssuedBy] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${baseUrl}${urls?.documentType?.documentGetAll}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ referTo: 1 }),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) return;
      setDocuments(data.data || []);
      if ((data.data || []).length > 0) setSelectedDocument(data.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUploadedDocuments = async () => {
    try {
      const res = await fetch(`${baseUrl}${urls?.document?.getAll}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        // Changed to use the current Superadmin's userId, or pass referTo: 1 if it needs to match the system list
        body: JSON.stringify({ id: sessionStorage.getItem("userId") }),
      });
      const data = await res.json();
      if (res.ok) setUploadedDocuments(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchUploadedDocuments();
  }, []);

  const getUploadedDocByType = (docTypeId) => {
    return uploadedDocuments.find((item) => String(item.documentTypeId) === String(docTypeId) || String(item.documentTypeId?._id) === String(docTypeId));
  };

  const selectedUploadedDoc = selectedDocument ? getUploadedDocByType(selectedDocument._id) : null;

  const handleViewFile = () => {
    if (!selectedUploadedDoc) return;
    const fileUrlData = selectedUploadedDoc.fileUrl || selectedUploadedDoc.file;
    if (!fileUrlData) return;
    const fileUrl = typeof fileUrlData === 'object'
      ? fileUrlData.url
      : (typeof fileUrlData === 'string' && (fileUrlData.startsWith('http')
        ? fileUrlData
        : `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/uploads/documents/${fileUrlData}`));
    if (fileUrl) window.open(fileUrl, '_blank');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

const handleSubmitDocument = async () => {
    try {
      setIsUploading(true);


      if (!isEditMode) {
        if (!selectedDocument?._id || !selectedFile) {
          notify(false, "Please select document and file");
          return;
        }

        const isExpiryRequired = !!(uploadDrawerDoc?.isExipreDate || selectedDocument?.isExipreDate);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("documentTypeId", selectedDocument._id);
        formData.append("hospitalId", sessionStorage.getItem("userId")); // ✅ IMPORTANT
        formData.append("issuedBy", issuedBy);
        formData.append("issueDate", issueDate);
        if (isExpiryRequired) {
          formData.append("expiryDate", expiryDate);
        }

        const res = await fetch(
          `${baseUrl}${urls?.document?.upload}${sessionStorage.getItem("userId")}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        const data = await res.json();

        if (!res.ok) {
          notify(false, data.message || "Upload failed");
          return;
        }

        notify(true, "Document uploaded successfully");

        // Optimistically update state so badge shows immediately
        const newDoc = {
          ...data.data,
          documentName: selectedDocument?.name || selectedDocument?.documentName || "",
          documentTypeId: selectedDocument._id,
        };
        const uId = sessionStorage.getItem("userId");
        setUploadedDocuments((prev) => {
          const filtered = prev.filter(
            (d) => String(d.documentTypeId) !== String(selectedDocument._id)
          );
          const updated = [...filtered, newDoc];
          if (uId) {
            localStorage.setItem(`uploaded_docs_${uId}`, JSON.stringify(updated));
          }
          return updated;
        });
      }


      else {
        if (!selectedUploadedDoc?._id) {
          notify(false, "No document selected");
          return;
        }

        const isExpiryRequired = !!uploadDrawerDoc?.isExipreDate;

        const bodyData = {
          sId: selectedUploadedDoc._id,
          issuedBy,
          issueDate,
        };

        if (isExpiryRequired) {
          bodyData.expiryDate = expiryDate;
        }

        const res = await fetch(
          `${baseUrl}${urls?.document?.updateDetails}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(bodyData),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          notify(false, data.message || "Update failed");
          return;
        }

        notify(true, "Details updated successfully");
      }

      await fetchUploadedDocuments();
      setUploadDrawerDoc(null);
      setIsEditMode(false);
      setSelectedFile(null);

    } catch (err) {
      console.error(err);
      notify(false, "Server error");
    } finally {
      setIsUploading(false);
    }
  }

const handleDeleteDocument = async () => {
    if (!selectedUploadedDoc?._id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmDelete) return;

    try {
      setIsUploading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_DELETE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sId: selectedUploadedDoc._id,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Delete failed");
        return;
      }

      notify(true, "Document deleted successfully");

      await fetchUploadedDocuments();

      setUploadDrawerDoc(null);
      setIsEditMode(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("Delete error:", err);
      notify(false, "Server error");
    } finally {
      setIsUploading(false);
    }
  }

const fetchDocumentTimeline = async (docId) => {
    try {
      setLoadingTimeline(true);
      setShowTimelineModal(true);
      setTimelineData([]);

      const endpoint = urls?.documentActivity?.timeline || "api/documentActivity/timeline";

      let res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ documentId: docId, id: docId }),
      });

      if (!res.ok) {
        // Fallback to GET
        res = await fetch(`${baseUrl}${endpoint}?documentId=${docId}&id=${docId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const list = Array.isArray(data.data)
            ? data.data
            : (Array.isArray(data.data.activities)
              ? data.data.activities
              : (Array.isArray(data.data.timeline)
                ? data.data.timeline
                : []));
          setTimelineData(list);
        }
      }
    } catch (err) {
      console.error("Error fetching document timeline:", err);
    } finally {
      setLoadingTimeline(false);
    }
  }

const handleUploadClick = () => {
    if (!selectedDocument) return alert("Select document first");
    fileInputRef.current.click();
  }

const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (isEditMode && selectedUploadedDoc?._id) {
      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("sId", selectedUploadedDoc._id);

        const res = await fetch(
          `${baseUrl}${urls?.document?.updateFile}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: formData,
          },
        );

        const data = await res.json();

        if (!res.ok) {
          notify(false, data.message || "File update failed");
          return;
        }

        notify(true, "File updated successfully");

        await fetchUploadedDocuments();
        setSelectedFile(null);
      } catch (err) {
        console.error(err);
        notify(false, "Server error");
      } finally {
        setIsUploading(false);
      }
    }
  }

  return (
    <div className="h-[calc(100vh-100px)] w-full p-4 md:p-8 bg-slate-50/50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* LEFT PANEL */}
            <div className="col-span-5 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-slate-100/80">
              {/* Elegant white list header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Required Documents</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Please upload all compliance documents below</p>
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
                  const isRejected = uploadedDoc?.verificationStatus === "Rejected";
                  const isVerified = uploadedDoc?.verificationStatus === "Verified";

                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-200 ${isSelected
                        ? "bg-white border-2 border-[#4039AD] shadow-md shadow-[#4039AD]/5"
                        : "bg-white border border-slate-100 hover:border-[#4039AD]/30 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-[#4039AD] text-white" : "bg-indigo-50 text-[#4039AD]"
                          }`}>
                          <span className="text-sm">{getDocumentIcon(doc.name || doc.documentName)}</span>
                        </div>
                        <p className={`text-xs font-semibold truncate transition-colors ${isSelected ? "text-[#4039AD]" : "text-slate-700"}`}>
                          {doc.name || doc.documentName}
                        </p>
                      </div>
                      {uploadedDoc ? (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${isRejected ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : isVerified ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-indigo-50 text-[#4039AD] border border-indigo-100"
                          }`}>
                          {isRejected ? "Rejected" : isVerified ? "Verified" : "Uploaded"}
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
                  <p className="text-sm font-bold text-slate-700">No document selected</p>
                  <p className="text-xs text-slate-400 mt-1">Select a document from the list to preview details</p>
                </div>
              ) : !selectedUploadedDoc ? (
                <div className="h-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-slate-50 to-white">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 text-[#4039AD]">
                    <AlertCircle size={28} className="text-amber-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{selectedDocument.name || selectedDocument.documentName}</p>
                  <p className="text-xs text-slate-400 mt-1 mb-5 text-center max-w-[240px]">This document has not been uploaded yet. Please click upload below to submit.</p>
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
                    style={{ background: "linear-gradient(135deg, #4039AD 0%, #6c63d8 100%)" }}
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
                    style={{ background: "linear-gradient(135deg, #4039AD 0%, #5a51df 100%)" }}
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
                          <span className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${selectedUploadedDoc.verificationStatus === "Rejected"
                            ? "bg-rose-500/10 text-rose-200 border-rose-500/30"
                            : selectedUploadedDoc.verificationStatus === "Verified"
                              ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-200 border-amber-500/30"
                            }`}>
                            {selectedUploadedDoc.verificationStatus === "Rejected" && <XCircle size={10} />}
                            {selectedUploadedDoc.verificationStatus === "Verified" && <CheckCircle2 size={10} />}
                            {(!selectedUploadedDoc.verificationStatus || selectedUploadedDoc.verificationStatus === "Pending") && <Clock size={10} className="animate-pulse" />}
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
                            setIssueDate(selectedUploadedDoc.issueDate ? selectedUploadedDoc.issueDate.split("T")[0] : "");
                            setExpiryDate(selectedUploadedDoc.expiryDate ? selectedUploadedDoc.expiryDate.split("T")[0] : "");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                        >
                          <FaEdit size={11} />
                          Edit
                        </button>
                        <button
                          onClick={() => fetchDocumentTimeline(selectedUploadedDoc._id)}
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
                        { label: "Issued By", value: selectedUploadedDoc.issuedBy || "--", icon: <Building2 size={16} /> },
                        { label: "Issue Date", value: formatDate(selectedUploadedDoc.issueDate), icon: <Calendar size={16} /> },
                        { label: "Expiry Date", value: formatDate(selectedUploadedDoc.expiryDate), icon: <Hourglass size={16} /> },
                        { label: "Uploaded On", value: formatDate(selectedUploadedDoc.createdAt), icon: <CloudUpload size={16} /> },
                      ].map(({ label, value, icon }) => (
                        <div
                          key={label}
                          className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md hover:border-[#4039AD]/20 transition-all flex items-start gap-3.5 group"
                        >
                          <div className="p-2.5 rounded-xl bg-slate-50 text-slate-800 group-hover:bg-slate-100 transition-colors flex-shrink-0">
                            {icon}
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#4039AD] transition-colors">{label}</p>
                            <p className="font-bold text-slate-700 text-xs mt-0.5 leading-snug">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status Alert Banner */}
                    <div className={`flex items-start gap-4 px-6 py-5 rounded-2xl border ${selectedUploadedDoc.verificationStatus === "Rejected"
                      ? "bg-rose-500/5 border-rose-100 text-rose-800"
                      : selectedUploadedDoc.verificationStatus === "Verified"
                        ? "bg-emerald-500/5 border-emerald-100 text-emerald-800"
                        : "bg-amber-500/5 border-amber-100 text-amber-800"
                      }`}>
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${selectedUploadedDoc.verificationStatus === "Rejected" ? "bg-rose-100 text-rose-600"
                        : selectedUploadedDoc.verificationStatus === "Verified" ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                        }`}>
                        {selectedUploadedDoc.verificationStatus === "Rejected" && <XCircle size={18} />}
                        {selectedUploadedDoc.verificationStatus === "Verified" && <CheckCircle2 size={18} />}
                        {(!selectedUploadedDoc.verificationStatus || selectedUploadedDoc.verificationStatus === "Pending") && <Clock size={18} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {selectedUploadedDoc.verificationStatus === "Rejected" ? "Document Rejected"
                            : selectedUploadedDoc.verificationStatus === "Verified" ? "Document Verified"
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
      {uploadDrawerDoc && (
          <div className="fixed inset-0 z-50 flex">
            {/* OVERLAY */}
            <div
              onClick={() => {
                setUploadDrawerDoc(null);
                setIsEditMode(false);
                setSelectedFile(null);
              }}
              className="flex-1 bg-black/40 backdrop-blur-sm transition-opacity"
            />

            {/* RIGHT SLIDE PANEL */}
            <div
              className={`w-[500px] h-full bg-white shadow-2xl p-6 transform transition-all duration-300 ease-in-out ${uploadDrawerDoc ? "translate-x-0" : "translate-x-full"
                }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="font-semibold text-lg">
                  {isEditMode ? "Edit" : "Upload"}{" "}
                  {uploadDrawerDoc.name || uploadDrawerDoc.documentName}
                </h3>

                <button
                  onClick={() => {
                    setUploadDrawerDoc(null);
                    setIsEditMode(false);
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* FORM */}
              <div className="space-y-5">
                {/* ISSUED BY */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Issued By
                  </label>
                  <input
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    placeholder="Enter issuing authority"
                    className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                  />
                </div>

                {/* ISSUE DATE */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                  />
                </div>

                {/* EXPIRY DATE */}
                {uploadDrawerDoc?.isExipreDate && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                    />
                  </div>
                )}

                {/* FILE SECTION */}
                <div className="space-y-3">
                  {/* EXISTING FILE (EDIT MODE ONLY) */}
                  {isEditMode &&
                    selectedUploadedDoc?.documentUrl &&
                    !selectedFile && (
                      <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <LuEye size={16} />
                          <span className="truncate max-w-[180px]">
                            {typeof selectedUploadedDoc.documentUrl === "object"
                              ? (selectedUploadedDoc.documentUrl.url ? selectedUploadedDoc.documentUrl.url.split("/").pop() : "")
                              : selectedUploadedDoc.documentUrl}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleViewFile}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition"
                          >
                            View
                          </button>

                          <button onClick={handleDeleteDocument} disabled={isUploading} className="flex items-center gap-1.5 text-xs px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition disabled:opacity-50">\n {isUploading && <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>} \n Delete\n</button>
                        </div>
                      </div>
                    )}

                  {(!isEditMode || !selectedUploadedDoc?.documentUrl) && (
                    <div
                      onClick={handleUploadClick}
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition"
                    >
                      {selectedFile ? (
                        <p className="text-sm font-medium text-gray-700">
                          {selectedFile.name}
                        </p>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                          <IoCloudUpload size={34} className="text-[#4039AD]" />
                          <p className="text-sm font-medium">
                            Drag & Drop or Browse
                          </p>
                          <span className="text-xs text-gray-400">
                            PDF, JPG, PNG supported
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isEditMode && (
                  <button onClick={() => handleSubmitDocument("details")} disabled={isUploading} className="w-full bg-[#4039AD] text-white py-3 rounded-xl text-sm mt-3 flex items-center justify-center gap-2 disabled:opacity-70">\n {isUploading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>} \n {isUploading ? "Saving..." : "Save Details"}\n</button>
                )}

                {!isEditMode && (
                  <button onClick={() => handleSubmitDocument()} disabled={isUploading} className="w-full bg-[#4039AD] text-white py-3 rounded-xl text-sm mt-3 flex items-center justify-center gap-2 disabled:opacity-70">\n {isUploading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>} \n {isUploading ? "Submitting..." : "Submit Document"}\n</button>
                )}
              </div>
            </div>
          </div>
        )}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
          <div
            className="relative bg-white rounded-3xl w-[520px] max-h-[82vh] flex flex-col shadow-[0_32px_80px_-12px_rgba(64,57,173,0.3)] overflow-hidden border border-white/50"
            style={{ animation: "modalPop 0.22s cubic-bezier(.34,1.56,.64,1)" }}
          >
            {/* ── Brand gradient header ── */}
            <div
              className="relative px-7 pt-6 pb-5 flex items-start justify-between"
              style={{ background: "linear-gradient(135deg, #4039AD 0%, #6c63d8 100%)" }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-10 w-20 h-20 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                    <History size={15} className="text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg tracking-tight">Document History</h3>
                </div>
                <p className="text-white/60 text-[11px] font-medium pl-[42px] leading-relaxed max-w-[300px] truncate">
                  {selectedUploadedDoc?.documentName || "Document"} — activity timeline
                </p>
              </div>

              <button
                onClick={() => setShowTimelineModal(false)}
                className="relative z-10 w-8 h-8 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white/80 hover:text-white transition-all mt-0.5"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* ── Timeline body ── */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-1 no-scrollbar bg-gradient-to-b from-white to-slate-50/40">
              {loadingTimeline ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-[#4039AD]/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#4039AD] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  <p className="text-xs text-slate-400 font-semibold tracking-wide">Loading timeline…</p>
                </div>
              ) : timelineData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <History size={22} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">No activity recorded yet</p>
                  <p className="text-xs text-slate-300">Activity will appear here once changes are made.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#4039AD]/30 via-[#4039AD]/10 to-transparent rounded-full" />

                  <div className="space-y-5">
                    {timelineData.map((activity, idx) => {
                      const action = activity.action || "Activity";
                      const isUpload = action === "UPLOADED";
                      const isVerify = action === "Verified" || action === "VERIFIED" || action === "Approved" || action === "APPROVED";
                      const isReject = action === "Rejected" || action === "REJECTED";
                      const isPending = action === "PENDING";

                      // Dot styles
                      let dotColor = "bg-slate-400";
                      let dotGlow = "";
                      if (isUpload) { dotColor = "bg-[#4039AD]"; dotGlow = "shadow-[0_0_0_5px_rgba(64,57,173,0.12)]"; }
                      else if (isVerify) { dotColor = "bg-emerald-500"; dotGlow = "shadow-[0_0_0_5px_rgba(16,185,129,0.12)]"; }
                      else if (isReject) { dotColor = "bg-rose-500"; dotGlow = "shadow-[0_0_0_5px_rgba(244,63,94,0.12)]"; }
                      else if (isPending) { dotColor = "bg-amber-400"; dotGlow = "shadow-[0_0_0_5px_rgba(251,191,36,0.12)]"; }

                      // Badge styles
                      let badgeCls = "bg-slate-100 text-slate-600 border-slate-200/80";
                      if (isUpload) badgeCls = "bg-indigo-50 text-[#4039AD] border-indigo-100";
                      else if (isVerify) badgeCls = "bg-emerald-50 text-emerald-700 border-emerald-100";
                      else if (isReject) badgeCls = "bg-rose-50 text-rose-700 border-rose-100";
                      else if (isPending) badgeCls = "bg-amber-50 text-amber-700 border-amber-100";

                      const actor = activity.actionByData?.fullName || activity.actorName || "System";
                      const email = activity.actionByData?.email || "";
                      const remarks = activity.remarks || activity.rejectionReason || "";
                      const isFirst = idx === 0;

                      return (
                        <div key={activity._id || idx} className="relative flex gap-4">
                          {/* Dot */}
                          <div className="relative z-10 flex-shrink-0 mt-1">
                            <div className={`w-[26px] h-[26px] rounded-full ${dotColor} ${dotGlow} flex items-center justify-center`}>
                              <div className="w-[10px] h-[10px] rounded-full bg-white/80" />
                            </div>
                          </div>

                          {/* Card */}
                          <div className={`flex-1 rounded-2xl border p-4 shadow-sm transition-all ${isFirst ? "border-[#4039AD]/20 bg-gradient-to-br from-indigo-50/60 to-white" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${badgeCls}`}>
                                {action}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
                                {formatDate(activity.createdAt)}
                                {activity.createdAt && (
                                  <span className="ml-1.5 text-slate-300">·</span>
                                )}
                                <span className="ml-1.5">
                                  {activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                                </span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 ${isUpload ? "bg-[#4039AD]" : isVerify ? "bg-emerald-500" : isReject ? "bg-rose-500" : "bg-slate-400"}`}>
                                {actor.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-700 leading-tight">{actor}</p>
                                {email && <p className="text-[10px] text-slate-400">{email}</p>}
                              </div>
                            </div>

                            {remarks && (
                              <div className="mt-3 flex gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100/80">
                                <div className="w-0.5 rounded-full bg-slate-300 self-stretch flex-shrink-0" />
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                  <span className="font-bold text-slate-600 mr-1">Remarks:</span>
                                  {remarks}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-7 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                {timelineData.length > 0 ? `${timelineData.length} event${timelineData.length > 1 ? "s" : ""}` : ""}
              </span>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#4039AD]/20 hover:shadow-[#4039AD]/30 hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: "linear-gradient(135deg, #4039AD 0%, #6c63d8 100%)" }}
              >
                Close
              </button>
            </div>
          </div>

          <style>{`
            @keyframes modalPop {
              from { opacity: 0; transform: scale(0.92) translateY(16px); }
              to   { opacity: 1; transform: scale(1)    translateY(0); }
            }
          `}</style>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </div>
  );
};

export default Documents;
