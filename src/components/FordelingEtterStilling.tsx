import { useState, useMemo } from "react";
import { Heading, ToggleGroup } from "@navikt/ds-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useKjonnPerStilling } from "../data/useKjonnPerStilling";
import { useAlderPerStilling } from "../data/useAlderPerStilling";
import { getAlderFarger } from "../utils/alderFarger";
import { getKjonnFarger } from "../utils/kjonnFarger";
import "../css/KjonnPerSeksjonChart.css";

type ViewType = "kjonn" | "alder";

function fordelProsentverdier(grupper: string[], verdier: Record<string, number>) {
    const total = grupper.reduce((sum, gruppe) => sum + (verdier[gruppe] ?? 0), 0);
    const rawPercent: Record<string, number> = {};
    grupper.forEach(gruppe => {
        rawPercent[gruppe] = total > 0 ? (verdier[gruppe] ?? 0) / total * 100 : 0;
    });

    const floored: Record<string, number> = {};
    grupper.forEach(gruppe => {
        floored[gruppe] = Math.floor(rawPercent[gruppe]);
    });

    let remainder = 100 - Object.values(floored).reduce((sum, v) => sum + v, 0);
    const sorted = [...grupper].sort(
        (a, b) => (rawPercent[b] - floored[b]) - (rawPercent[a] - floored[a])
    );
    for (let i = 0; i < remainder; i++) {
        floored[sorted[i % sorted.length]] += 1;
    }
    return floored;
}

function CustomTooltip(props: {
    active?: boolean;
    payload?: any;
    label?: string;
    view: ViewType;
    aldersgrupper: string[];
    alderFarger: Map<string, string>;
    kjonnFarger: Map<string, string>;
}) {
    const { active, payload, label, view, aldersgrupper, alderFarger, kjonnFarger } = props;
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;
if (entry.isMasked) {
    return (
        <div style={{ background: "#2d3748", color: "#fff", padding: "1rem", borderRadius: "0.5rem" }}>
            <div style={{ fontWeight: 600 }}>{label}</div>
            <div style={{ color: "#fff", marginTop: 8 }}>For få personer til å kunne vise data.</div>
        </div>
    );
}
    const isGender = view === "kjonn";
    const total = isGender
        ? (entry.femaleCount ?? 0) + (entry.maleCount ?? 0) + (entry.unknownCount ?? 0)
        : aldersgrupper.reduce((sum, gruppe) => entry[`${gruppe}Count`] ? sum + entry[`${gruppe}Count`] : sum, 0);

    return (
        <div style={{ background: "#2d3748", color: "white", padding: "1rem", borderRadius: "0.5rem", fontSize: "14px", lineHeight: "1.6", maxWidth: "300px" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
            {isGender ? (
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span className="gender-square" style={{ background: kjonnFarger.get("female") }} />
                        <span>Andel kvinner <strong>{entry.female}%</strong> ({entry.femaleCount} personer)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: entry.unknownCount > 0 ? 4 : 0 }}>
                        <span className="gender-square" style={{ background: kjonnFarger.get("male") }} />
                        <span>Andel menn <strong>{entry.male}%</strong> ({entry.maleCount} personer)</span>
                    </div>
                    {entry.unknownCount > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="gender-square" style={{ background: kjonnFarger.get("unknown") }} />
                            <span>Ukjent <strong>{entry.unknown}%</strong> ({entry.unknownCount} personer)</span>
                        </div>
                    )}
                    <div style={{ marginTop: 8, borderTop: "1px solid #ccc", paddingTop: 6 }}>
                        Totalt: 100% (<strong>{total}</strong> personer)
                    </div>
                </>
            ) : (
                <>
                    {aldersgrupper.map((gruppe: string) => (
                        <div key={gruppe} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span className="gender-square" style={{ background: alderFarger.get(gruppe) ?? "#ccc" }} />
                            <span>
                                {gruppe}: {entry[`${gruppe}Count`] ?? 0} personer, {entry[`percent_${gruppe}`] ?? 0}%
                            </span>
                        </div>
                    ))}
                    <div style={{ marginTop: 8, borderTop: "1px solid #ccc", paddingTop: 6 }}>
                        Totalt: 100% (<strong>{total}</strong> personer)
                    </div>
                </>
            )}
        </div>
    );
}

