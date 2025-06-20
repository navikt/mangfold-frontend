import { useEffect, useState } from "react";
import DepartmentSelector from "./DepartmentSelector";
import "../css/FilterPanel.css";
import { departments } from "../data/departmentData";

interface Props {
  onFilterChange: (filters: {
    departments: string[];
    section: string;
    showAsTable?: boolean;
  }) => void;
}

export default function FilterPanel({ onFilterChange }: Props) {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");

  const availableSections = selectedDepartments.length > 0
    ? departments
        .filter((dept) => selectedDepartments.includes(dept.name))
        .flatMap((dept) => dept.sections)
    : [];

  const handleChange = () => {
    if (onFilterChange) {
      onFilterChange({
        departments: selectedDepartments,
        section: selectedSection,
      });
    }
  };

  useEffect(() => {
    if (selectedSection && !availableSections.includes(selectedSection)) {
      setSelectedSection("");
    }

    handleChange();
  }, [selectedDepartments, selectedSection]);

  return (
    <div className="filter-panel">
      <DepartmentSelector
        selected={selectedDepartments}
        setSelected={(s) => {
          setSelectedDepartments(s);
        }}
      />

      <div className="section-selector">
        <label htmlFor="section-select">Velg seksjon:</label>
        <select
          id="section-select"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          disabled={selectedDepartments.length === 0}
        >
          {selectedDepartments.length === 0 ? (
            <option value="">Ingen avdeling valgt</option>
          ) : (
            <>
              <option value="">-- Velg seksjon --</option>
              {availableSections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    </div>
  );
}