import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { baseUrl, notify, urls } from "../../constants/config";

const incidentCategories = [
  {
    title: "Agency Staff Involved in Professional Misconduct Incidents",
    items: [
      "Abuse of company property",
      "Improper dress code",
      "Absconding",
      "Negligence",
      "Not adhering to hospital policy",
      "Sleeping on duty",
      "Substance abuse",
      "Theft of company belongings",
      "Total Number of Professional Misconduct Incidents Reported",
      "Total Number of Professional Misconduct Incidents (Included Reported and Actioned)"
    ]
  },
  {
    title: "Patient Incidents",
    items: [
      "IV-related phlebitis",
      "Medication Error",
      "Slip and Fall (Patient)",
      "Procedure-related Incidents (Nursing)",
      "Total Number of Patient Incidents",
      "Total Number of Patient Incidents involving Agency Staff",
      "Total Number of Agency Staff Involved in Patient Incidents"
    ]
  },
  {
    title: "Agency Involved in Patient Complaints",
    items: [
      "Total Number of P2 Complaints involving Agency Staff (Reported)",
      "Total Number of P3 Complaints involving Agency Staff (Reported)",
      "Total Number of All Complaints involving Agency Staff (Reported)",
      "Total Number of Agency Staff Involved in P2 Complaints"
    ]
  }
];

const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  selectedApplicationId, 
  selectedWorkerId, 
  applicationId 
}) => {
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [selectedOffences, setSelectedOffences] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const toggleOffence = (option) => {
    setSelectedOffences((prev) => 
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSubmitFeedback = async () => {
    if (submittingFeedback) return;

    try {
      setSubmittingFeedback(true);

      const res = await fetch(
        `${baseUrl}${urls.review.create}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            shiftId: selectedApplicationId,
            reviewerId: sessionStorage.getItem("userId"),
            reviewerType: "facility",
            targetId: selectedWorkerId,
            targetType: "worker",
            rating: feedbackRating,
            message: feedbackMessage,
            shiftApplicationId: applicationId,
            ...(selectedOffences.length > 0 && { incidentTypes: selectedOffences }),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Feedback failed");
        return;
      }

      notify(true, "Feedback submitted");

      // Reset local state
      setFeedbackRating(0);
      setFeedbackMessage("");
      setSelectedOffences([]);
      
      // Close modal
      onClose();
    } catch (err) {
      notify(false, "Server error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleClose = () => {
    setFeedbackRating(0);
    setFeedbackMessage("");
    setSelectedOffences([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[640px] rounded-3xl shadow-2xl p-8 relative">
        {/* CLOSE */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors text-2xl"
        >
          ✕
        </button>

        {/* TITLE */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Submit Your Feedback</h2>
        </div>

        {/* STARS */}
        <div className="flex justify-center gap-4 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => {
                if (feedbackRating !== star) {
                  setFeedbackRating(star);
                  setSelectedOffences([]);
                }
              }}
              className={`text-5xl transition-colors hover:scale-110 duration-200 ${
                star <= feedbackRating
                  ? (feedbackRating === 5 ? "text-green-500"
                    : feedbackRating === 4 ? "text-blue-500"
                    : feedbackRating === 3 ? "text-yellow-500"
                    : feedbackRating === 2 ? "text-orange-500"
                    : "text-red-500")
                  : "text-gray-200"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* RATING DESCRIPTION */}
        <div className="h-6 flex items-center justify-center mb-4">
          {feedbackRating === 5 && <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">Excellent performance</span>}
          {feedbackRating === 4 && <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full">Meets expectations</span>}
          {feedbackRating === 3 && <span className="text-yellow-600 font-bold text-sm bg-yellow-50 px-3 py-1 rounded-full">Improvement needed</span>}
        </div>

        {/* MESSAGE */}
        <textarea
          placeholder="Your Message..."
          value={feedbackMessage}
          rows={3}
          onChange={(e) => setFeedbackMessage(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-4 text-base mb-4 focus:outline-none focus:border-[#4039AD] focus:ring-1 focus:ring-[#4039AD] transition-all resize-none shadow-sm"
        />

        {/* INCIDENT CHECKLIST FOR 1 OR 2 STARS */}
        {(feedbackRating === 1 || feedbackRating === 2) && (
          <div className="mb-4 border rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-red-50 text-red-700 px-4 py-2 border-b font-semibold text-sm">
              {feedbackRating === 1 ? "Major Incident Under Investigation" : "Minor Incident Under Investigation"}
            </div>
            <div className="p-2 max-h-48 overflow-y-auto space-y-2">
              <p className="text-xs text-gray-500 px-2 pb-1">Please select all offences that apply:</p>
              {incidentCategories.map((category, catIdx) => (
                <div key={catIdx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === catIdx ? null : catIdx)}
                    className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors text-left"
                  >
                    <span className="font-semibold text-sm text-gray-800">{category.title}</span>
                    {expandedCategory === catIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedCategory === catIdx && (
                    <div className="p-2 space-y-1 bg-white border-t border-gray-100">
                      {category.items.map((item, idx) => (
                        <label
                          key={idx}
                          className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border border-transparent
                            ${selectedOffences.includes(item) ? "bg-red-50/50 border-red-100" : "hover:bg-gray-50"}
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOffences.includes(item)}
                            onChange={() => toggleOffence(item)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 flex-shrink-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 block leading-tight">{item}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSubmitFeedback}
          disabled={submittingFeedback}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2
            ${submittingFeedback ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"}
            text-white font-bold text-lg hover:shadow-lg transition-all
          `}
        >
          {submittingFeedback && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
