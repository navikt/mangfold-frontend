import { useState, useEffect } from 'react';

interface MetaData {
    sisteOppdateringsDato: string;
}

export function useMetaData() {
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch('https://mangfold-backend.intern.nav.no/sistoppdatert')
            .then(res => res.json())
            .then((data: MetaData[]) => {
                setLastUpdated(data[0]?.sisteOppdateringsDato || null);
            })
            .catch(err => {
                setError(err);
                console.error('Feil ved henting av metadata:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { lastUpdated, loading, error };
}