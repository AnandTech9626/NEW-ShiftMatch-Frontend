# How to Integrate Razorpay in a React Application (Simple Steps)

This guide explains how to integrate Razorpay into a React application using the official hook-based package `react-razorpay`.

---

## Step 1: Install the Razorpay Package

In your React project root directory, install `react-razorpay`:

```bash
npm install react-razorpay
```

---

## Step 2: Create the Payment Button Component

Create a component (e.g., `PayButton.jsx`) to handle loading the SDK and launching the checkout form.

Here is a clean, reusable template:

```jsx
import React from "react";
import { useRazorpay } from "react-razorpay";

const PayButton = ({ amount, customerDetails, onSuccess }) => {
  const { error, isLoading, Razorpay } = useRazorpay();

  const handlePayment = () => {
    const options = {
      // 1. Replace with your Razorpay API Key ID (from Settings > API Keys in Dashboard)
      key: "YOUR_RAZORPAY_KEY_ID", 
      
      // 2. Amount must be in the smallest currency unit (e.g., paise for INR). 100 paise = 1 Rupee.
      amount: amount * 100, 
      currency: "INR",
      
      // 3. Branding & Customization
      name: "Your Business Name",
      description: "Transaction Description",
      image: "https://yourwebsite.com/logo.png", // Optional logo URL
      
      // 4. Prefill customer details for convenience
      prefill: {
        name: customerDetails?.name || "",
        email: customerDetails?.email || "",
        contact: customerDetails?.phone || "",
      },
      
      // 5. Callback handler after user completes payment info in the popup
      handler: function (response) {
        // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
        console.log("Payment Successful:", response);
        if (onSuccess) {
          onSuccess(response);
        }
      },
      
      // 6. Custom styling for Razorpay checkout window
      theme: {
        color: "#3B82F6", // Primary brand color
      },
    };

    // Instantiate and open Razorpay
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  };

  if (error) {
    return <p style={{ color: "red" }}>Failed to load Razorpay SDK.</p>;
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      style={{
        padding: "10px 20px",
        backgroundColor: isLoading ? "#9CA3AF" : "#3B82F6",
        color: "#FFFFFF",
        border: "none",
        borderRadius: "6px",
        cursor: isLoading ? "not-allowed" : "pointer",
        fontWeight: "bold"
      }}
    >
      {isLoading ? "Loading Payment..." : `Pay ₹${amount}`}
    </button>
  );
};

export default PayButton;
```

---

## Step 3: Use the Component in Your Page

Import and use the button inside your React pages:

```jsx
import React from "react";
import PayButton from "./PayButton";

function CheckoutPage() {
  const customer = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "9876543210",
  };

  const handleSuccess = (paymentDetails) => {
    alert(`Payment successful! ID: ${paymentDetails.razorpay_payment_id}`);
    // Send paymentDetails to your backend server to verify payment signature
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Checkout Summary</h2>
      <p>Total amount to pay: <strong>₹500.00</strong></p>
      
      <PayButton 
        amount={500} 
        customerDetails={customer} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}

export default CheckoutPage;
```

---

## Step 4: Recommended Security Step (Backend Verification)

For production environments, **never trust payments validated only on the frontend**. 

1. **Create an Order on Backend**: Before opening the checkout, call your backend API to create an order using Razorpay's backend API (`orders.create`). This returns an `order_id`.
2. **Pass the `order_id` to options**: Include the returned `order_id` in your React frontend `options` configuration.
3. **Verify Signature**: When Razorpay calls `handler(response)`, send the payload (`razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`) to your backend. The backend should verify the signature using your **Razorpay Key Secret** using HMAC SHA256 before marking the order as paid in your database.
