## PH-HEALTHCARE-FRONTEND-PART-7

Updated Backend: https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server



Frontend : https://github.com/Apollo-Level2-Web-Dev/ph-health-care/tree/new-part-7

## 71-1 Analysis The New Backend Improvements And Changes

- some backend mechanism Changed . see code in dev branch 

## 71-2 Creating Multi Select Specialty Component For Doctor Form

- components -> admin -> DoctorsManagement -> SpecialtyMultiSelect.tsx

```tsx 
// UI primitives used to build the select + badges + buttons UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  // Select components for the dropdown used to add specialties
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Type definition for a specialty
import { ISpecialty } from "@/types/specialities.interface";
// Icon used to indicate removal (small 'x')
import { X } from "lucide-react";

interface SpecialtyMultiSelectProps {
  // Array of specialty IDs currently selected for the doctor (existing + new)
  selectedSpecialtyIds: string[];
  // IDs that will be removed in edit mode
  removedSpecialtyIds: string[];
  // Currently chosen specialty ID in the dropdown (controlled value)
  currentSpecialtyId: string;
  // List of available specialties to choose from
  availableSpecialties: ISpecialty[];
  // Whether the component is rendered in edit mode (shows diff info)
  isEdit: boolean;
  // Handler when the dropdown selection changes
  onCurrentSpecialtyChange: (id: string) => void;
  // Handler to add the currently selected specialty
  onAddSpecialty: () => void;
  // Handler to remove a specialty by id
  onRemoveSpecialty: (id: string) => void;
  // Utility to get a specialty title from its id
  getSpecialtyTitle: (id: string) => string;
  // Utility to compute newly added specialties (only in edit mode)
  getNewSpecialties: () => string[];
}

const SpecialtyMultiSelect = ({
  selectedSpecialtyIds,
  removedSpecialtyIds,
  currentSpecialtyId,
  availableSpecialties,
  isEdit,
  onCurrentSpecialtyChange,
  onAddSpecialty,
  onRemoveSpecialty,
  getSpecialtyTitle,
  getNewSpecialties,
}: SpecialtyMultiSelectProps) => {
  return (
    <Field>
      {/* Label for the field */}
      <FieldLabel htmlFor="specialties">Specialties (Required)</FieldLabel>

      {/* Hidden input that holds the specialties array for form submission.
          When editing we only want to submit the newly added specialties,
          otherwise we submit the full selected array. */}
      <Input
        type="hidden"
        name="specialties"
        value={JSON.stringify(
          isEdit ? getNewSpecialties() : selectedSpecialtyIds
        )}
      />

      {/* If in edit mode, submit removed specialty ids separately so backend
          can process deletions. */}
      {isEdit && (
        <Input
          type="hidden"
          name="removeSpecialties"
          value={JSON.stringify(removedSpecialtyIds)}
        />
      )}

      {/* Display currently selected specialties as badges with a remove button */}
      {selectedSpecialtyIds?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-muted rounded-lg">
          {selectedSpecialtyIds?.map((id) => (
            <Badge key={id} variant="secondary" className="px-3 py-1.5 text-sm">
              {/* Render the human readable title for the specialty id */}
              {getSpecialtyTitle(id)}
              {/* Small link-style button to remove this specialty */}
              <Button
                variant="link"
                onClick={() => onRemoveSpecialty(id)}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Row containing the select dropdown and the Add button */}
      <div className="flex gap-2">
        <Select
          value={currentSpecialtyId}
          onValueChange={onCurrentSpecialtyChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a specialty to add" />
          </SelectTrigger>
          <SelectContent>
            {/* If specialties are available, list them as options */}
            {availableSpecialties?.length > 0 ? (
              availableSpecialties?.map((specialty) => (
                <SelectItem key={specialty?.id} value={specialty?.id}>
                  {specialty?.title}
                </SelectItem>
              ))
            ) : (
              // If none are available, show a disabled item explaining why
              <SelectItem value="none" disabled>
                {selectedSpecialtyIds?.length > 0
                  ? "All specialties selected"
                  : "No specialties available"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Add button is disabled until a specialty is selected */}
        <Button
          type="button"
          onClick={onAddSpecialty}
          disabled={!currentSpecialtyId}
          variant="outline"
        >
          Add
        </Button>
      </div>

      {/* Helper / hint text displayed under the control */}
      <p className="text-xs text-gray-500 mt-1">
        {isEdit
          ? "Add new specialties or remove existing ones"
          : "Select at least one specialty for the doctor"}
      </p>

      {/* In edit mode show a quick summary of additions and removals */}
      {isEdit && (
        <div className="mt-2 space-y-1">
          {getNewSpecialties()?.length > 0 && (
            <p className="text-xs text-green-600">
              ✓ Will add: {getNewSpecialties()?.map(getSpecialtyTitle)?.join(", ")}
            </p>
          )}
          {removedSpecialtyIds?.length > 0 && (
            <p className="text-xs text-red-600">
              ✗ Will remove: {removedSpecialtyIds?.map(getSpecialtyTitle)?.join(", ")}
            </p>
          )}
        </div>
      )}
    </Field>
  );
};

export default SpecialtyMultiSelect;
```
- we will create a hook for handling the states otherwise the form will be dirty. 
- 
## 71-3 Creating useSpecialtySelection Hook For Multi Select Specialty Component


- hooks -> specialtyHooks -> useSpecialtySelection.ts

