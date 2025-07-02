import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Heading } from "@navikt/ds-react";
import { roleData } from "../data/roleData";
import "../css/KjonnPerSeksjonChart.css";

type ViewType = "kjonn" | "alder";

const ViewDescriptions = {
    kjonn: "Her ser du kjønnsfordelingen per rolle. Du kan holde musepekeren over for å se nøyaktig antall kvinner, menn og ukjente.",
    alder: "Her ser du aldersfordelingen per rolle. Du kan holde musepekeren over for å se antall i hver aldersgruppe og ukjente.",
};

interface CombinedEntry {
    section: string;
    female: number;
    male: number;
    unknown: number;
    under35: number;
    age35to50: number;
    over50: number;
    total: number;
}

interface GenderChartEntry extends CombinedEntry {
    femaleCount: number;
    maleCount: number;
    unknownCount: number;
    female: number;
    male: number;
    unknown: number;
}

interface AgeChartEntry extends CombinedEntry {
    under35Percent: number;
    age35to50Percent: number;
    over50Percent: number;
    unknownPercent: number;
    under35Count: number;
    age35to50Count: number;
    over50Count: number;
    unknownCount: number;
}

function normalizeGender(f: number, m: number, u: number) {
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

function normalizeAge(u35: number, a35_50: number, o50: number, unknown = 0) {
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
    const isGender = "femaleCount" in entry;

    const Row = ({ color, label, value, percent }: { color: string; label: string; value: number; percent: number }) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }}></span>
                <span>{label}</span>
            </span>
            <span>
                <strong>{value}</strong>{" "}
                <span style={{ color: "#cbd5e1", marginLeft: 6 }}>{percent.toFixed(2)}%</span>
            </span>
        </div>
    );

    return (
        <div style={{ backgroundColor: "#2d3748", color: "white", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.9rem" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{label}</div>
            {isGender ? (
                <>
                    <Row color="#38a169" label="Kvinne" value={entry.femaleCount} percent={entry.female} />
                    <Row color="#1e293b" label="Mann" value={entry.maleCount} percent={entry.male} />
                    <Row color="#d1d5db" label="Ukjent" value={entry.unknownCount} percent={entry.unknown} />
                </>
            ) : (
                <>
                    <Row color="#32bf66" label="35 og under" value={entry.under35Count} percent={entry.under35Percent} />
                    <Row color="#208444" label="35–50" value={entry.age35to50Count} percent={entry.age35to50Percent} />
                    <Row color="#0e4d1b" label="50 og over" value={entry.over50Count} percent={entry.over50Percent} />
                    <Row color="#999b9d" label="Ukjent" value={entry.unknownCount} percent={entry.unknownPercent} />
                </>
            )}
        </div>
    );
}

export default function FordelingEtterRoller() {
    const [visning, setVisning] = useState<ViewType>("kjonn");
    const [hovered, setHovered] = useState<string | null>(null);

    const chartData: (GenderChartEntry | AgeChartEntry)[] = roleData.map((entry) => {
        if (visning === "kjonn") {
            const { female, male, unknown } = normalizeGender(entry.female, entry.male, entry.unknown);
            return {
                ...entry,
                female,
                male,
                unknown,
                femaleCount: entry.female,
                maleCount: entry.male,
                unknownCount: entry.unknown,
            };
        } else {
            const knownTotal = entry.under35 + entry.age35to50 + entry.over50;
            const unknownAge = entry.total - knownTotal;
            const { under35, age35to50, over50, unknown } = normalizeAge(entry.under35, entry.age35to50, entry.over50, unknownAge);
            return {
                ...entry,
                under35Percent: under35,
                age35to50Percent: age35to50,
                over50Percent: over50,
                unknownPercent: unknown,
                under35Count: entry.under35,
                age35to50Count: entry.age35to50,
                over50Count: entry.over50,
                unknownCount: unknownAge,
            };
        }
    });

    const sortedData = [...chartData].sort((a, b) => {
        if (visning === "kjonn") return (b as GenderChartEntry).female - (a as GenderChartEntry).female;
        return (b as AgeChartEntry).under35Percent - (a as AgeChartEntry).under35Percent;
    });

    return (
        <div>
            <Heading level="2" size="medium" spacing>
                Fordeling etter {visning === "kjonn" ? "kjønn" : "alder"} – gruppert etter rolle
            </Heading>

            <p style={{ marginBottom: "1rem" }}>{ViewDescriptions[visning]}</p>

            <div style={{ marginBottom: "1rem" }}>
                <label>
                    <input type="radio" checked={visning === "kjonn"} onChange={() => setVisning("kjonn")} /> Vis kjønn
                </label>
                <label style={{ marginLeft: "1rem" }}>
                    <input type="radio" checked={visning === "alder"} onChange={() => setVisning("alder")} /> Vis alder
                </label>
            </div>

            <div className="legend-row">
                {visning === "kjonn" ? (
                    <>
                        <span className="dot dot-female" onMouseEnter={() => setHovered("female")} onMouseLeave={() => setHovered(null)} /> Kvinner
                        <span className="dot dot-male" onMouseEnter={() => setHovered("male")} onMouseLeave={() => setHovered(null)} /> Menn
                        <span className="dot dot-unknown" onMouseEnter={() => setHovered("unknown")} onMouseLeave={() => setHovered(null)} /> Ukjent
                    </>
                ) : (
                    <>
                        <span className="dot dot-under35" onMouseEnter={() => setHovered("under35")} onMouseLeave={() => setHovered(null)} /> 35 og under
                        <span className="dot dot-age35to50" onMouseEnter={() => setHovered("age35to50")} onMouseLeave={() => setHovered(null)} /> 35–50
                        <span className="dot dot-over50" onMouseEnter={() => setHovered("over50")} onMouseLeave={() => setHovered(null)} /> 50 og over
                        <span className="dot dot-unknown" onMouseEnter={() => setHovered("unknown")} onMouseLeave={() => setHovered(null)} /> Ukjent
                    </>
                )}
            </div>

            <ResponsiveContainer width="100%" height={sortedData.length * 30 + 60}>
                <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 60, bottom: 20, left: 220 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="section" width={220} tick={{ fontSize: 13 }} />
                    <Tooltip content={<CustomTooltip />} />
                    {visning === "kjonn" ? (
                        <>
                            <Bar dataKey="female" stackId="a" fill="#38a169" fillOpacity={hovered === null || hovered === "female" ? 1 : 0.3} />
                            <Bar dataKey="male" stackId="a" fill="#1e293b" fillOpacity={hovered === null || hovered === "male" ? 1 : 0.3} />
                            <Bar dataKey="unknown" stackId="a" fill="#999b9d" fillOpacity={hovered === null || hovered === "unknown" ? 1 : 0.3} />
                        </>
                    ) : (
                        <>
                            <Bar dataKey="under35Percent" stackId="a" fill="#32bf66" fillOpacity={hovered === null || hovered === "under35" ? 1 : 0.3} />
                            <Bar dataKey="age35to50Percent" stackId="a" fill="#208444" fillOpacity={hovered === null || hovered === "age35to50" ? 1 : 0.3} />
                            <Bar dataKey="over50Percent" stackId="a" fill="#0e4d1b" fillOpacity={hovered === null || hovered === "over50" ? 1 : 0.3} />
                            <Bar dataKey="unknownPercent" stackId="a" fill="#999b9d" fillOpacity={hovered === null || hovered === "unknown" ? 1 : 0.3} />
                        </>
                    )}
                </BarChart>
            </ResponsiveContainer>

            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#334155", marginTop: "0.5rem" }}>
                {visning === "kjonn" ? "Andel kvinner (hover for antall)" : "Andel i hver aldersgruppe (hover for antall)"}
            </p>
        </div>
    );
}