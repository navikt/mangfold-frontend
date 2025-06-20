import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface Props {
    data: { år: string | number; menn: number; kvinner: number }[];
    title: string;
}


export default function SimpleLineChart({ data, title }: Props) {
    return (
        <div
            style={{
                backgroundColor: "#f7f8f9",
                padding: "1rem 1rem 0 1rem",
                borderRadius: "0.5rem",
                marginTop: "1rem",
            }}
        >
            <h3 style={{ fontWeight: "bold", marginBottom: "1rem" }}>{title}</h3>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                    <CartesianGrid stroke="#e6e6e6" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="år"
                        tick={{ fontSize: 12 }}
                        label={{ value: "År", position: "insideBottomRight", offset: -5 }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        label={{
                            value: "Antall",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                            style: { textAnchor: "middle" },
                        }}
                    />
                    <Tooltip
                        contentStyle={{ fontSize: 12 }}
                        labelStyle={{ fontWeight: 500 }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: 12 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="menn"
                        stroke="#e37373"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="kvinner"
                        stroke="#3d495c"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