```ts
// Import the doctor type so we can inspect doctor's existing specialties
import { IDoctor } from "@/types/doctor.interface";
// Import the specialty type used by available specialties list
import { ISpecialty } from "@/types/specialities.interface";
// React hooks used for state and lifecycle management
import { useEffect, useState } from "react";

// Props accepted by the hook
interface UseSpecialtySelectionProps {
    // Optional doctor object when editing an existing doctor
    doctor?: IDoctor;
    // Whether the form is in edit mode (vs create mode)
    isEdit: boolean;
    // Whether the UI/dialog that uses this hook is open
    open: boolean;
}

// Shape of the value returned by the hook
interface UseSpecialtySelectionReturn {
    // Currently selected specialty ids (strings)
    selectedSpecialtyIds: string[];
    // Specialty ids that have been removed during editing
    removedSpecialtyIds: string[];
    // The id currently selected in the dropdown (controlled)
    currentSpecialtyId: string;
    // Setter for the controlled dropdown value
    setCurrentSpecialtyId: (id: string) => void;
    // Function to add the currently selected specialty to the list
    handleAddSpecialty: () => void;
    // Function to remove a specialty by id
    handleRemoveSpecialty: (id: string) => void;
    // Compute specialties that are newly added (not part of original doctor)
    getNewSpecialties: () => string[];
    // Filter all specialties to only those that are not currently selected
    getAvailableSpecialties: (allSpecialties: ISpecialty[]) => ISpecialty[];
}


export const useSpecialtySelection = ({
    doctor,
    isEdit,
    open,
}: UseSpecialtySelectionProps): UseSpecialtySelectionReturn => {

    const getInitialSpecialtyIds = () => {
        // If we're editing and have a doctor with specialties, map them to ids
        if (isEdit && doctor?.doctorSpecialties) {
            return (
                doctor?.doctorSpecialties
                    // Map each doctorSpecialty entry to the id we expect
                    ?.map((ds) => {
                        // Some APIs may use different keys; prefer `specialitiesId` here
                        return ds?.specialitiesId || null;
                    })
                    // Remove any null/undefined values and keep only strings
                    ?.filter((id): id is string => !!id) || []
            );
        }
        // Default to empty when creating a new doctor or no specialties present
        return [];
    };


    // State: ids currently selected for this doctor (includes originals + newly added)
    const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(
        getInitialSpecialtyIds
    );

    // State: ids that were removed while editing (to send to backend)
    const [removedSpecialtyIds, setRemovedSpecialtyIds] = useState<string[]>([]);

    // State: the controlled value for the specialty dropdown
    const [currentSpecialtyId, setCurrentSpecialtyId] = useState<string>("");


    const handleAddSpecialty = () => {
        // Only add when there's a selected id and it's not already chosen
        if (
            currentSpecialtyId &&
            !selectedSpecialtyIds.includes(currentSpecialtyId)
        ) {
            // Append the current id to the selected list
            setSelectedSpecialtyIds([...selectedSpecialtyIds, currentSpecialtyId]);
            // If this id was previously removed (in edit mode), unmark it as removed
            if (removedSpecialtyIds.includes(currentSpecialtyId)) {
                setRemovedSpecialtyIds(
                    removedSpecialtyIds.filter((id) => id !== currentSpecialtyId)
                );
            }
            // Clear the dropdown selection after adding
            setCurrentSpecialtyId("");
        }
    };

    const handleRemoveSpecialty = (specialtyId: string) => {
        // Remove the id from the selected list immediately
        setSelectedSpecialtyIds(
            selectedSpecialtyIds.filter((id) => id !== specialtyId)
        );

        // If editing an existing doctor, mark original specialties as removed
        if (isEdit && doctor?.doctorSpecialties) {
            const wasOriginalSpecialty = doctor?.doctorSpecialties?.some((ds) => {
                // Compare with the same key used earlier
                const id = ds?.specialitiesId || null;
                return id === specialtyId;
            });
            // If it was part of the original set and not already tracked, add to removals
            if (wasOriginalSpecialty && !removedSpecialtyIds.includes(specialtyId)) {
                setRemovedSpecialtyIds([...removedSpecialtyIds, specialtyId]);
            }
        }
    };

    const getNewSpecialties = (): string[] => {
        // In create mode just return the selected ids
        if (!isEdit || !doctor?.doctorSpecialties) {
            return selectedSpecialtyIds;
        }
        // Otherwise compute original ids and filter them out to get only new ones
        const originalIds =
            doctor?.doctorSpecialties
                ?.map((ds) => ds?.specialitiesId || null)
                ?.filter((id): id is string => !!id) || [];
        return selectedSpecialtyIds.filter((id) => !originalIds.includes(id));
    };

    const getAvailableSpecialties = (allSpecialties: ISpecialty[]) => {
        // Return specialties that are not currently selected
        return allSpecialties?.filter((s) => !selectedSpecialtyIds?.includes(s?.id)) || [];
    };

    useEffect(() => {
        // When the dialog opens (or doctor changes) reset selection state
        if (open && doctor) {
            const initialIds = getInitialSpecialtyIds();
            setSelectedSpecialtyIds(initialIds);
            setRemovedSpecialtyIds([]);
            setCurrentSpecialtyId("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, doctor?.id]);


    return {
        selectedSpecialtyIds,
        removedSpecialtyIds,
        currentSpecialtyId,
        setCurrentSpecialtyId,
        handleAddSpecialty,
        handleRemoveSpecialty,
        getNewSpecialties,
        getAvailableSpecialties,
    };
};
```

