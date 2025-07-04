import { useEffect, useState } from "react";

export interface RolleKjonn {
  gruppe: string;
  kjonnAntall: {
    kvinne?: number;
    mann?: number;
    ukjent?: number;
  };
}

export interface GenderRoleEntry {
  section: string; // rollenavn
  female: number;
  male: number;
  unknown: number;
  total: number;
  femaleCount: number;
  maleCount: number;
  unknownCount: number;
}

export function useKjonnPerRolle() {
  const [data, setData] = useState<GenderRoleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("https://mangfold-backend.intern.nav.no/kjonn-per-rolle")
      .then(res => res.json())
      .then((apiData: RolleKjonn[]) => {
        const result = apiData.map(role => {
          const female = role.kjonnAntall.kvinne ?? 0;
          const male = role.kjonnAntall.mann ?? 0;
          const unknown = role.kjonnAntall.ukjent ?? 0;
          const total = female + male + unknown;

          return {
            section: role.gruppe, // <-- Riktig felt her!
            female,
            male,
            unknown,
            total,
            femaleCount: female,
            maleCount: male,
            unknownCount: unknown,
          };
        });
        setData(result);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
