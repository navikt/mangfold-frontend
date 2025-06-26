import { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Heading } from "@navikt/ds-react";
import DepartmentSelector from "./DepartmentSelector";
import { alderData } from "../data/alderData";
import { roleData } from "../data/roleData";
import "../css/KjonnPerSeksjonChart.css";

interface DataEntry {
    section: string;
    department?: string;
    role?: string;
    under35: number;
    age35to50: number;
    over50: number;
    unknown?: number;
    total: number;
}

interface ChartEntry extends DataEntry {
    under35Percent: number;
    age35to50Percent: number;
    over50Percent: number;
    unknownPercent: number;
    under35Count: number;
    age35to50Count: number;
    over50Count: number;
    unknownCount: number;
}

function normalizeTo100(u35: number, a35_50: number, o50: number, unknown = 0) {
    const total = u35 + a35_50 + o50 + unknown;
    if (total === 0) return { under35: 0, age35to50: 0, over50: 0, unknown: 0 };

    const rawU35 = (u35 / total) * 100;
    const rawA35_50 = (a35_50 / total) * 100;
    const rawO50 = (o50 / total) * 100;
    const rawUnknown = (unknown / total) * 100;

    let under35 = Math.round(rawU35);
    let age35to50 = Math.round(rawA35_50);
    let over50 = Math.round(rawO50);
    let unknownRounded = 100 - under35 - age35to50 - over50;

    if (unknownRounded < 0) {
        unknownRounded = Math.max(0, Math.round(rawUnknown));
        over50 = Math.max(0, 100 - under35 - age35to50 - unknownRounded);
    }

    return { under35, age35to50, over50, unknown: unknownRounded };
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;

    const Row = ({ color, label, value, percent }: { color: string; label: string; value: number; percent: number }) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }}></span>
                <span>{label}</span>
            </span>
            <span><strong>{value}</strong> <span style={{ color: "#cbd5e1", marginLeft: 6 }}>{percent.toFixed(2)}%</span></span>
        </div>
    );

    return (
        <div style={{ backgroundColor: "#1f2937", color: "white", padding: "0.75rem 1rem", borderRadius: "0.5rem", boxShadow: "0px 2px 10px rgba(0,0,0,0.4)", fontSize: "0.9rem", maxWidth: "300px" }}>
            <div style={{ fontWeight: "600", marginBottom: "0.5rem", textTransform: "uppercase" }}>{label}</div>
            <Row color="#32bf66" label="35 og under" value={entry.under35Count} percent={entry.under35Percent} />
            <Row color="#208444" label="35–50" value={entry.age35to50Count} percent={entry.age35to50Percent} />
            <Row color="#0e4d1b" label="50 og over" value={entry.over50Count} percent={entry.over50Percent} />
            <Row color="#999b9d" label="Ukjent" value={entry.unknownCount} percent={entry.unknownPercent} />
            <div style={{ marginTop: "0.5rem", borderTop: "1px solid #374151", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                <span>= Total</span>
                <span>{entry.total} <span style={{ color: "#cbd5e1", marginLeft: 6 }}>100%</span></span>
            </div>
        </div>
    );
}

export default function AlderPerSeksjonChart() {
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [hoveredCategory, setHoveredCategory] = useState<"under35" | "age35to50" | "over50" | "unknown" | null>(null);
    const [activeView, setActiveView] = useState<"department" | "role" | null>(null);

    const baseData: DataEntry[] =
        activeView === "role" ? roleData :
            activeView === "department" ? alderData :
                [];

    const filteredData = baseData.filter((entry) =>
        activeView === "department"
            ? selectedDepartments.length === 0 || selectedDepartments.includes(entry.department || "")
            : true
    );

    const chartData: ChartEntry[] = filteredData.map((entry) => {
        const unknown = entry.total - (entry.under35 + entry.age35to50 + entry.over50);
        const { under35, age35to50, over50, unknown: unknownPercent } = normalizeTo100(entry.under35, entry.age35to50, entry.over50, unknown);

        return {
            ...entry,
            under35Percent: under35,
            age35to50Percent: age35to50,
            over50Percent: over50,
            unknownPercent,
            under35Count: entry.under35,
            age35to50Count: entry.age35to50,
            over50Count: entry.over50,
            unknownCount: unknown,
        };
    });

    const sortedData = [...chartData].sort((a, b) => b.under35Percent - a.under35Percent);

    return (
        <div>
            <Heading level="2" size="medium" spacing>
                Aldersfordeling per seksjon
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
                <>
                    <div className="legend-row" style={{ marginTop: "1rem" }}>
                        <span className="dot dot-under35" onMouseEnter={() => setHoveredCategory("under35")} onMouseLeave={() => setHoveredCategory(null)} /> 35 og under
                        <span className="dot dot-age35to50" onMouseEnter={() => setHoveredCategory("age35to50")} onMouseLeave={() => setHoveredCategory(null)} /> 35–50
                        <span className="dot dot-over50" onMouseEnter={() => setHoveredCategory("over50")} onMouseLeave={() => setHoveredCategory(null)} /> 50 og over
                        <span className="dot dot-unknown" onMouseEnter={() => setHoveredCategory("unknown")} onMouseLeave={() => setHoveredCategory(null)} /> Ukjent
                    </div>

                    {activeView === "department" && (
                        <DepartmentSelector selected={selectedDepartments} setSelected={setSelectedDepartments} />
                    )}

                    <ResponsiveContainer width="100%" height={sortedData.length * 30 + 60}>
                        <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 60, bottom: 20, left: 220 }}>
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                            <YAxis type="category" dataKey="section" width={220} tick={{ fontSize: 13 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="under35Percent" stackId="a" fill="#32bf66" fillOpacity={hoveredCategory === null || hoveredCategory === "under35" ? 1 : 0.3} />
                            <Bar dataKey="age35to50Percent" stackId="a" fill="#208444" fillOpacity={hoveredCategory === null || hoveredCategory === "age35to50" ? 1 : 0.3} />
                            <Bar dataKey="over50Percent" stackId="a" fill="#0e4d1b" fillOpacity={hoveredCategory === null || hoveredCategory === "over50" ? 1 : 0.3} />
                            <Bar dataKey="unknownPercent" stackId="a" fill="#999b9d" fillOpacity={hoveredCategory === null || hoveredCategory === "unknown" ? 1 : 0.3} />
                        </BarChart>
                    </ResponsiveContainer>

                    <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#334155", marginTop: "0.5rem" }}>
                        Andel i hver aldersgruppe (hover for antall)
                    </p>
                </>
            )}
        </div>
    );
}
