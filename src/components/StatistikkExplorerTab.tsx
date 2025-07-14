import { useEffect, useMemo, useState } from "react";
import {
  Heading,
  Button,
  Accordion,
  UNSAFE_Combobox,
} from "@navikt/ds-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as tokens from "@navikt/ds-tokens/dist/tokens";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc: number, entry: any) => acc + entry.payload[entry.dataKey], 0);

    return (
      <div style={{ background: "white", border: "1px solid #ccc", padding: "0.5rem" }}>
        {payload.map((entry: any, index: number) => {
          const verdi = entry.payload[entry.dataKey];
          const antall = Math.round((verdi / 100) * total);

          return (
            <div key={`item-${index}`} style={{ color: entry.color }}>
              <strong>{entry.name}</strong>:{" "}
              {antall < 5
                ? "For få personer til å vise data"
                : `${verdi.toFixed(1)}% (${antall} personer)`}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};


export default function StatistikkExplorerTab() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedKjonn, setSelectedKjonn] = useState<string[]>([]);
  const [selectedAlder, setSelectedAlder] = useState<string[]>([]);
  const [selectedAnsiennitet, setSelectedAnsiennitet] = useState<string[]>([]);
  const [selectedLederniva, setSelectedLederniva] = useState<string[]>([]);
  const [selectedStilling, setSelectedStilling] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("https://mangfold-backend.intern.nav.no/ansatt-detaljer");
        const json = await res.json();
        setRawData(json);
      } catch (e) {
        console.error("Feil ved henting av data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const distinct = (arr: any[]) =>
    Array.from(new Set(arr.map((val) => (typeof val === "string" ? val.trim() : "")).filter((v) => v)));

  const allDepartments = useMemo(() => distinct(rawData.map((d) => d.avdeling)), [rawData]);

  const sectionOptionsByDepartment = useMemo(() => {
    const map: Record<string, string[]> = {};
    rawData.forEach((d) => {
      if (d.avdeling && d.seksjon) {
        if (!map[d.avdeling]) map[d.avdeling] = [];
        if (!map[d.avdeling].includes(d.seksjon)) {
          map[d.avdeling].push(d.seksjon);
        }
      }
    });
    return map;
  }, [rawData]);


  useEffect(() => {
    setSelectedSections([]);
  }, [selectedDepartments]);

  useEffect(() => {
    setSelectedKjonn([]);
    setSelectedAlder([]);
    setSelectedAnsiennitet([]);
    setSelectedLederniva([]);
    setSelectedStilling([]);
  }, [selectedDepartments, selectedSections]);

  const addSelectAll = (options: string[]) => ["(Alle)", ...options];

  const handleToggle = (val: string, selected: string[], setSelected: (val: string[]) => void, all: string[]) => {
    if (val === "(Alle)") {
      setSelected(selected.length === all.length ? [] : [...all]);
    } else {
      setSelected(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
    }
  };

  const filteredData = useMemo(() => {
    if (selectedDepartments.length === 0) return [];

    return rawData.filter((d) => {
      const matchesAvdeling = selectedDepartments.includes(d.avdeling);
      const matchesSeksjon = selectedSections.length === 0 || selectedSections.includes(d.seksjon);
      const matchesKjonn = selectedKjonn.length === 0 || selectedKjonn.includes(d.kjonn);
      const matchesAlder = selectedAlder.length === 0 || selectedAlder.includes(d.aldersgruppe);
      const matchesAnsiennitet = selectedAnsiennitet.length === 0 || selectedAnsiennitet.includes(d.ansiennitetsgruppe);
      const matchesLederniva = selectedLederniva.length === 0 || selectedLederniva.includes(d.lederniva);
      const matchesStilling = selectedStilling.length === 0 || selectedStilling.includes(d.stillingsnavn);

      return (
        matchesAvdeling &&
        matchesSeksjon &&
        matchesKjonn &&
        matchesAlder &&
        matchesAnsiennitet &&
        matchesLederniva &&
        matchesStilling
      );
    });
  }, [rawData, selectedDepartments, selectedSections, selectedKjonn, selectedAlder, selectedAnsiennitet, selectedLederniva, selectedStilling]);

  const groupKey = selectedSections.length > 0 ? "seksjon" : "avdeling";

  const chartData = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    const grupper = new Set<string>();
    const undergrupper = new Set<string>();

    filteredData.forEach((d) => {
      const gruppe = d[groupKey] ?? "Ukjent";
      const keyParts: string[] = [];
      if (selectedKjonn.length > 0) keyParts.push(d.kjonn || "Ukjent");
      if (selectedAlder.length > 0) keyParts.push(d.aldersgruppe || "Ukjent");
      if (selectedAnsiennitet.length > 0) keyParts.push(d.ansiennitetsgruppe || "Ukjent");
      if (selectedLederniva.length > 0) keyParts.push(d.lederniva || "Ukjent");
      if (selectedStilling.length > 0) keyParts.push(d.stillingsnavn || "Ukjent");
      const comboKey = keyParts.length > 0 ? keyParts.join(" | ") : "Totalt";

      if (!map[gruppe]) map[gruppe] = {};
      map[gruppe][comboKey] = (map[gruppe][comboKey] || 0) + (d.antall ?? 0);

      grupper.add(gruppe);
      undergrupper.add(comboKey);
    });

    const data = Array.from(grupper).map((g) => {
      const total = Object.values(map[g]).reduce((sum, val) => sum + val, 0);
      const row: Record<string, any> = { gruppe: g };
      Object.entries(map[g]).forEach(([key, val]) => {
        row[key] = total > 0 ? (val / total) * 100 : 0;
      });
      return row;
    });

    return {
      data,
      undergrupper: Array.from(undergrupper),
    };
  }, [filteredData, groupKey, selectedKjonn, selectedAlder, selectedAnsiennitet, selectedLederniva, selectedStilling]);


  const fargeMap = useMemo(() => {
    const baseColors = {
      Kvinne: [tokens.ABlue700, tokens.ABlue500, tokens.ABlue300],
      Mann: [tokens.ARed700, tokens.ARed500, tokens.ARed300],
      Ukjent: ["#134852"],
    };

    const alderFarger: Record<string, string> = {
      "<30": "#005B5B",
      "30-55": "#008080",
      "55+": "#4DB6AC",
    };

    const ansiennitetFarger: Record<string, string> = {
      "0-2": tokens.AGreen300,
      "2-4": tokens.AGreen500,
      "4-10": tokens.AGreen600,
      "10-16": tokens.AGreen700,
      "16+": tokens.AGreen900,
    };

    const lederFarger: Record<string, string> = {
      "Medarbeider": tokens.AOrange200,
      "Seksjonssjef": tokens.AOrange400,
      "Avdelingsdirektør": tokens.AOrange600,
      "Direktør": tokens.AOrange700,
    };

    const stillingFarger = [
      tokens.APurple700,
      tokens.APurple600,
      tokens.APurple500,
      tokens.APurple400,
      tokens.APurple300,
      tokens.APurple200,
      tokens.APurple100,
    ];

    const counters: Record<string, number> = {
      Kvinne: 0,
      Mann: 0,
      Ukjent: 0,
    };

    const result: Record<string, string> = {};

    // For stilling: lag mapping stilling → farge
    let stillingColorIndex = 0;
    const stillingColorMap: Record<string, string> = {};

    chartData.undergrupper.forEach((val) => {
      if (val.startsWith("Kvinne") || val.startsWith("Mann") || val.startsWith("Ukjent")) {
        const kjonn = val.startsWith("Kvinne")
          ? "Kvinne"
          : val.startsWith("Mann")
            ? "Mann"
            : "Ukjent";
        const index = counters[kjonn] % baseColors[kjonn].length;
        result[val] = baseColors[kjonn][index];
        counters[kjonn]++;
      }

      else if (selectedKjonn.length === 0 && selectedAlder.length > 0) {
        const alderKey = Object.keys(alderFarger).find((key) => val.includes(key));
        result[val] = alderFarger[alderKey ?? "<30"];
      }

      else if (selectedKjonn.length === 0 && selectedAlder.length === 0 && selectedAnsiennitet.length > 0) {
        const ansKey = Object.keys(ansiennitetFarger).find((key) => val.includes(key));
        result[val] = ansiennitetFarger[ansKey ?? "0-2"];
      }

      else if (
        selectedKjonn.length === 0 &&
        selectedAlder.length === 0 &&
        selectedAnsiennitet.length === 0 &&
        selectedLederniva.length > 0
      ) {
        const ledKey = Object.keys(lederFarger).find((key) => val.includes(key));
        result[val] = lederFarger[ledKey ?? "Medarbeider"];
      }

      else if (
        selectedKjonn.length === 0 &&
        selectedAlder.length === 0 &&
        selectedAnsiennitet.length === 0 &&
        selectedLederniva.length === 0 &&
        selectedStilling.length > 0
      ) {
        const stillingKey = val;
        if (!stillingColorMap[stillingKey]) {
          const color = stillingFarger[stillingColorIndex % stillingFarger.length];
          stillingColorMap[stillingKey] = color;
          stillingColorIndex++;
        }
        result[val] = stillingColorMap[stillingKey];
      }

      else {
        result[val] = "#236B7D";
      }
    });

    return result;
  }, [
    chartData.undergrupper,
    selectedKjonn,
    selectedAlder,
    selectedAnsiennitet,
    selectedLederniva,
    selectedStilling,
  ]);

  const nullstillFilter = () => {
    setSelectedDepartments([]);
    setSelectedSections([]);
    setSelectedKjonn([]);
    setSelectedAlder([]);
    setSelectedAnsiennitet([]);
    setSelectedLederniva([]);
    setSelectedStilling([]);
  };

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  return (
    <div>
      <Heading level="2" size="medium">Statistikkfilter</Heading>
      <p style={{ marginBottom: "1rem" }}>
        Denne visningen gir deg oversikt over grupperte data hvor hver kategori-kombinasjon vises med egen farge.
      </p>

      {!loading && selectedDepartments.length === 0 && (
        <p style={{ marginBottom: "2rem" }}>Vennligst velg én avdeling for å se statistikk.</p>
      )}

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <div style={{ minWidth: "300px", maxWidth: "400px" }}>
          <Accordion>
            <Accordion.Item title="Avdeling">
              <UNSAFE_Combobox
                label="Velg avdeling(er)"
                options={addSelectAll(allDepartments)}
                isMultiSelect
                selectedOptions={selectedDepartments}
                onToggleSelected={(val: string) => handleToggle(val, selectedDepartments, setSelectedDepartments, allDepartments)}
              />
            </Accordion.Item>

            <Accordion.Item title="Seksjon">
              <UNSAFE_Combobox
                label="Velg seksjon(er)"
                options={
                  selectedDepartments.length === 0
                    ? []
                    : addSelectAll(
                      selectedDepartments.flatMap(
                        (dep) => sectionOptionsByDepartment[dep] || []
                      )
                    )
                }
                isMultiSelect
                selectedOptions={selectedSections}
                onToggleSelected={(val: string) =>
                  handleToggle(
                    val,
                    selectedSections,
                    setSelectedSections,
                    selectedDepartments.flatMap((dep) => sectionOptionsByDepartment[dep] || [])
                  )
                }
                placeholder={selectedDepartments.length === 0 ? "Velg en avdeling først" : "Velg seksjon(er)"}
              />
            </Accordion.Item>

            <Accordion.Item title="Kjønn">
              <UNSAFE_Combobox
                label="Velg kjønn"
                options={
                  selectedDepartments.length === 0
                    ? []
                    : addSelectAll(
                      distinct(
                        rawData
                          .filter((d) => selectedDepartments.includes(d.avdeling))
                          .map((d) => d.kjonn)
                      )
                    )
                }
                isMultiSelect
                selectedOptions={selectedKjonn}
                onToggleSelected={(val: string) =>
                  handleToggle(
                    val,
                    selectedKjonn,
                    setSelectedKjonn,
                    distinct(
                      rawData
                        .filter((d) => selectedDepartments.includes(d.avdeling))
                        .map((d) => d.kjonn)
                    )
                  )
                }
                placeholder={selectedDepartments.length === 0 ? "Velg en avdeling først" : "Velg kjønn"}
              />
            </Accordion.Item>

            <Accordion.Item title="Alder">
              <UNSAFE_Combobox
                label="Velg aldersgruppe"
                options={
                  selectedDepartments.length === 0
                    ? []
                    : addSelectAll(
                      distinct(
                        rawData
                          .filter((d) => selectedDepartments.includes(d.avdeling))
                          .map((d) => d.aldersgruppe)
                      )
                    )
                }
                isMultiSelect
                selectedOptions={selectedAlder}
                onToggleSelected={(val: string) =>
                  handleToggle(
                    val,
                    selectedAlder,
                    setSelectedAlder,
                    distinct(
                      rawData
                        .filter((d) => selectedDepartments.includes(d.avdeling))
                        .map((d) => d.aldersgruppe)
                    )
                  )
                }
                placeholder={selectedDepartments.length === 0 ? "Velg en avdeling først" : "Velg aldersgruppe"}
              />
            </Accordion.Item>

            <Accordion.Item title="Ansiennitet">
              <UNSAFE_Combobox
                label="Velg ansiennitet"
                options={
                  selectedDepartments.length === 0
                    ? []
                    : addSelectAll(
                      distinct(
                        rawData
                          .filter((d) => selectedDepartments.includes(d.avdeling))
                          .map((d) => d.ansiennitetsgruppe)
                      )
                    )
                }
                isMultiSelect
                selectedOptions={selectedAnsiennitet}
                onToggleSelected={(val: string) =>
                  handleToggle(
                    val,
                    selectedAnsiennitet,
                    setSelectedAnsiennitet,
                    distinct(
                      rawData
                        .filter((d) => selectedDepartments.includes(d.avdeling))
                        .map((d) => d.ansiennitetsgruppe)
                    )
                  )
                }
                placeholder={selectedDepartments.length === 0 ? "Velg en avdeling først" : "Velg ansiennitet"}
              />
            </Accordion.Item>

            <Accordion.Item title="Ledernivå">
              <UNSAFE_Combobox
                label="Velg ledernivå"
                options={
                  selectedDepartments.length === 0
                    ? []
                    : addSelectAll(
                      distinct(
                        rawData
                          .filter((d) => selectedDepartments.includes(d.avdeling))
                          .map((d) => d.lederniva)
                      )
                    )
                }
                isMultiSelect
                selectedOptions={selectedLederniva}
                onToggleSelected={(val: string) =>
                  handleToggle(
                    val,
                    selectedLederniva,
                    setSelectedLederniva,
                    distinct(
                      rawData
                        .filter((d) => selectedDepartments.includes(d.avdeling))
                        .map((d) => d.lederniva)
                    )
                  )
                }
                placeholder={selectedDepartments.length === 0 ? "Velg en avdeling først" : "Velg ledernivå"}
              />
            </Accordion.Item>

            <Accordion.Item title="Stilling">
              <UNSAFE_Combobox
                label="Velg stilling(er)"
                options={
                  selectedDepartments.length === 0
                    ? []
                    : addSelectAll(
                      distinct(
                        rawData
                          .filter((d) => selectedDepartments.includes(d.avdeling))
                          .map((d) => d.stillingsnavn)
                      )
                    )
                }
                isMultiSelect
                selectedOptions={selectedStilling}
                onToggleSelected={(val: string) =>
                  handleToggle(
                    val,
                    selectedStilling,
                    setSelectedStilling,
                    distinct(
                      rawData
                        .filter((d) => selectedDepartments.includes(d.avdeling))
                        .map((d) => d.stillingsnavn)
                    )
                  )
                }
                placeholder={selectedDepartments.length === 0 ? "Velg en avdeling først" : "Velg stilling(er)"}
              />
            </Accordion.Item>
          </Accordion>

          {selectedDepartments.length > 0 && (
            <Button variant="tertiary" onClick={nullstillFilter} style={{ marginTop: "1rem" }}>
              Nullstill filter
            </Button>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {loading ? (
            <p>Laster data...</p>
          ) : selectedDepartments.length === 0 && selectedSections.length === 0 ? (
            <p>Vennligst velg avdeling og seksjon for å vise statistikk.</p>
          ) : (
            <div>
              <div style={{ height: "calc(100vh - 200px)", maxHeight: "900px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.data} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <XAxis
                      dataKey="gruppe"
                      angle={chartData.data.length > 12 ? -30 : 0}
                      textAnchor={chartData.data.length > 12 ? "end" : "middle"}
                      interval={0}
                      height={80}
                      tick={{
                        fontSize:
                          chartData.data.length <= 6
                            ? 16
                            : chartData.data.length <= 10
                              ? 14
                              : 12,
                      }}
                    />

                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${Math.round(value)}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    {chartData.undergrupper.map((key) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        name={key}
                        fill={fargeMap[key]}
                        opacity={hoveredKey === null || hoveredKey === key ? 1 : 0.2}
                        radius={[2, 2, 0, 0]} // liten kurve
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  marginTop: "2rem",
                  paddingBottom: "2rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(300px, 1fr))",
                    gap: "1rem 2rem",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    whiteSpace: "normal",
                    maxWidth: "1200px",
                  }}
                >
                  {chartData.undergrupper.map((key) => {
                    const isHovered = hoveredKey === key;
                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                          backgroundColor: isHovered ? "#f0f0f0" : "transparent",
                          borderRadius: "4px",
                          padding: "2px 4px",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={() => setHoveredKey(key)}
                        onMouseLeave={() => setHoveredKey(null)}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            backgroundColor: fargeMap[key],
                            flexShrink: 0,
                            border: isHovered ? "2px solid black" : "none",
                          }}
                        />
                        <span
                          style={{
                            fontWeight: isHovered ? "bold" : "normal",
                            color: isHovered ? "#222" : "inherit",
                          }}
                        >
                          {key}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}