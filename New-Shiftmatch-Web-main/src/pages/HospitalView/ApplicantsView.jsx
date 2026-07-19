import React from "react";
import { baseUrl } from "../../constants/config";
import PayNowButton from "../../components/PayNowButton";

const ApplicantsView = ({
  setDashboardView,
  loadingApplicants,
  applicantsData,
  selectedShiftPayRate,
  paidApplicationIds,
  fetchHealthcareWorkerById,
  startLoading,
  endLoading,
  handlePunchTime,
  handlePaymentSuccess,
  approveLoading,
  rejectLoading,
  handleApplicantAction,
  setSelectedApplicationId,
  setSelectedWorkerId,
  setApplicationId,
  setShowFeedbackModal,
}) => {
  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setDashboardView("shifts")}
          className="px-4 py-2 bg-[#4A42B8] rounded-lg text-sm text-white"
        >
          ← Go Back to Shifts
        </button>

        <h2 className="text-xl font-semibold">Shift Applicants</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 overflow-x-auto">
        {loadingApplicants ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : applicantsData.length === 0 ? (
          <p className="text-gray-500 text-sm">No applicants found</p>
        ) : (
          <>
            {(() => {
              return (
                <div className="overflow-x-auto border rounded-xl">
                  <table className="min-w-[900px] w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-gray-600 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 text-left">Applicant</th>
                        <th className="px-6 py-4 text-left whitespace-nowrap">
                          Start Time
                        </th>
                        <th className="px-6 py-4 text-left whitespace-nowrap">
                          End Time
                        </th>
                        <th className="px-6 py-4 text-left">Duration</th>
                        <th className="px-6 py-4 text-left">Pay Rate</th>
                        <th className="px-6 py-4 text-left">Total</th>
                        <th className="px-6 py-4 text-left">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {applicantsData.map((app) => {
                        const applicantId =
                          app._id || app.applicationId || app.id;
                        const hasStarted = !!app.startTime;
                        const hasEnded = !!app.endTime;
                        const shiftCompleted = hasStarted && hasEnded;
                        let durationMinutes = 0;
                        let totalAmount = 0;

                        if (shiftCompleted) {
                          const start = new Date(app.startTime);
                          const end = new Date(app.endTime);

                          durationMinutes = Math.floor(
                            (end - start) / (1000 * 60)
                          );

                          const payPerMinute = selectedShiftPayRate / 60;
                          totalAmount = durationMinutes * payPerMinute;
                        }

                        const paymentCompleted = Boolean(
                          app.paymentCompleted ||
                            (applicantId &&
                              paidApplicationIds.includes(applicantId))
                        );
                        const showPayButton =
                          shiftCompleted &&
                          !paymentCompleted &&
                          totalAmount > 0;

                        if (shiftCompleted) {
                          const start = new Date(app.startTime);
                          const end = new Date(app.endTime);

                          durationMinutes = Math.floor(
                            (end - start) / (1000 * 60)
                          );

                          const payPerMinute = selectedShiftPayRate / 60;

                          totalAmount = durationMinutes * payPerMinute;
                        }

                        return (
                          <tr
                            key={
                              applicantId ||
                              app._id ||
                              app.userData?.email ||
                              Math.random()
                            }
                            className="hover:bg-gray-50 transition"
                          >
                            {/* APPLICANT */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                  {app.userData?.imageUrl ? (
                                    <img
                                      src={
                                        typeof app.userData.imageUrl === "object"
                                          ? app.userData.imageUrl.url
                                          : `${baseUrl}/uploads/${app.userData.imageUrl}`
                                      }
                                      alt={app.userData.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-semibold text-gray-600">
                                      {app.userData?.fullName
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <p
                                    onClick={() =>
                                      fetchHealthcareWorkerById({
                                        _id: app.workerId,
                                      })
                                    }
                                    className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
                                  >
                                    {app.userData?.fullName}
                                  </p>

                                  {shiftCompleted && (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                      Shift Completed
                                    </span>
                                  )}
                                  {paymentCompleted && (
                                    <span className="inline-block mt-1 ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                      Paid
                                    </span>
                                  )}
                                  {!paymentCompleted &&
                                    shiftCompleted &&
                                    totalAmount === 0 && (
                                      <span className="inline-block mt-1 ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-700">
                                        No Payment Required
                                      </span>
                                    )}
                                </div>
                              </div>
                            </td>

                            {/* START */}
                            <td className="px-6 py-4">
                              {hasStarted ? (
                                new Date(app.startTime)
                                  .toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                  .toUpperCase()
                              ) : (
                                <button
                                  disabled={
                                    startLoading === app._id ||
                                    app.status !== "Approved" ||
                                    !!app.startTime
                                  }
                                  onClick={() =>
                                    handlePunchTime(app, "PunchIn")
                                  }
                                  className={`px-3 py-1 rounded text-xs text-white flex items-center gap-1
                                ${
                                  app.status !== "Approved"
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500"
                                }`}
                                >
                                  {startLoading === app._id && (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  )}
                                  Start
                                </button>
                              )}
                            </td>

                            {/* END */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {hasEnded ? (
                                new Date(app.endTime)
                                  .toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                  .toUpperCase()
                              ) : (
                                <button
                                  disabled={
                                    endLoading === app._id ||
                                    app.status !== "Approved" ||
                                    !app.startTime ||
                                    !!app.endTime
                                  }
                                  onClick={() =>
                                    handlePunchTime(app, "PunchOut")
                                  }
                                  className={`px-3 py-1 rounded text-xs text-white flex items-center gap-1
                                ${
                                  !app.startTime
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-500"
                                }`}
                                >
                                  {endLoading === app._id && (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  )}
                                  End
                                </button>
                              )}
                            </td>

                            {/* DURATION */}
                            <td className="px-6 py-4">
                              {shiftCompleted
                                ? `${(durationMinutes / 60).toFixed(2)} hrs`
                                : "--"}
                            </td>

                            {/* PAY */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              ₹ {selectedShiftPayRate}
                            </td>

                            {/* TOTAL + PAY BUTTON */}
                            <td className="px-6 py-4 font-semibold whitespace-nowrap">
                              {shiftCompleted ? (
                                <div className="flex items-center gap-3">
                                  <span>₹ {totalAmount.toFixed(2)}</span>

                                  {showPayButton ? (
                                    <PayNowButton
                                      amount={totalAmount}
                                      worker={app}
                                      onPaymentSuccess={() =>
                                        handlePaymentSuccess(applicantId)
                                      }
                                    />
                                  ) : paymentCompleted ? (
                                    <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                      Paid
                                    </span>
                                  ) : null}
                                </div>
                              ) : (
                                "₹ --"
                              )}
                            </td>

                            {/* ACTION */}
                            <td className="px-6 py-4">
                              {!shiftCompleted ? (
                                <div className="flex items-center gap-3">
                                  <button
                                    disabled={approveLoading === app._id}
                                    onClick={() =>
                                      handleApplicantAction(app, "Approved")
                                    }
                                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all
                                            ${
                                              approveLoading === app._id
                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                : "bg-[#0D215C] hover:bg-[#08153A] text-white"
                                            }`}
                                  >
                                    {approveLoading === app._id && (
                                      <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                    )}
                                    {approveLoading === app._id
                                      ? "Approving..."
                                      : "Approve"}
                                  </button>

                                  <button
                                    disabled={rejectLoading === app._id}
                                    onClick={() =>
                                      handleApplicantAction(app, "Rejected")
                                    }
                                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all
                                            ${
                                              rejectLoading === app._id
                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                : "bg-[#DCE7FC] hover:bg-[#C9D9FB] text-[#002D62]"
                                            }`}
                                  >
                                    {rejectLoading === app._id && (
                                      <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                    )}
                                    {rejectLoading === app._id
                                      ? "Rejecting..."
                                      : "Reject"}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      setSelectedApplicationId(app.shiftId);
                                      setSelectedWorkerId(app.workerId);
                                      setApplicationId(applicantId);
                                      setShowFeedbackModal(true);
                                    }}
                                    className="px-4 py-2 bg-[#F1EEFE] text-[#3B28A3] font-bold text-sm rounded-full hover:bg-[#E2DEFE] transition-colors"
                                  >
                                    Review
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicantsView;
