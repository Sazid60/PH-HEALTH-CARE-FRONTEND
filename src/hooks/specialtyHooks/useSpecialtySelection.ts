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