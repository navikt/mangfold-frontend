import { useState } from "react";
import { Heading, Button } from "@navikt/ds-react";
import { genderChartData } from "../data/genderStats";
import YearRangeFilter from "./YearRangeFilter";
import ChartTableView from "./ChartTableView";

const aggregateDataForRange = (start: number, end: number, data: any) => {
  const result: Record<string, { male: number; female: number; count: number }> = {};
  for (let y = start; y <= end; y++) {
    const entries = data[String(y)] || [];
    entries.forEach(({ label, male, female }: any) => {
      if (!result[label]) result[label] = { male: 0, female: 0, count: 0 };
      result[label].male += male;
      result[label].female += female;
      result[label].count += 1;
    });
  }
  return Object.entries(result).map(([label, { male, female, count }]) => ({
    label,
    male: +(male / count).toFixed(1),
    female: +(female / count).toFixed(1),
  }));
};

export default function StatistikkPanel() {
  const [yearRange, setYearRange] = useState<[number, number]>([2020, 2025]);
  const [showTable, setShowTable] = useState(false);
  const aggregatedData = aggregateDataForRange(yearRange[0], yearRange[1], genderChartData);

  return (
    <div className="chart-toggle-wrapper">
      <Heading level="3" size="small" spacing>
        Velg hvilket år eller årsperiode du vil se statistikk 
      </Heading>

      <div className="control-row" style={{ alignItems: "flex-end" }}>
        <YearRangeFilter yearRange={yearRange} setYearRange={setYearRange} />
        <Button variant="secondary" onClick={() => setShowTable((prev) => !prev)}>
          {showTable ? "Vis som figur" : "Vis som tabell"}
        </Button>
      </div>

      <ChartTableView showTable={showTable} aggregatedData={aggregatedData} yearRange={yearRange} />
    </div>
  );
}
