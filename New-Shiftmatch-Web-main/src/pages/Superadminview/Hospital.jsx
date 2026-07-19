import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { History, Search } from "lucide-react";
import { baseUrl, notify, urls } from "../../constants/config";
import { getStatusColor } from "../../utils/statusColors";
import AdvancedPeopleLoader from "../../components/AdvancedPeopleLoader";
import AddFacility from "../AddFacility";

const Hospital = () => {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [workersPage, setWorkersPage] = useState(1);
  const [workersTotalPages, setWorkersTotalPages] = useState(1);
  const [workersTotalCount, setWorkersTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const workersLimit = 10;

  const currentHospitals = workers.filter(w =>
    (w.fullName || "").toLowerCase().startsWith(searchQuery.toLowerCase()) ||
    (w.email || "").toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const [showDocumentsPanel, setShowDocumentsPanel] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedWorkerAddress, setSelectedWorkerAddress] = useState(null);
  const [workerDocuments, setWorkerDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [verifyingAction, setVerifyingAction] = useState(null);
  const [processingApproveId, setProcessingApproveId] = useState(null);
  const [processingRejectId, setProcessingRejectId] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDocName, setSelectedDocName] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);

  // Timeline modal states
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [timelineDocName, setTimelineDocName] = useState("");

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

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "--";

  const goToNextWorkersPage = () => {
    if (workersPage < workersTotalPages) {
      setWorkersPage((prev) => prev + 1);
    }
  };

  const fetchDocumentTimeline = async (docId, docName = "") => {
    try {
      setLoadingTimeline(true);
      setShowTimelineModal(true);
      setTimelineData([]);
      setTimelineDocName(docName);

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
        res = await fetch(`${baseUrl}${endpoint}?documentId=${docId}&id=${docId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const list = Array.isArray(data.data)
            ? data.data
            : (Array.isArray(data.data.activities)
              ? data.data.activities
              : (Array.isArray(data.data.timeline) ? data.data.timeline : []));
          setTimelineData(list);
        }
      }
    } catch (err) {
      console.error("Error fetching document timeline:", err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const goToPreviousWorkersPage = () => {
    if (workersPage > 1) {
      setWorkersPage((prev) => prev - 1);
    }
  };

  const fetchWorkers = async (page = 1) => {
    try {
      setLoadingWorkers(true);

      const res = await fetch(
        `${baseUrl}${urls?.users?.getUsers || "api/user/getAll"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            roleId: 2,
            page: page,
            limit: workersLimit,
          }),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        const workerList = Array.isArray(data.data?.users)
          ? data.data.users
          : [];
        setWorkers(workerList);

        const totalCount = data.data?.pagination?.totalCount || workerList.length;
        const totalPages = data.data?.pagination?.totalPages ||
          Math.ceil(totalCount / workersLimit);

        setWorkersTotalCount(totalCount);
        setWorkersTotalPages(totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const fetchAddressByUserId = async (userId) => {
    try {
      console.log(urls?.address.getByUserId);
      const res = await fetch(
        `${baseUrl}${urls?.address.getByUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: userId,
          }),
        },
      );

      const data = await res.json();

      if (res.ok && data.success && data.data) {
        if (Array.isArray(data.data)) {
          setSelectedWorkerAddress(data.data.length > 0 ? data.data[0] : null);
        } else {
          setSelectedWorkerAddress(data.data);
        }
      } else {
        setSelectedWorkerAddress(null);
      }
    } catch (err) {
      console.error("Address fetch error:", err);
      setSelectedWorkerAddress(null);
    }
  };

  const fetchWorkerDocuments = async (worker) => {
    try {
      setLoadingDocs(true);
      setSelectedWorker(worker);
      fetchAddressByUserId(worker._id);
      setShowDocumentsPanel(true);

      const res = await fetch(
        `${baseUrl}${urls?.documentType?.documentGetAll.replace("documentType/getAll", "document/getAll") || "api/document/getAll"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ id: worker._id }),
        },
      );

      const data = await res.json();

      const docs = Array.isArray(data.data)
        ? data.data
        : data.data?.documents || [];

      setWorkerDocuments(docs);
    } catch (err) {
      console.error("Fetch worker documents failed", err);
      setWorkerDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const verifyHealthcareWorker = async (userId, status) => {
    if (verifyingAction) return;

    try {
      setVerifyingAction(status);


      const res = await fetch(
        `${baseUrl}${urls?.users?.userVerify || "api/user/verify"}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id: userId,
            verificationStatus: status,
          }),
        },
      );

      const data = await res.json();
      console.log("VERIFY USER RESPONSE:", data);

      if (res.ok && data.success) {
        setWorkers((prevWorkers) =>
          prevWorkers.map((worker) =>
            worker._id === userId
              ? { ...worker, verificationStatus: status }
              : worker,
          ),
        );

        notify(true, `User ${status} successfully`);
      } else {
        notify(false, data.message || data.details || "Verification failed");
      }
    } catch (err) {
      notify(false, "Something went wrong");
    } finally {
      setVerifyingAction(null);
    }
  };

  const handleVerify = async (
    docId,
    status,
    reason = null,
    documentName = "",
  ) => {
    try {
      if (status === "Approved") {
        setProcessingApproveId(docId);
      } else {
        setProcessingRejectId(docId);
      }

      // Map UI status to API enum values
      const verificationStatus = status === "Approved" ? "Verified" : status;

      const bodyData = {
        id: docId,
        verificationStatus,
        verifiedBy: sessionStorage.getItem("userId"),
        userId: sessionStorage.getItem("userId"),
        facilityName: selectedWorker?.fullName || selectedWorker?.facilityName || selectedWorker?.name || "Facility",
        email: selectedWorker?.email || "admin@shiftmatch.com",
        documentName: documentName || "Document",
      };

      if (verificationStatus === "Rejected") {
        bodyData.rejectionReason = reason || "Document rejected";
      }

      const res = await fetch(
        `${baseUrl}${urls?.document?.verify || "api/document/verify"}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(bodyData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, `Document ${status}`);

        setWorkerDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc._id === docId ? { ...doc, verificationStatus } : doc,
          ),
        );
      } else {
        notify(false, Array.isArray(data.message) ? data.message.join(", ") : (data.message || data.details || "Verification failed"));
      }
    } catch (err) {
      console.error("Verify error", err);
      notify(false, "Something went wrong");
    } finally {
      setProcessingApproveId(null);
      setProcessingRejectId(null);
    }
  };

  useEffect(() => {
    fetchWorkers(workersPage);
  }, [workersPage]);

  return (
    <div className="w-full h-full flex-1 flex flex-col p-0 m-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">HealthCare Facilities</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/50 transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddFacilityModal(true)}
            className="bg-[#4039AD] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#342e8d] transition whitespace-nowrap shadow-md"
          >
            + Create Facility
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        {/* LEFT TABLE */}
        <div className="flex flex-col flex-1">
          {/* CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
            <div
              className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-6 py-2 shrink-0 border-b border-slate-200 gap-4"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "2.8fr 2.5fr 1.2fr 1.1fr 1.1fr 1.1fr 0.9fr",
              }}
            >
              <div>Facility</div>
              <div>Email</div>
              <div>Mobile</div>
              <div>Verification</div>
              <div>Registered</div>
              <div>Updated</div>
              <div className="text-center">Action</div>
            </div>

            <div className="flex-1 flex flex-col divide-y divide-slate-100">
              {loadingWorkers ? (
                Array.from({ length: workersLimit }).map((_, rowIndex) => (
                  <div
                    key={`skeleton-row-${rowIndex}`}
                    className="flex-1 px-6 py-1 items-center gap-4 border-b border-slate-50 last:border-none"
                    style={{ display: "grid", gridTemplateColumns: "2.8fr 2.5fr 1.2fr 1.1fr 1.1fr 1.1fr 0.9fr" }}
                  >
                    {Array.from({ length: 7 }).map((_, colIndex) => (
                      <div key={`skeleton-col-${colIndex}`}>
                        <div className="h-3.5 bg-slate-200 rounded animate-pulse w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ))
              ) : currentHospitals.length === 0 ? (
                <div className="py-16 text-center text-slate-500 font-medium">
                  No workers found
                </div>
              ) : (
              <>
                {currentHospitals.map((item) => (
                  <div
                    key={item._id}
                    className="flex-1 px-6 py-1 text-sm hover:bg-slate-50 transition items-center gap-4"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "2.8fr 2.5fr 1.2fr 1.1fr 1.1fr 1.1fr 0.9fr",
                    }}
                  >
                    {/* Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border">
                        {item.imageUrl && item.imageUrl.url && !failedImages[item._id] ? (
                          <img
                            src={item.imageUrl.url}
                            alt={item.fullName}
                            onError={() => setFailedImages((prev) => ({ ...prev, [item._id]: true }))}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(
                              item.fullName,
                            )}`}
                          >
                            {item.fullName?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="relative group flex-1 min-w-0">
                        <span className="font-semibold text-slate-800 truncate pr-4 block cursor-pointer">
                          {item?.fullName}
                        </span>
                        {item?.fullName && item.fullName.length > 25 && (
                          <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                            {item.fullName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="text-slate-600 text-sm pr-4 relative group min-w-0">
                      <span className="font-semibold font-sans text-slate-800 truncate block cursor-pointer">
                        {item.email}
                      </span>
                      {item.email && item.email.length > 28 && (
                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                          {item.email}
                        </div>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="text-slate-600 text-sm">
                      {item.mobileNumber}
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(
                          item.verificationStatus,
                        )}`}
                      >
                        {item.verificationStatus || "Pending"}
                      </span>
                    </div>

                    {/* Created */}
                    <div className="text-slate-600 text-sm">
                      {formatDate(item.createdAt)}
                    </div>

                    {/* Updated */}
                    <div className="text-slate-600 text-sm">
                      {formatDate(item.updatedAt)}
                    </div>

                    {/* Action */}
                    <div className="text-center">
                      <button
                        onClick={() => fetchWorkerDocuments(item)}
                        className="inline-flex items-center justify-center gap-1 px-4 py-1.5 
                          border border-slate-200 rounded text-xs font-semibold 
                          hover:bg-slate-50 transition"
                      >
                        <FaEye className="text-sm" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, workersLimit - currentHospitals.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex-1" />
                ))}
              </>
            )}
          </div>

            <div className="px-6 py-1.5 border-t border-slate-100 text-sm text-slate-500 shrink-0 flex items-center justify-between">
              <div>
                {workersTotalCount === 0
                  ? 0
                  : (workersPage - 1) * workersLimit + 1}
                –{Math.min(workersPage * workersLimit, workersTotalCount)} of{" "}
                {workersTotalCount}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={goToPreviousWorkersPage}
                  disabled={workersPage === 1}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors
                      bg-[#0f172a] text-white hover:bg-slate-800
                      disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  Previous
                </button>

                <span className="text-xs font-medium">
                  Page {workersPage} of {workersTotalPages || 1}
                </span>

                <button
                  onClick={goToNextWorkersPage}
                  disabled={
                    workersPage === workersTotalPages ||
                    workersTotalPages === 0
                  }
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors
                      bg-[#0f172a] text-white hover:bg-slate-800
                      disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-5">
          {showDocumentsPanel && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-lg w-[900px] max-h-[85vh] flex flex-col relative">
                <div className="p-6 border-b flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-base">
                        Uploaded Documents:
                      </h3>
                      <p className="text-[#4039AD] font-medium mt-1">
                        {selectedWorker?.fullName}
                      </p>
                      <p className="text-sm text-[#4039AD]">
                        {selectedWorkerAddress
                          ? `${selectedWorkerAddress.addressLine1 || ""}, 
                            ${selectedWorkerAddress.addressLine2 || ""}, 
                            ${selectedWorkerAddress.cityName || selectedWorkerAddress.city || ""}, 
                            ${selectedWorkerAddress.stateName || selectedWorkerAddress.state || ""}, 
                            ${selectedWorkerAddress.country || ""} - 
                            ${selectedWorkerAddress.postalCode || ""}`
                          : "No Address Found"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          verifyHealthcareWorker(selectedWorker?._id, "Verified")
                        }
                        disabled={verifyingAction !== null}
                        className={`px-5 py-2 rounded-lg text-sm text-white flex items-center gap-2
                          ${verifyingAction === "Verified"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                          }
                        `}
                      >
                        {verifyingAction === "Verified" && (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        )}
                        {verifyingAction === "Verified" ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() =>
                          verifyHealthcareWorker(selectedWorker?._id, "Rejected")
                        }
                        disabled={verifyingAction !== null}
                        className={`px-5 py-2 rounded-lg text-sm text-white flex items-center gap-2
                          ${verifyingAction === "Rejected"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                          }
                        `}
                      >
                        {verifyingAction === "Rejected" && (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        )}
                        {verifyingAction === "Rejected" ? "Processing..." : "Reject"}
                      </button>
                      <button
                        onClick={() => setShowDocumentsPanel(false)}
                        className="text-sm border px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        ✕ Close
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid text-xs px-6 py-3 text-gray-500 border-b bg-gray-50 flex-shrink-0" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 0.6fr 2fr' }}>
                  <div>Document</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">Expiry</div>
                  <div className="text-center">Verification</div>
                  <div className="text-center">Link</div>
                  <div className="text-center">Verify</div>
                </div>

                <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
                  {loadingDocs ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : workerDocuments.length === 0 ? (
                    <p className="text-sm text-gray-500">No documents found</p>
                  ) : (
                    workerDocuments.map((doc) => {
                      const fileUrl = doc.documentUrl && typeof doc.documentUrl === "object"
                        ? doc.documentUrl.url
                        : (typeof doc.documentUrl === "string" && (doc.documentUrl.startsWith("http://") || doc.documentUrl.startsWith("https://"))
                          ? doc.documentUrl
                          : `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}/uploads/${doc.documentUrl}`);
                      return (
                        <div
                          key={doc._id}
                          className="grid items-center border rounded-lg mx-6 px-6 py-3 text-sm mb-2"
                          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 0.6fr 2fr' }}
                        >
                          <div>{doc.documentName}</div>
                          <div className="flex justify-center">
                            <span className="bg-green-100 text-green-800 font-bold text-xs px-2.5 py-1 rounded-full">
                              Submitted
                            </span>
                          </div>
                          <div className="text-center">{formatDate(doc.expiryDate)}</div>
                          <div className="flex justify-center">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(doc.verificationStatus)}`}
                            >
                              {doc.verificationStatus || "Pending"}
                            </span>
                          </div>
                          <div className="flex justify-center items-center">
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#4039AD] underline text-xs"
                            >
                              View
                            </a>
                          </div>
                          <div className="flex gap-2 justify-end items-center pr-2">
                            <button
                              onClick={() =>
                                handleVerify(doc._id, "Approved", null, doc.documentName)
                              }
                              disabled={processingApproveId === doc._id}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all
                                ${processingApproveId === doc._id
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-[#0D215C] hover:bg-[#08153A] text-white"
                                }`}
                            >
                              {processingApproveId === doc._id && (
                                <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                              )}
                              {processingApproveId === doc._id ? "Processing..." : "Approve"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDocId(doc._id);
                                setSelectedDocName(doc.documentName);
                                setRejectReason("");
                                setShowRejectModal(true);
                              }}
                              disabled={processingRejectId === doc._id}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all
                                ${processingRejectId === doc._id
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-[#DCE7FC] hover:bg-[#C9D9FB] text-[#002D62]"
                                }`}
                            >
                              {processingRejectId === doc._id && (
                                <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                              )}
                              {processingRejectId === doc._id ? "Processing..." : "Reject"}
                            </button>
                            {/* History Button */}
                            <button
                              onClick={() => fetchDocumentTimeline(doc._id, doc.documentName)}
                              title="View History"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#4039AD] hover:bg-indigo-50 transition border border-transparent hover:border-indigo-100"
                            >
                              <History size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTimelineModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
          <div
            className="relative bg-white rounded-3xl w-[520px] max-h-[82vh] flex flex-col shadow-[0_32px_80px_-12px_rgba(64,57,173,0.3)] overflow-hidden border border-white/50"
            style={{ animation: "modalPop 0.22s cubic-bezier(.34,1.56,.64,1)" }}
          >
            {/* Brand gradient header */}
            <div
              className="relative px-7 pt-6 pb-5 flex items-start justify-between"
              style={{ background: "linear-gradient(135deg, #4039AD 0%, #6c63d8 100%)" }}
            >
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
                  {timelineDocName || "Document"} — activity timeline
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

            {/* Timeline body */}
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
                  <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#4039AD]/30 via-[#4039AD]/10 to-transparent rounded-full" />
                  <div className="space-y-5">
                    {timelineData.map((activity, idx) => {
                      const action = activity.action || "Activity";
                      const isUpload = action === "UPLOADED";
                      const isVerify = ["Verified", "VERIFIED", "Approved", "APPROVED"].includes(action);
                      const isReject = ["Rejected", "REJECTED"].includes(action);
                      const isPending = action === "PENDING";

                      let dotColor = "bg-slate-400"; let dotGlow = "";
                      if (isUpload) { dotColor = "bg-[#4039AD]"; dotGlow = "shadow-[0_0_0_5px_rgba(64,57,173,0.12)]"; }
                      else if (isVerify) { dotColor = "bg-emerald-500"; dotGlow = "shadow-[0_0_0_5px_rgba(16,185,129,0.12)]"; }
                      else if (isReject) { dotColor = "bg-rose-500"; dotGlow = "shadow-[0_0_0_5px_rgba(244,63,94,0.12)]"; }
                      else if (isPending) { dotColor = "bg-amber-400"; dotGlow = "shadow-[0_0_0_5px_rgba(251,191,36,0.12)]"; }

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
                          <div className="relative z-10 flex-shrink-0 mt-1">
                            <div className={`w-[26px] h-[26px] rounded-full ${dotColor} ${dotGlow} flex items-center justify-center`}>
                              <div className="w-[10px] h-[10px] rounded-full bg-white/80" />
                            </div>
                          </div>
                          <div className={`flex-1 rounded-2xl border p-4 shadow-sm transition-all ${isFirst ? "border-[#4039AD]/20 bg-gradient-to-br from-indigo-50/60 to-white" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${badgeCls}`}>
                                {action}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
                                {formatDate(activity.createdAt)}
                                {activity.createdAt && <span className="ml-1.5 text-slate-300">·</span>}
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
                                  <span className="font-bold text-slate-600 mr-1">Remarks:</span>{remarks}
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

            {/* Footer */}
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

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Reject Document
            </h3>
            <label className="text-sm text-gray-600 block mb-2">
              Enter Rejection Reason
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="border w-full px-3 py-2 rounded-lg mb-4"
              placeholder="Type rejection reason here..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!rejectReason.trim()) {
                    notify(false, "Please enter rejection reason");
                    return;
                  }
                  setIsRejecting(true);
                  await handleVerify(selectedDocId, "Rejected", rejectReason, selectedDocName);
                  setIsRejecting(false);
                  setShowRejectModal(false);
                }}
                disabled={isRejecting}
                className={`px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2
                  ${isRejecting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}
                `}
              >
                {isRejecting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {isRejecting ? "Rejecting..." : "Submit & Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddFacilityModal && (
        <AddFacility
          isModal={true}
          onClose={() => setShowAddFacilityModal(false)}
          onSuccess={() => fetchWorkers(workersPage)}
        />
      )}
    </div>
  );
};

export default Hospital;
