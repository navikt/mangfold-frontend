import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getKjonnFarger } from "../utils/kjonnFarger";
// import { Heading } from "@navikt/ds-react";

interface GenderDataEntry {
  label: string;
  female: number;
  male: number;
  femaleCount?: number;
  maleCount?: number;
}

interface GenderBarChartProps {
  // title: string;
  data: GenderDataEntry[];
}

const kjonnFarger = getKjonnFarger();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length >= 2) {
    const female = payload.find((p: any) => p.dataKey === "female");
    const male = payload.find((p: any) => p.dataKey === "male");

    return (
      <div
        style={{
          background: "white",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "0.5rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          fontSize: "0.9rem",
          lineHeight: "1.5",
          minWidth: "220px"
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "1rem" }}>{label}</div>

        <div style={{ color: kjonnFarger.get("female") }}>
          <strong>Andel kvinner:</strong> {female?.value}%{" "}
          <span style={{ fontSize: "0.85rem", color: "#4a5568" }}>
            ({female?.payload?.femaleCount ?? "?"} personer)
          </span>
        </div>

        <div style={{ color: kjonnFarger.get("male"), marginTop: "0.25rem" }}>
          <strong>Andel menn:</strong> {male?.value}%{" "}
          <span style={{ fontSize: "0.85rem", color: "#4a5568" }}>
            ({male?.payload?.maleCount ?? "?"} personer)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function GenderBarChart({ /*title*/ data }: GenderBarChartProps) {
  return (
    <div style={{ width: "100%", height: 300, marginTop: "2rem" }}>
      {/*<Heading level="3" size="small" spacing>{title}</Heading>*/}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <XAxis dataKey="label" />
          <YAxis domain={[0, 100]} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="female" fill={kjonnFarger.get("female")} name="Andel kvinner" />
          <Bar dataKey="male" fill={kjonnFarger.get("male")} name="Andel menn" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}