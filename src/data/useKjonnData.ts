import { useEffect, useState } from "react";

export interface KjønnEntry {
  section: string;
  department: string;
  female: number;
  male: number;
  unknown: number;
  total: number;
  femaleCount: number;
  maleCount: number;
  unknownCount: number;
  erMaskert: boolean;
}

export function useKjonnData() {
  const [data, setData] = useState<KjønnEntry[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://mangfold-backend.intern.nav.no/avdelinger-med-seksjoner")
      .then(res => res.json())
      .then((apiData: any[]) => {
        const result: KjønnEntry[] = [];
        apiData.forEach(avd => {
          const department = avd.avdeling;
          avd.seksjoner.forEach((seksjon: any) => {
            const section = seksjon.gruppe || seksjon.seksjon;
            const female = seksjon.kjonnAntall?.kvinne ?? 0;
            const male = seksjon.kjonnAntall?.mann ?? 0;
            const unknown = seksjon.kjonnAntall?.ukjent ?? 0;
            const total = female + male + unknown;
            result.push({
              section,
              department,
              female,
              male,
              unknown,
              total,
              femaleCount: female,
              maleCount: male,
              unknownCount: unknown,
              erMaskert: seksjon.erMaskert ?? false,
            });
          });
        });
        setData(result);
        setDepartments(Array.from(new Set(result.map(d => d.department))));
      });
  }, []);
  return { data, departments };
}