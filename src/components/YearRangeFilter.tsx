import { useEffect, useState } from "react";
import { TextField } from "@navikt/ds-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../css/ChartToggleView.css";

const currentYear = new Date().getFullYear();
const MIN_YEAR = currentYear - 10;
const MAX_YEAR = currentYear;

interface Props {
  year: [number, number];
  setyear: (range: [number, number]) => void;
}

export default function yearFilter({ year, setyear }: Props) {
  const [inputValue, setInputValue] = useState(`${year[0]}–${year[1]}`);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setInputValue(`${year[0]}–${year[1]}`);
    setError(undefined);
  }, [year]);

  const handleManualInput = () => {
    const match = inputValue.trim().match(/^(\d{4})\s*[-–]\s*(\d{4})$/);
    if (match) {
      const start = Math.max(MIN_YEAR, Math.min(MAX_YEAR, parseInt(match[1])));
      const end = Math.max(start, Math.min(MAX_YEAR, parseInt(match[2])));
      setyear([start, end]);
      setError(undefined);
    } else {
      setError("Skriv et gyldig intervall, f.eks. 2020–2023");
    }
  };

  return (
    <div className="year-range-container">
      <label className="year-range-label">Velg periode:</label>

      <div className="year-range-controls">
        <Slider
          range
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={year}
          onChange={(val) => {
            if (Array.isArray(val)) setyear([val[0], val[1]]);
          }}
          marks={{ [MIN_YEAR]: `${MIN_YEAR}`, [MAX_YEAR]: `${MAX_YEAR}` }}
          allowCross={false}
          className="year-slider"
        />

        <TextField
          label="Årsintervall"
          hideLabel
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleManualInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleManualInput();
          }}
          placeholder="f.eks. 2020–2023"
          error={error}
          className="year-input"
        />
      </div>
    </div>
  );
}