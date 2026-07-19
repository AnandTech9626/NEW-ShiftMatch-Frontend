import React, { useEffect, useState } from "react";
import { baseUrl, notify, urls } from "../../constants/config";
import { FiEdit } from "react-icons/fi";
import {
  MapPin,
  Plus,
  Trash2,
  X,
  Settings,
  MapPinned,
  Check
} from "lucide-react";
import { locationStateSchema, locationCitySchema } from "../../schemas/adminSchema";

const Locations = () => {
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTab, setAddTab] = useState("state"); // state | city
  const [newStateName, setNewStateName] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");

  // Manage State / City Edit States
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [editName, setEditName] = useState("");
  const [inlineError, setInlineError] = useState("");

  // Manage Cities Modal (Detailed View)
  const [showManageCitiesModal, setShowManageCitiesModal] = useState(false);
  const [activeManageState, setActiveManageState] = useState(null);
  const [modalNewCityName, setModalNewCityName] = useState("");
  const [locationErrors, setLocationErrors] = useState({ stateName: "", cityName: "", stateId: "" });

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
          body: JSON.stringify({
            type: 1,
          }),
        },
      );

      const data = await res.json();
      if (data.success) {
        setStatesList(data.data || []);
      }
    } catch (err) {
      console.error("Fetch states error:", err);
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
        if (data.success && data.data) {
          allCities = [...allCities, ...data.data];
        }
      }

      setCitiesList(allCities);
    } catch (err) {
      console.error("Fetch cities error:", err);
    }
  };

  const handleCreateState = async () => {
    // ── Zod validation ──
    const result = locationStateSchema.safeParse({ stateName: newStateName });
    if (!result.success) {
      setLocationErrors((p) => ({ ...p, stateName: result.error.flatten().fieldErrors.stateName?.[0] || "" }));
      return;
    }
    setLocationErrors((p) => ({ ...p, stateName: "" }));

    try {
      const res = await fetch(
        `${baseUrl}${urls?.locations?.createState}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: newStateName.trim(),
          }),
        },
      );

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        notify(false, data?.message || "Failed to create state");
        return;
      }

      notify(true, "State created successfully");
      setNewStateName("");
      setShowAddModal(false);
      fetchStates();
    } catch (err) {
      console.error("Create state error:", err);
      notify(false, "Error creating state");
    }
  };

  const handleCreateCity = async (stateId = null, cityNameValue = null) => {
    const targetStateId = stateId || selectedStateId;
    const targetCityName = cityNameValue || newCityName;

    // ── Zod validation ──
    const result = locationCitySchema.safeParse({ cityName: targetCityName, stateId: targetStateId || "dummy" });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setLocationErrors((p) => ({ ...p, cityName: fe.cityName?.[0] || "", stateId: fe.stateId?.[0] || "" }));
      return;
    }
    setLocationErrors((p) => ({ ...p, cityName: "", stateId: "" }));

    try {
      const res = await fetch(
        `${baseUrl}${urls?.locations?.createCity}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: targetCityName.trim(),
            parentId: targetStateId
          }),
        },
      );

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        notify(false, data?.message || "Failed to create city");
        return;
      }

      notify(true, "City created successfully");

      if (stateId) {
        setModalNewCityName("");
      } else {
        setNewCityName("");
        setSelectedStateId("");
        setShowAddModal(false);
      }
      fetchCities();
    } catch (err) {
      console.error("Create city error:", err);
      notify(false, "Error creating city");
    }
  };

  const handleUpdateLocation = async (id, newName, isState = false, parentId = null) => {
    setInlineError("");
    const parentIdStr = typeof parentId === 'object' && parentId !== null ? parentId._id : parentId;

    if (isState) {
      const result = locationStateSchema.safeParse({ stateName: newName });
      if (!result.success) {
        setInlineError(result.error.flatten().fieldErrors.stateName?.[0] || "Invalid state name");
        return;
      }
    } else {
      const result = locationCitySchema.safeParse({ cityName: newName, stateId: parentIdStr || "dummy" });
      if (!result.success) {
        setInlineError(result.error.flatten().fieldErrors.cityName?.[0] || "Invalid city name");
        return;
      }
    }

    try {
      const url = isState
        ? `${baseUrl}${urls?.locations?.updateState || "api/location/updateState"}`
        : `${baseUrl}${urls?.locations?.updateCity || "api/location/updateCity"}`;

      const body = isState
        ? { id, name: newName.trim() }
        : { id, name: newName.trim(), parentId };

      const res = await fetch(
        url,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        notify(false, data?.message || "Failed to update location");
        return;
      }
      notify(true, isState ? "State updated successfully" : "City updated successfully");

      // Immediately update local state so UI refreshes without waiting for re-fetch
      if (isState) {
        setStatesList((prev) =>
          prev.map((s) => (s._id === id ? { ...s, name: newName.trim() } : s))
        );
      } else {
        setCitiesList((prev) =>
          prev.map((c) => (c._id === id ? { ...c, name: newName.trim() } : c))
        );
      }

      setEditingLocationId(null);
      setEditName("");
    } catch (err) {
      console.error(err);
      notify(false, "Error updating location");
    }
  };

  const handleDeleteLocation = async (id, isState = false) => {
    const confirmMessage = isState
      ? "Are you sure you want to delete this state? All associated cities will also be deleted."
      : "Are you sure you want to delete this city?";

    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      const res = await fetch(
        `${baseUrl}${urls?.locations?.deleteLocation || "api/location/delete"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id: id,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        notify(false, data?.message || "Failed to delete location");
        return;
      }
      notify(true, "Location deleted successfully");
      fetchStates();
      fetchCities();
    } catch (err) {
      console.error(err);
      notify(false, "Error deleting location");
    }
  };

  useEffect(() => {
    fetchStates();
    fetchCities();
  }, []);

  const getStateTheme = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("gauteng")) {
      return {
        icon: <MapPin className="w-5 h-5 text-indigo-600" />,
        bg: "bg-indigo-50",
      };
    } else if (n.includes("western cape")) {
      return {
        icon: <MapPin className="w-5 h-5 text-sky-600" />,
        bg: "bg-sky-50",
      };
    } else if (n.includes("kwazulu")) {
      return {
        icon: <MapPin className="w-5 h-5 text-blue-600" />,
        bg: "bg-blue-50",
      };
    } else if (n.includes("mpumalanga")) {
      return {
        icon: <MapPin className="w-5 h-5 text-emerald-600" />,
        bg: "bg-emerald-50",
      };
    } else if (n.includes("eastern cape")) {
      return {
        icon: <MapPin className="w-5 h-5 text-cyan-600" />,
        bg: "bg-cyan-50",
      };
    } else if (n.includes("free state")) {
      return {
        icon: <MapPin className="w-5 h-5 text-teal-600" />,
        bg: "bg-teal-50",
      };
    } else {
      const themes = [
        { icon: <MapPin className="w-5 h-5 text-violet-600" />, bg: "bg-violet-50" },
        { icon: <MapPin className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50" },
        { icon: <MapPin className="w-5 h-5 text-rose-600" />, bg: "bg-rose-50" },
      ];
      let hash = 0;
      for (let i = 0; i < n.length; i++) {
        hash = n.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % themes.length;
      return themes[index];
    }
  };

  const formatCount = (count) => {
    return count < 10 ? `0${count}` : `${count}`;
  };

  return (
    <div className="bg-[#f8fafc] p-6 h-[85vh] flex flex-col overflow-hidden">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Locations</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage and monitor organizational expansion across regions.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* STATS CARDS */}
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-2.5 min-w-[130px] shadow-sm flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Total States
            </span>
            <span className="text-2xl font-bold text-[#4039AD] mt-0.5">
              {formatCount(statesList.length)}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl px-5 py-2.5 min-w-[130px] shadow-sm flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Active Cities
            </span>
            <span className="text-2xl font-bold text-teal-600 mt-0.5">
              {formatCount(citiesList.length)}
            </span>
          </div>

          <button
            onClick={() => {
              setNewStateName("");
              setShowAddModal(true);
            }}
            className="bg-[#4039AD] hover:bg-[#342e8f] text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all duration-300 ml-auto md:ml-0"
          >
            <Plus size={16} />
            <span>Add State</span>
          </button>
        </div>
      </div>

      {/* STATE CARDS GRID */}
      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
        {statesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-2xl">
            <MapPinned className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-700">No Locations Configured</h3>
            <p className="text-slate-400 text-sm mt-1 mb-4">Get started by creating your first state.</p>
            <button
              onClick={() => {
                setNewStateName("");
                setShowAddModal(true);
              }}
              className="bg-[#4039AD] text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              Add State
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {statesList.map((state) => {
              const stateCities = citiesList.filter(
                (city) =>
                  city.parentId === state._id ||
                  city.parentId?._id === state._id
              );

              const theme = getStateTheme(state.name);
              const isEditing = editingLocationId === state._id;

              return (
                <div
                  key={state._id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 flex-1">
                    {/* CARD HEADER */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl ${theme.bg} flex items-center justify-center shadow-sm`}>
                          {theme.icon}
                        </div>

                        <div>
                          {isEditing ? (
                            <div className="flex flex-col relative">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => {
                                    setEditName(e.target.value);
                                    setInlineError("");
                                  }}
                                  className={`border rounded px-2 py-0.5 text-sm w-36 font-semibold outline-none focus:ring-1 ${inlineError ? "border-red-400 focus:ring-red-400" : "border-slate-300 focus:ring-[#4039AD]"}`}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateLocation(state._id, editName, true)}
                                  className="text-green-600 hover:text-green-700 p-0.5"
                                  title="Save"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingLocationId(null);
                                    setInlineError("");
                                  }}
                                  className="text-red-500 hover:text-red-600 p-0.5"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              {inlineError && (
                                <p className="text-red-500 text-[10px] mt-0.5 absolute top-full left-0 whitespace-nowrap">{inlineError}</p>
                              )}
                            </div>
                          ) : (
                            <h3 className="font-bold text-slate-800 hover:text-[#4039AD] transition-colors">
                              {state.name}
                            </h3>
                          )}
                          <p className="text-slate-400 text-xs mt-0.5 font-medium">
                            South Africa &bull; {stateCities.length} Cities
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          onClick={() => {
                            setEditingLocationId(state._id);
                            setEditName(state.name);
                            setInlineError("");
                          }}
                          className="text-black hover:text-[#4039AD] p-1 rounded hover:bg-slate-50 transition-colors"
                          title="Edit State Name"
                        >
                          <FiEdit size={15} />
                        </button>
                      </div>
                    </div>

                    {/* CITY CHIPS LIST */}
                    <div className="flex flex-wrap gap-2 min-h-[50px] items-center">
                      {stateCities.slice(0, 3).map((city) => (
                        <span
                          key={city._id}
                          className="bg-indigo-50/70 border border-indigo-100/50 text-[#4039AD] px-3 py-1 rounded-full text-xs font-semibold select-none"
                        >
                          {city.name}
                        </span>
                      ))}

                      {stateCities.length > 3 && (
                        <button
                          onClick={() => {
                            setActiveManageState(state);
                            setModalNewCityName("");
                            setShowManageCitiesModal(true);
                          }}
                          className="bg-slate-100/80 hover:bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                        >
                          +{stateCities.length - 3} more
                        </button>
                      )}

                      {stateCities.length === 0 && (
                        <p className="text-slate-400 text-xs italic font-medium pt-2">
                          No cities added yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* MANAGE CITIES FOOTER BUTTON */}
                  <button
                    onClick={() => {
                      setActiveManageState(state);
                      setModalNewCityName("");
                      setShowManageCitiesModal(true);
                    }}
                    className="flex items-center justify-center gap-2 text-xs font-bold text-[#4039AD] hover:text-[#342e8f] py-3.5 border-t border-slate-100 hover:bg-slate-50 transition-all duration-300 w-full"
                  >
                    <Settings size={13} />
                    <span>Manage Cities</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE STATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-6">
              Add New State
            </h3>

            {/* NAME INPUT */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                State Name
              </label>

              <input
                type="text"
                value={newStateName}
                onChange={(e) => { setNewStateName(e.target.value); setLocationErrors((p) => ({ ...p, stateName: "" })); }}
                className={`border w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4039AD] transition-colors ${locationErrors.stateName ? "border-red-400 ring-2 ring-red-400" : "border-slate-200"}`}
                placeholder="Enter state name"
              />
              {locationErrors.stateName && <p className="text-red-500 text-xs mt-1 pl-1">{locationErrors.stateName}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateState}
                className="flex-1 bg-[#4039AD] hover:bg-[#342e8f] text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE CITIES DETAILED MODAL */}
      {showManageCitiesModal && activeManageState && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-[500px] max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowManageCitiesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"
            >
              <X size={18} />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Manage Cities
              </h3>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">
                State: <span className="text-[#4039AD] font-semibold">{activeManageState.name}</span>
              </p>
            </div>

            {/* ADD CITY IN-LINE FORM */}
            <div className="mb-4 w-full">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  value={modalNewCityName}
                  onChange={(e) => {
                    setModalNewCityName(e.target.value);
                    setLocationErrors((p) => ({ ...p, cityName: "" }));
                  }}
                  className={`border flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-[#4039AD] ${locationErrors.cityName ? 'border-red-400 ring-2 ring-red-400' : 'border-slate-200'}`}
                  placeholder="Enter city name"
                />
                <button
                  onClick={() => handleCreateCity(activeManageState._id, modalNewCityName)}
                  className="bg-[#4039AD] hover:bg-[#342e8f] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
              {locationErrors.cityName && (
                <p className="text-red-500 text-[10px] mt-1 pl-1">{locationErrors.cityName}</p>
              )}
            </div>

            {/* CITIES LIST */}
            <div className="flex-1 overflow-y-auto mb-4 border border-slate-100 rounded-xl divide-y divide-slate-100 no-scrollbar">
              {citiesList.filter(
                (city) =>
                  city.parentId === activeManageState._id ||
                  city.parentId?._id === activeManageState._id
              ).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">
                  No cities found for this state.
                </p>
              ) : (
                citiesList
                  .filter(
                    (city) =>
                      city.parentId === activeManageState._id ||
                      city.parentId?._id === activeManageState._id
                  )
                  .map((city) => {
                    const isCityEditing = editingLocationId === city._id;

                    return (
                      <div
                        key={city._id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50"
                      >
                        {isCityEditing ? (
                          <div className="flex flex-col relative">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => {
                                  setEditName(e.target.value);
                                  setInlineError("");
                                }}
                                className={`border rounded px-2.5 py-1 text-sm w-44 font-medium outline-none focus:ring-1 ${inlineError ? "border-red-400 focus:ring-red-400" : "border-slate-300 focus:ring-[#4039AD]"}`}
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateLocation(city._id, editName, false, city.parentId || activeManageState?._id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingLocationId(null);
                                  setInlineError("");
                                }}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            {inlineError && (
                              <p className="text-red-500 text-[10px] mt-0.5 absolute top-full left-0 whitespace-nowrap">{inlineError}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-700 text-sm font-medium">
                            {city.name}
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingLocationId(city._id);
                              setEditName(city.name);
                              setInlineError("");
                            }}
                            className="text-black hover:text-[#4039AD] p-1 rounded"
                            title="Edit City"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(city._id, false)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded"
                            title="Delete City"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <button
              onClick={() => setShowManageCitiesModal(false)}
              className="w-full border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
