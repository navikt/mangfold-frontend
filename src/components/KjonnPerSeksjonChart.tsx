import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Heading } from "@navikt/ds-react";
import DepartmentSelector from "./DepartmentSelector";
import { kjonnData } from "../data/kjonnData";
import { roleData } from "../data/roleData";
import "../css/KjonnPerSeksjonChart.css";

interface DataEntry {
    section: string;
    department?: string;
    role?: string;
    female: number;
    male: number;
    unknown: number;
    total: number;
}

interface ChartEntry extends DataEntry {
    femaleCount: number;
    maleCount: number;
    unknownCount: number;
}

function normalizeTo100(f: number, m: number, u: number) {
    const total = f + m + u;
    if (total === 0) return { female: 0, male: 0, unknown: 0 };

    const rawF = (f / total) * 100;
    const rawM = (m / total) * 100;
    const rawU = (u / total) * 100;

    let female = Math.round(rawF);
    let male = Math.round(rawM);
    let unknown = 100 - female - male;

    if (unknown < 0) {
        unknown = Math.max(0, Math.round(rawU));
        male = Math.max(0, 100 - female - unknown);
    }

    return { female, male, unknown };
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;

    const Row = ({ color, label, value, percent }: { color: string; label: string; value: number; percent: number }) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: color,
                }}></span>
                <span>{label}</span>
            </span>
            <span><strong>{value}</strong> <span style={{ color: "#cbd5e1", marginLeft: 6 }}>{percent.toFixed(2)}%</span></span>
        </div>
    );

    return (
        <div style={{
            backgroundColor: "#1f2937",
            color: "white",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.4)",
            fontSize: "0.9rem",
            maxWidth: "300px",
        }}>
            <div style={{ fontWeight: "600", marginBottom: "0.5rem", textTransform: "uppercase" }}>{label}</div>

            <Row color="#22c55e" label="Kvinne" value={entry.femaleCount} percent={entry.female} />
            <Row color="#1e293b" label="Mann" value={entry.maleCount} percent={entry.male} />
            <Row color="#d1d5db" label="Ukjent" value={entry.unknownCount} percent={entry.unknown} />

            <div style={{
                marginTop: "0.5rem",
                borderTop: "1px solid #374151",
                paddingTop: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
            }}>
                <span>= Total</span>
                <span>{entry.total} <span style={{ color: "#9ca3af", marginLeft: 6 }}>100%</span></span>
            </div>
        </div>
    );
}

export default function KjonnPerSeksjonChart() {
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [hoveredCategory, setHoveredCategory] = useState<"female" | "male" | "unknown" | null>(null);
    const [activeView, setActiveView] = useState<"department" | "role" | null>("department");

    const baseData: DataEntry[] = activeView === "role" ? roleData : kjonnData;

    const filteredData: DataEntry[] = baseData.filter((entry) => {
        if (activeView === "department") {
            return selectedDepartments.length === 0 || selectedDepartments.includes(entry.department || "");
        }
        return true;
    });

    const chartData: ChartEntry[] = filteredData.map((entry) => {
        const { female, male, unknown } = normalizeTo100(entry.female, entry.male, entry.unknown);
        return {
            ...entry,
            female,
            male,
            unknown,
            femaleCount: entry.female,
            maleCount: entry.male,
            unknownCount: entry.unknown,
        };
    });

    const sortedData = [...chartData].sort((a, b) => b.female - a.female);

    return (
        <div>
            <Heading level="2" size="medium" spacing>
                Kjønnsfordeling per seksjon
            </Heading>

            <div className="view-toggle">
                <label>
                    <input
                        type="checkbox"
                        checked={activeView === "department"}
                        onChange={() => setActiveView(activeView === "department" ? null : "department")}
                    />
                    Se på avdeling
                </label>

                <label style={{ marginLeft: "1rem" }}>
                    <input
                        type="checkbox"
                        checked={activeView === "role"}
                        onChange={() => setActiveView(activeView === "role" ? null : "role")}
                    />
                    Se på roller
                </label>
            </div>

            {activeView && (
                <div className="legend-row">
                    <span
                        className="dot dot-female"
                        onMouseEnter={() => setHoveredCategory("female")}
                        onMouseLeave={() => setHoveredCategory(null)}
                    /> Andel kvinner

                    <span
                        className="dot dot-male"
                        onMouseEnter={() => setHoveredCategory("male")}
                        onMouseLeave={() => setHoveredCategory(null)}
                    /> Andel menn

                    <span
                        className="dot dot-unknown"
                        onMouseEnter={() => setHoveredCategory("unknown")}
                        onMouseLeave={() => setHoveredCategory(null)}
                    /> Ukjent
                </div>
            )}

            {activeView === "department" && (
                <DepartmentSelector
                    selected={selectedDepartments}
                    setSelected={setSelectedDepartments}
                />
            )}

            {activeView === "role" && (
                <div style={{ marginTop: "1rem", fontWeight: 500 }}>
                    Viser kjønnsfordeling for alle roller.
                </div>
            )}

            {activeView && (
                <>
                    <ResponsiveContainer width="100%" height={sortedData.length * 30 + 60}>
                        <BarChart
                            layout="vertical"
                            data={sortedData}
                            margin={{ top: 20, right: 60, bottom: 20, left: 220 }}
                        >
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                            <YAxis
                                type="category"
                                dataKey="section"
                                width={220}
                                tick={{ fontSize: 13 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="female"
                                stackId="a"
                                fill="#22c55e"
                                name="Kvinner"
                                fillOpacity={hoveredCategory === null || hoveredCategory === "female" ? 1 : 0.3}
                            />
                            <Bar
                                dataKey="male"
                                stackId="a"
                                fill="#1e293b"
                                name="Menn"
                                fillOpacity={hoveredCategory === null || hoveredCategory === "male" ? 1 : 0.3}
                            />
                            <Bar
                                dataKey="unknown"
                                stackId="a"
                                fill="#999b9d"
                                name="Ukjent"
                                fillOpacity={hoveredCategory === null || hoveredCategory === "unknown" ? 1 : 0.3}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#334155", marginTop: "0.5rem" }}>
                        Andel kvinner (hover for antall)
                    </p>
                </>
            )}
        </div>
    );
}