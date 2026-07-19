import React, { useState } from "react";
import { useRazorpay } from "react-razorpay";

const PayNowButton = ({ amount, worker, onPaymentSuccess }) => {
  const { error, Razorpay } = useRazorpay();
  const [paying, setPaying] = useState(false);

  const handlePayment = () => {
    if (!Razorpay) {
      alert("Payment gateway is not ready yet. Please try again in a moment.");
      return;
    }

    const options = {
      key: "rzp_test_SPQ5ivUmcopW6r",
      amount: amount * 100,
      currency: "INR",
      name: "Hospital Shift Payment",
      description: "Worker Shift Payment",
      handler: function (response) {
        console.log("Payment Success:", response);
        setPaying(false);
        onPaymentSuccess?.();
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
      prefill: {
        name: worker?.bankData?.accountHolderName || worker?.userData?.fullName,
        email: worker?.userData?.email || "",
        contact: worker?.userData?.mobileNumber || "",
      },
      notes: {
        bank_name: worker?.bankData?.bankName,
        account_number: worker?.bankData?.accountNumber,
        branch: worker?.bankData?.branchName,
      },
      theme: {
        color: "#16a34a",
      },
    };

    setPaying(true);
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  };

  if (error) {
    return <p className="text-red-500 text-xs">Razorpay failed to load</p>;
  }

  return (
    <button
      onClick={handlePayment}
      disabled={paying}
      className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-md disabled:opacity-70"
    >
      {paying ? "Processing..." : "Pay Now"}
    </button>
  );
};

export default PayNowButton;