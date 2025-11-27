import DoctorPrescriptionsTable from "@/components/modules/Doctor/DoctorPrescription/DoctorPrescriptionTable";
import { getMyAppointments } from "@/services/patient/appointment.service";
import { IAppointment } from "@/types/appointments.interface";
import { IPrescription } from "@/types/prescription.interface";

export default async function DoctorPrescriptionsPage() {
  // Get all doctor's appointments
  const response = await getMyAppointments();
  const appointments: IAppointment[] = response?.data || [];

  // Extract prescriptions from appointments that have them
  const prescriptions: IPrescription[] = appointments
    .filter((appointment) => appointment.prescription) // Only appointments with prescriptions
    .map((appointment) => ({
      ...appointment.prescription!,
      patient: appointment.patient, // Add patient data from appointment
      appointment, // Include full appointment data for display
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Prescriptions</h1>
        <p className="text-muted-foreground mt-2">
          View all prescriptions you have provided to patients
        </p>
      </div>

      <DoctorPrescriptionsTable prescriptions={prescriptions} />
    </div>
  );
}
