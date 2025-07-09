import { useState, useEffect } from "react";
import { Heading, Button } from "@navikt/ds-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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
    const totalCount = (data.femaleCount ?? 0) + (data.maleCount ?? 0);

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
              borderRadius: "0px",
              backgroundColor: "#38a169",
            }}
          />
          <span>
            Kvinner <strong>{data.female}%</strong> ({data.femaleCount} personer)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "0px",
              backgroundColor: "#1e293b",
            }}
          />
          <span>
            Menn <strong>{data.male}%</strong> ({data.maleCount} personer)
          </span>
        </div>

        <div style={{ borderTop: "1px solid #ccc", paddingTop: "6px", marginTop: "4px" }}>
          Totalt: 100% (<strong>{totalCount}</strong> personer)
        </div>
      </div>
    );
  }

  return null;
}


export default function StatistikkPanel() {
  const [showTable, setShowTable] = useState(false);
  const [selectedYear] = useState(new Date().getFullYear());
  const yearRange: [number, number] = [selectedYear, selectedYear];
  const [hovered, setHovered] = useState<string | null>(null);
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

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '1rem' 
      }}>
        <Button variant="secondary" onClick={() => setShowTable((prev) => !prev)}>
          {showTable ? "Vis som figur" : "Vis som tabell"}
        </Button>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center',
          zIndex: 1
        }}>
          {!showTable && (
            <div style={{ 
              display: "flex", 
              gap: "1.5rem", 
              alignItems: "center",
              background: 'white',
              padding: '4px 12px',
              borderRadius: '4px'
            }}>
              <span
                className="gender-label"
                onMouseEnter={() => setHovered("female")}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="gender-square"
                  style={{ background: "#38a169" }}
                />
                Kvinner
              </span>

              <span
                className="gender-label"
                onMouseEnter={() => setHovered("male")}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="gender-square"
                  style={{ background: "#1e293b" }}
                />
                Menn
              </span>
            </div>
          )}
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
              <Bar
                dataKey="female"
                name="Kvinner"
                fill="#38a169"
                fillOpacity={hovered === "female" || hovered === null ? 1 : 0.3}
              />
              <Bar
                dataKey="male"
                name="Menn"
                fill="#333c46"
                fillOpacity={hovered === "male" || hovered === null ? 1 : 0.3}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
