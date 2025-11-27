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
- src/app/(dashboardLayout)/(patientDashboardLayout)/dashboard/book-appointment/[doctorId]/[scheduleId]/page.tsx

```tsx
import AppointmentConfirmation from "@/components/modules/Patient/PatientAppointment/AppointmentConfirmation";
import { getDoctorById } from "@/services/admin/doctorManagement";
import { getScheduleById } from "@/services/admin/schedulesManagement";
import { IDoctor } from "@/types/doctor.interface";
import { ISchedule } from "@/types/schedule.interface";
import { notFound } from "next/navigation";

interface BookAppointmentPageProps {
  params: Promise<{
    doctorId: string;
    scheduleId: string;
  }>;
}

export default async function BookAppointmentPage({
  params,
}: BookAppointmentPageProps) {
  const { doctorId, scheduleId } = await params;

  // Fetch doctor and schedule in parallel
  const [doctorResponse, scheduleResponse] = await Promise.all([
    getDoctorById(doctorId),
    getScheduleById(scheduleId),
  ]);

  if (!doctorResponse?.success || !scheduleResponse?.success) {
    notFound();
  }

  const doctor: IDoctor = doctorResponse.data;
  const schedule: ISchedule = scheduleResponse.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <AppointmentConfirmation doctor={doctor} schedule={schedule} />
    </div>
  );
}

```
- src\app\(dashboardLayout)\(patientDashboardLayout)\dashboard\my-appointments\[id]\page.tsx

```tsx
import AppointmentDetails from "@/components/modules/Patient/PatientAppointment/AppointmentDetails";
import { getAppointmentById } from "@/services/patient/appointment.service";
import { IAppointment } from "@/types/appointments.interface";
import { notFound } from "next/navigation";

interface AppointmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AppointmentDetailPage({
  params,
}: AppointmentDetailPageProps) {
  const { id } = await params;

  const response = await getAppointmentById(id);
  console.log({ response });

  if (!response?.success || !response?.data) {
    notFound();
  }

  const appointment: IAppointment = response.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <AppointmentDetails appointment={appointment} />
    </div>
  );
}

```

## 73-4 Creating Component And Page For Appointment Booking Of Patient Dashboard
- src\components\modules\Patient\PatientAppointment\AppointmentConfirmation.tsx

```tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createAppointment } from "@/services/patient/appointment.service";
import { IDoctor } from "@/types/doctor.interface";
import { ISchedule } from "@/types/schedule.interface";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Stethoscope,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AppointmentConfirmationProps {
  doctor: IDoctor;
  schedule: ISchedule;
}

const AppointmentConfirmation = ({
  doctor,
  schedule,
}: AppointmentConfirmationProps) => {
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleConfirmBooking = async () => {
    setIsBooking(true);

    try {
      const result = await createAppointment({
        doctorId: doctor.id!,
        scheduleId: schedule.id,
      });

      if (result.success) {
        setBookingSuccess(true);
        toast.success("Appointment booked successfully!");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/my-appointments");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to book appointment");
        setIsBooking(false);
      }
    } catch (error) {
      toast.error("An error occurred while booking the appointment");
      setIsBooking(false);
      console.error(error);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900">
                  Appointment Confirmed!
                </h2>
                <p className="text-green-700 mt-2">
                  Your appointment has been successfully booked
                </p>
              </div>
              <p className="text-sm text-green-600">
                Redirecting to your appointments...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Confirm Appointment
        </h1>
        <p className="text-muted-foreground mt-2">
          Review the details below and confirm your appointment
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctor Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">{doctor.name}</p>
              <p className="text-muted-foreground">{doctor.designation}</p>
            </div>

            <Separator />

            {doctor.doctorSpecialties &&
              doctor.doctorSpecialties.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Specialties</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.doctorSpecialties.map((ds, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
                      >
                        {ds.specialties?.title || "N/A"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <Separator />

            <div className="space-y-2">
              {doctor.qualification && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Qualification:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.qualification}
                  </span>
                </div>
              )}

              {doctor.experience !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Experience:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.experience} years
                  </span>
                </div>
              )}

              {doctor.currentWorkingPlace && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Working at:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.currentWorkingPlace}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              {doctor.contactNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.contactNumber}</span>
                </div>
              )}

              {doctor.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.address}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">
                  Consultation Fee
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ${doctor.appointmentFee}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="text-2xl font-bold text-blue-900">
                  {format(new Date(schedule.startDateTime), "EEEE")}
                </p>
                <p className="text-lg text-blue-700">
                  {format(new Date(schedule.startDateTime), "MMMM d, yyyy")}
                </p>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {format(new Date(schedule.startDateTime), "h:mm a")} -{" "}
                    {format(new Date(schedule.endDateTime), "h:mm a")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="font-semibold text-sm">Important Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Please arrive 10 minutes before your scheduled time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Bring any relevant medical records or prescriptions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    You can cancel or reschedule from your appointments page
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    A confirmation will be sent to your registered email
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full"
                size="lg"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm & Book Appointment
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isBooking}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;

```

