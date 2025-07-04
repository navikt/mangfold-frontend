import { useState, useMemo } from "react";
import { Heading } from "@navikt/ds-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "../css/KjonnPerSeksjonChart.css";
import { useKjonnData } from "../data/useKjonnData";
import { useAlderData } from "../data/useAlderData";

interface AlderChartEntry {
    section: string;
    department: string;
    alderGrupper: Record<string, number>;
    [key: `percent_${string}`]: number;
}

type ViewType = "kjonn" | "alder";

const ViewDescriptions = {
    kjonn: "Her ser du kjønnsfordelingen per seksjon innenfor valgt avdeling.",
    alder: "Her ser du aldersfordelingen per seksjon innenfor valgt avdeling.",
};

const ALDER_FARGER: Record<string, string> = {
    "<30": "#0e4d1b",
    "30-50": "#208444",
    "50+": "#32bf66",
};

function normalizeGender(f: number, m: number, u: number) {
    const total = f + m + u;
    if (total === 0) return { female: 0, male: 0, unknown: 0 };
    const rawF = (f / total) * 100;
    const rawM = (m / total) * 100;
    let female = Math.round(rawF);
    let male = Math.round(rawM);
    let unknown = 100 - female - male;
    return { female, male, unknown };
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;
    const isGender = "femaleCount" in entry;

    return (
        <div style={{ background: "#2d3748", color: "white", padding: "1rem", borderRadius: "0.5rem" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
            {isGender ? (
                <>
                    <div>Kvinne: {entry.femaleCount} ({entry.female}%)</div>
                    <div>Mann: {entry.maleCount} ({entry.male}%)</div>
                    {entry.unknownCount > 0 && (
                        <div>Ukjent: {entry.unknownCount} ({entry.unknown}%)</div>
                    )}
                </>
            ) : (
                Object.keys(entry.alderGrupper ?? {}).map(gruppe => (
                    <div key={gruppe}>
                        {gruppe}: {entry.alderGrupper[gruppe]} ({entry[`percent_${gruppe}`] ?? 0}%)
                    </div>
                ))
            )}
        </div>
    );
}

export default function FordelingEtterAvdelinger() {
    const [view, setView] = useState<ViewType>("kjonn");
    const [hovered, setHovered] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

    const { data: kjonnData } = useKjonnData();
    const { data: alderData } = useAlderData();

    const allDepartments = useMemo(() => {
        const kjonnDepts = Array.isArray(kjonnData) ? kjonnData.map(d => d.department) : [];
        const alderDepts = Array.isArray(alderData) ? alderData.map(d => d.department) : [];
        return Array.from(new Set([...kjonnDepts, ...alderDepts])).sort();
    }, [kjonnData, alderData]);

    const department = selectedDepartment ?? allDepartments?.[0] ?? "";

    const kjonnChartData = useMemo(() => {
        return (kjonnData ?? [])
            .filter(d => d.department === department)
            .map(entry => {
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
            });
    }, [kjonnData, department]);

    const alderGrupperDynamisk = useMemo(() => {
        const grupper = new Set<string>();
        (alderData ?? []).forEach(entry => {
            Object.keys(entry.alderGrupper ?? {}).forEach(g => grupper.add(g));
        });
        return Array.from(grupper).sort();
    }, [alderData]);

    const alderChartData = useMemo(() => {
        return (alderData ?? [])
            .filter(d => d.department === department)
            .map(entry => {
                const total = Object.values(entry.alderGrupper).reduce((sum, cnt) => sum + cnt, 0);
                const percentages: Record<string, number> = {};
                alderGrupperDynamisk.forEach(gruppe => {
                    const val = entry.alderGrupper[gruppe] ?? 0;
                    percentages[`percent_${gruppe}`] = total > 0 ? Math.round((val / total) * 100) : 0;
                });
                return {
                    ...entry,
                    ...percentages,
                } as AlderChartEntry;
            });
    }, [alderData, department, alderGrupperDynamisk]);

    const sortedData = useMemo(() => {
        return view === "kjonn"
            ? [...kjonnChartData].sort((a, b) => b.female - a.female)
            : [...(alderChartData as AlderChartEntry[])].sort(
                (a, b) => (b[`percent_${alderGrupperDynamisk[0]}`] ?? 0) - (a[`percent_${alderGrupperDynamisk[0]}`] ?? 0)
            );
    }, [view, kjonnChartData, alderChartData, alderGrupperDynamisk]);

    const barHeight = 44;
    const yAxisWidth = 260;

    return (
        <div>
            <Heading level="2" size="medium" spacing>
                Kjønns- og aldersfordeling per seksjon i valgt avdeling
            </Heading>

            <p style={{ marginBottom: "1.5rem" }}>{ViewDescriptions[view]}</p>

            <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={() => setView("kjonn")} style={{
                    border: "none",
                    background: view === "kjonn" ? "#e6f4ea" : "transparent",
                    color: view === "kjonn" ? "#157145" : "#000000",
                    fontWeight: view === "kjonn" ? "bold" : 500,
                    padding: "0.4em 1.4em",
                    borderRadius: 6,
                    cursor: "pointer",
                    boxShadow: view === "kjonn" ? "0 0 0 2px #38a169" : "none",
                    outline: "none",
                    fontSize: "1rem"
                }}>Kjønn</button>
                <button type="button" onClick={() => setView("alder")} style={{
                    border: "none",
                    background: view === "alder" ? "#e6f4ea" : "transparent",
                    color: view === "alder" ? "#157145" : "#000000",
                    fontWeight: view === "alder" ? "bold" : 500,
                    padding: "0.4em 1.4em",
                    borderRadius: 6,
                    cursor: "pointer",
                    boxShadow: view === "alder" ? "0 0 0 2px #38a169" : "none",
                    outline: "none",
                    fontSize: "1rem"
                }}>Alder</button>
            </div>

            <div style={{ marginBottom: "2rem" }}>
                <strong>Velg en avdeling:</strong>
                <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "2rem", marginLeft: 12 }}>
                    {allDepartments.map(dept => (
                        <label key={dept} style={{ cursor: "pointer", fontWeight: department === dept ? "bold" : 500 }}>
                            <input
                                type="radio"
                                name="department"
                                value={dept}
                                checked={department === dept}
                                onChange={() => setSelectedDepartment(dept)}
                                style={{ marginRight: 4 }}
                            />
                            {dept}
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 36, marginBottom: 16, fontWeight: 500, alignItems: "center" }}>
                {view === "kjonn" ? (
                    <>
                        <span className="dot dot-female" onMouseEnter={() => setHovered("female")} onMouseLeave={() => setHovered(null)} style={{ background: "#38a169" }} /> Kvinner
                        <span className="dot dot-male" onMouseEnter={() => setHovered("male")} onMouseLeave={() => setHovered(null)} style={{ background: "#1e293b" }} /> Menn
                        <span className="dot dot-unknown" onMouseEnter={() => setHovered("unknown")} onMouseLeave={() => setHovered(null)} style={{ background: "#999b9d" }} /> Ukjent
                    </>
                ) : (
                    Object.entries(ALDER_FARGER).map(([gruppe, farge]) => (
                        <span key={gruppe} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#334155" }}>
                            <span style={{ width: 14, height: 14, borderRadius: 4, background: farge, display: "inline-block" }}
                                onMouseEnter={() => setHovered(gruppe)}
                                onMouseLeave={() => setHovered(null)}
                            />
                            {gruppe}
                        </span>
                    ))
                )}
            </div>

            <ResponsiveContainer width="100%" height={sortedData.length * barHeight + 60}>
                <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 60, bottom: 20, left: yAxisWidth }} barCategoryGap={12} barSize={barHeight}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="section" width={yAxisWidth} tick={{ fontSize: 17, fontWeight: 500, fill: "#000000" }} />
                    <Tooltip content={<CustomTooltip />} />
                    {view === "kjonn" ? (
                        <>
                            <Bar dataKey="female" stackId="a" fill="#38a169" fillOpacity={hovered === "female" || hovered === null ? 1 : 0.3} />
                            <Bar dataKey="male" stackId="a" fill="#1e293b" fillOpacity={hovered === "male" || hovered === null ? 1 : 0.3} />
                            <Bar dataKey="unknown" stackId="a" fill="#999b9d" fillOpacity={hovered === "unknown" || hovered === null ? 1 : 0.3} />
                        </>
                    ) : (
                        alderGrupperDynamisk.map(gruppe => (
                            <Bar key={gruppe} dataKey={`percent_${gruppe}`} stackId="a" fill={ALDER_FARGER[gruppe] ?? "#ccc"} fillOpacity={hovered === gruppe || hovered === null ? 1 : 0.3} />
                        ))
                    )}
                </BarChart>
            </ResponsiveContainer>

            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#000000", marginTop: "0.5rem" }}>
                {view === "kjonn" ? "Andel kvinner (hover for antall)" : "Andel i hver aldersgruppe (hover for antall)"}
            </p>
        </div>
    );
}
