import { useEffect, useMemo, useState } from "react";
import { Heading, Label, Button } from "@navikt/ds-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ReactSelect from "react-select";
import { generateDynamicAgeColors, extractUniqueAgeGroups, isMasked, getMaskedStyle, getMaskedValue } from "../utils/alderGruppeUtils";

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

  const distinct = (arr: any[]) => Array.from(new Set(arr.map((val) => (typeof val === "string" ? val.trim() : "")).filter((v) => v)));

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

  const allOptions = useMemo(() => {
    const relevantData = rawData.filter((d) => {
      const matcherAvdeling = selectedDepartments.length === 0 || selectedDepartments.includes(d.avdeling);
      const matcherSeksjon = selectedSections.length === 0 || selectedSections.includes(d.seksjon);
      return matcherAvdeling && matcherSeksjon;
    });

    // Hent aldersgrupper dynamisk i stedet for hardkoding
    const dynamicAldersgrupper = Array.from(
      new Set(relevantData.map((d) => d.aldersgruppe).filter(Boolean))
    ).sort((a, b) => {
      // "Ukjent alder" skal alltid komme sist  
      if (a.includes("Ukjent") || a.includes("ukjent")) return 1;
      if (b.includes("Ukjent") || b.includes("ukjent")) return -1;
      
      // Prøv å sortere numerisk hvis mulig
      const aNum = parseInt(a.replace(/[^0-9]/g, ''));
      const bNum = parseInt(b.replace(/[^0-9]/g, ''));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // Fallback til alfabetisk sortering
      return a.localeCompare(b);
    });

    return {
      kjonn: distinct(relevantData.map((d) => d.kjonn)),
      alder: dynamicAldersgrupper, // Bruk dynamiske aldersgrupper
      ansiennitet: distinct(relevantData.map((d) => d.ansiennitetsgruppe)),
      lederniva: distinct(relevantData.map((d) => d.lederniva)),
      stilling: distinct(relevantData.map((d) => d.stillingsnavn)),
    };
  }, [rawData, selectedDepartments, selectedSections]);

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
      const kjonn = d.kjonn ?? "Ukjent";
      const antall = d.antall ?? 0;
      
      // Sjekk for maskering (erMaskert kan komme fra API-data)
      const maskert = isMasked(d);
      
      if (!map[gruppe]) map[gruppe] = {};
      map[gruppe][kjonn] = (map[gruppe][kjonn] || 0) + antall;
      map[gruppe].erMaskert = maskert; // Legg til maskeringsstatus
      
      grupper.add(gruppe);
      undergrupper.add(kjonn);
    });

    return {
      data: Array.from(grupper).map((g) => ({
        gruppe: g,
        erMaskert: map[g].erMaskert,
        ...map[g],
      })),
      undergrupper: Array.from(undergrupper),
    };
  }, [filteredData, groupKey]);

  // Dynamiske farger basert på faktiske kategorier fra data
  const farger = [
    "#339989", "#232C3D", "#D0D0D0", "#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0",
  ];
  const fargeMap = useMemo(() => {
    const result: Record<string, string> = {};
    chartData.undergrupper.forEach((val, i) => {
      result[val] = farger[i % farger.length];
    });
    return result;
  }, [chartData.undergrupper]);

  const harValgteFilter = useMemo(
    () =>
      selectedDepartments.length > 0 ||
      selectedSections.length > 0 ||
      selectedKjonn.length > 0 ||
      selectedAlder.length > 0 ||
      selectedAnsiennitet.length > 0 ||
      selectedLederniva.length > 0 ||
      selectedStilling.length > 0,
    [selectedDepartments, selectedSections, selectedKjonn, selectedAlder, selectedAnsiennitet, selectedLederniva, selectedStilling]
  );

  const nullstillFilter = () => {
    setSelectedDepartments([]);
    setSelectedSections([]);
    setSelectedKjonn([]);
    setSelectedAlder([]);
    setSelectedAnsiennitet([]);
    setSelectedLederniva([]);
    setSelectedStilling([]);
  };

  const multiSelect = (
    label: string,
    options: string[],
    selected: string[],
    setSelected: (val: string[]) => void,
    noOptionsMessage?: string,
    showSelectAll: boolean = true
  ) => {
    const selectAllValue = "__ALL__";
    const selectAllOption = { label: `Velg alle ${label.toLowerCase()}`, value: selectAllValue };
    const optionObjects = options.map((o) => ({ value: o, label: o }));

    const handleChange = (selectedOptions: any) => {
      if (!selectedOptions || selectedOptions.length === 0) {
        setSelected([]);
        return;
      }
      const values = selectedOptions.map((o: any) => o.value);
      const isSelectAllSelected = values.includes(selectAllValue);

      if (isSelectAllSelected) {
        if (selected.length !== options.length) {
          setSelected(options);
        } else {
          setSelected([]);
        }
      } else {
        setSelected(values);
      }
    };

    const customOptions = showSelectAll ? [selectAllOption, ...optionObjects] : optionObjects;
    const isAllSelected = selected.length === options.length;
    const currentValue = selected.length === 0
      ? []
      : isAllSelected
        ? [selectAllOption, ...optionObjects]
        : optionObjects.filter((o) => selected.includes(o.value));

    return (
      <div style={{ minWidth: "250px" }}>
        <Label style={{ display: "block", marginBottom: "0.25rem" }}>{label}</Label>
        <ReactSelect
          isMulti
          placeholder={`Velg ${label.toLowerCase()}...`}
          options={customOptions}
          value={currentValue}
          onChange={handleChange}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          noOptionsMessage={() => noOptionsMessage || "Ingen alternativer"}
        />
      </div>
    );
  };

  return (
    <div>
      <Heading level="2" size="medium">Statistikkfilter</Heading>
      <p style={{ marginBottom: "3rem" }}>
        Denne visningen gir deg oversikt over grupperte data med egne farger per kjønn (eller annen kategori).
      </p>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "6rem", alignItems: "flex-end" }}>
        {multiSelect("Avdeling(er)", allDepartments, selectedDepartments, setSelectedDepartments)}
        {multiSelect("Seksjon(er)", selectedDepartments.flatMap((dep) => sectionOptionsByDepartment[dep] || []), selectedSections, setSelectedSections, selectedDepartments.length === 0 ? "Velg avdeling(er) først..." : undefined)}
        {multiSelect("Kjønn", allOptions.kjonn, selectedKjonn, setSelectedKjonn)}
        {multiSelect("Alder", allOptions.alder, selectedAlder, setSelectedAlder)}
        {multiSelect("Ansiennitet", allOptions.ansiennitet, selectedAnsiennitet, setSelectedAnsiennitet)}
        {multiSelect("Ledernivå", allOptions.lederniva, selectedLederniva, setSelectedLederniva)}
        {multiSelect("Stilling", allOptions.stilling, selectedStilling, setSelectedStilling)}

        {harValgteFilter && (
          <div style={{ minWidth: "250px" }}>
            <Button variant="tertiary" onClick={nullstillFilter}>Nullstill filter</Button>
          </div>
        )}
      </div>

      {loading ? (
        <p>Laster data...</p>
      ) : selectedDepartments.length === 0 ? (
        <p style={{ marginTop: "2rem" }}>Vennligst velg én avdeling for å se statistikk.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.data} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
              <XAxis
                dataKey="gruppe"
                angle={chartData.data.length > 12 ? -45 : 0}
                textAnchor={chartData.data.length > 12 ? "end" : "middle"}
                interval={0}
                height={chartData.data.length > 12 ? 80 : 40}
                tick={{ fontSize: 8 }}
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  
                  const data = payload[0].payload;
                  const maskert = isMasked(data);
                  
                  return (
                    <div style={{ 
                      background: "#2d3748", 
                      color: "white", 
                      padding: "1rem", 
                      borderRadius: "0.5rem", 
                      fontSize: "14px",
                      ...getMaskedStyle(maskert)
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
                      {maskert && (
                        <div style={{ marginBottom: 8, fontStyle: "italic", color: "#cbd5e1" }}>
                          Data er maskert for denne gruppen
                        </div>
                      )}
                      {payload.map((entry, index) => (
                        <div key={index} style={{ marginBottom: 4 }}>
                          <span style={{ color: entry.color }}>■</span> {entry.name}: {getMaskedValue(entry.value, maskert)}
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend />
              {chartData.undergrupper.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  name={key}
                  fill={fargeMap[key]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
