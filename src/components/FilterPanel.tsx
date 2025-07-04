import { useEffect, useState } from "react";
import DepartmentSelector from "./DepartmentSelector";
import "../css/FilterPanel.css";

interface ApiEntry {
  department: string;
  section: string;
  kjonnAntall: {
    kvinne?: number;
    mann?: number;
    ukjent?: number;
  };
}

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
  const [data, setData] = useState<ApiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("https://mangfold-backend.intern.nav.no/kjonn-per-seksjon");
        if (!res.ok) throw new Error("Klarte ikke hente seksjonsdata");
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || "Ukjent feil");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const allDepartments = Array.from(new Set(data.map((d) => d.department).filter(Boolean)));

  const availableSections =
    selectedDepartments.length > 0
      ? data
          .filter((d) => selectedDepartments.includes(d.department))
          .map((d) => d.section)
      : [];

  // Fjern duplikate seksjoner
  const uniqueSections = Array.from(new Set(availableSections));

  useEffect(() => {
    if (selectedSection && !uniqueSections.includes(selectedSection)) {
      setSelectedSection("");
    }

    onFilterChange({
      departments: selectedDepartments,
      section: selectedSection,
    });
  }, [selectedDepartments, selectedSection]);

  if (loading) return <p>Laster data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="filter-panel">
      <DepartmentSelector
        selected={selectedDepartments}
        setSelected={setSelectedDepartments}
        departments={allDepartments}
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
              {uniqueSections.map((section) => (
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