import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Heading } from "@navikt/ds-react";
import DepartmentSelector from "./DepartmentSelector";
import "../css/KjonnPerSeksjonChart.css";
import { useKjonnData } from "../data/useKjonnData";
import { useKjonnPerRolle } from "../data/useKjonnPerRolle";

interface DataEntry {
  section: string;
  department?: string;
  role?: string;
  female: number;
  male: number;
  unknown: number;
  total: number;
}

interface ChartEntry extends DataEntry {
  femaleCount: number;
  maleCount: number;
  unknownCount: number;
}

function normalizeTo100(f: number, m: number, u: number) {
  const total = f + m + u;
  if (total === 0) return { female: 0, male: 0, unknown: 0 };
  const rawF = (f / total) * 100;
  const rawM = (m / total) * 100;
  let female = Math.round(rawF);
  let male = Math.round(rawM);
  let unknown = 100 - female - male;
  if (unknown < 0) {
    unknown = 0;
    female = Math.round(rawF);
    male = 100 - female;
  }
  return { female, male, unknown };
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0].payload;

  const Row = ({ color, label, value, percent }: { color: string; label: string; value: number; percent: number }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 10, height: 10, borderRadius: "50%", backgroundColor: color,
        }}></span>
        <span>{label}</span>
      </span>
      <span><strong>{value}</strong> <span style={{ color: "#cbd5e1", marginLeft: 6 }}>{percent.toFixed(2)}%</span></span>
    </div>
  );

  return (
    <div style={{
      backgroundColor: "#2d3748", color: "white", padding: "0.75rem 1rem", borderRadius: "0.5rem",
      boxShadow: "0px 2px 10px rgba(0,0,0,0.4)", fontSize: "0.9rem", maxWidth: "300px",
    }}>
      <div style={{ fontWeight: "600", marginBottom: "0.5rem", textTransform: "uppercase" }}>{label}</div>
      <Row color="#38a169" label="Kvinne" value={entry.femaleCount} percent={entry.female} />
      <Row color="#1e293b" label="Mann" value={entry.maleCount} percent={entry.male} />
      <Row color="#d1d5db" label="Ukjent" value={entry.unknownCount} percent={entry.unknown} />
      <div style={{
        marginTop: "0.5rem", borderTop: "1px solid #374151", paddingTop: "0.5rem",
        display: "flex", justifyContent: "space-between", fontWeight: "bold",
      }}>
        <span>= Total</span>
        <span>{entry.total} <span style={{ color: "#9ca3af", marginLeft: 6 }}>100%</span></span>
      </div>
    </div>
  );
}

export default function KjonnPerSeksjonChart() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<"female" | "male" | "unknown" | null>(null);
  const [activeView, setActiveView] = useState<"department" | "role" | null>(null);

  const { data: kjonnData, departments } = useKjonnData();
  const { data: rolleData } = useKjonnPerRolle();

  const baseData: DataEntry[] = activeView === "role"
    ? rolleData.map(({ section, female, male, unknown, total, femaleCount, maleCount, unknownCount }) => ({
        section,
        female,
        male,
        unknown,
        total,
        femaleCount,
        maleCount,
        unknownCount,
      }))
    : kjonnData;

  const filteredData: DataEntry[] = baseData.filter((entry) => {
    if (activeView === "department") {
      return selectedDepartments.length > 0 && selectedDepartments.includes(entry.department || "");
    }
    return true;
  });

  const chartData: ChartEntry[] = filteredData.map((entry) => {
    const { female, male, unknown } = normalizeTo100(entry.female, entry.male, entry.unknown);
    return {
      ...entry,
      female,
      male,
      unknown,
      femaleCount: entry.female,
      maleCount: entry.male,
      unknownCount: entry.unknown,
    };
  });

  const sortedData = [...chartData].sort((a, b) => b.female - a.female);

  const handleDepartmentView = () => {
    if (activeView === "department") {
      setActiveView(null);
      setSelectedDepartments([]);
    } else {
      setActiveView("department");
      if (selectedDepartments.length === 0) {
        if (departments && departments.length > 0) {
          setSelectedDepartments([departments[0]]);
        } else if (kjonnData.length > 0) {
          const firstDept = kjonnData[0].department;
          if (firstDept) setSelectedDepartments([firstDept]);
        }
      }
    }
  };

  return (
    <div>
      <Heading level="2" size="medium" spacing>
        Fordeling etter kjønn – gruppert etter {activeView === "role" ? "roller" : "avdeling"}
      </Heading>

      <div className="view-toggle">
        <label>
          <input type="checkbox" checked={activeView === "department"} onChange={handleDepartmentView} />
          Se på avdeling
        </label>

        <label style={{ marginLeft: "1rem" }}>
          <input type="checkbox" checked={activeView === "role"} onChange={() => setActiveView(activeView === "role" ? null : "role")} />
          Se på roller
        </label>

        {activeView && (
          <button type="button" className="reset-button" onClick={() => {
            setActiveView(null);
            setSelectedDepartments([]);
          }} style={{ marginLeft: "1rem" }}>
            Nullstill
          </button>
        )}
      </div>

      <div className="view-toggle">
        {activeView === "department" && (
          <p style={{ marginBottom: "1rem" }}>
            Her kan du se kjønnsfordelingen i hver seksjon, filtrert etter hvilken avdeling de tilhører.
          </p>
        )}
        {activeView === "role" && (
          <p style={{ marginBottom: "1rem" }}>
            Her ser du kjønnsfordelingen fordelt på roller uavhengig av avdeling.
          </p>
        )}
      </div>

      {activeView && (
        <div className="legend-row">
          <span className="dot dot-female" onMouseEnter={() => setHoveredCategory("female")} onMouseLeave={() => setHoveredCategory(null)} /> Kvinner
          <span className="dot dot-male" onMouseEnter={() => setHoveredCategory("male")} onMouseLeave={() => setHoveredCategory(null)} /> Menn
          <span className="dot dot-unknown" onMouseEnter={() => setHoveredCategory("unknown")} onMouseLeave={() => setHoveredCategory(null)} /> Ukjent
        </div>
      )}

      {activeView === "department" && (
        <DepartmentSelector
          selected={selectedDepartments}
          setSelected={setSelectedDepartments}
          departments={departments}
        />
      )}

      {activeView === "role" && (
        <div style={{ marginTop: "1rem", fontWeight: 500 }}>
          Viser kjønnsfordeling for alle roller.
        </div>
      )}

      {activeView && (
        <>
          <ResponsiveContainer width="100%" height={sortedData.length * 30 + 60}>
            <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 60, bottom: 20, left: 220 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="section" width={220} tick={{ fontSize: 13 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="female" stackId="a" fill="#38a169" fillOpacity={hoveredCategory === null || hoveredCategory === "female" ? 1 : 0.3} />
              <Bar dataKey="male" stackId="a" fill="#1e293b" fillOpacity={hoveredCategory === null || hoveredCategory === "male" ? 1 : 0.3} />
              <Bar dataKey="unknown" stackId="a" fill="#999b9d" fillOpacity={hoveredCategory === null || hoveredCategory === "unknown" ? 1 : 0.3} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#000000", marginTop: "0.5rem" }}>
            Andel kvinner (hover for antall)
          </p>
        </>
      )}
    </div>
  );
}