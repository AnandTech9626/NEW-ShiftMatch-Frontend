import React, { useState } from "react";
import { notify } from "../constants/config";
import { AlertCircle, Send, Paperclip } from "lucide-react";
import { reportIssueSchema } from "../schemas/adminSchema";

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Technical Issue",
    priority: "Medium",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({ title: "", description: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ── Zod validation ──
    const result = reportIssueSchema.safeParse({
      title: formData.title,
      description: formData.description,
    });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setFormErrors({
        title: fe.title?.[0] || "",
        description: fe.description?.[0] || "",
      });
      return;
    }
    setFormErrors({ title: "", description: "" });

    setIsSubmitting(true);
    
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      notify(true, "Issue reported successfully! Our support team will contact you soon.");
      setFormData({
        title: "",
        category: "Technical Issue",
        priority: "Medium",
        description: "",
      });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto h-full p-2 md:p-6 flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <AlertCircle className="text-[#4039AD]" />
          Report an Issue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Experiencing a problem? Fill out the form below and our support team will investigate.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/20 focus:border-[#4039AD] transition-all bg-slate-50/50 appearance-none cursor-pointer"
              >
                <option value="Technical Issue">Technical Issue</option>
                <option value="Account Access">Account Access</option>
                <option value="Billing & Payments">Billing & Payments</option>
                <option value="Shift Management">Shift Management</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-1 space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/20 focus:border-[#4039AD] transition-all bg-slate-50/50 appearance-none cursor-pointer"
              >
                <option value="Low">Low (Not urgent)</option>
                <option value="Medium">Medium (Needs attention)</option>
                <option value="High">High (Blocking work)</option>
                <option value="Critical">Critical (System down)</option>
              </select>
            </div>
            
            <div className="md:col-span-1 space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/20 focus:border-[#4039AD] transition-all bg-slate-50/50 ${formErrors.title ? "border-red-400 ring-2 ring-red-400" : "border-gray-200"}`}
              />
              {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue in detail, including steps to reproduce it..."
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/20 focus:border-[#4039AD] transition-all bg-slate-50/50 resize-y ${formErrors.description ? "border-red-400 ring-2 ring-red-400" : "border-gray-200"}`}
            />
            {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Paperclip size={16} />
              Attach Screenshot
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2 rounded-lg bg-[#0D215C] hover:bg-[#08153A] text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3 text-sm text-blue-800">
        <AlertCircle className="flex-shrink-0 text-blue-600" size={18} />
        <div>
          <span className="font-semibold mr-2">Need urgent help?</span>
          <span className="opacity-90">Call our 24/7 support line at +1 (800) 555-0199.</span>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
