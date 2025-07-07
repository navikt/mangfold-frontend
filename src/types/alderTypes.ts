export interface RawAlderPerStillingData {
    gruppe1: string;  // stillingstittel
    gruppe2: string;  // aldersgruppe
    kjonnAntall: {
        kvinne?: number;
        mann?: number;
    };
}

export interface TransformedAlderData {
    section: string;
    alderGrupper: Record<string, number>;
}