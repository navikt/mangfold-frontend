import { useState } from "react";
import { Heading, Button } from "@navikt/ds-react";
import { genderChartData } from "../data/genderStats";
import ChartTableView from "./ChartTableView";

const aggregateDataForRange = (start: number, end: number, data: any) => {
  const result: Record<string, { male: number; female: number; maleCount: number; femaleCount: number; count: number }> = {};

  for (let y = start; y <= end; y++) {
    const entries = data[String(y)] || [];
    entries.forEach(({ label, male, female }: any) => {
      if (!result[label]) result[label] = { male: 0, female: 0, maleCount: 0, femaleCount: 0, count: 0 };
      result[label].male += male;
      result[label].female += female;
      result[label].maleCount += male;
      result[label].femaleCount += female;
      result[label].count += 1;
    });
  }

  return Object.entries(result).map(([label, { male, female, maleCount, femaleCount, count }]) => ({
    label,
    male: +(male / count).toFixed(1),
    female: +(female / count).toFixed(1),
    maleCount,
    femaleCount,
  }));
};

export default function StatistikkPanel() {
  const yearRange: [number, number] = [2025, 2025]; // Fast år
  const [showTable, setShowTable] = useState(false);
  const aggregatedData = aggregateDataForRange(yearRange[0], yearRange[1], genderChartData);

  return (
    <div className="chart-toggle-wrapper">
      <Heading level="3" size="small" spacing>
        Oversikt over kvinner og menn i hver avdeling – {yearRange[0]}
      </Heading>

      <p>
        Her kan du se kjønnsfordelingen i hver avdeling basert på data fra inneværende år.
        Oversikten viser hvor mange kvinner og menn som jobber i hver avdeling – både som prosentandel og i antall personer.
        Dette gir et tydelig bilde av hvordan kjønnsbalansen fordeler seg på tvers av virksomheten akkurat nå, og kan brukes som
        grunnlag for videre arbeid med likestilling og mangfold.
      </p>

      <div className="control-row" style={{ alignItems: "flex-end" }}>
        {/* <YearRangeFilter yearRange={yearRange} setYearRange={setYearRange} /> */}
        <Button variant="secondary" onClick={() => setShowTable((prev) => !prev)}>
          {showTable ? "Vis som figur" : "Vis som tabell"}
        </Button>
      </div>

      <ChartTableView showTable={showTable} aggregatedData={aggregatedData} yearRange={yearRange} />
    </div>

  );
}