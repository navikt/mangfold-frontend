export type StatCategory =
    | "Totalt oversikt"
    | "alder"
    | "stillingsgruppe"
    | "utdanningsniva";

export interface StatEntry {
    label: string;
    female: number;
    male: number;
    femaleCount?: number; 
    maleCount?: number;
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
    { label: "Under 30 år", female: 34.6, male: 80.3 },
    { label: "30–50 år", female: 28.5, male: 73.1 },
    { label: "Over 50 år", female: 22.4, male: 65.2 },
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
