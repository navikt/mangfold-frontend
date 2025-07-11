import { useEffect, useState } from "react";

export interface SeksjonKjonn {
    avdeling: string;
    erMaskert?: boolean; // Support for department-level masking
    seksjoner: {
        gruppe: string;
        erMaskert?: boolean; // Support for section-level masking
        kjonnAntall: {
            kvinne?: number;
            mann?: number;
        };
    }[];
}

interface GenderChartEntry {
    section: string;
    department: string;
    female: number;
    male: number;
    unknown: number;
    total: number;
    femaleCount: number;
    maleCount: number;
    unknownCount: number;
    erMaskert?: boolean; // Support for masking
}

export function useKjonnData() {
    const [data, setData] = useState<GenderChartEntry[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://mangfold-backend.intern.nav.no/avdelinger-med-seksjoner")
            .then(res => res.json())
            .then((apiData: SeksjonKjonn[]) => {
                const result: GenderChartEntry[] = [];
                const allDepartments: string[] = [];
                apiData.forEach(avd => {
                    allDepartments.push(avd.avdeling);
                    avd.seksjoner.forEach(seksjon => {
                        const female = seksjon.kjonnAntall.kvinne ?? 0;
                        const male = seksjon.kjonnAntall.mann ?? 0;
                        const unknown = 0; // evt. annen logikk hvis unknown kan forekomme
                        const total = female + male + unknown;
                        
                        // Maskering: Hvis avdeling eller seksjon er maskert
                        const erMaskert = Boolean(avd.erMaskert || seksjon.erMaskert);
                        
                        result.push({
                            section: seksjon.gruppe,
                            department: avd.avdeling,
                            female,
                            male,
                            unknown,
                            total,
                            femaleCount: female,
                            maleCount: male,
                            unknownCount: unknown,
                            erMaskert, // Include masking status
                        });
                    });
                });
                setData(result);
                setDepartments(allDepartments);
            })
            .finally(() => setLoading(false));
    }, []);

    return { data, departments, loading };
}