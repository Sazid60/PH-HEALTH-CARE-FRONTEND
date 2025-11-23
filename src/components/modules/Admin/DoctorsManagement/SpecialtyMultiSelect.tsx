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