- src\components\modules\Patient\PatientAppointment\AppointmentDetails.tsx

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import ReviewDialog from "./ReviewDialog";
import {
  AppointmentStatus,
  IAppointment,
} from "@/types/appointments.interface";
import ReviewDialog from "./ReviewDialog";

interface AppointmentDetailProps {
  appointment: IAppointment;
}

const AppointmentDetails = ({ appointment }: AppointmentDetailProps) => {
  const router = useRouter();
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const canReview = isCompleted && !appointment.review;

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig: Record<
      AppointmentStatus,
      { variant: any; label: string; className?: string }
    > = {
      [AppointmentStatus.SCHEDULED]: {
        variant: "default",
        label: "Scheduled",
        className: "bg-blue-500 hover:bg-blue-600",
      },
      [AppointmentStatus.INPROGRESS]: {
        variant: "secondary",
        label: "In Progress",
      },
      [AppointmentStatus.COMPLETED]: {
        variant: "default",
        label: "Completed",
        className: "bg-green-500 hover:bg-green-600",
      },
      [AppointmentStatus.CANCELED]: {
        variant: "destructive",
        label: "Canceled",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Appointment Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete information about your appointment
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {/* Review Notification - Only show if can review (completed but no review) */}
      {canReview && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  Review This Appointment
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your appointment has been completed. Share your experience by
                  leaving a review for Dr. {appointment.doctor?.name}.
                </p>
                <Button
                  onClick={() => setShowReviewDialog(true)}
                  className="mt-3"
                  size="sm"
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cannot Review Yet - Only show if not completed and no review */}
      {!isCompleted && !appointment.review && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Review Not Available Yet
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  You can review this appointment after it has been completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">
                {appointment.doctor?.name || "N/A"}
              </p>
              <p className="text-muted-foreground">
                {appointment.doctor?.designation || "Doctor"}
              </p>
            </div>

            <Separator />

            {appointment.doctor?.doctorSpecialties &&
              appointment.doctor.doctorSpecialties.length > 0 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Specialties</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {appointment.doctor.doctorSpecialties.map((ds, idx) => (
                        <Badge key={idx} variant="secondary">
                          {ds.specialties?.title || "N/A"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            <div className="space-y-2">
              {appointment.doctor?.qualification && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qualification:</span>
                  <span className="font-medium">
                    {appointment.doctor.qualification}
                  </span>
                </div>
              )}

              {appointment.doctor?.experience !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">
                    {appointment.doctor.experience} years
                  </span>
                </div>
              )}

              {appointment.doctor?.currentWorkingPlace && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Working at:</span>
                  <span className="font-medium">
                    {appointment.doctor.currentWorkingPlace}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              {appointment.doctor?.contactNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.doctor.contactNumber}</span>
                </div>
              )}

              {appointment.doctor?.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{appointment.doctor.address}</span>
                </div>
              )}
            </div>

            {appointment.doctor?.appointmentFee !== undefined && (
              <>
                <Separator />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">
                      Consultation Fee
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ${appointment.doctor.appointmentFee}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Status
                </span>
                {getStatusBadge(appointment.status)}
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          {appointment.schedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-xl font-bold text-blue-900">
                      {format(
                        new Date(appointment.schedule.startDateTime),
                        "EEEE"
                      )}
                    </p>
                    <p className="text-blue-700">
                      {format(
                        new Date(appointment.schedule.startDateTime),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  </div>

                  <Separator className="bg-blue-200" />

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold text-blue-900">
                        {format(
                          new Date(appointment.schedule.startDateTime),
                          "h:mm a"
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(appointment.schedule.endDateTime),
                          "h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prescription */}
          {appointment.prescription && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Prescription Available
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-green-50 rounded-lg p-3 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-green-900">
                      Instructions:
                    </span>
                    <p className="text-sm text-green-700 mt-1">
                      {appointment.prescription.instructions}
                    </p>
                  </div>

                  {appointment.prescription.followUpDate && (
                    <div>
                      <span className="text-sm font-medium text-green-900">
                        Follow-up Date:
                      </span>
                      <p className="text-sm text-green-700">
                        {format(
                          new Date(appointment.prescription.followUpDate),
                          "MMMM d, yyyy"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Review Section - Full Width Below */}
      {appointment.review && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Star className="h-5 w-5 fill-yellow-600" />
              Your Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= appointment.review!.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-yellow-900">
                  {appointment.review.rating}/5
                </span>
              </div>

              {appointment.review.comment && (
                <div>
                  <p className="text-sm text-yellow-900 font-medium mb-1">
                    Comment:
                  </p>
                  <p className="text-sm text-yellow-800">
                    {appointment.review.comment}
                  </p>
                </div>
              )}

              <p className="text-xs text-yellow-600 italic">
                Reviews cannot be edited or deleted once submitted.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      {canReview && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          appointmentId={appointment.id}
          doctorName={appointment.doctor?.name || "the doctor"}
        />
      )}
    </div>
  );
};

export default AppointmentDetails;

```

- \src\components\modules\Patient\PatientAppointment\AppointmentsList.tsx

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AppointmentStatus,
  IAppointment,
} from "@/types/appointments.interface";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import Link from "next/link";

interface AppointmentsListProps {
  appointments: IAppointment[];
}

const AppointmentsList = ({ appointments }: AppointmentsListProps) => {
  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig: Record<
      AppointmentStatus,
      { variant: any; label: string; className?: string }
    > = {
      [AppointmentStatus.SCHEDULED]: {
        variant: "default",
        label: "Scheduled",
        className: "bg-blue-500 hover:bg-blue-600",
      },
      [AppointmentStatus.INPROGRESS]: {
        variant: "secondary",
        label: "In Progress",
      },
      [AppointmentStatus.COMPLETED]: {
        variant: "default",
        label: "Completed",
        className: "bg-green-500 hover:bg-green-600",
      },
      [AppointmentStatus.CANCELED]: {
        variant: "destructive",
        label: "Canceled",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (appointments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            You haven&apos;t booked any appointments. Browse our doctors and
            book your first consultation.
          </p>
          <Button className="mt-4" asChild>
            <a href="/consultation">Find a Doctor</a>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <Card
          key={appointment.id}
          className="hover:shadow-lg transition-shadow"
        >
          <CardContent className="pt-6 space-y-4">
            {/* Status and Review Badge */}
            <div className="flex justify-between items-start gap-2 flex-wrap">
              {getStatusBadge(appointment.status)}
              <div className="flex gap-2 flex-wrap">
                {appointment.prescription && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Prescription
                  </Badge>
                )}
                {appointment.status === AppointmentStatus.COMPLETED &&
                  !appointment.review && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Can Review
                    </Badge>
                  )}
              </div>
            </div>

            {/* Doctor Info */}
            <div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {appointment.doctor?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctor?.designation || "Doctor"}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {appointment.doctor?.doctorSpecialties &&
              appointment.doctor.doctorSpecialties.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  {appointment.doctor.doctorSpecialties
                    .slice(0, 2)
                    .map((ds, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {ds.specialties?.title || "N/A"}
                      </Badge>
                    ))}
                  {appointment.doctor.doctorSpecialties.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{appointment.doctor.doctorSpecialties.length - 2} more
                    </Badge>
                  )}
                </div>
              )}

            {/* Schedule */}
            {appointment.schedule && (
              <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(
                      new Date(appointment.schedule.startDateTime),
                      "EEEE, MMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(
                      new Date(appointment.schedule.startDateTime),
                      "h:mm a"
                    )}{" "}
                    -{" "}
                    {format(
                      new Date(appointment.schedule.endDateTime),
                      "h:mm a"
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Address */}
            {appointment.doctor?.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="line-clamp-2">
                  {appointment.doctor.address}
                </span>
              </div>
            )}

            {/* Review Status */}
            {appointment.status === AppointmentStatus.COMPLETED && (
              <div>
                {appointment.review ? (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 rounded-lg p-2">
                    <Star className="h-4 w-4 fill-yellow-600" />
                    <span>Rated {appointment.review.rating}/5</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-2">
                    No review yet
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-4">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/dashboard/my-appointments/${appointment.id}`}>
                View Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentsList;

```

- \src\components\modules\Patient\PatientAppointment\ReviewDialog.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/services/patient/reviews.services";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  doctorName: string;
}

export default function ReviewDialog({
  isOpen,
  onClose,
  appointmentId,
  doctorName,
}: ReviewDialogProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview({
        appointmentId,
        rating,
        comment: comment.trim(),
      });

      if (result.success) {
        toast.success("Review submitted successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("An error occurred while submitting review");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      setComment("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with Dr. {doctorName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-medium">
                    {rating}/5 -{" "}
                    {rating === 1
                      ? "Poor"
                      : rating === 2
                      ? "Fair"
                      : rating === 3
                      ? "Good"
                      : rating === 4
                      ? "Very Good"
                      : "Excellent"}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comment * (minimum 10 characters)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this doctor..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                disabled={isSubmitting}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {comment.length} characters
              </p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Reviews cannot be edited or deleted once
                submitted. Please ensure your feedback is accurate.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

```

- src\components\modules\Patient\PatientPrescription\PatientPrescriptionList.tsx

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IPrescription } from "@/types/prescription.interface";
import { format } from "date-fns";
import { Calendar, Clock, FileText, User } from "lucide-react";

interface PatientPrescriptionsListProps {
  prescriptions: IPrescription[];
}

export default function PatientPrescriptionsList({
  prescriptions = [],
}: PatientPrescriptionsListProps) {
  // Sort prescriptions by creation date (latest first)
  const sortedPrescriptions = [...prescriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (prescriptions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Prescriptions Yet</h3>
        <p className="text-muted-foreground">
          Your prescriptions will appear here after your appointments are
          completed.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedPrescriptions.map((prescription) => (
        <Card
          key={prescription.id}
          className="p-6 hover:shadow-lg transition-shadow"
        >
          {/* Doctor Information */}
          <div className="flex items-start gap-3 mb-4 pb-4 border-b">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {prescription.doctor?.name || "N/A"}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {prescription.doctor?.email || "N/A"}
              </p>
              {prescription.doctor?.designation && (
                <p className="text-xs text-muted-foreground mt-1">
                  {prescription.doctor.designation}
                </p>
              )}
            </div>
          </div>

          {/* Appointment Date */}
          {prescription.appointment?.schedule?.startDateTime && (
            <div className="flex items-center gap-2 mb-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Appointment:</span>
              <span className="font-medium">
                {format(
                  new Date(prescription.appointment.schedule.startDateTime),
                  "PPP"
                )}
              </span>
            </div>
          )}

          {/* Instructions Preview */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Instructions</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {prescription.instructions}
              </p>
            </div>
          </div>

          {/* Follow-up Date */}
          {prescription.followUpDate && (
            <div className="mb-4">
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-700 bg-blue-50"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Follow-up: {format(new Date(prescription.followUpDate), "PPP")}
              </Badge>
            </div>
          )}

          {/* Prescribed Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
            <Clock className="h-3 w-3" />
            <span>
              Prescribed on {format(new Date(prescription.createdAt), "PPP")}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

## 73-5 Creating Components And Page For Appointment List Of Patient Dashboard

## 73-6 Creating Components And Page For Appointment Detail Of Patient Dashboard

## 73-7 Creating Components And Page For Appointment List Table For Doctor

## 73-8 Creating Components And Page For Prescription List Table For Doctor

## 73-9 Creating Components For Prescription List And Review For Patient


