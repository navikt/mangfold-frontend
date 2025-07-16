import { useState, useMemo } from "react";
import { BodyShort, Heading, ToggleGroup } from "@navikt/ds-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useKjonnPerStilling } from "../data/useKjonnPerStilling";
import { useAlderPerStilling } from "../data/useAlderPerStilling";
import { getAlderFarger } from "../utils/alderFarger";
import { getKjonnFarger } from "../utils/kjonnFarger";
//import { CustomizedAxisTick } from "./FordelingEtterAvdeling";



type ViewType = "kjonn" | "alder";

function aktuelleAldersgrupperForStillinger(alderData: any[], aldersgrupper: string[]) {
  return aldersgrupper.filter(gruppe =>
    alderData.some(entry => (entry.alderGrupper[gruppe] ?? 0) > 0)
  );
}

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
  const sorted = grupper.slice().sort(
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
          {aldersgrupper.map((gruppe) => (
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

type LegendItem = { label: string; color: string };

function LegendBar({
  view,
  aldersgrupper,
  alderFarger,
  kjonnFarger,
  hasUnknown,
  hasMasked,
}: {
  view: ViewType;
  aldersgrupper: string[];
  alderFarger: Map<string, string>;
  kjonnFarger: Map<string, string>;
  hasUnknown: boolean;
  hasMasked: boolean;
}) {
  let items: LegendItem[] = [];

  if (view === "kjonn") {
    items.push({ label: "Kvinner", color: kjonnFarger.get("female") ?? "#ccc" });
    items.push({ label: "Menn", color: kjonnFarger.get("male") ?? "#ccc" });
    if (hasUnknown) items.push({ label: "Ukjent", color: kjonnFarger.get("unknown") ?? "#ccc" });
    if (hasMasked) items.push({ label: "Skjult", color: kjonnFarger.get("masked") ?? "#ccc" });
  } else {
    items = aldersgrupper.map(gruppe => ({
      label: gruppe,
      color: alderFarger.get(gruppe) ?? "#ccc"
    }));
    if (hasMasked) items.push({ label: "Skjult", color: kjonnFarger.get("masked") ?? "#ccc" });
  }

  if (items.length === 0) return null;

  return (
    <div className="legend-row">
      {items.map(item => (
        <span className="gender-label" key={item.label}>
          <span className="gender-square" style={{ background: item.color, border: "1px solid #888" }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function CustomizedAxisTick({ x, y, payload, visibleTicksCount = 0 }: any) {
  const angle = visibleTicksCount > 6 ? -48 : 0;
  const anchor = visibleTicksCount > 6 ? "end" : "middle";
  const fontSize = visibleTicksCount > 10 ? 10 : visibleTicksCount > 6 ? 12 : 14;
  const dy = 10;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={dy}
        textAnchor={anchor}
        transform={`rotate(${angle})`}
        fontSize={fontSize}
        fill="#262626"
        style={{
          fontFamily: "Arial, sans-serif",
          fontWeight: 400,
        }}
      >
        {`${payload.value}%`}
      </text>
    </g>
  );
}

export default function FordelingEtterStilling() {
  const [view, setView] = useState<ViewType>("kjonn");

  const { data: kjonnData } = useKjonnPerStilling();
  const { data: alderData, aldersgrupper } = useAlderPerStilling();
  const alderFarger = useMemo(() => getAlderFarger(aldersgrupper), [aldersgrupper]);
  const kjonnFarger = useMemo(() => getKjonnFarger(), []);

  const aktuelleAldersgrupper = useMemo(() => {
    return aktuelleAldersgrupperForStillinger(alderData, aldersgrupper);
  }, [alderData, aldersgrupper]);

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

  const alderChartData = useMemo(() => {
    const stillingsnavn = Array.from(new Set((alderData ?? []).map((d: any) => d.section)));
    return stillingsnavn.map((stilling: string) => {
      const alle = (alderData ?? []).filter((d: any) => d.section === stilling);
      const isMasked = alle.some((d: any) => d.erMaskert);
      const grupper = aktuelleAldersgrupper;
      if (isMasked) {
        const percentObj: Record<string, number> = {};
        const countObj: Record<string, number> = {};
        grupper.forEach((gruppe: string) => {
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

      const tall: Record<string, number> = {};
      grupper.forEach((gruppe: string) => { tall[gruppe] = 0; });
      alle.forEach((entry: any) => {
        grupper.forEach((gruppe: string) => {
          tall[gruppe] += entry.alderGrupper?.[gruppe] ?? 0;
        });
      });

      const fordelt = fordelProsentverdier(grupper, tall);
      const percentObj: Record<string, number> = {};
      const countObj: Record<string, number> = {};
      grupper.forEach((gruppe: string) => {
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
  }, [alderData, aktuelleAldersgrupper]);

  const sortedData = useMemo(() => {
    return [...(view === "kjonn" ? kjonnChartData : alderChartData)].sort((a, b) =>
      a.section.localeCompare(b.section)
    );
  }, [view, kjonnChartData, alderChartData]);

  const barHeight = 44;
  const yAxisWidth = 260;

  const hasMasked = useMemo(() => {
    return sortedData.some(entry => entry.isMasked);
  }, [sortedData]);



  return (
    <div>
      <Heading size="large" spacing>
        Kjønns- og aldersfordeling per stilling
      </Heading>

      <BodyShort size="medium" spacing style={{ marginBottom: "1.5rem" }}>
        Her ser du {view === "kjonn" ? "kjønnsfordelingen" : "aldersfordelingen"} per stilling. Hold musen over en stilling for å se detaljer om fordelingen.
      </BodyShort>

      <div className="visningstype-toggle">
        <ToggleGroup
          size="medium"
          value={view}
          onChange={(val) => {
            if (val === "kjonn" || val === "alder") {
              setView(val);
            }
          }}
          label="Velg visningstype"
        >
          <ToggleGroup.Item value="kjonn">Kjønn</ToggleGroup.Item>
          <ToggleGroup.Item value="alder">Alder</ToggleGroup.Item>
        </ToggleGroup>
      </div>

      <LegendBar
        view={view}
        aldersgrupper={aktuelleAldersgrupper}
        alderFarger={alderFarger}
        kjonnFarger={kjonnFarger}
        hasUnknown={hasUnknown}
        hasMasked={hasMasked}
      />

      <ResponsiveContainer width="100%" height={sortedData.length * barHeight + 60}>
        <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 60, bottom: 20, left: yAxisWidth }} barCategoryGap={12} barSize={barHeight}>
          <XAxis type="number" domain={[0, 100]} tick={<CustomizedAxisTick visibleTicksCount={sortedData.length} />} />
          <YAxis type="category" dataKey="section" width={300} />

          <Tooltip content={(props) => (
            <CustomTooltip
              {...props}
              view={view}
              aldersgrupper={aktuelleAldersgrupper}
              alderFarger={alderFarger}
              kjonnFarger={kjonnFarger}
            />
          )} />
          <Bar dataKey="masked" stackId="a" fill={kjonnFarger.get("masked")} isAnimationActive={false} label={false} stroke="#ffffff" strokeWidth={2} />
          {view === "kjonn" ? (
            <>
              <Bar dataKey="female" stackId="a" fill={kjonnFarger.get("female")} stroke="#ffffff" strokeWidth={2} />
              <Bar dataKey="male" stackId="a" fill={kjonnFarger.get("male")} stroke="#ffffff" strokeWidth={2} />
              {hasUnknown && (
                <Bar dataKey="unknown" stackId="a" fill={kjonnFarger.get("unknown")} stroke="#ffffff" strokeWidth={2} />
              )}
            </>
          ) : (
            aktuelleAldersgrupper.map((gruppe: string) => (
              <Bar
                key={gruppe}
                dataKey={`percent_${gruppe}`}
                stackId="a"
                fill={alderFarger.get(gruppe)}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}