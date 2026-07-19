import "react-toastify/dist/ReactToastify.css";

import { toast, Zoom } from "react-toastify";

export const baseUrl = import.meta.env.VITE_API_BASE_URL;
export const urls = {
  authentication: {
    login: "api/authentication/login",
    forgetPassword: "api/authentication/forgotPassword",
    resetPassword: "api/authentication/resetPassword",
    register: "api/authentication/register",

  },

  users: {
    updateFcm: "api/user/updateFcm",
    getCurrentUser: "api/user/getCurrentUser",
    getUsers: "api/user/getAll",
    updateProfile: "api/user/updateProfile/",
    userVerify: "api/user/verify",
  },

  otps: {
    verifyOtp: "api/otp/verifyOtp",
    resendOtp: "api/otp/resendOtp",
    generateRegisterOtps: "api/otp/generateRegisterOtps",
  },

  designations: {
    getAllDesignations: "api/designation/getAll",
    createDesignations: "api/designation/create",
    updateDesignations: "api/designation/update",
  },

  locations: {
    getAllLocations: "api/location/getAllLocations",
    createState: "api/location/createState",
    createCity: "api/location/createCity",
    getAllCity: "api/location/getAllCity",
    updateCity: "api/location/updateCity",
    updateState: "api/location/updateState"
  },

  department: {
    departmentGetAll: "api/department/getAll",
    createDepartment: "api/department/create",
    updateDepartment: "api/department/update",
  },

  documentType: {
    documentGetAll: "api/documentType/getAll",
    createDocumentType: "api/documentType/create",
    updateDocumentType: "api/documentType/update",
  },
  fileUrls: {
    userProfile: "uploads/profile/",
    documents: "uploads/documents/",
  },

  address: {
    create: "api/address/create",
    update: "api/address/update",
    getByUserId: "api/address/getByUserId",
  },

  document: {
    upload: "api/document/upload/",
    getAll: "api/document/getAll",
    updateFile: "api/document/updateFile",
    updateDetails: "api/document/updateDetails",
    verify: "api/document/verify",
  },
  investigation: {
    getAll: "api/investigation/getAll",
  },
  shift: {
    create: "api/shift/create",
    getAll: "api/shift/getAllWeb",
    updateStatus: "api/shift/updateStatus",
    getDashboard: "api/shift/getDashboard"
  },
  shiftApplicant: {
    getRecentApplicants: "api/shiftApplication/getrecentApplicants",
    getById: "api/shiftApplication/getById",
    action: "api/shiftApplication/action",
    punchTime: "api/shiftApplication/punchTime"
  },
  superAdmin: {
    getAnalytics: "api/superAdmin/getAnalytics"
  },
  documentActivity: {
    activities: "api/documentActivity/activities",
    timeline: "api/documentActivity/timeline"
  },
  review: {
    create: "api/review/create"
  }

  // healthCareWorker: {
  //   signup: "api/healthCareWorker/signup",
  // },

  // documentType: {
  //   getAll: "api/documentType/getAll",
  // },

  // shift: {
  //   create: "api/shift/create",
  //   getAll: "api/shift/getAll",
  // },

  // document: {
  //   upload: "api/document/upload",
  //   getAll: "api/document/getAll",
  //   verify: "api/document/verify",
  // },

};
export const notify = (status, msg) => {
  const toastOptions = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Zoom,
    style: {
      width: "300px",
    },
  };

  // Handle array of validation messages — show each as a toast
  if (Array.isArray(msg)) {
    msg.forEach((m) => {
      if (status == true) {
        toast.success(m, toastOptions);
      } else {
        toast.error(m, toastOptions);
      }
    });
    return;
  }

  if (status == true) {
    toast.success(msg, toastOptions);
  } else {
    toast.error(msg || "Something went wrong", toastOptions);
  }
};

export const colors = {
  success: "#fff"
}