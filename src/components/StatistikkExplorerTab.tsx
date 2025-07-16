import { useEffect, useMemo, useState } from "react";
import { Heading, BodyLong, Box, GuidePanel } from "@navikt/ds-react";
import { Button, Accordion, UNSAFE_Combobox } from "@navikt/ds-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as tokens from "@navikt/ds-tokens/dist/tokens";
import { CustomizedAxisTick } from "./CustomizedAxisTick";

const MIN_ANTALL_FOR_VISNING = 5;

// Tooltip for grafen, viser alle undergrupper, både synlige og maskerte (slik som legend)
const CustomTooltip = ({
  active,
  payload,
  shouldShowCountAxis,
  legendGroups,
  row,
  getFarge,
}: {
  active?: boolean;
  payload?: any;
  shouldShowCountAxis: boolean;
  legendGroups: string[];
  row: any;
  getFarge: (entry: string, antall: number) => string;
}) => {
  if (active && payload && payload.length) {
    const totalAntall = row.totalAntall ?? 0;
    // Hvis hele gruppen (seksjon/avdeling) har for få personer, vis kun grå tekst
    if (totalAntall < MIN_ANTALL_FOR_VISNING) {
      return (
        <div
          style={{
            background: "white",
            border: "1px solid #ccc",
            padding: "0.5rem",
            color: "#888",
          }}
        >
          <strong>For få personer til å vise data for denne gruppen</strong>
        </div>
      );
    }
    return (
      <div
        style={{
          background: "white",
          border: "1px solid #ccc",
          padding: "0.5rem",
        }}
      >
        {legendGroups.map((entry: string, index: number) => {
          const antall = row.rawGroupMap?.[entry] ?? 0;
          if (antall === 0) return null;
          if (antall < MIN_ANTALL_FOR_VISNING) {
            return (
              <div key={`item-${index}`} style={{ color: "#888" }}>
                <strong>{entry}</strong>: For få personer til å vise data
              </div>
            );
          }
          const value = row[entry];
          const prosent = shouldShowCountAxis ? undefined : value;
          const visAntall = shouldShowCountAxis
            ? value
            : Math.round((value / 100) * totalAntall);
          return (
            <div key={`item-${index}`} style={{ color: getFarge(entry, antall) }}>
              <strong>{entry}</strong>:{" "}
              {shouldShowCountAxis
                ? `${visAntall} personer`
                : `${prosent?.toFixed(1)}% (${visAntall} personer)`}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function StatistikkExplorerTab() {
  // --- STATE FOR FILTER OG DATA ---
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtervalg
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
        const res = await fetch(
          "https://mangfold-backend.intern.nav.no/ansatt-detaljer"
        );
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

  // Fjerner duplikater og tomme verdier fra array
  const distinct = (arr: any[]) =>
    Array.from(
      new Set(
        arr
          .map((val) => (typeof val === "string" ? val.trim() : ""))
          .filter((v) => v)
      )
    );

  // Hent alle avdelingsnavn
  const allDepartments = useMemo(
    () => distinct(rawData.map((d) => d.avdeling)),
    [rawData]
  );

  // Seksjonene per avdeling
  const sectionOptionsByDepartment = useMemo(() => {
    const avdelinger = new Set(distinct(rawData.map((d) => d.avdeling)));
    const map: Record<string, string[]> = {};
    rawData.forEach((d) => {
      if (
        d.avdeling &&
        d.seksjon &&
        d.seksjon !== d.avdeling &&
        !avdelinger.has(d.seksjon)
      ) {
        if (!map[d.avdeling]) map[d.avdeling] = [];
        if (!map[d.avdeling].includes(d.seksjon)) {
          map[d.avdeling].push(d.seksjon);
        }
      }
    });
    return map;
  }, [rawData]);

  // Skal Y-aksen vise antall eller prosent
  const shouldShowCountAxis =
    selectedKjonn.length === 0 &&
    selectedAlder.length === 0 &&
    selectedAnsiennitet.length === 0 &&
    selectedLederniva.length === 0 &&
    selectedStilling.length === 0;

  // Fjerner ugyldige valg fra filter hvis tilgjengelige alternativer endres
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
    const validSections = selectedDepartments.flatMap(
      (dep) => sectionOptionsByDepartment[dep] || []
    );
    setSelectedSections((prev) => filterValidSelections(prev, validSections));
    const validKjonn = distinct(
      rawData
        .filter((d) => selectedDepartments.includes(d.avdeling))
        .map((d) => d.kjonn)
    );
    setSelectedKjonn((prev) => filterValidSelections(prev, validKjonn));
    const validAlder = distinct(
      rawData
        .filter((d) => selectedDepartments.includes(d.avdeling))
        .map((d) => d.aldersgruppe)
    );
    setSelectedAlder((prev) => filterValidSelections(prev, validAlder));
    const validAnsiennitet = distinct(
      rawData
        .filter((d) => selectedDepartments.includes(d.avdeling))
        .map((d) => d.ansiennitetsgruppe)
    );
    setSelectedAnsiennitet((prev) =>
      filterValidSelections(prev, validAnsiennitet)
    );
    const validLederniva = distinct(
      rawData
        .filter((d) => selectedDepartments.includes(d.avdeling))
        .map((d) => d.lederniva)
    );
    setSelectedLederniva((prev) => filterValidSelections(prev, validLederniva));
    const validStilling = distinct(
      rawData
        .filter((d) => selectedDepartments.includes(d.avdeling))
        .map((d) => d.stillingsnavn)
    );
    setSelectedStilling((prev) => filterValidSelections(prev, validStilling));
  }, [selectedDepartments, rawData]);

  // Legger til "(Alle)"-valg i filter
  const addSelectAll = (options: string[]) => ["(Alle)", ...options];

  // Håndterer valg/deseleksjon i filter
  const handleToggle = (
    val: string,
    selected: string[],
    setSelected: (val: string[]) => void,
    all: string[]
  ) => {
    if (val === "(Alle)") {
      setSelected(selected.length === all.length ? [] : [...all]);
    } else {
      setSelected(
        selected.includes(val)
          ? selected.filter((v) => v !== val)
          : [...selected, val]
      );
    }
  };

  // Nullstill alle filtervalg
  const nullstillFilter = () => {
    setSelectedDepartments([]);
    setSelectedSections([]);
    setSelectedKjonn([]);
    setSelectedAlder([]);
    setSelectedAnsiennitet([]);
    setSelectedLederniva([]);
    setSelectedStilling([]);
  };

  // Bestemmer om vi grupperer på avdeling eller seksjon
  const groupKey = selectedSections.length > 0 ? "seksjon" : "avdeling";

  // Filtrerer data basert på valgt avdeling/seksjon og ALLE AKTIVE filter
  const filteredData = useMemo(() => {
    if (selectedDepartments.length === 0) return [];
    const avdelinger = new Set(distinct(rawData.map((d) => d.avdeling)));
    return rawData.filter((d) => {
      const validAvdeling = selectedDepartments.includes(d.avdeling);
      const validSeksjon = groupKey === "seksjon"
        ? selectedSections.length === 0 || selectedSections.includes(d.seksjon)
        : true;
      const isNotLeder = groupKey === "seksjon"
        ? d.seksjon && d.seksjon !== d.avdeling && !avdelinger.has(d.seksjon)
        : true;
      const validKjonn = selectedKjonn.length === 0 || selectedKjonn.includes(d.kjonn);
      const validAlder = selectedAlder.length === 0 || selectedAlder.includes(d.aldersgruppe);
      const validAnsiennitet = selectedAnsiennitet.length === 0 || selectedAnsiennitet.includes(d.ansiennitetsgruppe);
      const validLederniva = selectedLederniva.length === 0 || selectedLederniva.includes(d.lederniva);
      const validStilling = selectedStilling.length === 0 || selectedStilling.includes(d.stillingsnavn);
      return validAvdeling && validSeksjon && isNotLeder &&
        validKjonn && validAlder && validAnsiennitet && validLederniva && validStilling;
    });
  }, [
    rawData,
    selectedDepartments,
    selectedSections,
    groupKey,
    selectedKjonn,
    selectedAlder,
    selectedAnsiennitet,
    selectedLederniva,
    selectedStilling,
  ]);

  // CHARTDATA: Alle grupper synlige på x-aksen, men kun >=5 personer får graf/bar.
  // Undergrupper med <5 skjules fra bar/graf, men vises i legend og tooltip i grått.
  const chartData = useMemo(() => {
    let grupper: string[] = [];
    if (groupKey === "seksjon" && selectedSections.length > 0) {
      grupper = selectedSections;
    } else if (groupKey === "avdeling" && selectedDepartments.length > 0) {
      grupper = selectedDepartments;
    } else {
      grupper = Array.from(new Set(filteredData.map((d) => d[groupKey] ?? "Ukjent")));
    }

    // Map: gruppe -> comboKey -> antall
    const map: Record<string, Record<string, number>> = {};
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
    });

    // Finn alle undergrupper for legend og tooltip (også de <5 personer)
    const undergrupperSet = new Set<string>();
    Object.values(map).forEach((groupMap) => {
      Object.keys(groupMap).forEach((comboKey) => {
        undergrupperSet.add(comboKey);
      });
    });
    const undergrupper = Array.from(undergrupperSet);

    const data = grupper.map((g) => {
      const groupMap = map[g] || {};
      // Synlige barer (>=5 personer)
      const visibleCombos = undergrupper.filter((key) => (groupMap[key] || 0) >= MIN_ANTALL_FOR_VISNING);
      // Maskerte barer (0 < x < 5 personer)
      const maskedCombos = undergrupper.filter((key) => (groupMap[key] || 0) > 0 && (groupMap[key] || 0) < MIN_ANTALL_FOR_VISNING);
      const totalVisible = visibleCombos.reduce((sum, key) => sum + (groupMap[key] || 0), 0);

      const isMasked = totalVisible < MIN_ANTALL_FOR_VISNING;

      const row: Record<string, any> = {
        gruppe: g,
        totalAntall: totalVisible,
        isMasked,
        comboKeysWithData: undergrupper, // Tooltip og legend skal vise alle!
        rawGroupMap: groupMap,
      };

      visibleCombos.forEach((key) => {
        const antall = groupMap[key] || 0;
        row[key] = shouldShowCountAxis
          ? antall
          : totalVisible > 0
          ? (antall / totalVisible) * 100
          : 0;
      });

      // Maskerte combos har ingen bar/tall, men vises i tooltip/legend i grått
      maskedCombos.forEach((key) => {
        row[key] = undefined;
      });

      return row;
    });

    const allGroupsMasked = data.every((row) => row.isMasked);

    return {
      data,
      undergrupper,
      allGroupsMasked,
      map,
    };
  }, [
    filteredData,
    groupKey,
    selectedDepartments,
    selectedSections,
    selectedKjonn,
    selectedAlder,
    selectedAnsiennitet,
    selectedLederniva,
    selectedStilling,
    shouldShowCountAxis,
  ]);

  // FARGER FOR GRAFEN
  const getFarge = (entry: string, antall: number) => {
    if (antall > 0 && antall < MIN_ANTALL_FOR_VISNING) return "#888";
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
    const ansiennitetsFarger: Record<string, string> = {
      "0-2": tokens.AGreen300,
      "2-4": tokens.AGreen500,
      "4-10": tokens.AGreen600,
      "10-16": tokens.AGreen700,
      "16+": tokens.AGreen900,
    };
    const lederFarger: Record<string, string> = {
      Medarbeider: tokens.AOrange200,
      Seksjonssjef: tokens.AOrange400,
      Avdelingsdirektør: tokens.AOrange600,
      Direktør: tokens.AOrange700,
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

    if (
      entry.startsWith("Kvinne") ||
      entry.startsWith("Mann") ||
      entry.startsWith("Ukjent")
    ) {
      const kjonn = entry.startsWith("Kvinne")
        ? "Kvinne"
        : entry.startsWith("Mann")
        ? "Mann"
        : "Ukjent";
      return baseColors[kjonn][0];
    } else if (selectedKjonn.length === 0 && selectedAlder.length > 0) {
      const alderKey = Object.keys(alderFarger).find((key) =>
        entry.includes(key)
      );
      return alderFarger[alderKey ?? "<30"];
    } else if (
      selectedKjonn.length === 0 &&
      selectedAlder.length === 0 &&
      selectedAnsiennitet.length > 0
    ) {
      const ansKey = Object.keys(ansiennitetsFarger).find((key) =>
        entry.includes(key)
      );
      return ansiennitetsFarger[ansKey ?? "0-2"];
    } else if (
      selectedKjonn.length === 0 &&
      selectedAlder.length === 0 &&
      selectedAnsiennitet.length === 0 &&
      selectedLederniva.length > 0
    ) {
      const ledKey = Object.keys(lederFarger).find((key) =>
        entry.includes(key)
      );
      return lederFarger[ledKey ?? "Medarbeider"];
    } else if (
      selectedKjonn.length === 0 &&
      selectedAlder.length === 0 &&
      selectedAnsiennitet.length === 0 &&
      selectedLederniva.length === 0 &&
      selectedStilling.length > 0
    ) {
      return stillingFarger[0];
    }
    return "#236B7D";
  };

  // Hover-state for legende
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const remToPx = (rem: string) => parseFloat(rem) * 16;

  // LEGEND: Vis alle undergrupper i legend, markér maskerte i grått med tekst
  const legendGroups = chartData.undergrupper;
  const legendBoxStatus: Record<string, "visible" | "masked" | "empty"> = {};
  legendGroups.forEach((key) => {
    const hasVisible = chartData.data.some(
      (row) => row.rawGroupMap?.[key] >= MIN_ANTALL_FOR_VISNING
    );
    const isMasked = chartData.data.some(
      (row) => row.rawGroupMap?.[key] > 0 && row.rawGroupMap?.[key] < MIN_ANTALL_FOR_VISNING
    );
    const isEmpty = chartData.data.every(
      (row) => !(row.rawGroupMap?.[key] ?? 0)
    );
    legendBoxStatus[key] = hasVisible
      ? "visible"
      : isMasked
      ? "masked"
      : isEmpty
      ? "empty"
      : "masked";
  });
  const anyVisible = legendGroups.length > 0 && !chartData.allGroupsMasked;

  // --- RENDER ---
  return (
    <div>
      <div>
        <GuidePanel poster>
          <Heading size="medium">Om denne visningen</Heading>
          <BodyLong size="medium">
            Her kan du selv filtrere og sammenligne data på tvers av avdelinger
            og seksjoner. Du kan vise fordeling på gruppene kjønn, alder,
            ansiennitet, ledernivå og stilling.
          </BodyLong>
          <BodyLong size="medium">
            Du kan bruke filtrene til venstre for å skreddersy visningen, og for
            eksempel sammenligne hvordan kjønnsfordelingen varierer mellom
            seksjoner, eller hvordan ansiennitet fordeler seg på tvers av
            stillinger.
          </BodyLong>
          <BodyLong size="medium">
            Når du beveger musen over grafene, får du opp detaljerte tall.
          </BodyLong>
          <BodyLong size="medium">
            Du kan velge flere kombinasjoner samtidig for å analysere mer
            komplekse mønstre. Obs: Velger du for mange filtre kan grafen bli
            uoversiktlig. Grupperinger som er for små blir ikke vist av
            personvernshensyn.
          </BodyLong>
        </GuidePanel>
      </div>
      <div
        style={{
          display: "flex",
          gap: "3rem",
          alignItems: "flex-start",
          paddingTop: "1.5rem",
        }}
      >
        <div
          style={{ minWidth: "320px", maxWidth: "420px", padding: "1rem 0" }}
        >
          <Accordion>
            <Accordion.Item title="Avdeling">
              <UNSAFE_Combobox
                label="Velg avdeling(er)"
                options={addSelectAll(allDepartments)}
                isMultiSelect
                selectedOptions={selectedDepartments}
                onToggleSelected={(val: string) =>
                  handleToggle(
                    val,
                    selectedDepartments,
                    setSelectedDepartments,
                    allDepartments
                  )
                }
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
                    selectedDepartments.flatMap(
                      (dep) => sectionOptionsByDepartment[dep] || []
                    )
                  )
                }
                placeholder={
                  selectedDepartments.length === 0
                    ? "Velg en avdeling først"
                    : "Velg seksjon(er)"
                }
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
                            .filter((d) =>
                              selectedDepartments.includes(d.avdeling)
                            )
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
                placeholder={
                  selectedDepartments.length === 0
                    ? "Velg en avdeling først"
                    : "Velg kjønn"
                }
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
                            .filter((d) =>
                              selectedDepartments.includes(d.avdeling)
                            )
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
                placeholder={
                  selectedDepartments.length === 0
                    ? "Velg en avdeling først"
                    : "Velg aldersgruppe"
                }
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
                            .filter((d) =>
                              selectedDepartments.includes(d.avdeling)
                            )
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
                placeholder={
                  selectedDepartments.length === 0
                    ? "Velg en avdeling først"
                    : "Velg ansiennitet"
                }
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
                            .filter((d) =>
                              selectedDepartments.includes(d.avdeling)
                            )
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
                placeholder={
                  selectedDepartments.length === 0
                    ? "Velg en avdeling først"
                    : "Velg ledernivå"
                }
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
                            .filter((d) =>
                              selectedDepartments.includes(d.avdeling)
                            )
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
                placeholder={
                  selectedDepartments.length === 0
                    ? "Velg en avdeling først"
                    : "Velg stilling(er)"
                }
              />
            </Accordion.Item>
          </Accordion>
          {selectedDepartments.length > 0 && (
            <Button
              variant="tertiary"
              onClick={nullstillFilter}
              style={{ marginTop: "1rem" }}
            >
              Nullstill filter
            </Button>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {loading ? (
            <p>Laster data...</p>
          ) : selectedDepartments.length === 0 &&
            selectedSections.length === 0 ? (
            <p>Vennligst velg en eller flere avdelinger.</p>
          ) : (
            <div>
              <Box
                padding="6"
                marginBlock="6"
                borderRadius="large"
                background-color="subtle"
                shadow="medium"
              >
                <div
                  style={{ height: "calc(100vh - 200px)", maxHeight: "900px" }}
                >
                  {chartData.allGroupsMasked ? (
                    <div style={{ color: "#888", padding: "2rem 0" }}>
                      <strong>Kan ikke vise data for denne gruppen</strong>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.data}
                        margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
                      >
                        <XAxis
                          dataKey="gruppe"
                          interval={0}
                          height={chartData.data.length > 9 ? 100 : 60}
                          tick={(props) => (
                            <CustomizedAxisTick
                              {...props}
                              visibleTicksCount={chartData.data.length}
                            />
                          )}
                        />
                        <YAxis
                          tick={{
                            fontSize:
                              chartData.data.length <= 10
                                ? remToPx(tokens.AFontSizeLarge)
                                : remToPx(tokens.AFontSizeMedium),
                            fill: tokens.ATextDefault,
                          }}
                          domain={shouldShowCountAxis ? [0, "auto"] : [0, 100]}
                          tickFormatter={(value: any) =>
                            shouldShowCountAxis
                              ? `${Math.round(value)}`
                              : `${Math.round(value)}%`
                          }
                          label={{
                            value: shouldShowCountAxis ? "Antall" : "Prosent",
                            angle: -90,
                            position: "insideLeft",
                            offset: -8,
                            style: {
                              fill: tokens.ATextDefault,
                              fontSize: remToPx(tokens.AFontSizeMedium),
                              fontWeight: 800,
                            },
                          }}
                        />
                        <Tooltip
                          content={(props) => {
                            const row = props?.payload?.[0]?.payload;
                            return (
                              <CustomTooltip
                                {...props}
                                shouldShowCountAxis={shouldShowCountAxis}
                                legendGroups={legendGroups}
                                row={row}
                                getFarge={getFarge}
                              />
                            );
                          }}
                        />
                        {chartData.undergrupper.map((key) => {
                          // Finn farge for baren basert på første rad med synlig antall
                          let color = "#cccccc";
                          for (const row of chartData.data) {
                            const antall = row.rawGroupMap?.[key] ?? 0;
                            if (antall >= MIN_ANTALL_FOR_VISNING) {
                              color = getFarge(key, antall);
                              break;
                            }
                          }
                          return (
                            <Bar
                              key={key}
                              dataKey={key}
                              stackId="a"
                              name={key}
                              fill={color}
                              opacity={
                                hoveredKey === null || hoveredKey === key ? 1 : 0.2
                              }
                              radius={[2, 2, 0, 0]}
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          );
                        })}
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {anyVisible && (
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
                      {legendGroups.map((key) => {
                        const status = legendBoxStatus[key];
                        const isVisible = status === "visible";
                        const isMasked = status === "masked";
                        const isEmpty = status === "empty";
                        const isHovered = hoveredKey === key;
                        return (
                          <div
                            key={key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              cursor: "pointer",
                              backgroundColor: isHovered
                                ? "#f0f0f0"
                                : "transparent",
                              borderRadius: "4px",
                              padding: "2px 4px",
                              transition: "background-color 0.2s ease",
                              opacity: isVisible ? 1 : 0.4,
                              color: isMasked || isEmpty ? "#888" : undefined,
                            }}
                            onMouseEnter={() => setHoveredKey(key)}
                            onMouseLeave={() => setHoveredKey(null)}
                            title={
                              isMasked
                                ? "For få personer til å vise data"
                                : isEmpty
                                ? "Ingen personer i denne gruppen"
                                : undefined
                            }
                          >
                            <div
                              style={{
                                width: 14,
                                height: 14,
                                backgroundColor: isVisible
                                  ? getFarge(key, MIN_ANTALL_FOR_VISNING)
                                  : "#cccccc",
                                flexShrink: 0,
                                border: isHovered
                                  ? "2px solid black"
                                  : "1px solid #aaa",
                              }}
                            />
                            <span
                              style={{
                                fontWeight: isHovered ? "bold" : "normal",
                                color: isHovered
                                  ? "#222"
                                  : isMasked || isEmpty
                                  ? "#888"
                                  : "inherit",
                              }}
                            >
                              {key}
                              {isMasked
                                ? " – For få personer til å vise data"
                                : isEmpty
                                ? " – Ingen personer i denne gruppen"
                                : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Box>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
