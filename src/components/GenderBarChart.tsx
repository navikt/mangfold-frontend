import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Heading } from "@navikt/ds-react";

interface GenderDataEntry {
  label: string;
  female: number;
  male: number;
}

interface GenderBarChartProps {
  title: string;
  data: GenderDataEntry[];
}

export default function GenderBarChart({ title, data }: GenderBarChartProps) {
  return (
    <div style={{ width: "100%", height: 300, marginTop: "2rem" }}>
      <Heading level="3" size="small" spacing>{title}</Heading>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <XAxis dataKey="label" />
          <YAxis domain={[0, 50]} unit="%" />
          <Tooltip />
          <Legend />
          <Bar dataKey="female" fill="#38a169" name="Andel kvinner" />
          <Bar dataKey="male" fill="#2d3748" name="Andel menn" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
