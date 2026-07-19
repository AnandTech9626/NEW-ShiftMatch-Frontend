import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addressSchema } from "../schemas/addressSchema";
import { baseUrl, notify, urls } from "../constants/config";
import { FaEdit } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase";
import { LuUpload } from "react-icons/lu";
import { LuEye } from "react-icons/lu";
import { getStatusColor } from "../utils/statusColors";
import { IoCloudUpload } from "react-icons/io5";
import { CiMenuKebab } from "react-icons/ci";

import { IoLocationSharp } from "react-icons/io5";
import { IoDocuments } from "react-icons/io5";
import { MdDashboardCustomize } from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import PayNowButton from "../components/PayNowButton";
import AnalyticalDashboard from "./Superadminview/AnalyticalDashboard";
import ReportIssue from "./ReportIssue";
import FeedbackModal from "../components/Modals/FeedbackModal";
import PostShiftModal from "../components/Modals/PostShiftModal";
import EditProfileModal from "../components/Modals/EditProfileModal";
import ManageShifts from "./HospitalView/ManageShifts";
import ApplicantsView from "./HospitalView/ApplicantsView";
import DocumentsView from "./HospitalView/DocumentsView";
import {
  FaGraduationCap,
  FaUniversity,
  FaBookOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCamera,
  FaUsers,
  FaRegBuilding,
  FaUserTie,
  FaClipboardList,
  FaEraser,
  FaPaperPlane,
  FaUserNurse,
} from "react-icons/fa";
import {
  FileText,
  ShieldCheck,
  Building2,
  BadgeCheck,
  Flame,
  ClipboardCheck,
  FileBadge,
  BadgePlus,
  Stethoscope,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  CloudUpload,
  Clock,
  Hourglass,
  Search,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [showPostShiftModal, setShowPostShiftModal] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [docTab, setDocTab] = useState("types");
  const [selectedShiftDate, setSelectedShiftDate] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [issuedBy, setIssuedBy] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedShiftPayRate, setSelectedShiftPayRate] = useState(0);
  const fileInputRef = useRef(null);
  const [location, setLocation] = useState("");
  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [applicantsData, setApplicantsData] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [shiftApplicantCounts, setShiftApplicantCounts] = useState({});
  const [uploadDrawerDoc, setUploadDrawerDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDocMenu, setShowDocMenu] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShifts, setTotalShifts] = useState(0);
  const [shiftSearchQuery, setShiftSearchQuery] = useState("");
  const audioRef = useRef(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    id: null,
    type: null,
  });
  const [dashboardView, setDashboardView] = useState("shifts");
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [approveLoading, setApproveLoading] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(null);
  const [endLoading, setEndLoading] = useState(null);
  const [showDocumentsPanel, setShowDocumentsPanel] = useState(false);
  const [paidApplicationIds, setPaidApplicationIds] = useState([]);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const maskAccountNumber = (accountNumber = "") => {
    if (!accountNumber) return "--";
    const last4 = accountNumber.slice(-4);
    return "*".repeat(accountNumber.length - 4) + last4;
  };

  const hasRejectedDocs = uploadedDocuments.some(
    (doc) => doc.verificationStatus === "Rejected",
  );
  const selectedUploadedDoc = uploadedDocuments.find(
    (item) => String(item.documentTypeId) === String(selectedDocument?._id),
  );
  const getUploadedDocByType = (docTypeId) => {
    return uploadedDocuments.find((item) => String(item.documentTypeId) === String(docTypeId));
  };

  const handleViewFile = () => {
    if (!selectedUploadedDoc?.documentUrl) return;

    const fileUrl = typeof selectedUploadedDoc.documentUrl === "object"
      ? selectedUploadedDoc.documentUrl.url
      : (selectedUploadedDoc.documentUrl.startsWith("http://") || selectedUploadedDoc.documentUrl.startsWith("https://")
        ? selectedUploadedDoc.documentUrl
        : `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}/uploads/${selectedUploadedDoc.documentUrl}`);

    window.open(fileUrl, "_blank");
  };

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
  };

  const fetchHealthcareWorkerById = async (worker) => {
    try {
      setLoadingDocs(true);
      setShowDocumentsPanel(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_HEALTHCARE_WORKER_GET_BY_ID_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: worker._id }),
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
  };
  const handleShiftStatusChange = async (shiftId, status) => {
    try {
      const res = await fetch(
        `${baseUrl}${urls?.shift?.updateStatus}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id: shiftId,
            status: status,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Status update failed");
        return;
      }

      notify(true, "Shift status updated");

      fetchAllShifts();
    } catch (err) {
      notify(false, "Server error");
    }
  };
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
  };
  const getDocumentIcon = (name = "") => {
    const lower = name.toLowerCase();

    if (lower.includes("license")) return <FileBadge size={20} />;
    if (lower.includes("compliance")) return <ShieldCheck size={20} />;
    if (lower.includes("registration")) return <Building2 size={20} />;
    if (lower.includes("practice")) return <BadgeCheck size={20} />;
    if (lower.includes("tax")) return <ClipboardCheck size={20} />;
    if (lower.includes("fire")) return <Flame size={20} />;

    return <FileText size={20} />;
  };
  const handleApplicantAction = async (app, status) => {
    try {
      if (status === "Approved") setApproveLoading(app._id);
      if (status === "Rejected") setRejectLoading(app._id);

      const res = await fetch(
        `${baseUrl}${urls?.shiftApplicant?.action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          sId: app._id,
          status: status,
          userId: app.workerId,
          hospitalName: currentUser?.fullName,
          shiftDate: new Date(selectedShiftDate).toISOString().split("T")[0],
        }),
      },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Action failed");
        return;
      }

      notify(true, `Applicant ${status}`);
      fetchShiftApplications(app.shiftId);
    } catch (err) {
      notify(false, "Server error");
    } finally {
      setApproveLoading(null);
      setRejectLoading(null);
    }
  };
  const handlePunchTime = async (app, type) => {
    const applicationId = app._id;
    const workerId = app.workerId;

    try {
      if (type === "PunchIn") setStartLoading(app._id);
      if (type === "PunchOut") setEndLoading(app._id);

      const res = await fetch(
        `${baseUrl}${urls?.shiftApplicant?.punchTime}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          sId: applicationId,
          type: type,
          workerId: workerId,
        }),
      },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Punch failed");
        return;
      }

      notify(
        true,
        type === "PunchIn"
          ? "Start time recorded successfully"
          : "End time recorded successfully",
      );

      // Optimistically update local state so buttons react immediately
      const now = new Date().toISOString();
      setApplicantsData((prev) =>
        prev.map((a) =>
          a._id === app._id
            ? {
              ...a,
              startTime: type === "PunchIn" ? now : a.startTime,
              endTime: type === "PunchOut" ? now : a.endTime,
            }
            : a,
        ),
      );

      if (type === "PunchOut") {
        setSelectedApplicationId(app.shiftId);
        setSelectedWorkerId(workerId);
        setApplicationId(app._id);
        setShowFeedbackModal(true);
      }
    } catch (err) {
      notify(false, "Server error");
    } finally {
      if (type === "PunchIn") setStartLoading(null);
      if (type === "PunchOut") setEndLoading(null);
    }
  };
  const handleOpenEditModal = () => {
    setShowEditProfileModal(true);
  };


  const handleViewApplicants = (applications = []) => {
    setSelectedApplicants(applications);
    setShowApplicantsModal(true);
  };

  const handlePaymentSuccess = (applicationId) => {
    setPaidApplicationIds((prev) =>
      prev.includes(applicationId) ? prev : [...prev, applicationId],
    );
    setApplicantsData((prev) =>
      prev.map((app) =>
        app._id === applicationId ? { ...app, paymentCompleted: true } : app,
      ),
    );
  };

  const fetchShiftApplications = async (shiftId) => {
    try {
      setLoadingApplicants(true);

      const res = await fetch(
        `${baseUrl}${urls?.shiftApplicant?.getById}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            shiftId: shiftId,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Failed to fetch applicants");
        return;
      }

      const applicants = data.data || [];
      setApplicantsData(applicants);

      // Cache the count so the shift list shows it dynamically
      setShiftApplicantCounts((prev) => ({
        ...prev,
        [shiftId]: applicants.length,
      }));
    } catch (err) {
      console.error(err);
      notify(false, "Server error");
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Pre-fetch applicant counts for all shifts silently
  const prefetchApplicantCounts = async (shiftsArray) => {
    const counts = {};
    await Promise.allSettled(
      shiftsArray.map(async (shift) => {
        try {
          const res = await fetch(`${baseUrl}${urls?.shiftApplicant?.getById}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({ shiftId: shift._id }),
          });
          if (res.ok) {
            const data = await res.json();
            counts[shift._id] = (data.data || []).length;
          }
        } catch (e) {
          // Silent fail per shift
        }
      })
    );
    setShiftApplicantCounts((prev) => ({ ...prev, ...counts }));
  };


  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(
        `${baseUrl}${urls?.users?.getCurrentUser}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data.data) && data.data.length > 0) {
        const user = data.data[0];
        setCurrentUser(user);

        const cityName =
          user.addressData?.city?.name || user.addressData?.city || "";

        const cityId =
          user.addressData?.cityId?._id ||
          user.addressData?.cityId ||
          user.addressData?.city?._id ||
          "";

        setLocation(cityName);
        setLocationId(cityId);

        console.log("CITY NAME ", cityName);
        console.log("CITY ID ", cityId);
      }
    } catch (err) {
      console.error("Fetch current user error:", err);
    }
  };
  const isUserVerified = currentUser?.verificationStatus === "Verified";

  useEffect(() => {
    fetchCurrentUser();
  }, []);
  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  useEffect(() => {
    // messaging is null when FCM is unsupported (plain HTTP / network IP access)
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔥 FOREGROUND MESSAGE:", payload);

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "New Notification";

      const body = payload.notification?.body || payload.data?.body || "";

      if (Notification.permission === "granted") {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg.showNotification(title, {
            body: body,
            icon: "/logo.png",
          });
        });
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (activePage === "shifts") {
      fetchAllShifts();
    }
  }, [currentPage, shiftSearchQuery]);
  useEffect(() => {
    if (currentUser?.addressData) {
      const fullAddress = [currentUser.addressData.city]
        .filter(Boolean)
        .join(", ");

      setLocation(fullAddress);
    }
  }, [currentUser]);

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


  const handleUploadProfileImage = async (file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      notify(false, "Profile image must be less than 5MB");
      return;
    }

    try {
      setIsUploadingImage(true);
      setSelectedProfileImage(file);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", currentUser?._id);

      const profileRes = await fetch(
        `${baseUrl}${urls?.users?.updateProfile}${currentUser?._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        notify(false, profileData.message || "Profile image update failed");
        setSelectedProfileImage(null);
        return;
      }

      notify(true, "Profile picture uploaded successfully");
      fetchCurrentUser();
    } catch (err) {
      console.error("Profile image upload error:", err);
      notify(false, "Failed to upload profile picture");
      setSelectedProfileImage(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (isSavingProfile) return;
    try {
      setIsSavingProfile(true);
      let addressUpdated = false;

      const addressChanged =
        editProfileData.state !== currentUser?.addressData?.stateId ||
        editProfileData.city !== currentUser?.addressData?.cityId ||
        editProfileData.area !== currentUser?.addressData?.addressLine1 ||
        editProfileData.street !== currentUser?.addressData?.addressLine2 ||
        editProfileData.pincode !== currentUser?.addressData?.postalCode ||
        editProfileData.country !== currentUser?.addressData?.country;

      if (addressChanged) {
        // ── Zod validation ──
        const result = addressSchema.safeParse(editProfileData);
        if (!result.success) {
          const fieldErrors = result.error.flatten().fieldErrors;
          setAddressErrors({
            state: fieldErrors.state?.[0] || "",
            city: fieldErrors.city?.[0] || "",
            area: fieldErrors.area?.[0] || "",
            street: fieldErrors.street?.[0] || "",
            pincode: fieldErrors.pincode?.[0] || "",
            country: fieldErrors.country?.[0] || "",
          });
          setIsSavingProfile(false);
          return;
        }
        setAddressErrors({});

        const stateVal = typeof editProfileData.state === "object" ? editProfileData.state?._id : editProfileData.state;
        const cityVal = typeof editProfileData.city === "object" ? editProfileData.city?._id : editProfileData.city;

        const selectedState = statesList.find(
          (s) => String(s._id) === String(stateVal),
        );

        const selectedCity = citiesList.find(
          (c) => String(c._id) === String(cityVal),
        );

        const hasAddress = !!currentUser?.addressData?._id;
        const apiPath = hasAddress ? urls?.address?.update : urls?.address?.create;

        const bodyData = {
          stateId: stateVal,
          cityId: cityVal,
          stateName: selectedState?.name || "",
          cityName: selectedCity?.name || "",
          addressLine1: editProfileData.area,
          addressLine2: editProfileData.street,
          postalCode: editProfileData.pincode,
          country: editProfileData.country,
        };

        if (hasAddress) {
          bodyData.id = currentUser?.addressData?._id;
        } else {
          bodyData.userId = currentUser?._id;
        }

        const res = await fetch(
          `${baseUrl}${apiPath}`,
          {
            method: hasAddress ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(bodyData),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          notify(false, data.message || (hasAddress ? "Address update failed" : "Address creation failed"));
          return;
        }

        notify(true, hasAddress ? "Address updated successfully" : "Address created successfully");
        addressUpdated = true;
      }

      if (addressUpdated) {
        setShowEditProfileModal(false);
        setSelectedProfileImage(null);
        fetchCurrentUser();
      } else {
        notify(false, "No changes detected");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      notify(false, "Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };
  const fetchStates = async () => {
    try {
      const res = await fetch(
        `${baseUrl}${urls?.locations?.getAllLocations}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ type: 1 }),
        },
      );

      const data = await res.json();
      if (res.ok && data.success) setStatesList(data.data || []);
    } catch (err) {
      console.error("Fetch states error", err);
    }
  };

  const fetchCities = async () => {
    try {
      let states = statesList;
      if (states.length === 0) {
        const resStates = await fetch(
          `${baseUrl}${urls?.locations?.getAllLocations}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({ type: 1 }),
          },
        );
        const dataStates = await resStates.json();
        if (dataStates.success) {
          states = dataStates.data || [];
          setStatesList(states);
        }
      }

      let allCities = [];
      for (const state of states) {
        const res = await fetch(
          `${baseUrl}${urls?.locations?.getAllCity}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              parentId: state._id,
            }),
          },
        );

        const data = await res.json();
        if (res.ok && data.success && data.data) {
          allCities = [...allCities, ...data.data];
        }
      }

      setCitiesList(allCities);
    } catch (err) {
      console.error("Fetch cities error", err);
    }
  };

  const fetchAllShifts = async () => {
    try {
      setLoadingShifts(true);

      const res = await fetch(
        `${baseUrl}${urls?.shift?.getAll}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id: sessionStorage.getItem("userId"),
            page: currentPage,
            limit: 10,
          }),
        },
      );

      const data = await res.json();
      console.log("GET SHIFTS RESPONSE ", data);

      if (!res.ok) {
        alert(data.message || "Failed to fetch shifts");
        setShifts([]);
        return;
      }

      const shiftsArray = Array.isArray(data.data?.shifts)
        ? data.data.shifts
        : [];

      setShifts(shiftsArray);
      setTotalPages(data.data?.totalPages || 1);
      setTotalShifts(data.data?.total || 0);

      // Silently pre-fetch applicant counts for all shifts
      if (shiftsArray.length > 0) {
        prefetchApplicantCounts(shiftsArray);
      }
    } catch (err) {
      console.error("Get shifts error ", err);
      setShifts([]);
    } finally {
      setLoadingShifts(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        `${baseUrl}${urls?.documentType?.documentGetAll}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            referTo: 1,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        alert(data.message || "Failed to fetch documents");
        return;
      }

      setDocuments(data.data || []);
    } catch (err) {
      console.error("Fetch documents error", err);
    }
  };

  const fetchUploadedDocuments = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(
        `${baseUrl}${urls?.document?.getAll}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ id: userId }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        const fetchedDocs = data.data || [];
        setUploadedDocuments(fetchedDocs);
        localStorage.setItem(`uploaded_docs_${userId}`, JSON.stringify(fetchedDocs));
      }
    } catch (err) {
      console.error("Fetch uploaded documents error:", err);
      const cached = localStorage.getItem(`uploaded_docs_${userId}`);
      if (cached) {
        setUploadedDocuments(JSON.parse(cached));
      }
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchUploadedDocuments();
  }, []);

  useEffect(() => {
    if (docTab === "uploaded") fetchUploadedDocuments();
  }, [docTab]);

  const handleUploadClick = () => {
    if (!selectedDocument) return alert("Select document first");
    fileInputRef.current.click();
  };

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
  };

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc);
    setIssuedBy("");
    setIssueDate("");
    setExpiryDate("");
    setSelectedFile(null);
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <aside
        className={`
          bg-[#4039AD] text-white flex flex-col h-screen fixed left-0 top-0 z-50
          transform transition-all duration-300
          ${sidebarOpen ? "translate-x-0 w-[240px]" : "-translate-x-full w-[240px]"}
          md:translate-x-0 ${isSidebarCollapsed ? 'md:w-[80px]' : 'md:w-[260px]'}
        `}
      >
        {/* Desktop Toggle Button floating on the right boundary */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`hidden md:flex absolute ${isSidebarCollapsed ? 'top-8' : 'top-10'} -right-3 z-40 bg-[#4039AD] border border-white/30 text-white rounded-full w-6 h-6 items-center justify-center hover:bg-[#524ac9] transition-all shadow-md focus:outline-none cursor-pointer`}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* TOP SECTION */}
        <div>
          {/* LOGO */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'} pt-6 transition-all duration-300 relative`}>
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Logo"
                className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-14 h-14'} object-contain flex-shrink-0 transition-all duration-300`}
              />
              {!isSidebarCollapsed && (
                <h1 className="text-lg font-bold text-white whitespace-nowrap transition-all duration-300">
                  NetCare Hospitals
                </h1>
              )}
            </div>
            {/* Mobile close button */}
            <button
              className="md:hidden text-white text-xl absolute right-4 top-6"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="mt-3 text-sm">
            {/* Dashboard */}
            <div
              onClick={() => {
                setActivePage("dashboard");
                fetchAllShifts();
              }}
              className={`py-3 cursor-pointer flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-2' : 'px-6 gap-3'
                } ${activePage === "dashboard" ? "bg-white/10" : "opacity-80 hover:bg-white/5"
                }`}
              title={isSidebarCollapsed ? "Dashboard" : ""}
            >
              <MdDashboardCustomize size={18} className="flex-shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </div>

            {/* Manage Shifts */}
            <div
              onClick={() => {
                if (!isUserVerified) {
                  notify(
                    false,
                    "Your application is still under review. Please contact facility admin.",
                  );
                  return;
                }
                setActivePage("shifts");
                setDashboardView("shifts");
                fetchAllShifts();
              }}
              className={`py-3 cursor-pointer flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-2' : 'px-6 gap-3'
                } ${activePage === "shifts" ? "bg-white/10" : "opacity-80 hover:bg-white/5"
                }`}
              title={isSidebarCollapsed ? "Manage Shifts" : ""}
            >
              <FaBriefcase size={16} className="flex-shrink-0" />
              {!isSidebarCollapsed && <span>Manage Shifts</span>}
            </div>

            {/* Documents */}
            <div
              onClick={() => setActivePage("documents")}
              className={`py-3 cursor-pointer flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-2' : 'px-6 gap-3'
                } ${activePage === "documents" ? "bg-white/10" : "opacity-80 hover:bg-white/5"
                }`}
              title={isSidebarCollapsed ? "Documents" : ""}
            >
              <IoDocuments size={18} className="flex-shrink-0" />
              {!isSidebarCollapsed && <span>Documents</span>}
            </div>

            {/* Report Issue */}
            <div
              onClick={() => setActivePage("report")}
              className={`py-3 cursor-pointer flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-2' : 'px-6 gap-3'
                } ${activePage === "report" ? "bg-white/10" : "opacity-80 hover:bg-white/5"
                }`}
              title={isSidebarCollapsed ? "Report an Issue" : ""}
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              {!isSidebarCollapsed && <span>Report an Issue</span>}
            </div>
          </nav>
        </div>

        {currentUser && (
          <div className={`mx-2 mb-6 bg-white/10 rounded-lg text-xs mt-auto transition-all duration-300 ${isSidebarCollapsed ? 'p-2 flex flex-col items-center gap-3' : 'mx-4 p-4'
            }`}>
            {isSidebarCollapsed ? (
              <>
                {currentUser.imageUrl ? (
                  <img
                    src={typeof currentUser.imageUrl === 'object' ? currentUser.imageUrl.url : `${baseUrl}/uploads/${currentUser.imageUrl}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    title={currentUser.fullName}
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${getAvatarColor(currentUser.fullName)}`} title={currentUser.fullName}>
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={handleOpenEditModal}
                  className="text-yellow-300 hover:scale-110 transition-transform"
                  title="Edit Profile"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="text-yellow-300 hover:scale-110 transition-transform"
                  title="Logout"
                >
                  <MdLogout size={16} />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {currentUser.imageUrl ? (
                    <img
                      src={typeof currentUser.imageUrl === 'object' ? currentUser.imageUrl.url : `${baseUrl}/uploads/${currentUser.imageUrl}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      title={currentUser.fullName}
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${getAvatarColor(currentUser.fullName)}`} title={currentUser.fullName}>
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="font-semibold text-white truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-yellow-300 mt-1 text-xs truncate">
                      Hospital Admin
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-1 text-yellow-300"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-1 text-yellow-300 hover:underline"
                  >
                    <MdLogout className="text-sm" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </aside>

      <main className={`flex-1 min-w-0 ${isSidebarCollapsed ? 'md:pl-[112px]' : 'md:pl-[292px]'} py-4 px-4 md:py-8 md:pr-8 md:pl-0 ${activePage === "shifts" && dashboardView === "shifts" ? "h-screen overflow-hidden flex flex-col" : "overflow-y-auto min-h-screen"} transition-all duration-300`}>
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-[#4039AD]"
          >
            ☰
          </button>

          <img src="/logo.png" className="w-28" />
        </div>
        {activePage === "dashboard" && (
          <AnalyticalDashboard />
        )}

        {activePage === "report" && (
          <ReportIssue />
        )}

        {activePage === "shifts" && dashboardView === "shifts" && (
          <ManageShifts
            shiftSearchQuery={shiftSearchQuery}
            setShiftSearchQuery={setShiftSearchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalShifts={totalShifts}
            isUserVerified={isUserVerified}
            setShowPostShiftModal={setShowPostShiftModal}
            shifts={shifts}
            loadingShifts={loadingShifts}
            shiftApplicantCounts={shiftApplicantCounts}
            setSelectedShiftPayRate={setSelectedShiftPayRate}
            setSelectedShiftDate={setSelectedShiftDate}
            setSelectedShiftId={setSelectedShiftId}
            fetchShiftApplications={fetchShiftApplications}
            setDashboardView={setDashboardView}
            handleShiftStatusChange={handleShiftStatusChange}
          />
        )}

        {activePage === "shifts" && dashboardView === "applicants" && (
          <ApplicantsView
            setDashboardView={setDashboardView}
            loadingApplicants={loadingApplicants}
            applicantsData={applicantsData}
            selectedShiftPayRate={selectedShiftPayRate}
            paidApplicationIds={paidApplicationIds}
            fetchHealthcareWorkerById={fetchHealthcareWorkerById}
            startLoading={startLoading}
            endLoading={endLoading}
            handlePunchTime={handlePunchTime}
            handlePaymentSuccess={handlePaymentSuccess}
            approveLoading={approveLoading}
            rejectLoading={rejectLoading}
            handleApplicantAction={handleApplicantAction}
            setSelectedApplicationId={setSelectedApplicationId}
            setSelectedWorkerId={setSelectedWorkerId}
            setApplicationId={setApplicationId}
            setShowFeedbackModal={setShowFeedbackModal}
          />
        )}

        {/* POST NEW SHIFT MODAL */}
        <PostShiftModal
          isOpen={showPostShiftModal}
          onClose={() => setShowPostShiftModal(false)}
          location={location}
          locationId={locationId}
          currentUser={currentUser}
          onSuccess={fetchAllShifts}
        />
        {activePage === "documents" && (
          <DocumentsView
            documents={documents}
            getUploadedDocByType={getUploadedDocByType}
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            getDocumentIcon={getDocumentIcon}
            selectedUploadedDoc={selectedUploadedDoc}
            setIsEditMode={setIsEditMode}
            setUploadDrawerDoc={setUploadDrawerDoc}
            setIssuedBy={setIssuedBy}
            setIssueDate={setIssueDate}
            setExpiryDate={setExpiryDate}
            setSelectedFile={setSelectedFile}
            handleViewFile={handleViewFile}
            fetchDocumentTimeline={fetchDocumentTimeline}
            formatDate={formatDate}
          />
        )}


        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          currentUser={currentUser}
          onSuccess={fetchCurrentUser}
        />
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

                          <button
                            onClick={handleDeleteDocument}
                            disabled={isUploading}
                            className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
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
                  <button
                    onClick={() => handleSubmitDocument("details")}
                    disabled={isUploading}
                    className="w-full bg-[#4039AD] text-white py-3 rounded-xl text-sm mt-3"
                  >
                    Save Details
                  </button>
                )}

                {!isEditMode && (
                  <button
                    onClick={() => handleSubmitDocument()}
                    disabled={isUploading}
                    className="w-full bg-[#4039AD] text-white py-3 rounded-xl text-sm mt-3"
                  >
                    Submit Document
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
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

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        selectedApplicationId={selectedApplicationId}
        selectedWorkerId={selectedWorkerId}
        applicationId={applicationId}
      />
      <div className="col-span-6">
        {showDocumentsPanel && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl w-[1000px] max-h-[90vh] overflow-y-auto relative">
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      workerProfile?.imageUrl
                        ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${workerProfile.imageUrl}`
                        : "https://via.placeholder.com/150"
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[#2563EB]">
                        {workerProfile?.fullName || "--"}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(workerProfile?.verificationStatus)}`}
                      >
                        {workerProfile?.verificationStatus || "Pending"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {workerProfile?.email}
                    </p>
                  </div>
                </div>

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setShowDocumentsPanel(false)}
                  className="text-gray-500 hover:text-black text-xl font-semibold"
                >
                  ✕
                </button>
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
                  <div className="flex items-center justify-center py-16"></div>
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
                          <p className="font-semibold">{workerProfile.email}</p>
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
                          <p className="text-xs text-gray-500 mb-1">GENDER</p>
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
                          <p className="text-xs text-gray-500 mb-1">ADDRESS</p>
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
                        {/* LEFT BANK CARD */}
                        <div className="col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
                          {/* HEADER */}
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

                          {workerProfile.bankData ? (
                            <>
                              {/* GRID */}
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

                              {/* BRANCH IDENTIFIER */}
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
                              {/* Top Grid Section */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Hospital */}
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

                                {/* Designation */}
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

                                {/* Department */}
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

                                {/* Employment */}
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

                                {/* Duration */}
                                <div className="flex items-start gap-3">
                                  <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">
                                      Duration
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                      {new Date(
                                        exp.startDate,
                                      ).toLocaleDateString()}{" "}
                                      —{" "}
                                      {exp.isCurrentlyWorking
                                        ? "Present"
                                        : new Date(
                                          exp.endDate,
                                        ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Divider */}
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
                    {activeProfileTab === "qualification" && (
                      <div className="space-y-6">
                        {/* HEADER */}
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FaGraduationCap className="text-[#4039AD]" />
                            Qualification Details
                          </h3>
                        </div>

                        {/* LIST */}
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
                                  {/* TOP ROW */}
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

                                  {/* GRID CONTENT */}
                                  <div className="grid grid-cols-3 gap-6 text-sm text-gray-700">
                                    {/* Institution */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaUniversity className="text-gray-400" />
                                        Institution
                                      </p>
                                      <p className="font-medium">
                                        {qual.institution}
                                      </p>
                                    </div>

                                    {/* Course */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaBookOpen className="text-gray-400" />
                                        Course
                                      </p>
                                      <p className="font-medium">
                                        {qual.course}
                                      </p>
                                    </div>

                                    {/* Specialization */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                        Specialization
                                      </p>
                                      <p className="font-medium">
                                        {qual.specialization}
                                      </p>
                                    </div>

                                    {/* Duration */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaCalendarAlt className="text-gray-400" />
                                        Duration
                                      </p>
                                      <p className="font-medium">
                                        {qual.startYear} – {qual.endYear}
                                      </p>
                                    </div>

                                    {/* Course Type */}
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

                    {activeProfileTab === "documents" && (
                      <div className="border rounded-xl p-6 space-y-4">
                        {workerProfile?.documentsData?.length === 0 ? (
                          <p className="text-gray-400 text-sm">
                            No documents uploaded
                          </p>
                        ) : (
                          workerProfile?.documentsData?.map((doc) => {
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

                                <div>
                                  {doc.expiryDate
                                    ? new Date(
                                      doc.expiryDate,
                                    ).toLocaleDateString()
                                    : "--"}
                                </div>

                                <div>
                                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
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
      </div>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <MdLogout className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Are you want to logout?
            </h2>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              You'll need to log back in to manage your shifts and view new
              opportunities. We'll be here when you're ready.
            </p>

            {/* BUTTONS */}
            <div className="space-y-4">
              {/* PRIMARY BUTTON */}
              <button
                onClick={async () => {
                  if (isLoggingOut) return;

                  try {
                    setIsLoggingOut(true);

                    const token = sessionStorage.getItem("token");
                    const fcmToken = sessionStorage.getItem("fcmToken");

                    if (fcmToken && token) {
                      await fetch(
                        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_HEALTHCARE_WORKER_UPDATE_FCM_API}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            fcm: fcmToken,
                            type: "Logout",
                          }),
                        },
                      );
                    }

                    sessionStorage.clear();

                    notify(true, "Logged out successfully");
                    setShowLogoutModal(false);

                    setTimeout(() => {
                      navigate("/");
                    }, 800);
                  } catch (err) {
                    console.error("Logout FCM error:", err);
                    notify(false, "Logout failed");
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                disabled={isLoggingOut}
                className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2
    ${isLoggingOut
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }
  `}
              >
                {isLoggingOut && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}

                {isLoggingOut ? "Logging out..." : "Log Out →"}
              </button>

              {/* SECONDARY BUTTON */}
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full border border-gray-300 text-blue-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
