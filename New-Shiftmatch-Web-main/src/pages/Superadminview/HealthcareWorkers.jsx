import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { baseUrl, notify, urls } from "../../constants/config";
import { getStatusColor } from "../../utils/statusColors";
import AdvancedPeopleLoader from "../../components/AdvancedPeopleLoader";
import {
  Building2,
  BadgePlus,
  Stethoscope,
  Briefcase,
  Calendar,
  FileText,
  History,
  Search,
} from "lucide-react";
import {
  FaGraduationCap,
  FaUniversity,
  FaBookOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

const HealthcareWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loadingHealthcareWorkers, setLoadingHealthcareWorkers] = useState(false);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  const [workerDocuments, setWorkerDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showDocumentsPanel, setShowDocumentsPanel] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const [verifyingAction, setVerifyingAction] = useState(null);
  const [processingApproveId, setProcessingApproveId] = useState(null);
  const [processingRejectId, setProcessingRejectId] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDocName, setSelectedDocName] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  // Timeline modal states
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [timelineDocName, setTimelineDocName] = useState("");

  // Pagination states
  const [healthcarePage, setHealthcarePage] = useState(1);
  const [healthcareTotalPages, setHealthcareTotalPages] = useState(1);
  const [healthcareTotalCount, setHealthcareTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const healthcareItemsPerPage = 10;

  const currentHealthcareWorkers = workers.filter(w =>
    (w.fullName || "").toLowerCase().startsWith(searchQuery.toLowerCase()) ||
    (w.email || "").toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const goToPreviousHealthcarePage = () => {
    if (healthcarePage > 1) {
      setHealthcarePage((prev) => prev - 1);
    }
  };

  const goToNextHealthcarePage = () => {
    if (healthcarePage < healthcareTotalPages) {
      setHealthcarePage((prev) => prev + 1);
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

  const maskAccountNumber = (accountNumber = "") => {
    if (!accountNumber) return "--";
    const last4 = accountNumber.slice(-4);
    return "*".repeat(accountNumber.length - 4) + last4;
  };

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

  const fetchWorkers2 = async (page = 1) => {
    try {
      setLoadingHealthcareWorkers(true);

      const res = await fetch(
        `${baseUrl}${urls?.users?.getUsers || "api/user/getAll"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            roleId: 3,
            page: page,
            limit: healthcareItemsPerPage,
          }),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        const workerList = Array.isArray(data.data?.users)
          ? data.data.users
          : Array.isArray(data.data?.workers)
            ? data.data.workers
            : [];
        setWorkers(workerList);

        const totalCount = data.data?.pagination?.totalCount || workerList.length;
        const totalPages = data.data?.pagination?.totalPages ||
          Math.ceil(totalCount / healthcareItemsPerPage);

        setHealthcareTotalCount(totalCount);
        setHealthcareTotalPages(totalPages || 1);
      }
    } catch (err) {
      console.error("Healthcare workers fetch failed", err);
    } finally {
      setLoadingHealthcareWorkers(false);
    }
  };

  const fetchWorkerDocuments = async (worker) => {
    try {
      setLoadingDocs(true);

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

  const fetchHealthcareWorkerById = async (worker) => {
    try {
      setLoadingDocs(true);
      setSelectedWorker(worker);
      setShowDocumentsPanel(true);

      const res = await fetch(
        `${baseUrl}${urls?.users?.getCurrentUser.replace("getCurrentUser", "getById") || "api/user/getById"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ id: worker._id }),
        },
      );

      const result = await res.json();

      if (res.ok && Array.isArray(result.data) && result.data.length > 0) {
        setWorkerProfile(result.data[0]);
      } else {
        setWorkerProfile(null);
      }
    } catch (err) {
      console.error("Fetch healthcare worker failed", err);
      setWorkerProfile(null);
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
        setWorkerProfile((prev) => ({
          ...prev,
          verificationStatus: status,
        }));

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

      const verificationStatus = status === "Approved" ? "Verified" : status;
      const bodyData = {
        id: docId,
        verificationStatus,
        verifiedBy: sessionStorage.getItem("userId"),
        userId: sessionStorage.getItem("userId"),
        facilityName: selectedWorker?.fullName || selectedWorker?.facilityName || selectedWorker?.name || "Healthcare Worker",
        email: selectedWorker?.email || "worker@shiftmatch.com",
        documentName: documentName || "Document",
      };

      if (verificationStatus === "Rejected") {
        bodyData.rejectionReason = reason || "Document rejected";
        bodyData.remarks = reason || "Document rejected";
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
        },
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
    fetchWorkers2(healthcarePage);
  }, [healthcarePage]);

  useEffect(() => {
    if (activeProfileTab === "documents" && workerProfile?._id) {
      fetchWorkerDocuments(workerProfile);
    }
  }, [activeProfileTab, workerProfile]);

  return (
    <div className="w-full h-full flex-1 flex flex-col p-0 m-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Nurses</h1>
        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search workers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
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
            {loadingHealthcareWorkers ? (
              Array.from({ length: healthcareItemsPerPage }).map((_, rowIndex) => (
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
            ) : currentHealthcareWorkers.length === 0 ? (
              <div className="py-16 text-center text-slate-500 font-medium">
                No healthcare workers found
              </div>
            ) : (
              <>
                {currentHealthcareWorkers.map((item) => (
                  <div
                    key={item._id}
                    className="flex-1 px-6 py-1 text-sm hover:bg-slate-50 transition items-center gap-4"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "2.8fr 2.5fr 1.2fr 1.1fr 1.1fr 1.1fr 0.9fr",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border">
                      {item.imageUrl && !failedImages[item._id] ? (
                        <img
                          src={`${baseUrl}${urls.fileUrls.userProfile}${item._id}/${item.imageUrl}`}
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
                        {item.fullName}
                      </span>
                      {item.fullName && item.fullName.length > 25 && (
                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                          {item.fullName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-600 text-sm relative group pr-4 min-w-0">
                    <span className="font-semibold font-sans text-slate-800 truncate block cursor-pointer">
                      {item.email}
                    </span>
                    {item.email && item.email.length > 28 && (
                      <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                        {item.email}
                      </div>
                    )}
                  </div>

                  <div className="text-slate-800 text-sm font-semibold">
                    {item.mobileNumber}
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        item.verificationStatus,
                      )}`}
                    >
                      {item.verificationStatus || "Pending"}
                    </span>
                  </div>

                  <div className="text-slate-600 text-sm">
                    {formatDate(item.createdAt)}
                  </div>

                  <div className="text-slate-600 text-sm">
                    {formatDate(item.updatedAt)}
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => fetchHealthcareWorkerById(item)}
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
                {Array.from({ length: Math.max(0, healthcareItemsPerPage - currentHealthcareWorkers.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex-1" />
                ))}
              </>
            )}
          </div>

          <div className="px-6 py-2 border-t border-slate-100 text-sm text-slate-500 shrink-0 flex items-center justify-between">
            <div>
              Showing{" "}
              {healthcareTotalCount === 0 ? 0 : (healthcarePage - 1) * healthcareItemsPerPage + 1}–
              {Math.min(healthcarePage * healthcareItemsPerPage, healthcareTotalCount)} of{" "}
              {healthcareTotalCount} entries
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToPreviousHealthcarePage}
                disabled={healthcarePage === 1}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors
                    bg-[#0f172a] text-white hover:bg-slate-800
                    disabled:bg-white disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Previous
              </button>

              <span className="text-xs font-medium">
                Page {healthcarePage} of {healthcareTotalPages || 1}
              </span>

              <button
                onClick={goToNextHealthcarePage}
                disabled={
                  healthcarePage === healthcareTotalPages ||
                  healthcareTotalPages === 0
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

      {showDocumentsPanel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-[1000px] max-h-[90vh] overflow-y-auto relative no-scrollbar">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {workerProfile?.imageUrl ? (
                  <img
                    src={`${baseUrl}${urls.fileUrls.userProfile}${workerProfile._id}/${workerProfile.imageUrl}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                ) : null}

                <div
                  className={`w-12 h-12 rounded-full bg-[#4039AD] text-white items-center justify-center font-semibold text-sm border ${workerProfile?.imageUrl ? "hidden" : "flex"
                    }`}
                >
                  {(workerProfile?.fullName || "User")
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-[#2563EB]">
                      {workerProfile?.fullName || "--"}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        workerProfile?.verificationStatus,
                      )}`}
                    >
                      {workerProfile?.verificationStatus || "Pending"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {workerProfile?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* APPROVE BUTTON */}
                <button
                  onClick={() =>
                    verifyHealthcareWorker(
                      workerProfile?._id || selectedWorker?._id,
                      "Verified",
                    )
                  }
                  disabled={verifyingAction !== null}
                  className={`px-4 py-1.5 rounded-lg text-sm text-white flex items-center gap-2
                    ${verifyingAction === "Verified"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                    }
                  `}
                >
                  {verifyingAction === "Verified" && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {verifyingAction === "Verified"
                    ? "Processing..."
                    : "Approve"}
                </button>

                <button
                  onClick={() =>
                    verifyHealthcareWorker(
                      workerProfile?._id || selectedWorker?._id,
                      "Rejected",
                    )
                  }
                  disabled={verifyingAction !== null}
                  className={`px-4 py-1.5 rounded-lg text-sm text-white flex items-center gap-2
                    ${verifyingAction === "Rejected"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                    }
                  `}
                >
                  {verifyingAction === "Rejected" && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {verifyingAction === "Rejected"
                    ? "Processing..."
                    : "Reject"}
                </button>

                <button
                  onClick={() => {
                    setShowDocumentsPanel(false);
                    setWorkerProfile(null);
                    setActiveProfileTab("personal");
                  }}
                  className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-100 transition"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="flex gap-8 px-6 pt-4 border-b text-sm font-medium">
              {[
                { key: "personal", label: "Personal Details" },
                { key: "bank", label: "Bank Details" },
                { key: "experience", label: "Experience" },
                { key: "availability", label: "Availability" },
                { key: "qualification", label: "Qualification" },
                { key: "prefernce", label: "Preference" },
                { key: "documents", label: "Documents" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveProfileTab(tab.key)}
                  className={`pb-3 transition ${activeProfileTab === tab.key
                    ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <div className="p-6">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-16">
                  <AdvancedPeopleLoader />
                </div>
              ) : !workerProfile ? (
                <p className="text-center text-sm text-gray-500">
                  No data found
                </p>
              ) : (
                <>
                  {/* PERSONAL DETAILS */}
                  {activeProfileTab === "personal" && (
                    <div className="border rounded-xl p-6 grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          FULL NAME
                        </p>
                        <p className="font-semibold">
                          {workerProfile.fullName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          EMAIL ADDRESS
                        </p>
                        <p className="font-semibold">
                          {workerProfile.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          MOBILE NUMBER
                        </p>
                        <p className="font-semibold">
                          {workerProfile.mobileNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          DATE OF BIRTH
                        </p>
                        <p className="font-semibold">
                          {workerProfile.dob || "--"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          GENDER
                        </p>
                        <p className="font-semibold">
                          {workerProfile.gender || "--"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          ACCOUNT STATUS
                        </p>
                        <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          {workerProfile.accountStatus}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          ADDRESS
                        </p>
                        <p className="font-semibold">
                          {workerProfile.addressData?.addressLine1 ? `${workerProfile.addressData.addressLine1}, ` : ""}
                          {workerProfile.addressData?.addressLine2 ? `${workerProfile.addressData.addressLine2}, ` : ""}
                          {workerProfile.addressData?.cityName || workerProfile.addressData?.city?.name || workerProfile.addressData?.city ? `${workerProfile.addressData?.cityName || workerProfile.addressData?.city?.name || workerProfile.addressData?.city}, ` : ""}
                          {workerProfile.addressData?.stateName || workerProfile.addressData?.state?.name || workerProfile.addressData?.state ? `${workerProfile.addressData?.stateName || workerProfile.addressData?.state?.name || workerProfile.addressData?.state}, ` : ""}
                          {workerProfile.addressData?.country ? `${workerProfile.addressData.country}, ` : ""}
                          {workerProfile.addressData?.postalCode ? workerProfile.addressData.postalCode : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* BANK DETAILS */}
                  {activeProfileTab === "bank" && (
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                              🏦
                            </div>
                            <h4 className="font-semibold text-base">
                              Banking Information
                            </h4>
                          </div>

                          <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                            VERIFIED
                          </span>
                        </div>

                        {workerProfile.bankData && Object.keys(workerProfile.bankData).length > 0 ? (
                          <>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-sm">
                              <div>
                                <p className="text-xs text-black-300 mb-1 uppercase">
                                  Account Holder
                                </p>
                                <p className="font-medium">
                                  {workerProfile.bankData.accountHolderName}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-black-300 mb-1 uppercase">
                                  Bank Name
                                </p>
                                <p className="font-medium">
                                  {workerProfile.bankData.bankName}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-black-400 mb-1 uppercase">
                                  Account Number
                                </p>

                                <div className="flex items-center gap-2">
                                  <p className="font-medium tracking-wider">
                                    {maskAccountNumber(
                                      workerProfile.bankData.accountNumber,
                                    )}
                                  </p>

                                  <span
                                    className="cursor-pointer text-gray-400 text-xs"
                                    title="Copy full account number"
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        workerProfile.bankData.accountNumber,
                                      )
                                    }
                                  >
                                    📋
                                  </span>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs text-black-300 mb-1 uppercase">
                                  Account Type
                                </p>
                                <p className="font-medium">
                                  {workerProfile.bankData.accountType}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6">
                              <p className="text-xs text-black-300 mb-1 uppercase">
                                Branch Identifier
                              </p>
                              <div className="bg-gray-50 border rounded-lg px-4 py-3 text-sm text-gray-700 break-all">
                                {workerProfile.bankData.branchName}
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            No bank details found
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* EXPERIENCE */}
                  {activeProfileTab === "experience" && (
                    <div className="bg-gray-50 border rounded-xl p-6 space-y-6">
                      {workerProfile.experiencesData?.length > 0 ? (
                        workerProfile.experiencesData.map((exp, i) => (
                          <div
                            key={i}
                            className="bg-white border rounded-xl shadow-sm p-6 space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="flex items-start gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  <Building2 className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase">
                                    Hospital
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    {exp.hospitalName}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  <BadgePlus className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase">
                                    Designation
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    {exp.designation}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase">
                                    Department
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    {exp.department}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  <Briefcase className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase">
                                    Employment
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    {exp.employmentType}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  <Calendar className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase">
                                    Duration
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    {formatDate(exp.startDate)} —{" "}
                                    {exp.isCurrentlyWorking
                                      ? "Present"
                                      : formatDate(exp.endDate)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-5 flex gap-3">
                              <div className="bg-indigo-100 p-2 rounded-lg h-fit">
                                <FileText className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 uppercase mb-1">
                                  Role Description
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {exp.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No experience added</p>
                      )}
                    </div>
                  )}

                  {/* QUALIFICATION */}
                  {activeProfileTab === "qualification" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FaGraduationCap className="text-[#4039AD]" />
                          Qualification Details
                        </h3>
                      </div>
                      {workerProfile.qualificationsData?.length > 0 ? (
                        workerProfile.qualificationsData
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((qual) => {
                            const docUrl = qual.documentUrl
                              ? (typeof qual.documentUrl === "object"
                                ? qual.documentUrl.url
                                : (qual.documentUrl.startsWith("http://") || qual.documentUrl.startsWith("https://")
                                  ? qual.documentUrl
                                  : `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}/uploads/${qual.documentUrl}`))
                              : null;

                            return (
                              <div
                                key={qual._id}
                                className="bg-white border rounded-xl shadow-sm p-6"
                              >
                                <div className="flex justify-between items-center mb-5">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                                      <FaGraduationCap />
                                    </div>
                                    <h4 className="text-[#4039AD] font-semibold">
                                      {qual.education}
                                    </h4>
                                  </div>

                                  {docUrl && (
                                    <button
                                      onClick={() =>
                                        window.open(docUrl, "_blank")
                                      }
                                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
                                    >
                                      <FaEye />
                                      View Document
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-6 text-sm text-gray-700">
                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                      <FaUniversity className="text-gray-400" />
                                      Institution
                                    </p>
                                    <p className="font-medium">
                                      {qual.institution}
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                      <FaBookOpen className="text-gray-400" />
                                      Course
                                    </p>
                                    <p className="font-medium">
                                      {qual.course}
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                      <FaMapMarkerAlt className="text-gray-400" />
                                      Specialization
                                    </p>
                                    <p className="font-medium">
                                      {qual.specialization}
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                      <FaCalendarAlt className="text-gray-400" />
                                      Duration
                                    </p>
                                    <p className="font-medium">
                                      {qual.startYear} – {qual.endYear}
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                      <FaClock className="text-gray-400" />
                                      Course Type
                                    </p>
                                    <p className="font-medium">
                                      {qual.courseType}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No qualification details available
                        </p>
                      )}
                    </div>
                  )}

                  {/* AVAILABILITY */}
                  {activeProfileTab === "availability" && (
                    <div className="border rounded-xl p-6 text-sm text-gray-500">
                      Availability module not implemented yet
                    </div>
                  )}

                  {/* PREFERENCE */}
                  {activeProfileTab === "prefernce" && (
                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            PREFERRED SHIFT TYPE
                          </p>
                          <p className="font-semibold text-gray-800">
                            {workerProfile.preferencesData?.preferredShiftType || "--"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            PREFERRED LOCATION
                          </p>
                          <p className="font-semibold text-gray-800">
                            {workerProfile.preferencesData?.preferredLocation?.name || "--"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          PREFERRED DEPARTMENTS
                        </p>
                        {Array.isArray(workerProfile.preferencesData?.preferredDepartments) &&
                          workerProfile.preferencesData.preferredDepartments.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {workerProfile.preferencesData.preferredDepartments.map((dept, idx) => (
                              <span
                                key={dept.id || idx}
                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold"
                              >
                                {dept.departmentName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No preferred departments added</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DOCUMENTS */}
                  {activeProfileTab === "documents" && (
                    <div className="border rounded-xl p-6 space-y-4">
                      {workerDocuments.length === 0 ? (
                        <p className="text-gray-400 text-sm">
                          No documents uploaded
                        </p>
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
                              className="grid grid-cols-6 items-center border rounded-lg px-4 py-3 text-sm"
                            >
                              <div className="font-semibold text-gray-800">
                                {doc.documentName}
                              </div>

                              <div>{formatDate(doc.expiryDate)}</div>

                              <div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${doc.verificationStatus === "Verified"
                                    ? "bg-green-100 text-green-700"
                                    : doc.verificationStatus === "Rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                    }`}
                                >
                                  {doc.verificationStatus || "Pending"}
                                </span>
                              </div>

                              <div>
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#4039AD] underline text-xs"
                                >
                                  View
                                </a>
                              </div>

                              <div className="flex gap-2 items-center col-span-2">
                                <button
                                  onClick={() =>
                                    handleVerify(
                                      doc._id,
                                      "Approved",
                                      null,
                                      doc.documentName,
                                    )
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
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showTimelineModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
          <div
            className="relative bg-white rounded-3xl w-[520px] max-h-[82vh] flex flex-col shadow-[0_32px_80px_-12px_rgba(64,57,173,0.3)] overflow-hidden border border-white/50"
            style={{ animation: "modalPop 0.22s cubic-bezier(.34,1.56,.64,1)" }}
          >
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
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${badgeCls}`}>
                                {action}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
                                {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : ""}
                                {activity.createdAt && <span className="mx-1 text-slate-300">·</span>}
                                {activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
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

                  await handleVerify(
                    selectedDocId,
                    "Rejected",
                    rejectReason,
                    selectedDocName,
                  );

                  setIsRejecting(false);
                  setShowRejectModal(false);
                }}
                disabled={isRejecting}
                className={`px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2
                  ${isRejecting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                  }
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
    </div>
  );
};

export default HealthcareWorkers;
