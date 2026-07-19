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