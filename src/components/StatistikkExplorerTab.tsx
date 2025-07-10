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

    return {
      kjonn: distinct(relevantData.map((d) => d.kjonn)),
      alder: distinct(relevantData.map((d) => d.aldersgruppe)),
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
      if (!map[gruppe]) map[gruppe] = {};
      map[gruppe][kjonn] = (map[gruppe][kjonn] || 0) + antall;
      grupper.add(gruppe);
      undergrupper.add(kjonn);
    });

    return {
      data: Array.from(grupper).map((g) => ({
        gruppe: g,
        ...map[g],
      })),
      undergrupper: Array.from(undergrupper),
    };
  }, [filteredData, groupKey]);

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
              <Tooltip />
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
