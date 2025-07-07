import { useEffect, useMemo, useState } from "react";
import { Heading, Button, Select, Checkbox, Tooltip } from "@navikt/ds-react";
import FordelingEtterAvdelinger from "./FordelingEtterAvdeling";
import FordelingEtterStilling from "./FordelingEtterStilling";
import StatBarChart from "./StatBarChart";
import "../css/ChartToggleView.css";
import { useKjonnData } from "../data/useKjonnData";

// API-type
type ApiStatEntry = {
  kategori: string;
  gruppe: string;
  kjonnAntall: {
    kvinne?: number;
    mann?: number;
    ukjent?: number;
  };
};

type NormalizedStatEntry = {
  label: string;
  female: number;
  male: number;
  unknown: number;
  femaleCount: number;
  maleCount: number;
  unknownCount: number;
  total: number;
};

const CATEGORY_LABELS = [
  { key: "ansiennitet", label: "Ansiennitet" },
  { key: "lederniva", label: "Ledernivå" },
  { key: "stillingsgruppe", label: "Stillingsgruppe" },
  { key: "utdanningsniva", label: "Utdanningsnivå" },
];

export default function StatistikkExplorer() {
  const { data: kjonnData } = useKjonnData();

  const [selectedCategory, setSelectedCategory] = useState("ansiennitet");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const [rawData, setRawData] = useState<ApiStatEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch("https://mangfold-backend.intern.nav.no/kjonn-statistikk-kategori");
        const json: ApiStatEntry[] = await res.json();
        setRawData(json);
      } catch (e) {
        console.error("Feil ved henting av statistikk:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const departmentOptions = useMemo(
    () => Array.from(new Set(kjonnData.map((d) => d.department).filter(Boolean))),
    [kjonnData]
  );

  const sectionOptionsByDepartment = useMemo(() => {
    const mapping: Record<string, string[]> = {};
    kjonnData.forEach((curr) => {
      if (!mapping[curr.department]) mapping[curr.department] = [];
      if (!mapping[curr.department].includes(curr.section)) {
        mapping[curr.department].push(curr.section);
      }
    });
    return mapping;
  }, [kjonnData]);

  const filteredData: NormalizedStatEntry[] = useMemo(() => {
    return rawData
      .filter((entry) => entry.kategori === selectedCategory)
      .map((entry) => {
        const female = entry.kjonnAntall.kvinne ?? 0;
        const male = entry.kjonnAntall.mann ?? 0;
        const unknown = entry.kjonnAntall.ukjent ?? 0;
        const total = female + male + unknown;

        const femalePercent = total ? (female / total) * 100 : 0;
        const malePercent = total ? (male / total) * 100 : 0;
        const unknownPercent = total ? (unknown / total) * 100 : 0;

        return {
          label: entry.gruppe,
          female: +femalePercent.toFixed(1),
          male: +malePercent.toFixed(1),
          unknown: +unknownPercent.toFixed(1),
          femaleCount: female,
          maleCount: male,
          unknownCount: unknown,
          total,
        };
      });
  }, [rawData, selectedCategory]);

  return (
    <div className="chart-toggle-wrapper">
      <FordelingEtterAvdelinger />
      <FordelingEtterStilling />

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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
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
            const isDisabled = !rawData.some((entry) => entry.kategori === cat.key);
            return isDisabled ? (
              <Tooltip key={cat.key} content="Ingen data tilgjengelig for denne kategorien.">
                <span className="disabled-button">{cat.label}</span>
              </Tooltip>
            ) : (
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

      {loading ? (
        <p>Laster kategori-data...</p>
      ) : (
        <StatBarChart data={filteredData} />
      )}
    </div>
  );
}
