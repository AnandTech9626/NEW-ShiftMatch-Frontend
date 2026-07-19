
export const getStatusColor = (status = "") => {
    const value = status.toLowerCase();

    if (["approved", "verified", "active", "success"].includes(value)) {
        return "bg-green-100 text-green-800 font-bold";
    }

    if (["rejected", "failed", "error", "inactive"].includes(value)) {
        return "bg-red-100 text-red-800 font-bold";
    }

    if (["pending", "under review", "processing"].includes(value)) {
        return "bg-yellow-100 text-yellow-800 font-bold";
    }

    return "bg-indigo-100 text-indigo-800 font-bold";
};
