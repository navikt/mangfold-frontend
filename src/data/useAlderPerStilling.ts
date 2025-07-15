import { useEffect, useState } from "react";

export interface AlderPerStillingEntry {
  section: string; // Stillingsnavn
  alderGrupper: Record<string, number>; // { "<30": 12, "30-55": 34, ... }
  erMaskert: boolean;
}

export function useAlderPerStilling() {
  const [data, setData] = useState<AlderPerStillingEntry[]>([]);
  const [aldersgrupper, setAldersgrupper] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://mangfold-backend.intern.nav.no/aldersgruppe-per-stilling")
      .then(res => res.json())
      .then((apiData: any[]) => {
        // Behold rekkefølge på aldersgrupper som backend gir (første gang de dukker opp)
        const grupperArray: string[] = [];
        apiData.forEach(entry => {
          if (!grupperArray.includes(entry.gruppe2)) grupperArray.push(entry.gruppe2);
        });

        // Gruppér alle entries per stilling
        const stillinger = Array.from(new Set(apiData.map(entry => entry.gruppe1)));

        const result: AlderPerStillingEntry[] = stillinger.map(stilling => {
          const entries = apiData.filter(entry => entry.gruppe1 === stilling);

          // Maskering: hvis noen av entries er maskert, maskér hele stillingen
          const isMasked = entries.some(entry => entry.erMaskert);

          // Summer antall per aldersgruppe
          const alderGrupper: Record<string, number> = {};
          grupperArray.forEach(gruppe => {
            alderGrupper[gruppe] = entries
              .filter(entry => entry.gruppe2 === gruppe && !entry.erMaskert)
              .reduce(
                (sum, entry) =>
                  sum +
                  (entry.kjonnAntall?.kvinne ?? 0) +
                  (entry.kjonnAntall?.mann ?? 0),
                0
              );
          });

          return {
            section: stilling,
            alderGrupper,
            erMaskert: isMasked,
          };
        });

        setData(result);
        setAldersgrupper(grupperArray);
      });
  }, []);

  return { data, aldersgrupper };
}