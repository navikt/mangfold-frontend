import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

interface StatEntry {
    label: string;
    female: number;
    male: number;
    femaleCount?: number;
    maleCount?: number;
}

interface StatBarChartProps {
    data: StatEntry[];
}

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

                <div style={{ color: "#38a169" }}>
                    <strong>Andel kvinner:</strong> {female?.value}%{" "}
                    <span style={{ fontSize: "0.85rem", color: "#38a169" }}>
                        ({female?.payload?.femaleCount ?? "?"} personer)
                    </span>
                </div>

                <div style={{ color: "#2d3748", marginTop: "0.25rem" }}>
                    <strong>Andel menn:</strong> {male?.value}%{" "}
                    <span style={{ fontSize: "0.85rem", color: "#2d3748" }}>
                        ({male?.payload?.maleCount ?? "?"} personer)
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export default function StatBarChart({ data }: StatBarChartProps) {
    return (
        <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="female" fill="#38a169" name="Kvinner" />
                    <Bar dataKey="male" fill="#2d3748" name="Menn" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}