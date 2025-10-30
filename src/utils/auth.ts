/* eslint-disable @typescript-eslint/no-explicit-any */
const checkAuthStatus = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        const data = await res.json();
        console.log(data)

        if (!res.ok) {
            throw new Error("Failed to fetch auth status");
        }

        return {
            isAuthenticated: true,
            user: data.user
        }
    } catch (error: any) {
        console.log(error.message)
        return {
            isAuthenticated: false,
            user: null
        }
    }
}

export default checkAuthStatus;