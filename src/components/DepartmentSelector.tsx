import "../css/DepartmentSelector.css";
import { departments } from "../data/departmentData";

interface Props {
  selected: string[];
  setSelected: (val: string[]) => void;
}

export default function DepartmentSelector({ selected, setSelected }: Props) {
  const handleSelect = (dept: string) => {
    setSelected([dept]);
  };

  return (
    <div className="department-selector">
      <label className="department-label">Velg én avdeling:</label>
      <div className="checkbox-grid">
        {departments.map((dept) => (
          <label key={dept.name} className="checkbox-item">
            <input
              type="radio"
              name="department"
              checked={selected.includes(dept.name)}
              onChange={() => handleSelect(dept.name)}
            />
            {dept.name}
          </label>
        ))}
      </div>
    </div>
  );
}