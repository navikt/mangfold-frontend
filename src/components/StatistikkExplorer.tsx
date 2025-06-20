import { useState } from "react";
import { Button } from "@navikt/ds-react";
import ChartTableView from "./ChartTableView";
import YearRangeFilter from "./YearRangeFilter";
import "../css/ChartToggleView.css";

import { statisticsData } from "../data/StatistikkData";
import type { StatCategory, StatEntry } from "../data/StatistikkData";

interface Props {
  selectedDepartments: string[];
  selectedSection: string;
}

const CATEGORIES: { key: StatCategory; label: string }[] = [
  { key: "alder", label: "Alder" },
  { key: "ansiennitet", label: "Ansiennitet" },
  { key: "lederniva", label: "Ledernivå" },
  { key: "stillingsgruppe", label: "Stillingsgruppe" },
  { key: "utdanningsniva", label: "Utdanningsnivå" }
];


export default function StatistikkExplorer({
  selectedDepartments: _selectedDepartments,
  selectedSection: _selectedSection
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<StatCategory>("alder");
  const [showTable, setShowTable] = useState(false);
  const [yearRange, setYearRange] = useState<[number, number]>([2021, 2024]);

  const categoryData: StatEntry[] = statisticsData[selectedCategory]; // evt. filtrer senere

  return (
    <div className="chart-toggle-wrapper">
      <div className="control-row" style={{ marginBottom: "1rem" }}>
        <YearRangeFilter yearRange={yearRange} setYearRange={setYearRange} />

        <Button
          variant="secondary"
          onClick={() => setShowTable((prev) => !prev)}
          style={{ marginTop: "1rem" }}
        >
          {showTable ? "Vis som figur" : "Vis som tabell"}
        </Button>
      </div>

      <div className="category-tabs" style={{ marginBottom: "1rem" }}>
        {CATEGORIES.map((cat) => (
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

      <ChartTableView
        showTable={showTable}
        aggregatedData={categoryData}
        yearRange={yearRange}
      />
    </div>
  )
}