import { useState, useEffect } from "react";
import { Heading, Button } from "@navikt/ds-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import ChartTableView from "./ChartTableView";
import { CustomizedAxisTick } from "./CustomizedAxisTick";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";


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

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length > 1) {
    const data = payload[0].payload;

    return (
      <div
        style={{
          background: "#2d3748",
          color: "#fff",
          padding: "0.75rem 1rem",
          borderRadius: "6px",
          fontSize: "14px",
          lineHeight: "1.6",
          boxShadow: "0 0 8px rgba(0, 0, 0, 0.4)",
        }}
      >
        <strong style={{ display: "block", marginBottom: "8px" }}>{data.label}</strong>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "4px", gap: "8px" }}>
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#38a169",
            }}
          />
          <span>
            Kvinne <strong>{data.female}%</strong> ({data.femaleCount} personer)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#1e293b",
            }}
          />
          <span>
            Mann <strong>{data.male}%</strong> ({data.maleCount} personer)
          </span>
        </div>
      </div>
    );
  }

  return null;
}

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
        Her kan du se kjønnsfordelingen i hver avdeling basert på data fra inneværende år. Oversikten viser hvor mange kvinner
        og menn som jobber i hver avdeling – både som prosentandel og i antall personer. Dette gir et tydelig bilde av hvordan
        kjønnsbalansen fordeler seg på tvers av virksomheten akkurat nå, og kan brukes som grunnlag for videre arbeid med
        likestilling og mangfold.
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
      ) : showTable ? (
        <ChartTableView showTable={true} aggregatedData={aggregatedData} />
      ) : (
        <ResponsiveContainer width="100%" height={550}>
          <BarChart
            data={aggregatedData}
            margin={{ top: 30, right: 20, left: 20, bottom: 150 }}
          >
            <XAxis
              dataKey="label"
              interval={0}
              tick={<CustomizedAxisTick />}
            />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" />
            <Bar dataKey="female" name="Kvinner" fill="#38a169" />
            <Bar dataKey="male" name="Menn" fill="#333c46" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
