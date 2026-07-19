
import { baseUrl, urls } from "../constants/config";

const fetchCurrentUser = async () => {
    try {
        const res = await fetch(
            `${baseUrl}${urls?.users?.getCurrentUser}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            },
        );

        const data = await res.json();
        const success = data.success;
        return data;

        // if (success && Array.isArray(data.data) && data.data.length > 0) {
        //     setCurrentUser(data.data[0]);
        // } else {
        //     setCurrentUser(null);
        // }
    } catch (err) {
        console.error("Fetch current user error:", err);
    }
};