import { useState, useMemo } from "react";
import { BodyShort, Heading } from "@navikt/ds-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useKjonnData } from "../data/useKjonnData";
import { useAlderData } from "../data/useAlderData";
import { getAlderFarger } from "../utils/alderFarger";
import { getKjonnFarger } from "../utils/kjonnFarger";
import "../css/KjonnPerSeksjonChart.css";
import { VStack, Chips, ToggleGroup } from "@navikt/ds-react";

type ViewType = "kjonn" | "alder";

// Her beholdes rekkefølgen fra backend!
function filterAldersgrupperForDepartment(
  alderData: any[],
  department: string,
  aldersgrupper: string[]
) {
  // Ta med bare grupper med personer, behold rekkefølgen fra backend
  return aldersgrupper.filter(gruppe =>
    alderData
      .filter(entry => entry.department === department)
      .some(entry => (entry.alderGrupper[gruppe] ?? 0) > 0)
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

  if (items.length === 0) return null; // Ikke vis legend hvis ingen relevante grupper

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

export default function FordelingEtterAvdeling() {
  const [view, setView] = useState<ViewType>("kjonn");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const { data: kjonnData, departments: kjonnDepartments } = useKjonnData();
  const { data: alderData, departments: alderDepartments, aldersgrupper } = useAlderData();
  const alderFarger = useMemo(() => getAlderFarger(aldersgrupper), [aldersgrupper]);
  const kjonnFarger = useMemo(() => getKjonnFarger(), []);

  // Kombiner avdelinger fra begge datasett
  const allDepartments = useMemo(() => {
    return Array.from(new Set([
      ...(kjonnDepartments ?? []),
      ...(alderDepartments ?? [])
    ])).sort();
  }, [kjonnDepartments, alderDepartments]);

  const department = selectedDepartment ?? allDepartments?.[0] ?? "";

  // Aldersgrupper for valgt avdeling, behold rekkefølgen fra backend
  const avdelingAldersgrupper = useMemo(() => {
    return filterAldersgrupperForDepartment(alderData, department, aldersgrupper);
  }, [alderData, department, aldersgrupper]);

  // Kjønn-data: maskering og prosenter
  const kjonnChartData = useMemo(() => {
    return (kjonnData ?? [])
      .filter(entry => entry.department === department)
      .map(entry => {
        if (entry.erMaskert === true) {
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
  }, [kjonnData, department]);

  const hasUnknown = useMemo(() => {
    return kjonnChartData.some(entry => entry.unknownCount > 0);
  }, [kjonnChartData]);

  // Alder-data: maskering og prosenter
  const alderChartData = useMemo(() => {
    return alderData
      .filter(entry => entry.department === department)
      .map(entry => {
        const grupper = avdelingAldersgrupper;
        if (entry.erMaskert === true) {
          const percentObj: Record<string, number> = {};
          const countObj: Record<string, number> = {};
          grupper.forEach((gruppe: string) => {
            percentObj[`percent_${gruppe}`] = 0;
            countObj[`${gruppe}Count`] = 0;
          });
          return {
            section: entry.section,
            ...percentObj,
            ...countObj,
            masked: 100,
            isMasked: true,
          };
        }
        // Summer alle grupper
        const tall: Record<string, number> = {};
        grupper.forEach((gruppe: string) => {
          tall[gruppe] = entry.alderGrupper[gruppe] ?? 0;
        });

        const fordelt = fordelProsentverdier(grupper, tall);
        const percentObj: Record<string, number> = {};
        const countObj: Record<string, number> = {};
        grupper.forEach((gruppe: string) => {
          percentObj[`percent_${gruppe}`] = fordelt[gruppe];
          countObj[`${gruppe}Count`] = tall[gruppe];
        });
        return {
          section: entry.section,
          ...percentObj,
          ...countObj,
          masked: 0,
          isMasked: false,
        };
      });
  }, [alderData, department, avdelingAldersgrupper]);

  const sortedData = useMemo(() => {
    return [...(view === "kjonn" ? kjonnChartData : alderChartData)].sort((a, b) =>
      a.section.localeCompare(b.section)
    );
  }, [view, kjonnChartData, alderChartData]);

  const barHeight = 44;
  const yAxisWidth = 260;

  // Sjekk om vi har skjulte verdier i datasettet
  const hasMasked = useMemo(() => {
    return sortedData.some(entry => entry.isMasked);
  }, [sortedData]);

  function CustomYAxisTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-5}
        y={0}
        dy={5}
        textAnchor="end"
        fontSize={17}
        fontWeight={500}
        fill="#000000"
        style={{ whiteSpace: "nowrap" }}
      >
        {payload.value}
      </text>
    </g>
  );
}

  return (
    <div>
      <Heading size="large" spacing>
        Kjønns- og aldersfordeling per seksjon
      </Heading>
      <BodyShort size="medium" spacing style={{ marginBottom: "1.5rem" }}>
        Her ser du {view === "kjonn" ? "kjønnsfordelingen" : "aldersfordelingen"} per seksjon i valgt avdeling. Hold musen over en seksjon for å se detaljer om fordelingen.
      </BodyShort>
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

      <VStack gap="2" style={{ marginBottom: "4rem" }}>
        <strong style={{ fontSize: "1rem" }}>Velg en avdeling:</strong>
        <Chips size="medium">
          {allDepartments.map((dept) => (
            <Chips.Toggle
              key={dept}
              selected={department === dept}
              onClick={() => setSelectedDepartment(dept)}
              checkmark={false}
              variant="action"
            >
              {dept}
            </Chips.Toggle>
          ))}
        </Chips>
      </VStack>

      {avdelingAldersgrupper.length > 0 &&
        <LegendBar
          view={view}
          aldersgrupper={avdelingAldersgrupper}
          alderFarger={alderFarger}
          kjonnFarger={kjonnFarger}
          hasUnknown={hasUnknown}
          hasMasked={hasMasked}
        />
      }

      <ResponsiveContainer width="100%" height={sortedData.length * barHeight + 60}>
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 20, right: 60, bottom: 20, left: yAxisWidth }}
          barSize={barHeight}
        >

          <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
          <YAxis
  type="category"
  dataKey="section"
  width={300} // Øk hvis teksten fortsatt kuttes
  tick={<CustomYAxisTick />}
/>
          <Tooltip content={(props) => (
            <CustomTooltip
              {...props}
              view={view}
              aldersgrupper={avdelingAldersgrupper}
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
            avdelingAldersgrupper.map((gruppe: string) => (
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