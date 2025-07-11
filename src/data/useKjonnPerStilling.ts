import { useEffect, useState } from "react";

export interface RolleKjonn {
  gruppe: string;
  erMaskert?: boolean; // Support for role-level masking
  kjonnAntall: {
    kvinne?: number;
    mann?: number;
    ukjent?: number;
  };
}

export interface GenderRoleEntry {
  section: string; 
  female: number;
  male: number;
  unknown: number;
  total: number;
  femaleCount: number;
  maleCount: number;
  unknownCount: number;
  erMaskert?: boolean; // Support for masking
}

export function useKjonnPerStilling() {
  const [data, setData] = useState<GenderRoleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("https://mangfold-backend.intern.nav.no/kjonn-per-stilling")
      .then(res => res.json())
      .then((apiData: RolleKjonn[]) => {
        const result = apiData.map(role => {
          const female = role.kjonnAntall.kvinne ?? 0;
          const male = role.kjonnAntall.mann ?? 0;
          const unknown = role.kjonnAntall.ukjent ?? 0;
          const total = female + male + unknown;
          
          // Include masking status if available
          const erMaskert = Boolean(role.erMaskert);

          return {
            section: role.gruppe, // <-- Riktig felt her!
            female,
            male,
            unknown,
            total,
            femaleCount: female,
            maleCount: male,
            unknownCount: unknown,
            erMaskert, // Include masking status
          };
        });
        setData(result);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
