export type StatCategory =
  | "alder"
  | "ansiennitet"
  | "lederniva"
  | "stillingsgruppe"
  | "utdanningsniva";

export interface StatEntry {
  label: string;
  female: number;
  male: number;
}

export const statisticsData: Record<StatCategory, StatEntry[]> = {
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
  ansiennitet: [
    { label: "0 år", female: 17.5, male: 41.0 },
    { label: "1 - 5 år", female: 16.5, male: 39.5 },
    { label: "6 år", female: 16.4, male: 38.8 },
    { label: "7 år", female: 16.1, male: 37.9 },
    { label: "8 år", female: 16.8, male: 37.5 },
    { label: "9 år", female: 16.6, male: 36.8 },
    { label: "10 år", female: 16.3, male: 35.2 }
  ],
  lederniva: [
    { label: "Nivå 1", female: 17.8, male: 41.0 },
    { label: "Nivå 2", female: 16.8, male: 39.5 },
    { label: "Nivå 3", female: 16.5, male: 38.8 },
    { label: "Nivå 4", female: 16.1, male: 37.9 },
    { label: "Nivå 5", female: 16.8, male: 37.5 }
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