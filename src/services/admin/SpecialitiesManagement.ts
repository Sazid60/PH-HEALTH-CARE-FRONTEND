
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverFetch } from "@/lib/server-fetch"
import z from "zod"



const createSpecialityZodSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long'),
})

export async function createSpeciality(_prevState: any, formData: FormData) {
    try {
        const payload = {
            title: formData.get('title') as string,
        }

        const validatedPayload = createSpecialityZodSchema.safeParse(payload)


        if (!validatedPayload.success) {
            return {
                success: false,
                errors: validatedPayload.error.issues.map(issue => {
                    return {
                        field: issue.path[0],
                        message: issue.message,
                    }
                })
            }
        }


        const newFormData = new FormData()
        newFormData.append('data', JSON.stringify(validatedPayload))

        if (formData.get("file")) {
            newFormData.append('file', formData.get("file") as Blob)
        }
        const response = await serverFetch.post("/specialties", {
            body: newFormData,
            // headers: {
            //     "Authorization": `Bearer`
            // } 
            // we do not need to set the accessToken here because serverFetch Function is setting token before making request 
        })

        const result = await response.json()
        return result

    } catch (error: any) {
        console.log(error)

        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : "Something Went Wrong"}`
        };

    }
}
export async function getSpecialities() {
    try {
        const response = await serverFetch.get("/specialties")

        const result = await response.json()
        return result
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? (error as Error).message : "Something Went Wrong"}`
        };
    }
}
export async function deleteSpeciality(id: string) {
    try {
        const response = await serverFetch.delete(`/specialties/${id}`)
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}
