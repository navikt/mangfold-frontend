interface Props {
  selected: string[];
  setSelected: (val: string[]) => void;
  departments: string[];
}

export default function DepartmentSelector({ selected, setSelected, departments }: Props) {
  const handleSelect = (dept: string) => {
    setSelected([dept]);
  };

  return (
    <div className="department-selector">
      <label className="department-label">Velg en avdeling:</label>
      <div className="checkbox-grid">
        {departments.map((dept) => (
          <label key={dept} className="checkbox-item">
            <input
              type="radio"
              name="department"
              checked={selected.includes(dept)}
              onChange={() => handleSelect(dept)}
            />
            {dept}
          </label>
        ))}
      </div>
    </div>
  );
}
