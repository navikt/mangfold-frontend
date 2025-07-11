export interface RawAlderPerStillingData {
    gruppe1: string;  // stillingstittel
    gruppe2: string;  // aldersgruppe
    erMaskert?: boolean; // Support for masking at data level
    kjonnAntall: {
        kvinne?: number;
        mann?: number;
    };
}

export interface TransformedAlderData {
    section: string;
    alderGrupper: Record<string, number>;
    erMaskert?: boolean; // Support for masking
}