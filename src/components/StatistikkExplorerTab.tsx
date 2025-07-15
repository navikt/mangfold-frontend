import { useEffect, useMemo, useState } from "react";
import { Heading, BodyLong } from "@navikt/ds-react";
import {
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
import { GuidePanel } from "@navikt/ds-react";

const MIN_ANTALL_FOR_VISNING = 5;

const CustomTooltip = ({
  active,
  payload,
  shouldShowCountAxis,
}: {
  active?: boolean;
  payload?: any;
  shouldShowCountAxis: boolean;
}) => {
  if (active && payload && payload.length) {
    const isMasked = payload[0]?.payload?.isMasked ?? false;
    const maskedCombos = payload[0]?.payload?.maskedCombos ?? new Set();
    const total = payload[0]?.payload?.totalAntall ?? 0;

    if (isMasked) {
      return (
        <div style={{ background: "white", border: "1px solid #ccc", padding: "0.5rem" }}>
          <strong>For få personer til å vise data</strong>
        </div>
      );
    }

    return (
      <div style={{ background: "white", border: "1px solid #ccc", padding: "0.5rem" }}>
        {payload.map((entry: any, index: number) => {
          const prosent = entry.value;
          const antall = shouldShowCountAxis
            ? entry.value
            : Math.round((prosent / 100) * total);
          const erTotalt = entry.name === "Totalt" || prosent === 100;

          if (maskedCombos.has(entry.name)) {
            return (
              <div key={`item-${index}`} style={{ color: entry.color }}>
                <strong>{entry.name}</strong>: For få personer til å vise data
              </div>
            );
          }

          return (
            <div key={`item-${index}`} style={{ color: entry.color }}>
              <strong>{entry.name}</strong>:{" "}
              {erTotalt
                ? shouldShowCountAxis
                  ? `${total} personer`
                  : `${prosent.toFixed(1)}% (${total} personer)`
                : shouldShowCountAxis
                  ? `${antall} personer`
                  : `${prosent.toFixed(1)}% (${antall} personer)`}
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

  const shouldShowCountAxis =
    selectedKjonn.length === 0 &&
    selectedAlder.length === 0 &&
    selectedAnsiennitet.length === 0 &&
    selectedLederniva.length === 0 &&
    selectedStilling.length === 0;

  const filterValidSelections = (selected: string[], available: string[]) =>
    selected.filter((val) => available.includes(val));

  useEffect(() => {
    setSelectedSections([]);
  }, [selectedDepartments]);

  useEffect(() => {
    if (selectedDepartments.length === 0) {
      setSelectedSections([]);
      setSelectedKjonn([]);
      setSelectedAlder([]);
      setSelectedAnsiennitet([]);
      setSelectedLederniva([]);
      setSelectedStilling([]);
      return;
    }

    // Filtrér seksjoner basert på valgte avdelinger
    const validSections = selectedDepartments.flatMap((dep) => sectionOptionsByDepartment[dep] || []);
    setSelectedSections((prev) => filterValidSelections(prev, validSections));

    // Kjønn
    const validKjonn = distinct(rawData.filter((d) => selectedDepartments.includes(d.avdeling)).map((d) => d.kjonn));
    setSelectedKjonn((prev) => filterValidSelections(prev, validKjonn));

    // Alder
    const validAlder = distinct(rawData.filter((d) => selectedDepartments.includes(d.avdeling)).map((d) => d.aldersgruppe));
    setSelectedAlder((prev) => filterValidSelections(prev, validAlder));

    // Ansiennitet
    const validAnsiennitet = distinct(rawData.filter((d) => selectedDepartments.includes(d.avdeling)).map((d) => d.ansiennitetsgruppe));
    setSelectedAnsiennitet((prev) => filterValidSelections(prev, validAnsiennitet));

    // Ledernivå
    const validLederniva = distinct(rawData.filter((d) => selectedDepartments.includes(d.avdeling)).map((d) => d.lederniva));
    setSelectedLederniva((prev) => filterValidSelections(prev, validLederniva));

    // Stilling
    const validStilling = distinct(rawData.filter((d) => selectedDepartments.includes(d.avdeling)).map((d) => d.stillingsnavn));
    setSelectedStilling((prev) => filterValidSelections(prev, validStilling));
  }, [selectedDepartments, rawData]);

  const addSelectAll = (options: string[]) => ["(Alle)", ...options];
  const handleToggle = (val: string, selected: string[], setSelected: (val: string[]) => void, all: string[]) => {
    if (val === "(Alle)") {
      setSelected(selected.length === all.length ? [] : [...all]);
    } else {
      setSelected(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
    }
  };

  // ---- MASKERING OG RENORMALISERING ----
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
    const isMaskedGroups: Record<string, boolean> = {};
    const maskedCombos: Record<string, Set<string>> = {};

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

    // Maskér hele gruppen hvis totalen < MIN_ANTALL_FOR_VISNING
    Object.entries(map).forEach(([gruppe, groupMap]) => {
      const totalAntall = Object.values(groupMap).reduce((sum, antall) => sum + antall, 0);
      if (totalAntall > 0 && totalAntall < MIN_ANTALL_FOR_VISNING) {
        Object.keys(groupMap).forEach((comboKey) => {
          groupMap[comboKey] = 0;
        });
        isMaskedGroups[gruppe] = true;
      } else {
        isMaskedGroups[gruppe] = false;
        // Maskér enkeltkombinasjoner med <5 personer
        Object.entries(groupMap).forEach(([comboKey, antall]) => {
          if (antall > 0 && antall < MIN_ANTALL_FOR_VISNING) {
            if (!maskedCombos[gruppe]) maskedCombos[gruppe] = new Set();
            maskedCombos[gruppe].add(comboKey);
            groupMap[comboKey] = 0;
          }
        });
      }
    });

    const data = Array.from(grupper).map((g) => {
      const total = Object.values(map[g] || {}).reduce((sum, v) => sum + v, 0);
      const row: Record<string, any> = {
        gruppe: g,
        totalAntall: total,
        isMasked: isMaskedGroups[g] || false,
        maskedCombos: maskedCombos[g] || new Set(),
      };

      // RENORMALISERING: Finn summen av synlige undergrupper
const visibleSum = Object.entries(map[g])
  .filter(([k]) => !(row.isMasked || row.maskedCombos.has(k)))
  .reduce((sum, [, v]) => sum + v, 0);

      Object.entries(map[g]).forEach(([key, val]) => {
        if (row.isMasked || row.maskedCombos.has(key)) {
          row[key] = 0;
        } else if (shouldShowCountAxis) {
          row[key] = val;
        } else {
          // Re-normaliser prosent så synlige undergrupper alltid summerer til 100%
          row[key] = visibleSum > 0 ? (val / visibleSum) * 100 : 0;
        }
      });
      return row;
    });

    return {
      data,
      undergrupper: Array.from(undergrupper),
    };
  }, [filteredData, groupKey, selectedKjonn, selectedAlder, selectedAnsiennitet, selectedLederniva, selectedStilling, rawData, shouldShowCountAxis]);

  // Fargelogikk
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
  const remToPx = (rem: string) => parseFloat(rem) * 16;

  return (
    <div>
      <div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
        <GuidePanel poster>
          <Heading level="2" size="small">Om denne visningen</Heading>
          <BodyLong spacing>
            I denne visningen kan du selv filtrere og sammenligne data på tvers av avdelinger, seksjoner og ulike grupper som kjønn, alder, ansiennitet, ledernivå og stilling.
            Målet er å gi deg fleksibilitet til å utforske mangfoldet i organisasjonen og få innsikt i fordelingen av ansatte i ulike deler av strukturen.
          </BodyLong>
          <BodyLong spacing>
            Du kan bruke filtrene til venstre for å skreddersy visningen, og for eksempel sammenligne hvordan kjønnsfordelingen varierer mellom seksjoner,
            eller hvordan ansiennitet fordeler seg på tvers av stillinger.
          </BodyLong>
          <BodyLong spacing>
            Diagrammet til høyre viser prosentandelene innenfor hver valgt gruppe, og du får også se antall personer representert bak hver andel.
            Når du beveger musen over grafene, får du opp detaljerte tall.
          </BodyLong>
          <BodyLong>
            Du kan velge flere kombinasjoner samtidig for å analysere mer komplekse mønstre. Målet er å gjøre det enklere å identifisere ubalanser,
            underrepresentasjon eller trender som bør følges opp i videre mangfoldsarbeid.
          </BodyLong>
        </GuidePanel>
      </div>

      {!loading && selectedDepartments.length === 0 && (
        <p style={{ marginBottom: "2rem" }}>Vennligst velg én avdeling for å se statistikk.</p>
      )}

      <div style={{ display: "flex", gap: "3rem", alignItems: "flex-start", paddingTop: "1.5rem" }}>
        <div style={{ minWidth: "320px", maxWidth: "420px", padding: "1rem 0" }}>
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
                  <BarChart
                    data={chartData.data}
                    margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
                  >
                    <XAxis
                      dataKey="gruppe"
                      angle={chartData.data.length > 12 ? -35 : 0}
                      textAnchor={chartData.data.length > 12 ? "end" : "middle"}
                      interval={0}
                      height={chartData.data.length > 12 ? 100 : 60}
                      tick={{
                        fontSize:
                          chartData.data.length <= 6
                            ? remToPx(tokens.AFontSizeLarge)
                            : chartData.data.length <= 10
                              ? remToPx(tokens.AFontSizeMedium)
                              : remToPx(tokens.AFontSizeSmall),
                        fill: tokens.ATextDefault,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize:
                          chartData.data.length <= 10
                            ? remToPx(tokens.AFontSizeLarge)
                            : remToPx(tokens.AFontSizeMedium),
                        fill: tokens.ATextDefault,
                      }}
                      domain={shouldShowCountAxis ? [0, 'auto'] : [0, 100]} // Prosent skal ikke gå over 100!
                      tickFormatter={(value: any) =>
                        shouldShowCountAxis
                          ? `${Math.round(value)}`
                          : `${Math.round(value)}%`
                      }
                    />

                    <Tooltip content={(props) => <CustomTooltip {...props} shouldShowCountAxis={shouldShowCountAxis} />} />

                    {chartData.undergrupper.map((key) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        name={key}
                        fill={fargeMap[key]}
                        opacity={hoveredKey === null || hoveredKey === key ? 1 : 0.2}
                        radius={[2, 2, 0, 0]}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  marginTop: "4rem",
                  paddingTop: "1rem",
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