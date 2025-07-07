import { useState, useMemo } from "react";
import { Heading } from "@navikt/ds-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useKjonnPerStilling } from "../data/useKjonnPerStilling";
import { useAlderPerStilling } from "../data/useAlderPerStilling";

type ViewType = "kjonn" | "alder";

const ViewDescriptions = {
    kjonn: "Her ser du kjønnsfordelingen per rolle/stilling.",
    alder: "Her ser du aldersfordelingen per rolle/stilling.",
};

const ALDER_FARGER: Record<string, string> = {
    "<30": "#0e4d1b",
    "30-50": "#208444",
    "50+": "#32bf66",
    "Ukjent alder": "#999b9d",
};

function normalizePercentages(groups: Record<string, number>): Record<string, number> {
    const total = Object.values(groups).reduce((sum, val) => sum + val, 0);
    if (total === 0) return Object.fromEntries(Object.keys(groups).map(k => [k, 0]));
    const rawPercent: Record<string, number> = {};
    for (const key in groups) rawPercent[key] = (groups[key] / total) * 100;
    const floored: Record<string, number> = {};
    for (const key in rawPercent) floored[key] = Math.floor(rawPercent[key]);
    let remainder = 100 - Object.values(floored).reduce((sum, val) => sum + val, 0);
    const sortedKeys = Object.keys(groups).sort((a, b) =>
        (rawPercent[b] - floored[b]) - (rawPercent[a] - floored[a])
    );
    for (let i = 0; i < remainder; i++) {
        floored[sortedKeys[i % sortedKeys.length]] += 1;
    }
    return floored;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;
    const isGender = "femaleCount" in entry;
    const ALDER_REKKEFOLGE = ["30-50", "50+", "<30", "Ukjent alder"];
    return (
        <div style={{ background: "#2d3748", color: "white", padding: "1rem", borderRadius: "0.5rem", fontSize: "14px", lineHeight: "1.6", maxWidth: "300px" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
            {isGender ? (
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#38a169", display: "inline-block" }} />
                        <span>Kvinne <strong>{entry.female}%</strong> ({entry.femaleCount} personer)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: entry.unknownCount > 0 ? 4 : 0 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#1e293b", display: "inline-block" }} />
                        <span>Mann <strong>{entry.male}%</strong> ({entry.maleCount} personer)</span>
                    </div>
                    {entry.unknownCount > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#999b9d", display: "inline-block" }} />
                            <span>Ukjent <strong>{entry.unknown}%</strong> ({entry.unknownCount} personer)</span>
                        </div>
                    )}
                </>
            ) : (
                ALDER_REKKEFOLGE
                    .filter(gruppe => entry[`percent_${gruppe}`] > 0)
                    .map(gruppe => (
                        <div key={gruppe} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 2, background: ALDER_FARGER[gruppe] ?? "#ccc", display: "inline-block" }} />
                            <span>{gruppe}: {entry[`percent_${gruppe}`] ?? 0}% ({entry[`${gruppe}Count`] ?? 0} personer)</span>
                        </div>
                    ))
            )}
        </div>
    );
}