## 71-4 Polishing The Doctor Form Dialog, 71-5 Polishing Form Validation UI With Proper Zod Validation, 71-6 Persisting Form Input Values After Input Validation Errors, 71-7 Reset Form During Closing Dialog Or Cancel The Form, 71-8 Fixing The Update Doctor Functionality, 71-9 Adding Multi Select Filter And Other Filters For Doctor Table, 

- zod -> doctor.validation.ts

```ts
import z from "zod";

export const createDoctorZodSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    contactNumber: z.string().min(1, "Contact Number is required").min(10, "Contact Number must be at least 10 characters long"),
    address: z.string().optional(),
    registrationNumber: z.string().min(1, "Registration Number is required").min(3, "Registration Number must be at least 3 characters long"),
    experience: z.number().positive("Experience is required and must be more than 0"),
    gender: z.enum(["MALE", "FEMALE"], { message: "Gender must be either 'MALE' or 'FEMALE'" }),
    appointmentFee: z.number().positive("Appointment Fee is required and must be more than 0"),
    qualification: z.string().min(1, "Qualification is required").min(3, "Qualification must be at least 3 characters long"),
    currentWorkingPlace: z.string().min(1, "Current Working Place is required").min(3, "Current Working Place must be at least 3 characters long"),
    designation: z.string().min(1, "Designation is required").min(2, "Designation must be at least 2 characters long"),
    specialties: z.array(z.uuid("Each specialty must be a valid UUID")).min(1, "At least one specialty is required"),
    profilePhoto: z.instanceof(File).refine((file) => file.size > 0, {
        message: "Profile photo is required",
    }),
});

export const updateDoctorZodSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().min(10, "Contact Number must be at least 10 characters long").optional(),
    address: z.string().optional(),
    registrationNumber: z.string().min(3, "Registration Number must be at least 3 characters long").optional(),
    experience: z.number().min(0, "Experience cannot be negative").optional(),
    gender: z.enum(["MALE", "FEMALE"], { message: "Gender must be either 'MALE' or 'FEMALE'" }).optional(),
    appointmentFee: z.number().min(0, "Appointment Fee cannot be negative").optional(),
    qualification: z.string().min(3, "Qualification must be at least 3 characters long").optional(),
    currentWorkingPlace: z.string().min(3, "Current Working Place must be at least 3 characters long").optional(),
    designation: z.string().min(2, "Designation must be at least 2 characters long").optional(),
    specialties: z.array(z.uuid("Each specialty must be a valid UUID")).optional(),
    removeSpecialties: z.array(z.uuid("Each specialty to remove must be a valid UUID")).optional(),
});
```
- services -> admin -> doctorsManagement.ts

```ts 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { IDoctor } from "@/types/doctor.interface";
import { createDoctorZodSchema, updateDoctorZodSchema } from "@/zod/doctor.validation";


export async function createDoctor(_prevState: any, formData: FormData) {

    // Parse specialties array
    const specialtiesString = formData.get("specialties") as string;
    let specialties: string[] = [];
    if (specialtiesString) {
        try {
            specialties = JSON.parse(specialtiesString);
            if (!Array.isArray(specialties)) specialties = [];
        } catch {
            specialties = [];
        }
    }

    const experienceValue = formData.get("experience");
    const appointmentFeeValue = formData.get("appointmentFee");


    const validationPayload: IDoctor = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        contactNumber: formData.get("contactNumber") as string,
        address: formData.get("address") as string,
        registrationNumber: formData.get("registrationNumber") as string,
        experience: experienceValue ? Number(experienceValue) : 0,
        gender: formData.get("gender") as "MALE" | "FEMALE",
        appointmentFee: appointmentFeeValue ? Number(appointmentFeeValue) : 0,
        qualification: formData.get("qualification") as string,
        currentWorkingPlace: formData.get("currentWorkingPlace") as string,
        designation: formData.get("designation") as string,
        password: formData.get("password") as string,
        specialties: specialties,
        profilePhoto: formData.get("file") as File,
    }

    const validatedPayload = zodValidator(validationPayload, createDoctorZodSchema);

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: validatedPayload.success,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        }
    }

    if (!validatedPayload.data) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
        }
    }
    const backendPayload = {
        password: validatedPayload.data.password,
        doctor: {
            name: validatedPayload.data.name,
            email: validatedPayload.data.email,
            contactNumber: validatedPayload.data.contactNumber,
            address: validatedPayload.data.address,
            registrationNumber: validatedPayload.data.registrationNumber,
            experience: validatedPayload.data.experience,
            gender: validatedPayload.data.gender,
            appointmentFee: validatedPayload.data.appointmentFee,
            qualification: validatedPayload.data.qualification,
            currentWorkingPlace: validatedPayload.data.currentWorkingPlace,
            designation: validatedPayload.data.designation,
            specialties: validatedPayload.data.specialties,
        }
    };
    const newFormData = new FormData()
    newFormData.append("data", JSON.stringify(backendPayload))
    newFormData.append("file", formData.get("file") as Blob)

    try {
        const response = await serverFetch.post("/user/create-doctor", {
            body: newFormData,
        })

        const result = await response.json();


        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`,
            formData: validationPayload,

        }
    }
}

