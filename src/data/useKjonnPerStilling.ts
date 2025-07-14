import { useEffect, useState } from "react";

export interface RolleKjonn {
  gruppe: string;
  kjonnAntall: {
    kvinne?: number;
    mann?: number;
    ukjent?: number;
  };
  erMaskert?: boolean;
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
  erMaskert?: boolean;
  isMasked: boolean;
}

export function useKjonnPerStilling() {
  const [data, setData] = useState<GenderRoleEntry[]>([]);
  useEffect(() => {
    fetch("https://mangfold-backend.intern.nav.no/kjonn-per-stilling")
      .then(res => res.json())
      .then((apiData: RolleKjonn[]) => {
        const result = apiData.map(role => {
          const female = role.kjonnAntall.kvinne ?? 0;
          const male = role.kjonnAntall.mann ?? 0;
          const unknown = role.kjonnAntall.ukjent ?? 0;
          const total = female + male + unknown;
          const isMasked = !!role.erMaskert;
          return {
            section: role.gruppe,
            female,
            male,
            unknown,
            total,
            femaleCount: female,
            maleCount: male,
            unknownCount: unknown,
            erMaskert: role.erMaskert,
            isMasked,
          };
        });
        setData(result);
      });
  }, []);
  return { data };
}