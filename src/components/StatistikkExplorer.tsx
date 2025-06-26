import { useState } from "react";
import { Heading,Button,Select,Checkbox} from "@navikt/ds-react";
import KjonnPerSeksjonChart from "./KjonnPerSeksjonChart";
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,Legend,
} from "recharts";

import "../css/ChartToggleView.css";
import { kjonnData } from "../data/kjonnData";
import { statisticsData } from "../data/StatistikkData";
import type { StatCategory, StatEntry } from "../data/StatistikkData";

const CATEGORY_LABELS: { key: StatCategory; label: string }[] = [
  { key: "ansiennitet", label: "Ansiennitet" },
  { key: "lederniva", label: "Ledernivå" },
  { key: "stillingsgruppe", label: "Stillingsgruppe" },
  { key: "utdanningsniva", label: "Utdanningsnivå" },
];

const sectionOptionsByDepartment: Record<string, string[]> = Array.from(
  kjonnData.reduce((acc, curr) => {
    if (!acc.has(curr.department)) acc.set(curr.department, new Set());
    acc.get(curr.department)?.add(curr.section);
    return acc;
  }, new Map<string, Set<string>>())
).reduce((acc, [department, sections]) => {
  acc[department] = Array.from(sections);
  return acc;
}, {} as Record<string, string[]>);

export default function StatistikkExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<StatCategory>("ansiennitet");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const departmentOptions = Array.from(
    new Set(kjonnData.map((d) => d.department))
  );

  const categoryData: StatEntry[] = statisticsData[selectedCategory];

  return (
    <div className="chart-toggle-wrapper">
      <KjonnPerSeksjonChart />

      <hr className="section-divider" />
      <Heading level="2" size="medium" spacing>
        Fordeling etter kategori
      </Heading>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}
      >
        <Select
          label="Velg avdeling"
          id="department-select"
          value={selectedDepartment}
          onChange={(e) => {
            setSelectedDepartment(e.target.value);
            setSelectedSections([]);
          }}
          style={{ width: "280px" }}
        >
          <option value="">Hele direktoratet</option>
          {departmentOptions.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </Select>

        {selectedDepartment && sectionOptionsByDepartment[selectedDepartment] && (
          <div>
            <Heading level="3" size="small">Seksjoner</Heading>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                marginTop: "0.5rem",
              }}
            >
              {sectionOptionsByDepartment[selectedDepartment].map((section) => (
                <Checkbox
                  key={section}
                  checked={selectedSections.includes(section)}
                  onChange={(e) => {
                    setSelectedSections((prev) =>
                      e.target.checked
                        ? [...prev, section]
                        : prev.filter((s) => s !== section)
                    );
                  }}
                >
                  {section}
                </Checkbox>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {CATEGORY_LABELS.map((cat) => (
            <Button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              variant={selectedCategory === cat.key ? "primary" : "tertiary"}
              size="small"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={categoryData}
          margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
        >
          <XAxis dataKey="label" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip />
          <Legend />
          <Bar dataKey="female" fill="#22c55e" name="Kvinner" />
          <Bar dataKey="male" fill="#1e293b" name="Menn" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