export async function getDoctors(queryString?: string) {
    try {
        const response = await serverFetch.get(`/doctor${queryString ? `?${queryString}` : ""}`);
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

export async function getDoctorById(id: string) {
    try {
        const response = await serverFetch.get(`/doctor/${id}`)
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

export async function updateDoctor(id: string, _prevState: any, formData: FormData) {
    const experienceValue = formData.get("experience");
    const appointmentFeeValue = formData.get("appointmentFee");


    const validationPayload: Partial<IDoctor> = {
        name: formData.get("name") as string,
        contactNumber: formData.get("contactNumber") as string,
        address: formData.get("address") as string,
        registrationNumber: formData.get("registrationNumber") as string,
        experience: experienceValue ? Number(experienceValue) : 0,
        gender: formData.get("gender") as "MALE" | "FEMALE",
        appointmentFee: appointmentFeeValue ? Number(appointmentFeeValue) : 0,
        qualification: formData.get("qualification") as string,
        currentWorkingPlace: formData.get("currentWorkingPlace") as string,
        designation: formData.get("designation") as string,
    };

    // Parse specialties array (for adding new specialties)
    const specialtiesValue = formData.get("specialties") as string;
    if (specialtiesValue) {
        try {
            const parsed = JSON.parse(specialtiesValue);
            if (Array.isArray(parsed) && parsed.length > 0) {
                validationPayload.specialties = parsed;
            }
        } catch {
            // Ignore invalid JSON
        }
    }

    // Parse removeSpecialties array (for removing existing specialties)
    const removeSpecialtiesValue = formData.get("removeSpecialties") as string;
    if (removeSpecialtiesValue) {
        try {
            const parsed = JSON.parse(removeSpecialtiesValue);
            if (Array.isArray(parsed) && parsed.length > 0) {
                validationPayload.removeSpecialties = parsed;
            }
        } catch {
            // Ignore invalid JSON
        }
    }
    const validatedPayload = zodValidator(validationPayload, updateDoctorZodSchema);

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: validatedPayload.success,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        }
    }

    if (!validatedPayload.data) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
        }
    }

    try {
        const response = await serverFetch.patch(`/doctor/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(validatedPayload.data),
        })
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`,
            formData: validationPayload,
        }
    }
}