export default function FordelingEtterStilling() {
    const [view, setView] = useState<ViewType>("kjonn");

    const { data: kjonnData } = useKjonnPerStilling();
    const { data: alderData, aldersgrupper } = useAlderPerStilling();
    const alderFarger = useMemo(() => getAlderFarger(aldersgrupper), [aldersgrupper]);
    const kjonnFarger = useMemo(() => getKjonnFarger(), []);

    // Kjønn-data: maskering og prosenter
    const kjonnChartData = useMemo(() => {
        return (kjonnData ?? []).map(entry => {
            if (entry.isMasked === true) {
                return {
                    section: entry.section,
                    masked: 100,
                    female: 0,
                    male: 0,
                    unknown: 0,
                    femaleCount: 0,
                    maleCount: 0,
                    unknownCount: 0,
                    isMasked: true,
                };
            }
            const femaleCount = entry.femaleCount ?? 0;
            const maleCount = entry.maleCount ?? 0;
            const unknownCount = entry.unknownCount ?? 0;
            const grupper = ["female", "male", "unknown"];
            const tall = {
                female: femaleCount,
                male: maleCount,
                unknown: unknownCount,
            };
            const fordelt = fordelProsentverdier(grupper, tall);
            return {
                section: entry.section,
                masked: 0,
                ...fordelt,
                femaleCount,
                maleCount,
                unknownCount,
                isMasked: false,
            };
        });
    }, [kjonnData]);

    const hasUnknown = useMemo(() => {
        return kjonnChartData.some(entry => entry.unknownCount > 0);
    }, [kjonnChartData]);

    // Alder-data: maskering og prosenter
    const alderChartData = useMemo(() => {
        // Aggregér per stilling
        const stillingsnavn = Array.from(new Set((alderData ?? []).map((d: any) => d.section)));
        return stillingsnavn.map((stilling: string) => {
            const alle = (alderData ?? []).filter((d: any) => d.section === stilling);
            const isMasked = alle.some((d: any) => d.erMaskert);
            if (isMasked) {
                const percentObj: Record<string, number> = {};
                const countObj: Record<string, number> = {};
                aldersgrupper.forEach((gruppe: string) => {
                    percentObj[`percent_${gruppe}`] = 0;
                    countObj[`${gruppe}Count`] = 0;
                });
                return {
                    section: stilling,
                    ...percentObj,
                    ...countObj,
                    masked: 100,
                    isMasked: true,
                };
            }
            // Summer alle grupper
            const tall: Record<string, number> = {};
            aldersgrupper.forEach((gruppe: string) => { tall[gruppe] = 0; });
            alle.forEach((entry: any) => {
                aldersgrupper.forEach((gruppe: string) => {
                    tall[gruppe] += entry.alderGrupper?.[gruppe] ?? 0;
                });
            });
            const fordelt = fordelProsentverdier(aldersgrupper, tall);
            const percentObj: Record<string, number> = {};
            const countObj: Record<string, number> = {};
            aldersgrupper.forEach((gruppe: string) => {
                percentObj[`percent_${gruppe}`] = fordelt[gruppe];
                countObj[`${gruppe}Count`] = tall[gruppe];
            });
            return {
                section: stilling,
                ...percentObj,
                ...countObj,
                masked: 0,
                isMasked: false,
            };
        });
    }, [alderData, aldersgrupper]);

    const sortedData = useMemo(() => {
        return [...(view === "kjonn" ? kjonnChartData : alderChartData)].sort((a, b) =>
            a.section.localeCompare(b.section)
        );
    }, [view, kjonnChartData, alderChartData]);

    const barHeight = 44;
    const yAxisWidth = 260;

    return (
        <div>
            <Heading level="2" size="medium" spacing>
                Kjønns- og aldersfordeling per stilling
            </Heading>
            <p style={{ marginBottom: "1.5rem" }}>Her ser du {view === "kjonn" ? "kjønnsfordelingen" : "aldersfordelingen"} per stilling.</p>
           <ToggleGroup
        size="medium"
        value={view}
        onChange={(val) => {
          if (val === "kjonn" || val === "alder") {
            setView(val);
          }
        }}
        label="Velg visningstype"
        style={{ marginBottom: "2rem" }}
      >
        <ToggleGroup.Item value="kjonn">Kjønn</ToggleGroup.Item>
        <ToggleGroup.Item value="alder">Alder</ToggleGroup.Item>
      </ToggleGroup>

            <div style={{ display: "flex", justifyContent: "center", gap: 36, marginBottom: 16, fontWeight: 500, alignItems: "center" }}>
                {view === "kjonn" ? (
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "1rem" }}>
                        <>
                            <span className="gender-label"><span className="gender-square" style={{ background: kjonnFarger.get("female") }} />Kvinner</span>
                            <span className="gender-label"><span className="gender-square" style={{ background: kjonnFarger.get("male") }} />Menn</span>
                            {hasUnknown && (
                                <span className="gender-label"><span className="gender-square" style={{ background: kjonnFarger.get("unknown") }} />Ukjent</span>
                            )}
                        </>
                    </div>
                ) : (
                    <>
                        {aldersgrupper.map((gruppe: string) => (
                            <span key={gruppe} className="gender-label"><span className="gender-square" style={{ background: alderFarger.get(gruppe) }} />{gruppe}</span>
                        ))}
                    </>
                )}
            </div>
            <ResponsiveContainer width="100%" height={sortedData.length * barHeight + 60}>
                <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 60, bottom: 20, left: yAxisWidth }} barCategoryGap={12} barSize={barHeight}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                    <YAxis type="category" dataKey="section" width={yAxisWidth} tick={{ fontSize: 17, fontWeight: 500, fill: "#000000" }} />
                    <Tooltip content={(props) => (
                        <CustomTooltip
                            {...props}
                            view={view}
                            aldersgrupper={aldersgrupper}
                            alderFarger={alderFarger}
                            kjonnFarger={kjonnFarger}
                        />
                    )} />
                    <Bar dataKey="masked" stackId="a" fill={kjonnFarger.get("masked")} isAnimationActive={false} label={false} />
                    {view === "kjonn" ? (
                        <>
                            <Bar dataKey="female" stackId="a" fill={kjonnFarger.get("female")} />
                            <Bar dataKey="male" stackId="a" fill={kjonnFarger.get("male")} />
                            {hasUnknown && (
                                <Bar dataKey="unknown" stackId="a" fill={kjonnFarger.get("unknown")} />
                            )}
                        </>
                    ) : (
                        aldersgrupper.map((gruppe: string) => (
                            <Bar
                                key={gruppe}
                                dataKey={`percent_${gruppe}`}
                                stackId="a"
                                fill={alderFarger.get(gruppe)}
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