import { useEffect, useState } from "react";

export interface AlderEntry {
  section: string;
  department: string;
  alderGrupper: Record<string, number>;
  erMaskert: boolean;
}

export function useAlderData() {
  const [data, setData] = useState<AlderEntry[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [aldersgrupper, setAldersgrupper] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://mangfold-backend.intern.nav.no/aldersgrupper-per-avdeling-seksjoner")
      .then(res => res.json())
      .then((apiData: any[]) => {
        // Behold aldersgruppe-rekkefølge fra backend, de skal være sortert fra minst til størst
        const grupperArray: string[] = [];
        const result: AlderEntry[] = [];
        apiData.forEach(avd => {
          const department = avd.avdeling;
          avd.seksjoner.forEach((seksjon: any) => {
            const section = seksjon.seksjon || seksjon.gruppe;
            const alderGrupper: Record<string, number> = {};
            Object.entries(seksjon.aldersgrupper ?? {}).forEach(([alder, kjonnObj]: [string, any]) => {
              if (!grupperArray.includes(alder)) grupperArray.push(alder);
              alderGrupper[alder] =
                (kjonnObj.kvinne ?? 0) + (kjonnObj.mann ?? 0);
            });
            result.push({
              section,
              department,
              alderGrupper,
              erMaskert: seksjon.erMaskert ?? false,
            });
          });
        });
        setData(result);
        setDepartments(Array.from(new Set(result.map(d => d.department))));
        setAldersgrupper(grupperArray);
      });
  }, []);
  return { data, departments, aldersgrupper };
}