export async function softDeleteDoctor(id: string) {
    try {
        const response = await serverFetch.delete(`/doctor/soft/${id}`)
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
export async function deleteDoctor(id: string) {
    try {
        const response = await serverFetch.delete(`/doctor/${id}`)
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
```

- hooks -> specialtyHooks -> useSpecialtySelection.ts

```ts 
import { IDoctor } from "@/types/doctor.interface";
import { ISpecialty } from "@/types/specialities.interface";
import { useEffect, useState } from "react";

interface UseSpecialtySelectionProps {
    doctor?: IDoctor;
    isEdit: boolean;
    open: boolean;
}

interface UseSpecialtySelectionReturn {
    selectedSpecialtyIds: string[];
    removedSpecialtyIds: string[];
    currentSpecialtyId: string;
    setCurrentSpecialtyId: (id: string) => void;
    handleAddSpecialty: () => void;
    handleRemoveSpecialty: (id: string) => void;
    getNewSpecialties: () => string[];
    getAvailableSpecialties: (allSpecialties: ISpecialty[]) => ISpecialty[];
}


export const useSpecialtySelection = ({
    doctor,
    isEdit,
    open,
}: UseSpecialtySelectionProps): UseSpecialtySelectionReturn => {

    const getInitialSpecialtyIds = () => {
        if (isEdit && doctor?.doctorSpecialties) {
            return (
                doctor?.doctorSpecialties
                    ?.map((ds) => {
                        // Try: specialitiesId, specialities.id, or specialties.id
                        return (
                            ds?.specialitiesId || null
                        );
                    })
                    ?.filter((id): id is string => !!id) || []
            );
        }
        return [];
    };


    const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(
        getInitialSpecialtyIds
    );

    const [removedSpecialtyIds, setRemovedSpecialtyIds] = useState<string[]>([]);
    const [currentSpecialtyId, setCurrentSpecialtyId] = useState<string>("");


    const handleAddSpecialty = () => {
        if (
            currentSpecialtyId &&
            !selectedSpecialtyIds.includes(currentSpecialtyId)
        ) {
            setSelectedSpecialtyIds([...selectedSpecialtyIds, currentSpecialtyId]);
            // If in edit mode and we're re-adding a removed specialty
            if (removedSpecialtyIds.includes(currentSpecialtyId)) {
                setRemovedSpecialtyIds(
                    removedSpecialtyIds.filter((id) => id !== currentSpecialtyId)
                );
            }
            setCurrentSpecialtyId("");
        }
    };

    const handleRemoveSpecialty = (specialtyId: string) => {
        setSelectedSpecialtyIds(
            selectedSpecialtyIds.filter((id) => id !== specialtyId)
        );

        // In edit mode, track removed specialties
        if (isEdit && doctor?.doctorSpecialties) {
            const wasOriginalSpecialty = doctor?.doctorSpecialties?.some((ds) => {
                const id =
                    ds?.specialitiesId || null
                return id === specialtyId;
            });
            if (wasOriginalSpecialty && !removedSpecialtyIds.includes(specialtyId)) {
                setRemovedSpecialtyIds([...removedSpecialtyIds, specialtyId]);
            }
        }
    };

    const getNewSpecialties = (): string[] => {
        if (!isEdit || !doctor?.doctorSpecialties) {
            return selectedSpecialtyIds;
        }
        const originalIds =
            doctor?.doctorSpecialties
                ?.map(
                    (ds) => ds?.specialitiesId || null
                )
                ?.filter((id): id is string => !!id) || [];
        return selectedSpecialtyIds.filter((id) => !originalIds.includes(id));
    };

    const getAvailableSpecialties = (allSpecialties: ISpecialty[]) => {
        return allSpecialties?.filter((s) => !selectedSpecialtyIds?.includes(s?.id)) || [];
    };

    useEffect(() => {
        if (open && doctor) {
            const initialIds = getInitialSpecialtyIds();
            setSelectedSpecialtyIds(initialIds);
            setRemovedSpecialtyIds([]);
            setCurrentSpecialtyId("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, doctor?.id]);


    return {
        selectedSpecialtyIds,
        removedSpecialtyIds,
        currentSpecialtyId,
        setCurrentSpecialtyId,
        handleAddSpecialty,
        handleRemoveSpecialty,
        getNewSpecialties,
        getAvailableSpecialties,
    };
};
```

- components -> admin -> DoctorsManagement -> SepecialityMultiSelect.tsx

```tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ISpecialty } from "@/types/specialities.interface";
import { X } from "lucide-react";

interface SpecialtyMultiSelectProps {
  selectedSpecialtyIds: string[];
  removedSpecialtyIds: string[];
  currentSpecialtyId: string;
  availableSpecialties: ISpecialty[];
  isEdit: boolean;
  onCurrentSpecialtyChange: (id: string) => void;
  onAddSpecialty: () => void;
  onRemoveSpecialty: (id: string) => void;
  getSpecialtyTitle: (id: string) => string;
  getNewSpecialties: () => string[];
}

const SpecialtyMultiSelect = ({
  selectedSpecialtyIds,
  removedSpecialtyIds,
  currentSpecialtyId,
  availableSpecialties,
  isEdit,
  onCurrentSpecialtyChange,
  onAddSpecialty,
  onRemoveSpecialty,
  getSpecialtyTitle,
  getNewSpecialties,
}: SpecialtyMultiSelectProps) => {
  return (
    <Field>
      <FieldLabel htmlFor="specialties">Specialties (Required)</FieldLabel>

      {/* Hidden Inputs for Form Submission */}
      <Input
        type="hidden"
        name="specialties"
        value={JSON.stringify(
          isEdit ? getNewSpecialties() : selectedSpecialtyIds
        )}
      />
      {isEdit && (
        <Input
          type="hidden"
          name="removeSpecialties"
          value={JSON.stringify(removedSpecialtyIds)}
        />
      )}

      {/* Selected Specialties Display */}
      {selectedSpecialtyIds?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-muted rounded-lg">
          {selectedSpecialtyIds?.map((id) => (
            <Badge key={id} variant="secondary" className="px-3 py-1.5 text-sm">
              {getSpecialtyTitle(id)}
              <Button
                variant="link"
                onClick={() => onRemoveSpecialty(id)}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Specialty Selector */}
      <div className="flex gap-2">
        <Select
          value={currentSpecialtyId}
          onValueChange={onCurrentSpecialtyChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a specialty to add" />
          </SelectTrigger>
          <SelectContent>
            {availableSpecialties?.length > 0 ? (
              availableSpecialties?.map((specialty) => (
                <SelectItem key={specialty?.id} value={specialty?.id}>
                  {specialty?.title}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                {selectedSpecialtyIds?.length > 0
                  ? "All specialties selected"
                  : "No specialties available"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={onAddSpecialty}
          disabled={!currentSpecialtyId}
          variant="outline"
        >
          Add
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        {isEdit
          ? "Add new specialties or remove existing ones"
          : "Select at least one specialty for the doctor"}
      </p>

      {/* Edit Mode: Show Changes */}
      {isEdit && (
        <div className="mt-2 space-y-1">
          {getNewSpecialties()?.length > 0 && (
            <p className="text-xs text-green-600">
              ✓ Will add:{" "}
              {getNewSpecialties()?.map(getSpecialtyTitle)?.join(", ")}
            </p>
          )}
          {removedSpecialtyIds?.length > 0 && (
            <p className="text-xs text-red-600">
              ✗ Will remove:{" "}
              {removedSpecialtyIds?.map(getSpecialtyTitle)?.join(", ")}
            </p>
          )}
        </div>
      )}
    </Field>
  );
};

export default SpecialtyMultiSelect;
```

- DoctorColumns.tsx

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DateCell } from "@/components/shared/cell/DateCell";
import { StatusBadgeCell } from "@/components/shared/cell/StatusBadgeCell";
import { UserInfoCell } from "@/components/shared/cell/UserInfoCell";
import { Column } from "@/components/shared/ManagementTable";
import { IDoctor } from "@/types/doctor.interface";
import { Star } from "lucide-react";

export const doctorsColumns: Column<IDoctor>[] = [
  {
    header: "Doctor",
    accessor: (doctor) => (
      <UserInfoCell
        name={doctor.name}
        email={doctor.email}
        photo={doctor.profilePhoto as string}
      />
    ),
    sortKey: "name",
  },
  {
    header: "Specialties",
    accessor: (doctor) => {
      // Handle both possible response structures
      const specialties: any = doctor.doctorSpecialties;

      if (!specialties || specialties.length === 0) {
        return <span className="text-xs text-gray-500">No specialties</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {specialties.map((item: any, index: any) => {
            // Handle nested specialty object
            const specialtyTitle = item.specialities?.title || "N/A";
            const specialtyId =
              item.specialties?.id || item.specialitiesId || index;

            return (
              <span
                key={specialtyId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                {specialtyTitle}
              </span>
            );
          })}
        </div>
      );
    },
  },
  {
    header: "Contact",
    accessor: (doctor) => (
      <div className="flex flex-col">
        <span className="text-sm">{doctor.contactNumber}</span>
      </div>
    ),
  },
  {
    header: "Experience",
    accessor: (doctor) => (
      <span className="text-sm font-medium">
        {doctor.experience ?? 0} years
      </span>
    ),
    sortKey: "experience",
  },
  {
    header: "Fee",
    accessor: (doctor) => (
      <span className="text-sm font-semibold text-green-600">
        ${doctor.appointmentFee}
      </span>
    ),
    sortKey: "appointmentFee",
  },
  {
    header: "Rating",
    accessor: (doctor) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">
          {doctor.averageRating!.toFixed(1)}
        </span>
      </div>
    ),
    sortKey: "averageRating",
  },
  {
    header: "Gender",
    accessor: (doctor) => (
      <span className="text-sm capitalize">{doctor.gender.toLowerCase()}</span>
    ),
  },
  {
    header: "Status",
    accessor: (doctor) => <StatusBadgeCell isDeleted={doctor.isDeleted} />,
  },
  {
    header: "Joined",
    accessor: (doctor) => <DateCell date={doctor.createdAt} />,
    sortKey: "createdAt",
  },
];
```

- DoctorFilters.tsx 

```tsx 
"use client";
import RefreshButton from "@/components/shared/RefreshButton";
import SearchFilter from "@/components/shared/SearchFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { ISpecialty } from "@/types/specialities.interface";
import { Check, ChevronsUpDown, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface DoctorsFilterProps {
  specialties: ISpecialty[];
}

const DoctorFilters = ({ specialties }: DoctorsFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  // ?speciality=Cardiology&speciality=Dermatology
  const [localSpecialties, setLocalSpecialties] = useState<string[]>(
    () => searchParams.getAll("specialties") || []
  );
  const [genderInput, setGenderInput] = useState(
    () => searchParams.get("gender") || ""
  );
  const [emailInput, setEmailInput] = useState(
    () => searchParams.get("email") || ""
  );
  const [contactNumberInput, setContactNumberInput] = useState(
    () => searchParams.get("contactNumber") || ""
  );

  const debouncedGender = useDebounce(genderInput, 300);
  const debouncedEmail = useDebounce(emailInput, 500);
  const debouncedContactNumber = useDebounce(contactNumberInput, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Update debounced fields
    if (debouncedGender) {
      params.set("gender", debouncedGender);
    } else {
      params.delete("gender");
    }

    if (debouncedEmail) {
      params.set("email", debouncedEmail);
    } else {
      params.delete("email");
    }

    if (debouncedContactNumber) {
      params.set("contactNumber", debouncedContactNumber);
    } else {
      params.delete("contactNumber");
    }

    // Reset to page 1 when filters change
    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGender, debouncedEmail, debouncedContactNumber]);

  const toggleSpecialty = (specialtyId: string) => {
    const newSelection = localSpecialties.includes(specialtyId)
      ? localSpecialties.filter((id) => id !== specialtyId)
      : [...localSpecialties, specialtyId];

    setLocalSpecialties(newSelection);
  };

  const applySpecialtyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("specialties");
    if (localSpecialties.length > 0) {
      localSpecialties.forEach((val) => params.append("specialties", val));
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
    setOpen(false);
  };

  const clearAllFilters = () => {
    setGenderInput("");
    setEmailInput("");
    setContactNumberInput("");
    setLocalSpecialties([]);
    startTransition(() => {
      router.push(window.location.pathname);
    });
  };

  const activeFiltersCount =
    localSpecialties.length +
    (genderInput ? 1 : 0) +
    (emailInput ? 1 : 0) +
    (contactNumberInput ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Row 1: Search and Refresh */}
      <div className="flex items-center gap-3">
        <SearchFilter paramName="searchTerm" placeholder="Search doctors..." />
        <RefreshButton />
      </div>

      {/* Row 2: Filter Controls */}
      <div className="flex items-center gap-3">
        {/* Specialties Multi-Select */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-60 justify-between h-10"
            >
              <Filter className="mr-2 h-4 w-4" />
              {localSpecialties.length > 0
                ? `${localSpecialties.length} selected`
                : "Select specialties"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search specialties..." />
              <CommandList>
                <CommandEmpty>No specialty found.</CommandEmpty>
                <CommandGroup>
                  {specialties.map((specialty) => {
                    const isSelected = localSpecialties.includes(
                      specialty.title
                    );
                    return (
                      <CommandItem
                        key={specialty.id}
                        value={specialty.title}
                        onSelect={() => toggleSpecialty(specialty.title)}
                        className={isSelected ? "bg-accent" : ""}
                      >
                        <Checkbox checked={isSelected} className="mr-2" />
                        <span className={isSelected ? "font-medium" : ""}>
                          {specialty.title}
                        </span>
                        {isSelected && (
                          <Check className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
              <div className="p-2 border-t">
                <Button
                  onClick={applySpecialtyFilter}
                  className="w-full"
                  size="sm"
                  disabled={isPending}
                >
                  Apply Filter
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Gender Filter */}
        <Select
          value={genderInput}
          onValueChange={(value) =>
            setGenderInput(value === "all" ? "" : value)
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
          </SelectContent>
        </Select>

        {/* Email Filter */}
        <Input
          type="email"
          placeholder="Email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="w-[200px] h-10"
          disabled={isPending}
        />

        {/* Contact Number Filter */}
        <Input
          type="text"
          placeholder="Contact"
          value={contactNumberInput}
          onChange={(e) => setContactNumberInput(e.target.value)}
          className="w-40 h-10"
          disabled={isPending}
        />

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            disabled={isPending}
            className="h-10 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Row 3: Active Specialty Badges - Fixed Height to Prevent Shift */}

      {localSpecialties.length > 0 && (
        <div className="min-h-8 flex items-center">
          <div className="flex flex-wrap gap-2">
            {localSpecialties.map((specialtyTitle) => (
              <Badge
                key={specialtyTitle}
                variant="outline"
                className="px-2.5 py-1 h-7"
              >
                {specialtyTitle}
                <Button
                  variant="ghost"
                  onClick={() => toggleSpecialty(specialtyTitle)}
                  className="ml-1.5 hover:text-destructive transition-colors"
                  aria-label={`Remove ${specialtyTitle}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorFilters;
```

- DoctorsFormDialog.tsx

```tsx 
import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpecialtySelection } from "@/hooks/specialtyHooks/useSpecialtySelection";
import { IDoctor } from "@/types/doctor.interface";
import { ISpecialty } from "@/types/specialities.interface";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import SpecialtyMultiSelect from "./SpecialtyMultiSelect";
import { createDoctor, updateDoctor } from "@/services/admin/doctorsManagement";

interface IDoctorFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctor?: IDoctor;
  specialities?: ISpecialty[];
}

const DoctorFormDialog = ({
  open,
  onClose,
  onSuccess,
  doctor,
  specialities,
}: IDoctorFormDialogProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!doctor;

  const [gender, setGender] = useState<"MALE" | "FEMALE">(
    doctor?.gender || "MALE"
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const [state, formAction, pending] = useActionState(
    isEdit ? updateDoctor.bind(null, doctor.id!) : createDoctor,
    null
  );

  const handleClose = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (selectedFile) {
      setSelectedFile(null); // Clear preview
    }
    formRef.current?.reset(); // Clear form
    onClose(); // Close dialog
  };

  console.log({ state });

  const specialtySelection = useSpecialtySelection({
    doctor,
    isEdit,
    open,
  });

  const getSpecialtyTitle = (id: string): string => {
    return specialities?.find((s) => s.id === id)?.title || "Unknown";
  };

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      if (formRef.current) {
        formRef.current.reset();
      }
      onSuccess();
      onClose();
    } else if (state && !state.success) {
      toast.error(state.message);

      if (selectedFile && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(selectedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }, [state, onSuccess, onClose, selectedFile]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="Dr. John Doe"
                defaultValue={
                  state?.formData?.name || (isEdit ? doctor?.name : "")
                }
              />
              <InputFieldError state={state} field="name" />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="doctor@example.com"
                // defaultValue={isEdit ? doctor?.email : undefined}
                defaultValue={
                  state?.formData?.email || (isEdit ? doctor?.email : "")
                }
                disabled={isEdit}
              />
              <InputFieldError state={state} field="email" />
            </Field>

            {!isEdit && (
              <>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    defaultValue={state?.formData?.password || ""}
                    placeholder="Enter password"
                  />
                  <InputFieldError state={state} field="password" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    defaultValue={state?.formData?.confirmPassword || ""}
                    placeholder="Confirm password"
                  />
                  <InputFieldError state={state} field="confirmPassword" />
                </Field>
              </>
            )}

            {/* Specialty Selection */}
            <SpecialtyMultiSelect
              selectedSpecialtyIds={specialtySelection.selectedSpecialtyIds}
              removedSpecialtyIds={specialtySelection.removedSpecialtyIds}
              currentSpecialtyId={specialtySelection.currentSpecialtyId}
              availableSpecialties={specialtySelection.getAvailableSpecialties(
                specialities!
              )}
              isEdit={isEdit}
              onCurrentSpecialtyChange={
                specialtySelection.setCurrentSpecialtyId
              }
              onAddSpecialty={specialtySelection.handleAddSpecialty}
              onRemoveSpecialty={specialtySelection.handleRemoveSpecialty}
              getSpecialtyTitle={getSpecialtyTitle}
              getNewSpecialties={specialtySelection.getNewSpecialties}
            />
            <InputFieldError field="specialties" state={state} />

            <Field>
              <FieldLabel htmlFor="contactNumber">Contact Number</FieldLabel>
              <Input
                id="contactNumber"
                name="contactNumber"
                placeholder="+1234567890"
                // defaultValue={doctor?.contactNumber}
                defaultValue={
                  state?.formData?.contactNumber ||
                  (isEdit ? doctor?.contactNumber : "")
                }
              />
              <InputFieldError state={state} field="contactNumber" />
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, Country"
                // defaultValue={isEdit ? doctor?.address : undefined}
                defaultValue={
                  state?.formData?.address || (isEdit ? doctor?.address : "")
                }
              />
              <InputFieldError state={state} field="address" />
            </Field>

            <Field>
              <FieldLabel htmlFor="registrationNumber">
                Registration Number
              </FieldLabel>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                placeholder="REG123456"
                // defaultValue={isEdit ? doctor?.registrationNumber : undefined}
                defaultValue={
                  state?.formData?.registrationNumber ||
                  (isEdit ? doctor?.registrationNumber : "")
                }
              />
              <InputFieldError state={state} field="registrationNumber" />
            </Field>

            <Field>
              <FieldLabel htmlFor="experience">
                Experience (in years)
              </FieldLabel>
              <Input
                id="experience"
                name="experience"
                type="number"
                placeholder="5"
                // defaultValue={isEdit ? doctor?.experience : undefined}
                defaultValue={
                  state?.formData?.experience ||
                  (isEdit ? doctor?.experience : "")
                }
                min="0"
              />
              <InputFieldError state={state} field="experience" />
            </Field>

            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Input
                id="gender"
                name="gender"
                placeholder="Select gender"
                defaultValue={gender}
                // defaultValue={
                //   state?.formData?.gender || (isEdit ? doctor?.gender : "")
                // }
                type="hidden"
              />
              <Select
                value={gender}
                onValueChange={(value) => setGender(value as "MALE" | "FEMALE")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              <InputFieldError state={state} field="gender" />
            </Field>

            <Field>
              <FieldLabel htmlFor="appointmentFee">Appointment Fee</FieldLabel>
              <Input
                id="appointmentFee"
                name="appointmentFee"
                type="number"
                placeholder="100"
                defaultValue={isEdit ? doctor?.appointmentFee : undefined}
                min="0"
              />
              <InputFieldError state={state} field="appointmentFee" />
            </Field>

            <Field>
              <FieldLabel htmlFor="qualification">Qualification</FieldLabel>
              <Input
                id="qualification"
                name="qualification"
                placeholder="MBBS, MD"
                // defaultValue={isEdit ? doctor?.qualification : undefined}
                defaultValue={
                  state?.formData?.qualification ||
                  (isEdit ? doctor?.qualification : "")
                }
              />
              <InputFieldError state={state} field="qualification" />
            </Field>

            <Field>
              <FieldLabel htmlFor="currentWorkingPlace">
                Current Working Place
              </FieldLabel>
              <Input
                id="currentWorkingPlace"
                name="currentWorkingPlace"
                placeholder="City Hospital"
                // defaultValue={isEdit ? doctor?.currentWorkingPlace : undefined}
                defaultValue={
                  state?.formData?.currentWorkingPlace ||
                  (isEdit ? doctor?.currentWorkingPlace : "")
                }
              />
              <InputFieldError state={state} field="currentWorkingPlace" />
            </Field>

            <Field>
              <FieldLabel htmlFor="designation">Designation</FieldLabel>
              <Input
                id="designation"
                name="designation"
                placeholder="Senior Consultant"
                // defaultValue={isEdit ? doctor?.designation : undefined}
                defaultValue={
                  state?.formData?.designation ||
                  (isEdit ? doctor?.designation : "")
                }
              />
              <InputFieldError state={state} field="designation" />
            </Field>

            {!isEdit && (
              <Field>
                <FieldLabel htmlFor="file">Profile Photo</FieldLabel>
                {selectedFile && (
                  <Image
                    //get from state if available
                    src={
                      typeof selectedFile === "string"
                        ? selectedFile
                        : URL.createObjectURL(selectedFile)
                    }
                    alt="Profile Photo Preview"
                    width={50}
                    height={50}
                    className="mb-2 rounded-full"
                  />
                )}
                <Input
                  ref={fileInputRef}
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a profile photo for the doctor
                </p>
                <InputFieldError state={state} field="profilePhoto" />
              </Field>
            )}
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving..."
                : isEdit
                ? "Update Doctor"
                : "Create Doctor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorFormDialog;
```

- doctrs-managment -> page.tsx

```tsx

import DoctorsManagementHeader from "@/components/modules/Admin/DoctorsManagement/DoctorsManagementHeader";
import DoctorsTable from "@/components/modules/Admin/DoctorsManagement/DoctorsTable";
import TablePagination from "@/components/shared/TablePagination";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { queryStringFormatter } from "@/lib/formatters";

import { Suspense } from "react";
import DoctorFilters from '@/components/modules/Admin/DoctorsManagement/DoctorFilters';
import { getSpecialities } from "@/services/admin/SpecialitiesManagement";
import { getDoctors } from "@/services/admin/doctorsManagement";

const AdminDoctorsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj); // {searchTerm: "John", speciality: "Cardiology" => "?searchTerm=John&speciality=Cardiology"}
  const specialitiesResult = await getSpecialities();
  const doctorsResult = await getDoctors(queryString);
  console.log({ doctorsResult });
  const totalPages = Math.ceil(
    (doctorsResult?.meta?.total || 1) / (doctorsResult?.meta?.limit || 1)
  );
  return (
    <div className="space-y-6">
      <DoctorsManagementHeader specialities={specialitiesResult?.data || []} />
      <DoctorFilters specialties={specialitiesResult?.data || []} />
      <Suspense fallback={<TableSkeleton columns={10} rows={10} />}>
        <DoctorsTable
          doctors={doctorsResult.data}
          specialities={specialitiesResult?.data || []}
        />
        <TablePagination
          currentPage={doctorsResult?.meta?.page || 1}
          totalPages={totalPages || 1}
        />
      </Suspense>
    </div>
  );
};

export default AdminDoctorsManagementPage;
```

- src -> components -> modules -> admin -> DoctorsManagement -> DoctorsManagementHeader.tsx

```tsx
"use client";

import ManagementPageHeader from "@/components/shared/ManagementPageHeader";
import { ISpecialty } from "@/types/specialities.interface";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DoctorFormDialog from "./DoctorFormDialog";

interface DoctorsManagementHeaderProps {
  specialities?: ISpecialty[];
}

const DoctorsManagementHeader = ({
  specialities,
}: DoctorsManagementHeaderProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const [dialogKey, setDialogKey] = useState(0);

  const handleOpenDialog = () => {
    setDialogKey((prev) => prev + 1); // Force remount
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  return (
    <>
      <DoctorFormDialog
        key={dialogKey}
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        specialities={specialities}
      />

      <ManagementPageHeader
        title="Doctors Management"
        description="Manage Doctors information and details"
        action={{
          label: "Add Doctor    ",
          icon: Plus,
          onClick: handleOpenDialog,
        }}
      />
    </>
  );
};

export default DoctorsManagementHeader;
```

