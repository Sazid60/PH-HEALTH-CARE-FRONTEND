/* eslint-disable @typescript-eslint/no-explicit-any */

"use server"

export const loginUser = async (_currentState: any, formData: any): Promise<any> => {
    try {
        const loginData = {
            email: formData.get("email"),
            password: formData.get("password"),
        }
        const response = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        }).then(res => res.json())
        return response
    } catch (error) {
        console.log(error)
        return { error: "Error logging in user" }
    }
}