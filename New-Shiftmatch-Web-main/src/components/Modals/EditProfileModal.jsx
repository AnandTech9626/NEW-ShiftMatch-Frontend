import React, { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { baseUrl, urls, notify } from "../../constants/config";
import { addressSchema } from "../../schemas/addressSchema";

const EditProfileModal = ({ isOpen, onClose, currentUser, onSuccess }) => {
  const [editProfileData, setEditProfileData] = useState({
    fullName: "",
    email: "",
    roleName: "",
    state: "",
    city: "",
    area: "",
    street: "",
    pincode: "",
    country: "",
  });
  
  const [addressErrors, setAddressErrors] = useState({});
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const profileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setEditProfileData({
        fullName: currentUser.fullName || "",
        email: currentUser.email || "",
        roleName: currentUser.roleName || "",
        state: currentUser.addressData?.stateId || "",
        city: currentUser.addressData?.cityId || "",
        area: currentUser.addressData?.addressLine1 || "",
        street: currentUser.addressData?.addressLine2 || "",
        pincode: currentUser.addressData?.postalCode || "",
        country: currentUser.addressData?.country || "",
      });
      fetchStates();
      fetchCities();
    }
  }, [isOpen, currentUser]);

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
      if (onSuccess) onSuccess();
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
          }
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
        onClose();
        setSelectedProfileImage(null);
        if (onSuccess) onSuccess();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[750px] max-h-[90vh] overflow-y-auto">
        {/* HEADER PROFILE SECTION */}
        <div className="flex items-center gap-4 p-6 border-b">
          <div className="relative w-16 h-16 flex-shrink-0">
            {selectedProfileImage || currentUser?.imageUrl ? (
              <img
                src={
                  selectedProfileImage
                    ? URL.createObjectURL(selectedProfileImage)
                    : (typeof currentUser?.imageUrl === "object"
                      ? currentUser?.imageUrl?.url
                      : `${baseUrl}${urls.fileUrls.userProfile}${currentUser?._id}/${currentUser?.imageUrl}`)
                }
                alt="Profile"
                onClick={() => !isUploadingImage && profileInputRef.current.click()}
                className={`w-16 h-16 rounded-full object-cover border-4 border-[#4039AD] cursor-pointer ${isUploadingImage ? 'opacity-50' : ''}`}
              />
            ) : (
              <div
                onClick={() => !isUploadingImage && profileInputRef.current.click()}
                className={`w-16 h-16 rounded-full border-4 border-[#4039AD] bg-slate-100 flex flex-col items-center justify-center cursor-pointer text-slate-400 select-none text-[9px] font-bold text-center leading-tight hover:bg-slate-200 transition-colors ${isUploadingImage ? 'opacity-50' : ''}`}
              >
                <span>No</span>
                <span>Profile</span>
              </div>
            )}

            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/25">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => profileInputRef.current.click()}
              className="absolute -bottom-1 -right-1 bg-[#4039AD] text-white p-1 rounded-full border-2 border-white hover:bg-[#342e8f] transition shadow-sm flex items-center justify-center disabled:opacity-50"
              title="Upload Profile Picture"
            >
              <FaCamera size={10} />
            </button>
          </div>

          <input
            type="file"
            ref={profileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0]) {
                handleUploadProfileImage(e.target.files[0]);
              }
            }}
          />

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {editProfileData.fullName}
            </h2>
            <p className="text-sm text-[#4039AD] font-medium">
              {editProfileData.roleName}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {editProfileData.email}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-6">
            Address Information
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* STATE */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">State</label>
              <select
                value={editProfileData.state}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData,
                    state: e.target.value,
                  })
                }
                className={`border w-full px-3 py-2 rounded-lg outline-none focus:ring-2 ${addressErrors.state ? 'border-red-400 focus:ring-red-200' : 'focus:ring-indigo-100'}`}
              >
                <option value="">Select State</option>
                {statesList.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))}
              </select>
              {addressErrors.state && <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>}
            </div>

            {/* CITY */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">City</label>
              <select
                value={editProfileData.city}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData,
                    city: e.target.value,
                  })
                }
                className={`border w-full px-3 py-2 rounded-lg outline-none focus:ring-2 ${addressErrors.city ? 'border-red-400 focus:ring-red-200' : 'focus:ring-indigo-100'}`}
                disabled={!editProfileData.state}
              >
                <option value="">Select City</option>
                {citiesList
                  .filter(
                    (city) =>
                      city.parentId === editProfileData.state ||
                      city.parentId?._id === editProfileData.state,
                  )
                  .map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
              </select>
              {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Street Address Line 1</label>
              <input
                type="text"
                placeholder="e.g. Downtown"
                value={editProfileData.area}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData,
                    area: e.target.value,
                  })
                }
                className={`border w-full px-3 py-2 rounded-lg outline-none focus:ring-2 ${addressErrors.area ? 'border-red-400 focus:ring-red-200' : 'focus:ring-indigo-100'}`}
              />
              {addressErrors.area && <p className="text-red-500 text-xs mt-1">{addressErrors.area}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Street Address Line 2</label>
              <input
                type="text"
                placeholder="e.g. 123 Main St"
                value={editProfileData.street}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData,
                    street: e.target.value,
                  })
                }
                className={`border w-full px-3 py-2 rounded-lg outline-none focus:ring-2 ${addressErrors.street ? 'border-red-400 focus:ring-red-200' : 'focus:ring-indigo-100'}`}
              />
              {addressErrors.street && <p className="text-red-500 text-xs mt-1">{addressErrors.street}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Zip Code</label>
              <input
                type="text"
                placeholder="e.g. 10001"
                value={editProfileData.pincode}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData,
                    pincode: e.target.value,
                  })
                }
                className={`border w-full px-3 py-2 rounded-lg outline-none focus:ring-2 ${addressErrors.pincode ? 'border-red-400 focus:ring-red-200' : 'focus:ring-indigo-100'}`}
              />
              {addressErrors.pincode && <p className="text-red-500 text-xs mt-1">{addressErrors.pincode}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Country</label>
              <input
                type="text"
                placeholder="e.g. USA"
                value={editProfileData.country}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData,
                    country: e.target.value,
                  })
                }
                className={`border w-full px-3 py-2 rounded-lg outline-none focus:ring-2 ${addressErrors.country ? 'border-red-400 focus:ring-red-200' : 'focus:ring-indigo-100'}`}
              />
              {addressErrors.country && <p className="text-red-500 text-xs mt-1">{addressErrors.country}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10 border-t pt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-lg text-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="px-6 py-2 bg-[#4039AD] text-white rounded-lg text-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSavingProfile ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : currentUser?.addressData?._id ? "Update Changes" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
