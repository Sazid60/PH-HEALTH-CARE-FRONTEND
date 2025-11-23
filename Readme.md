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

## 71-4 Polishing The Doctor Form Dialog

