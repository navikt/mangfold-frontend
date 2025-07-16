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

// Lager alle mulige kombinasjoner av filterverdier (kartesisk produkt)
function cartesian(arrays: string[][]): string[][] {
  return arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [
    [],
  ] as string[][]);
}

// Tooltip-komponent for grafen, viser kun synlige grupper i grafen (de med farge/beløp > 0 og ikke maskert)
const CustomTooltip = ({
  active,
  payload,
  shouldShowCountAxis,
  fargeMap,
}: {
  active?: boolean;
  payload?: any;
  shouldShowCountAxis: boolean;
  fargeMap: Record<string, string>;
}) => {
  if (active && payload && payload.length) {
    const isMasked = payload[0]?.payload?.isMasked ?? false;
    const maskedCombos = payload[0]?.payload?.maskedCombos ?? new Set();
    const total = payload[0]?.payload?.totalAntall ?? 0;
    const allKeys: string[] =
      payload[0]?.payload?.allComboKeys ??
      Object.keys(payload[0]?.payload).filter(
        (k) =>
          k !== "gruppe" &&
          k !== "totalAntall" &&
          k !== "isMasked" &&
          k !== "maskedCombos" &&
          k !== "allComboKeys"
      );
    if (isMasked) {
      return (
        <div
          style={{
            background: "white",
            border: "1px solid #ccc",
            padding: "0.5rem",
          }}
        >
          <strong>For få personer til å vise data</strong>
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
        {allKeys.map((entry: string, index: number) => {
          const value = payload[0]?.payload[entry];
          const isMaskedCombo =
            maskedCombos.has(entry) ||
            value === 0 ||
            value === undefined ||
            value < MIN_ANTALL_FOR_VISNING;
          const color = isMaskedCombo ? "#888" : fargeMap?.[entry] ?? "#222";
          const prosent = shouldShowCountAxis ? undefined : value;
          const antall = shouldShowCountAxis
            ? value
            : Math.round((value / 100) * total);
          return (
            <div key={`item-${index}`} style={{ color }}>
              <strong>{entry}</strong>:{" "}
              {isMaskedCombo
                ? "For få personer til å vise data"
                : shouldShowCountAxis
                ? `${antall} personer`
                : `${prosent?.toFixed(1)}% (${antall} personer)`}
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

  // Seksjonene per avdeling (kun ekte seksjoner, ikke ledere)
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

  // Bestemmer om Y-aksen skal vise antall eller prosent (ingen filter = antall)
  const shouldShowCountAxis =
    selectedKjonn.length === 0 &&
    selectedAlder.length === 0 &&
    selectedAnsiennitet.length === 0 &&
    selectedLederniva.length === 0 &&
    selectedStilling.length === 0;

  // Fjerner ugyldige valg fra filter hvis tilgjengelige alternativer endres
  const filterValidSelections = (selected: string[], available: string[]) =>
    selected.filter((val) => available.includes(val));

  // Nullstill seksjonsvalg når avdeling endres
  useEffect(() => {
    setSelectedSections([]);
  }, [selectedDepartments]);

  // Oppdaterer alle filtervalg når avdeling endres
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

  // Filtrerer data basert på valgt avdeling/seksjon og filter
  const filteredData = useMemo(() => {
    if (selectedDepartments.length === 0) return [];
    const avdelinger = new Set(distinct(rawData.map((d) => d.avdeling)));
    return rawData.filter((d) => {
      // AVDELINGSVISNING: alle ansatte for valgt avdeling
      if (groupKey === "avdeling") {
        return selectedDepartments.includes(d.avdeling);
      }
      // SEKSJONSVISNING: kun ansatte i ekte seksjoner
      if (groupKey === "seksjon") {
        const isNotLeder =
          d.seksjon && d.seksjon !== d.avdeling && !avdelinger.has(d.seksjon);
        const isInSelectedSeksjon =
          selectedSections.length === 0 || selectedSections.includes(d.seksjon);
        return (
          isNotLeder &&
          isInSelectedSeksjon &&
          selectedDepartments.includes(d.avdeling)
        );
      }
      return false;
    });
  }, [rawData, selectedDepartments, selectedSections, groupKey]);

  // --- CHARTDATA: grupper, maskering, renormalisering og farger ---
  const chartData = useMemo(() => {
    // 1. Lag alle mulige filterkombinasjoner
    const filterArrays: string[][] = [];
    if (selectedKjonn.length > 0) filterArrays.push(selectedKjonn);
    if (selectedAlder.length > 0) filterArrays.push(selectedAlder);
    if (selectedAnsiennitet.length > 0) filterArrays.push(selectedAnsiennitet);
    if (selectedLederniva.length > 0) filterArrays.push(selectedLederniva);
    if (selectedStilling.length > 0) filterArrays.push(selectedStilling);

    const cartesianCombos: string[] =
      filterArrays.length > 0
        ? cartesian(filterArrays).map((parts) => parts.join(" | "))
        : ["Totalt"];

    // 2. Finn alle grupper (avdeling/seksjon)
    const grupper = new Set<string>();
    filteredData.forEach((d) => {
      grupper.add(d[groupKey] ?? "Ukjent");
    });

    // 3. Bygg map: gruppe -> comboKey -> antall
    const map: Record<string, Record<string, number>> = {};
    filteredData.forEach((d) => {
      const gruppe = d[groupKey] ?? "Ukjent";
      const keyParts: string[] = [];
      if (selectedKjonn.length > 0) keyParts.push(d.kjonn || "Ukjent");
      if (selectedAlder.length > 0) keyParts.push(d.aldersgruppe || "Ukjent");
      if (selectedAnsiennitet.length > 0)
        keyParts.push(d.ansiennitetsgruppe || "Ukjent");
      if (selectedLederniva.length > 0) keyParts.push(d.lederniva || "Ukjent");
      if (selectedStilling.length > 0)
        keyParts.push(d.stillingsnavn || "Ukjent");
      const comboKey = keyParts.length > 0 ? keyParts.join(" | ") : "Totalt";
      if (!map[gruppe]) map[gruppe] = {};
      map[gruppe][comboKey] = (map[gruppe][comboKey] || 0) + (d.antall ?? 0);
    });

    // 4. Sikre at alle kombinasjoner finnes i alle grupper
    Array.from(grupper).forEach((gruppe) => {
      if (!map[gruppe]) map[gruppe] = {};
      cartesianCombos.forEach((comboKey) => {
        if (!(comboKey in map[gruppe])) {
          map[gruppe][comboKey] = 0;
        }
      });
    });

    // 5. Maskering: skjul små grupper av personvernhensyn
    const isMaskedGroups: Record<string, boolean> = {};
    const maskedCombos: Record<string, Set<string>> = {};

    Object.entries(map).forEach(([gruppe, groupMap]) => {
      const totalAntall = Object.values(groupMap).reduce(
        (sum, antall) => sum + antall,
        0
      );
      if (totalAntall > 0 && totalAntall < MIN_ANTALL_FOR_VISNING) {
        Object.keys(groupMap).forEach((comboKey) => {
          groupMap[comboKey] = 0;
        });
        isMaskedGroups[gruppe] = true;
      } else {
        isMaskedGroups[gruppe] = false;
        Object.entries(groupMap).forEach(([comboKey, antall]) => {
          if (antall > 0 && antall < MIN_ANTALL_FOR_VISNING) {
            if (!maskedCombos[gruppe]) maskedCombos[gruppe] = new Set();
            maskedCombos[gruppe].add(comboKey);
            groupMap[comboKey] = 0;
          }
        });
      }
    });

    // 6. Renormalisering: prosentfordeling på synlige grupper
    const data = Array.from(grupper).map((g) => {
      const total = Object.values(map[g] || {}).reduce((sum, v) => sum + v, 0);
      const row: Record<string, any> = {
        gruppe: g,
        totalAntall: total,
        isMasked: isMaskedGroups[g] || false,
        maskedCombos: maskedCombos[g] || new Set(),
        allComboKeys: cartesianCombos,
      };
      const visibleSum = cartesianCombos
        .filter((key) => !(row.isMasked || row.maskedCombos.has(key)))
        .reduce((sum, key) => sum + (map[g][key] || 0), 0);

      cartesianCombos.forEach((key) => {
        if (row.isMasked || row.maskedCombos.has(key)) {
          row[key] = 0;
        } else if (shouldShowCountAxis) {
          row[key] = map[g][key] || 0;
        } else {
          row[key] = visibleSum > 0 ? (map[g][key] / visibleSum) * 100 : 0;
        }
      });
      return row;
    });

    return {
      data,
      undergrupper: cartesianCombos,
      maskedCombos,
    };
  }, [
    filteredData,
    groupKey,
    selectedKjonn,
    selectedAlder,
    selectedAnsiennitet,
    selectedLederniva,
    selectedStilling,
    shouldShowCountAxis,
  ]);

  // --- FARGER FOR GRAFEN ---
  const fargeMap = useMemo(() => {
    // Fargepaletter for ulike grupper
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

    // Tildeler farger til hver undergruppe
    const counters: Record<string, number> = {
      Kvinne: 0,
      Mann: 0,
      Ukjent: 0,
    };
    const result: Record<string, string> = {};
    let stillingColorIndex = 0;
    const stillingColorMap: Record<string, string> = {};

    chartData.undergrupper.forEach((val) => {
      if (
        val.startsWith("Kvinne") ||
        val.startsWith("Mann") ||
        val.startsWith("Ukjent")
      ) {
        const kjonn = val.startsWith("Kvinne")
          ? "Kvinne"
          : val.startsWith("Mann")
          ? "Mann"
          : "Ukjent";
        const index = counters[kjonn] % baseColors[kjonn].length;
        result[val] = baseColors[kjonn][index];
        counters[kjonn]++;
      } else if (selectedKjonn.length === 0 && selectedAlder.length > 0) {
        const alderKey = Object.keys(alderFarger).find((key) =>
          val.includes(key)
        );
        result[val] = alderFarger[alderKey ?? "<30"];
      } else if (
        selectedKjonn.length === 0 &&
        selectedAlder.length === 0 &&
        selectedAnsiennitet.length > 0
      ) {
        const ansKey = Object.keys(ansiennitetFarger).find((key) =>
          val.includes(key)
        );
        result[val] = ansiennitetFarger[ansKey ?? "0-2"];
      } else if (
        selectedKjonn.length === 0 &&
        selectedAlder.length === 0 &&
        selectedAnsiennitet.length === 0 &&
        selectedLederniva.length > 0
      ) {
        const ledKey = Object.keys(lederFarger).find((key) =>
          val.includes(key)
        );
        result[val] = lederFarger[ledKey ?? "Medarbeider"];
      } else if (
        selectedKjonn.length === 0 &&
        selectedAlder.length === 0 &&
        selectedAnsiennitet.length === 0 &&
        selectedLederniva.length === 0 &&
        selectedStilling.length > 0
      ) {
        const stillingKey = val;
        if (!stillingColorMap[stillingKey]) {
          const color =
            stillingFarger[stillingColorIndex % stillingFarger.length];
          stillingColorMap[stillingKey] = color;
          stillingColorIndex++;
        }
        result[val] = stillingColorMap[stillingKey];
      } else {
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

  // Hover-state for legende
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const remToPx = (rem: string) => parseFloat(rem) * 16;

  // Legend: vis kun hvis minst én gruppe har synlig data
  const legendGroups = chartData.undergrupper.filter((key) => key !== "Totalt");
  const legendBoxStatus: Record<string, "visible" | "masked"> = {};
  legendGroups.forEach((key) => {
    const hasVisible = chartData.data.some(
      (row) => !row.isMasked && !row.maskedCombos.has(key) && row[key] > 0
    );
    legendBoxStatus[key] = hasVisible ? "visible" : "masked";
  });
  const anyVisible = legendGroups.some(
    (key) => legendBoxStatus[key] === "visible"
  );

  // --- RENDER ---
  return (
    <div>
      {/* Informasjonspanel */}
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
      {/* Layout: filterpanel og graf */}
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
        {/* Graf og legende */}
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
                        content={(props) => (
                          <CustomTooltip
                            {...props}
                            shouldShowCountAxis={shouldShowCountAxis}
                            fargeMap={fargeMap}
                          />
                        )}
                      />
                      {chartData.undergrupper.map((key) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          stackId="a"
                          name={key}
                          fill={fargeMap[key]}
                          opacity={
                            hoveredKey === null || hoveredKey === key ? 1 : 0.2
                          }
                          radius={[2, 2, 0, 0]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legende for undergrupper, med hover-effekt og maskeringsinfo */}
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
                        const isVisible = legendBoxStatus[key] === "visible";
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
                            }}
                            onMouseEnter={() => setHoveredKey(key)}
                            onMouseLeave={() => setHoveredKey(null)}
                            title={
                              isVisible
                                ? undefined
                                : "For få personer til å vise data"
                            }
                          >
                            <div
                              style={{
                                width: 14,
                                height: 14,
                                backgroundColor: isVisible
                                  ? fargeMap[key]
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
                                color: isHovered ? "#222" : "inherit",
                              }}
                            >
                              {key}
                              {!isVisible
                                ? " – For få personer til å vise data"
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