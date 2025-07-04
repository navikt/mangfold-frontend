import { useEffect, useState } from "react";

export interface SeksjonAlder {
  avdeling: string;
  seksjoner: {
    seksjon: string;
    aldersgrupper: {
      [gruppe: string]: {
        kvinne?: number;
        mann?: number;
      };
    };
  }[];
}

interface AlderChartEntry {
  section: string;
  department: string;
  alderGrupper: Record<string, number>;
}

export function useAlderData() {
  const [data, setData] = useState<AlderChartEntry[]>([]);
  const [aldersgrupper, setAldersgrupper] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://mangfold-backend.intern.nav.no/aldersgrupper-per-avdeling-seksjoner")
      .then(res => res.json())
      .then((apiData: SeksjonAlder[]) => {
        const grupperSet = new Set<string>();
        const result: AlderChartEntry[] = [];
        apiData.forEach(avd => {
          avd.seksjoner.forEach(seksjon => {
            const grupper: Record<string, number> = {};
            Object.entries(seksjon.aldersgrupper).forEach(([gruppe, kjonnObj]) => {
              grupperSet.add(gruppe);
              grupper[gruppe] = (kjonnObj.kvinne ?? 0) + (kjonnObj.mann ?? 0);
            });
            result.push({
              section: seksjon.seksjon,
              department: avd.avdeling,
              alderGrupper: grupper,
            });
          });
        });
        setData(result);
        setAldersgrupper(Array.from(grupperSet).sort());
      });
  }, []);
  return { data, aldersgrupper };
}