import { useState } from "react";
import { Heading, Button, Select, Checkbox, Tooltip } from "@navikt/ds-react";
import FordelingEtterAvdelinger from "./FordelingEtterAvdeling";
import FordelingEtterRoller from "./FordelingEtterRoller";
import StatBarChart from "./StatBarChart";
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

  const departmentOptions = Array.from(new Set(kjonnData.map((d) => d.department)));
  const categoryData: StatEntry[] = statisticsData[selectedCategory];

  return (
    <div className="chart-toggle-wrapper">
      <FordelingEtterAvdelinger />

      <FordelingEtterRoller />

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
        <Heading level="2" size="medium" spacing>
          Fordeling etter kategori
        </Heading>

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <Heading level="3" size="small">Seksjoner</Heading>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => {
                  setSelectedDepartment("");
                  setSelectedSections([]);
                  setSelectedCategory("ansiennitet");
                }}
              >
                Nullstill
              </Button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
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
          {CATEGORY_LABELS.map((cat) => {
            const isDisabled = cat.key === "utdanningsniva";

            if (isDisabled) {
              return (
                <Tooltip
                  key={cat.key}
                  content="Denne kategorien er deaktivert fordi vi mangler data."
                >
                  <span
                    style={{
                      display: "inline-block",
                      border: "2px solid #0067C5",
                      borderRadius: "0.375rem",
                      padding: "0.375rem 0.75rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#0067C5",
                      cursor: "not-allowed",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    {cat.label}
                  </span>
                </Tooltip>
              );
            }

            return (
              <Button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                variant={selectedCategory === cat.key ? "primary" : "tertiary"}
                size="small"
              >
                {cat.label}
              </Button>
            );
          })}
        </div>
      </div>
      <StatBarChart data={categoryData} />
    </div>
  );
}