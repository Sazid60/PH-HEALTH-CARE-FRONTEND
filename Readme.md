## PH-HEALTHCARE-FRONTEND-PART-2 

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-2

## 66-1 Planning The Routing Architecture Of Ph Healthcare

- In this project we have 3 category users. 
  1. Admin
  2. Doctor
  3. Patient

- `Public Pages` - These pages can be accessed by any user without authentication.
  - Home Page (/)
  - About Page (/about)
  - Contact Page
- `Public Auth pages` - These pages can be accessed by any user for authentication purposes.
  - Login Page (/login)
  - Register Page(/register)
  -  Forget Password Page
  -  Reset Password Page

- `Protected Patient pages` - These pages can only be accessed by authenticated patients.
  - Patient Dashboard (/dashboard)
  - My Appointment Page (/dashboard/my-appointment)
  - My Profile Page (/dashboard/my-profile)

- `Protected Doctor pages` - These pages can only be accessed by authenticated doctors.
  - Doctor Dashboard (/doctor/dashboard)
  - Appointments Page (/doctor/dashboard/appointments)
  - My Profile Page (/doctor/dashboard/my-profile)
  - My Schedule Page (/doctor/dashboard/my-schedule)

- `Protected Admin pages` - These pages can only be accessed by authenticated admins.
  - Admin Dashboard (/admin/dashboard)
  - Manage Doctors (/admin/dashboard/manage-doctors)
  - Mange Patients (/admin/dashboard/manage-patients)
  - Statistics Managements (/admin/dashboard/statistics)
  - My profile (/admin/dashboard/my-profile)