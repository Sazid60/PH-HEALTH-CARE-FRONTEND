/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

export const registerPatient = async (_currentState: any, formData: any): Promise<any> => {
    // register patient logic here
    try {
        const registerData = {
            password: formData.get("password"),
            patient: {
                name: formData.get("name"),
                address: formData.get("address"),
                email: formData.get("email"),
            }
        }

        const newFormData = new FormData()
        // new form data is created because original form data is formatted into an object then again needs to converted to form data as our backend only accepts form data

        newFormData.append("data", JSON.stringify(registerData))

        const res = await fetch("http://localhost:5000/api/v1/user/create-patient", {
            method: "POST",
            body: newFormData
        }).then(res => res.json())

        console.log(res)
        return res

    } catch (error) {
        console.error("Error registering patient:", error)
        return {
            error: "Error registering patient"
        }
    }
};