export default function FordelingEtterStilling() {
    const [view, setView] = useState<ViewType>("kjonn");
    const [hovered, setHovered] = useState<string | null>(null);

    const { data: kjonnData } = useKjonnPerStilling();
    const { data: alderData } = useAlderPerStilling();

    // Gender chart
    const kjonnChartData = useMemo(() => {
        return (kjonnData ?? []).map(entry => {
            const { female, male, unknown } = normalizePercentages({
                female: entry.female,
                male: entry.male,
                unknown: entry.unknown
            });
            return {
                ...entry,
                female,
                male,
                unknown,
                femaleCount: entry.femaleCount,
                maleCount: entry.maleCount,
                unknownCount: entry.unknownCount,
            };
        });
    }, [kjonnData]);

    const hasUnknown = useMemo(() => {
        return kjonnChartData.some(entry => entry.unknownCount > 0);
    }, [kjonnChartData]);

    // Age chart
    const alderGrupperDynamisk = useMemo(() => {
        const grupper = new Set<string>();
        (alderData ?? []).forEach(entry => {
            if ('under35' in entry) grupper.add("<30");
            if ('age35to50' in entry) grupper.add("30-50");
            if ('over50' in entry) grupper.add("50+");
            if ('unknown' in entry) grupper.add("Ukjent alder");
        });
        return Array.from(grupper).sort();
    }, [alderData]);

    const hasUkjentAlder = useMemo(() => {
        return (alderData ?? []).some(entry => entry.unknownCount > 0);
    }, [alderData]);

    // Denne typingen matcher dynamiske percent-keys
    type AlderChartDataRow = {
        section: string;
        under35: number;
        age35to50: number;
        over50: number;
        unknown: number;
        total: number;
        under35Count: number;
        age35to50Count: number;
        over50Count: number;
        unknownCount: number;
        [key: `percent_${string}`]: number;
        [key: `${string}Count`]: number;
    };

    const alderChartData: AlderChartDataRow[] = useMemo(() => {
        return (alderData ?? []).map(entry => {
            const total = entry.total;
            const rawPercentages: Record<string, number> = {
                "<30": total ? (entry.under35 / total) * 100 : 0,
                "30-50": total ? (entry.age35to50 / total) * 100 : 0,
                "50+": total ? (entry.over50 / total) * 100 : 0,
                "Ukjent alder": total ? (entry.unknown / total) * 100 : 0,
            };
            const floored: Record<string, number> = {};
            alderGrupperDynamisk.forEach(gruppe => {
                floored[gruppe] = Math.floor(rawPercentages[gruppe]);
            });
            let remainder = 100 - Object.values(floored).reduce((sum, v) => sum + v, 0);
            const sortedByDecimal = [...alderGrupperDynamisk].sort((a, b) =>
                (rawPercentages[b] - floored[b]) - (rawPercentages[a] - floored[a])
            );
            for (let i = 0; i < remainder; i++) {
                floored[sortedByDecimal[i % sortedByDecimal.length]] += 1;
            }
            const percentages: Record<string, number> = {};
            alderGrupperDynamisk.forEach(gruppe => {
                percentages[`percent_${gruppe}`] = floored[gruppe];
            });
            // NB: også inkluder antall for hver gruppe
            return {
                ...entry,
                ...percentages,
                "<30Count": entry.under35Count,
                "30-50Count": entry.age35to50Count,
                "50+Count": entry.over50Count,
                "Ukjent alderCount": entry.unknownCount,
            };
        });
    }, [alderData, alderGrupperDynamisk]);

    // Type assertion for dynamiske keys
  const sortedData = useMemo(() => {
    return view === "kjonn"
        ? [...kjonnChartData].sort((a, b) => b.female - a.female)
        : [...alderChartData].sort(
            (a, b) =>
                (b[`percent_${alderGrupperDynamisk[0]}`] ?? 0) -
                (a[`percent_${alderGrupperDynamisk[0]}`] ?? 0)
        );
}, [view, kjonnChartData, alderChartData, alderGrupperDynamisk]);


    const barHeight = 44;
    const yAxisWidth = 260;

    return (
        <div>
            <Heading level="2" size="medium" spacing>
                Kjønns- og aldersfordeling per rolle/stilling
            </Heading>

            <p style={{ marginBottom: "1.5rem" }}>{ViewDescriptions[view]}</p>

            <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={() => setView("kjonn")} style={{ border: "none", background: view === "kjonn" ? "#e6f4ea" : "transparent", color: view === "kjonn" ? "#157145" : "#000000", fontWeight: view === "kjonn" ? "bold" : 500, padding: "0.4em 1.4em", borderRadius: 6, cursor: "pointer", boxShadow: view === "kjonn" ? "0 0 0 2px #38a169" : "none", outline: "none", fontSize: "1rem" }}>Kjønn</button>
                <button type="button" onClick={() => setView("alder")} style={{ border: "none", background: view === "alder" ? "#e6f4ea" : "transparent", color: view === "alder" ? "#157145" : "#000000", fontWeight: view === "alder" ? "bold" : 500, padding: "0.4em 1.4em", borderRadius: 6, cursor: "pointer", boxShadow: view === "alder" ? "0 0 0 2px #38a169" : "none", outline: "none", fontSize: "1rem" }}>Alder</button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 36, marginBottom: 16, fontWeight: 500, alignItems: "center" }}>
                {view === "kjonn" ? (
                    <>
                        <span className="dot dot-female" onMouseEnter={() => setHovered("female")} onMouseLeave={() => setHovered(null)} style={{ background: "#38a169" }} /> Kvinner
                        <span className="dot dot-male" onMouseEnter={() => setHovered("male")} onMouseLeave={() => setHovered(null)} style={{ background: "#1e293b" }} /> Menn
                        {hasUnknown && (
                            <><span className="dot dot-unknown" onMouseEnter={() => setHovered("unknown")} onMouseLeave={() => setHovered(null)} style={{ background: "#999b9d" }} /> Ukjent</>
                        )}
                    </>
                ) : (
                    Object.entries(ALDER_FARGER)
                        .filter(([gruppe]) => gruppe !== "Ukjent alder" || hasUkjentAlder)
                        .map(([gruppe, farge]) => (
                            <span key={gruppe} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#334155" }}>
                                <span style={{ width: 14, height: 14, borderRadius: 4, background: farge, display: "inline-block" }} onMouseEnter={() => setHovered(gruppe)} onMouseLeave={() => setHovered(null)} />
                                {gruppe}
                            </span>
                        ))
                )}
            </div>

            <ResponsiveContainer width="100%" height={sortedData.length * barHeight + 60}>
                <BarChart
                    layout="vertical"
                    data={sortedData}
                    margin={{ top: 20, right: 60, bottom: 20, left: yAxisWidth }}
                    barCategoryGap={12}
                    barSize={barHeight}
                >
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="section" width={yAxisWidth} tick={{ fontSize: 17, fontWeight: 500, fill: "#000000" }} />
                    <Tooltip content={<CustomTooltip />} />
                    {view === "kjonn" ? (
                        <>
                            <Bar dataKey="female" stackId="a" fill="#38a169" fillOpacity={hovered === "female" || hovered === null ? 1 : 0.3} />
                            <Bar dataKey="male" stackId="a" fill="#1e293b" fillOpacity={hovered === "male" || hovered === null ? 1 : 0.3} />
                            {hasUnknown && (
                                <Bar dataKey="unknown" stackId="a" fill="#999b9d" fillOpacity={hovered === "unknown" || hovered === null ? 1 : 0.3} />
                            )}
                        </>
                    ) : (
                        alderGrupperDynamisk.map(gruppe => (
                            <Bar
                                key={gruppe}
                                dataKey={`percent_${gruppe}`}
                                stackId="a"
                                fill={ALDER_FARGER[gruppe] ?? "#ccc"}
                                fillOpacity={hovered === gruppe || hovered === null ? 1 : 0.3}
                            />
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