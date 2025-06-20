import "../css/DepartmentSelector.css";
import { departments } from "../data/departmentData";


interface Props {
  selected: string[];
  setSelected: (val: string[]) => void;
}

export default function DepartmentSelector({ selected, setSelected }: Props) {
  const toggleDepartment = (dept: string) => {
    if (selected.includes(dept)) {
      setSelected(selected.filter((d) => d !== dept));
    } else {
      setSelected([...selected, dept]);
    }
  };

  return (
    <div className="department-selector">

      <label className="department-label">
     For nærmere detaljer for velg avdeling:
      </label>
      <div className="checkbox-grid">
        {departments.map((dept) => (
          <label key={dept.name} className="checkbox-item">
            <input
              type="checkbox"
              checked={selected.includes(dept.name)}
              onChange={() => toggleDepartment(dept.name)}
            />
            {dept.name}
          </label>
        ))}
      </div>
    </div>
  );
}