import { useEffect, useState } from "react";
import { Select } from "@navikt/ds-react";

const currentYear = new Date().getFullYear();
const MIN_YEAR = currentYear - 10;
const MAX_YEAR = currentYear;

interface Props {
    year: number;
    setYear: (year: number) => void;
}


export default function SingleYearFilter({ year, setYear }: Props) {
    const [selected, setSelected] = useState(year.toString());

    useEffect(() => {
        setSelected(year.toString());
    }, [year]);

    const handleChange = (val: string) => {
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
            setYear(num);
        }
    };

    return (
        <div className="single-year-container">
            <label className="year-range-label">Velg år:</label>
            <Select
                label="Velg år"
                hideLabel
                value={selected}
                onChange={(e) => handleChange(e.target.value)}
                className="year-select"
            >

                {[...Array(MAX_YEAR - MIN_YEAR + 1)].map((_, i) => {
                    const y = MIN_YEAR + i;
                    return (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    );
                })}
            </Select>
        </div>
    );
}
