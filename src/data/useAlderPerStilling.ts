import { useState, useEffect } from 'react';
import type { RawAlderPerStillingData, TransformedAlderData } from '../types/alderTypes';

export function useAlderPerStilling() {
    const [data, setData] = useState<TransformedAlderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('https://mangfold-backend.intern.nav.no/aldersgruppe-per-stilling');
                const rawData: RawAlderPerStillingData[] = await response.json();

                // Grupper data etter stillingstittel
                const stillingMap = new Map<string, Record<string, number>>();
                
                rawData.forEach(item => {
                    if (!stillingMap.has(item.gruppe1)) {
                        stillingMap.set(item.gruppe1, {});
                    }
                    
                    const alderGrupper = stillingMap.get(item.gruppe1)!;
                    const antall = (item.kjonnAntall.kvinne ?? 0) + (item.kjonnAntall.mann ?? 0);
                    alderGrupper[item.gruppe2] = antall;
                });

                const transformedData = Array.from(stillingMap.entries())
                    .map(([stilling, alderGrupper]) => ({
                        section: stilling,
                        alderGrupper
                    }));

                setData(transformedData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Ukjent feil'));
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { data, loading, error };
}