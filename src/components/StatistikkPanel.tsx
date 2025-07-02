import { useState, useEffect } from "react";
import { Heading, Button } from "@navikt/ds-react";
import ChartTableView from "./ChartTableView";
type ApiAvdeling = {
  gruppe: string;
  kjonnAntall: {
    kvinne?: number;
    mann?: number;
  };
};

type AggregatedAvdeling = {
  label: string;
  male: number;
  female: number;
  maleCount: number;
  femaleCount: number;
};
export default function StatistikkPanel() {
  const [selectedYear] = useState(new Date().getFullYear());
  const yearRange: [number, number] = [selectedYear, selectedYear];
  
  const [showTable, setShowTable] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<AggregatedAvdeling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchAvdelingsData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("https://mangfold-backend.intern.nav.no/kjonn-per-avdeling");
        if (!res.ok) throw new Error("Kunne ikke hente kjønnsdata for avdelinger");
        const data: ApiAvdeling[] = await res.json();

        const aggregated = data.map((entry) => {
          const femaleCount = entry.kjonnAntall.kvinne ?? 0;
          const maleCount = entry.kjonnAntall.mann ?? 0;
          const total = femaleCount + maleCount;
          return {
            label: entry.gruppe,
            male: total ? +(maleCount / total * 100).toFixed(1) : 0,
            female: total ? +(femaleCount / total * 100).toFixed(1) : 0,
            maleCount,
            femaleCount,
          };
        });
        setAggregatedData(aggregated);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAvdelingsData();
  }, []);
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
        <Button variant="secondary" onClick={() => setShowTable((prev) => !prev)}>
          {showTable ? "Vis som figur" : "Vis som tabell"}
        </Button>
      </div>
      {loading ? (
        <p>Laster avdelingsdata...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <ChartTableView showTable={showTable} aggregatedData={aggregatedData} />
      )}
    </div>
  );
}