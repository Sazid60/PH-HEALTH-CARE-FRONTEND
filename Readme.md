# PH-HEALTH CARE PART-9 

Frontend: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-9
Backend: https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server

## 73-1 Analysing How The Appointment , Review And Prescription Will Work Between Doctor And Patient, 73-2 Creating Server Actions, Interfaces, Zod Validation For Appointment, Review And Prescription

- src\types\appointments.interface.ts

```ts
import { IDoctor } from "./doctor.interface";
import { IPatient } from "./patient.interface";
import { IPrescription } from "./prescription.interface";
import { IReview } from "./review.interface";
import { ISchedule } from "./schedule.interface";

export enum AppointmentStatus {
    SCHEDULED = "SCHEDULED",
    INPROGRESS = "INPROGRESS",
    COMPLETED = "COMPLETED",
    CANCELED = "CANCELED",
}

export enum PaymentStatus {
    PAID = "PAID",
    UNPAID = "UNPAID",
}

export interface IAppointment {
    id: string;
    patientId: string;
    patient?: IPatient;
    doctorId: string;
    doctor?: IDoctor;
    scheduleId: string;
    schedule?: ISchedule;
    videoCallingId: string;
    status: AppointmentStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    updatedAt: string;
    prescription?: IPrescription;
    review?: IReview;
    // payment?: IPayment;
}

export interface IAppointmentFormData {
    doctorId: string;
    scheduleId: string;
}
```

-  src\types\prescription.interface.ts

```ts 
import { IAppointment } from "./appointments.interface";
import { IDoctor } from "./doctor.interface";
import { IPatient } from "./patient.interface";

export interface IPrescription {
    id: string;
    appointmentId: string;
    appointment?: IAppointment;
    doctorId: string;
    doctor?: IDoctor;
    patientId: string;
    patient?: IPatient;
    instructions: string;
    followUpDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IPrescriptionFormData {
    appointmentId: string;
    instructions: string;
    followUpDate?: string;
}
```

- src\types\review.interface.ts

```ts 
import { IAppointment } from "./appointments.interface";
import { IDoctor } from "./doctor.interface";
import { IPatient } from "./patient.interface";

export interface IReview {
    id: string;
    patientId: string;
    patient?: IPatient;
    doctorId: string;
    doctor?: IDoctor;
    appointmentId: string;
    appointment?: IAppointment;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface IReviewFormData {
    appointmentId: string;
    rating: number;
    comment: string;
}
```

- also zod added checkout codes 

- src\services\patient\appointment.service.ts

```ts 
"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { IAppointmentFormData } from "@/types/appointments.interface";

export async function createAppointment(data: IAppointmentFormData) {
    try {
        const response = await serverFetch.post("/appointment", {
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error creating appointment:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to book appointment",
        };
    }
}

export async function getMyAppointments(queryString?: string) {
    try {
        const response = await serverFetch.get(
            `/appointment/my-appointment${queryString ? `?${queryString}` : "?sortBy=createdAt&sortOrder=desc"}`
        );
        const result = await response.json();
        console.log({ result });
        return result;
    } catch (error: any) {
        console.error("Error fetching appointments:", error);
        return {
            success: false,
            data: [],
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch appointments",
        };
    }
}

export async function getAppointmentById(appointmentId: string) {
    try {
        const response = await serverFetch.get('/appointment/my-appointment');
        const result = await response.json();

        if (result.success && result.data) {
            // Find the appointment by ID from the list
            const appointment = result.data.find((apt: any) => apt.id === appointmentId);

            if (appointment) {
                return {
                    success: true,
                    data: appointment,
                };
            } else {
                return {
                    success: false,
                    data: null,
                    message: "Appointment not found",
                };
            }
        }

        return {
            success: false,
            data: null,
            message: result.message || "Failed to fetch appointment",
        };
    } catch (error: any) {
        console.error("Error fetching appointment:", error);
        return {
            success: false,
            data: null,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch appointment",
        };
    }
}

export async function changeAppointmentStatus(
    appointmentId: string,
    status: string
) {
    try {
        const response = await serverFetch.patch(
            `/appointment/status/${appointmentId}`,
            {
                body: JSON.stringify({ status }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error changing appointment status:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to change appointment status",
        };
    }
}

```

- src\services\patient\prescription.service.ts

```ts 
"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { IPrescriptionFormData } from "@/types/prescription.interface";

export async function createPrescription(data: IPrescriptionFormData) {
    try {
        const response = await serverFetch.post("/prescription", {
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error creating prescription:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to create prescription",
        };
    }
}

export async function getMyPrescriptions(queryString?: string) {
    try {
        const response = await serverFetch.get(
            `/prescription/my-prescription${queryString ? `?${queryString}` : ""}`
        );
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error fetching prescriptions:", error);
        return {
            success: false,
            data: [],
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch prescriptions",
        };
    }
}

export async function getAllPrescriptions(queryString?: string) {
    try {
        const response = await serverFetch.get(
            `/prescription${queryString ? `?${queryString}` : ""}`
        );
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error fetching prescriptions:", error);
        return {
            success: false,
            data: [],
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch prescriptions",
        };
    }
}
```

- src\services\patient\reviews.services.ts

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { IReviewFormData } from "@/types/review.interface";

export async function getReviews(queryString?: string) {
    try {
        const url = queryString ? `/review?${queryString}` : "/review";

        const response = await serverFetch.get(url);
        const result = await response.json();

        return {
            success: true,
            data: result.data,
            meta: result.meta,
        };
    } catch (error: any) {
        console.error("Get reviews error:", error);
        return {
            success: false,
            message: error.message || "Failed to fetch reviews",
            data: null,
        };
    }
}

export async function createReview(data: IReviewFormData) {
    try {
        const response = await serverFetch.post("/review", {
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error creating review:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to create review",
        };
    }
}
```

## 73-3 Creating Page Structures For Appointment Booking, Appointment List For Patient And Doctor


## 73-4 Creating Component And Page For Appointment Booking Of Patient Dashboard

## 73-5 Creating Components And Page For Appointment List Of Patient Dashboard

## 73-6 Creating Components And Page For Appointment Detail Of Patient Dashboard

## 73-7 Creating Components And Page For Appointment List Table For Doctor

## 73-8 Creating Components And Page For Prescription List Table For Doctor

## 73-9 Creating Components For Prescription List And Review For Patient


