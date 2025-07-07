import { useEffect, useState } from "react";

interface RawAlderData {
  gruppe1: string; // alder: "<30", "30-50", "50+"
  gruppe2: string; // rolle
  kjonnAntall: {
    kvinne?: number;
    mann?: number;
  };
}

export interface AgeRoleEntry {
  section: string;
  under35: number;
  age35to50: number;
  over50: number;
  unknown: number;
  total: number;
  under35Percent: number;
  age35to50Percent: number;
  over50Percent: number;
  unknownPercent: number;
  under35Count: number;
  age35to50Count: number;
  over50Count: number;
  unknownCount: number;
}

export function useAlderPerStilling() {
  const [data, setData] = useState<AgeRoleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("https://mangfold-backend.intern.nav.no/aldersgruppe-per-stilling")
      .then(res => res.json())
      .then((apiData: RawAlderData[]) => {
        console.log("Aldersdata fra API:", apiData); // 👈 LEGG TIL DENNE

        const rolleMap: Record<string, { under35: number; age35to50: number; over50: number; unknown: number }> = {};

        for (const item of apiData) {
          const rolle = item.gruppe2;
          const alderGruppe = item.gruppe1;
          const antall = (item.kjonnAntall.kvinne ?? 0) + (item.kjonnAntall.mann ?? 0);

          if (!rolleMap[rolle]) {
            rolleMap[rolle] = { under35: 0, age35to50: 0, over50: 0, unknown: 0 };
          }

          switch (alderGruppe) {
            case "<30":
              rolleMap[rolle].under35 += antall;
              break;
            case "30-50":
              rolleMap[rolle].age35to50 += antall;
              break;
            case "50+":
              rolleMap[rolle].over50 += antall;
              break;
            default:
              rolleMap[rolle].unknown += antall;
          }
        }

        const result: AgeRoleEntry[] = [];

        for (const [rolle, counts] of Object.entries(rolleMap)) {
          const total = counts.under35 + counts.age35to50 + counts.over50 + counts.unknown;

          const under35Percent = total ? Math.round((counts.under35 / total) * 100) : 0;
          const age35to50Percent = total ? Math.round((counts.age35to50 / total) * 100) : 0;
          const over50Percent = total ? Math.round((counts.over50 / total) * 100) : 0;
          const unknownPercent = 100 - under35Percent - age35to50Percent - over50Percent;

          result.push({
            section: rolle,
            under35: counts.under35,
            age35to50: counts.age35to50,
            over50: counts.over50,
            unknown: counts.unknown,
            total,
            under35Percent,
            age35to50Percent,
            over50Percent,
            unknownPercent,
            under35Count: counts.under35,
            age35to50Count: counts.age35to50,
            over50Count: counts.over50,
            unknownCount: counts.unknown,
          });
        }

        setData(result);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}