export type StatCategory =
  | "Totalt oversikt"
  | "alder"
  | "stillingsgruppe"
  | "utdanningsniva";

export interface StatEntry {
  label: string;       // f.eks. årstall eller kategori
  female: number;
  male: number;
}

export const nyrekrutteringData: Record<StatCategory, StatEntry[]> = {
  "Totalt oversikt": [
    { label: "2020", female: 25, male: 36 },
    { label: "2021", female: 28, male: 41 },
    { label: "2022", female: 30, male: 43 },
    { label: "2023", female: 32, male: 46 },
    { label: "2024", female: 31, male: 44 }
  ],
  alder: [
    { label: "20 - 25 år", female: 17.8, male: 41.0 },
    { label: "26 - 30 år", female: 16.8, male: 39.5 },
    { label: "31 - 35 år", female: 16.5, male: 38.8 },
    { label: "36 - 40 år", female: 16.0, male: 38.0 },
    { label: "41 - 45 år", female: 15.9, male: 37.5 },
    { label: "46 - 50 år", female: 15.5, male: 36.8 },
    { label: "51 - 55 år", female: 15.2, male: 35.9 },
    { label: "56 - 60 år", female: 14.9, male: 35.0 },
    { label: "61 - 65 år", female: 14.5, male: 34.0 }
  ],
  stillingsgruppe: [
    { label: "Jurist", female: 17.8, male: 41.0 },
    { label: "Designer", female: 16.8, male: 39.5 },
    { label: "Data scientist", female: 16.5, male: 38.8 },
    { label: "Data engineer", female: 16.1, male: 37.9 },
    { label: "Utvikler", female: 16.8, male: 37.5 },
    { label: "Tech lead", female: 16.6, male: 36.8 }
  ],
  utdanningsniva: [
    { label: "Grunnskole", female: 17.8, male: 41.0 },
    { label: "Bachelor", female: 16.8, male: 39.5 },
    { label: "Master", female: 16.5, male: 38.8 },
    { label: "PhD", female: 15.9, male: 37.0 }
  ]
};
