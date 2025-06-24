import { useEffect, useState } from "react";
import { TextField } from "@navikt/ds-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../css/ChartToggleView.css";

const MIN_YEAR = 2018;
const MAX_YEAR = 2025;

interface Props {
  yearRange: [number, number];
  setYearRange: (range: [number, number]) => void;
}

export default function YearRangeFilter({ yearRange, setYearRange }: Props) {
  const [inputValue, setInputValue] = useState(`${yearRange[0]}–${yearRange[1]}`);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setInputValue(`${yearRange[0]}–${yearRange[1]}`);
    setError(undefined);
  }, [yearRange]);

  const handleManualInput = () => {
    const match = inputValue.trim().match(/^(\d{4})\s*[-–]\s*(\d{4})$/);
    if (match) {
      const start = Math.max(MIN_YEAR, Math.min(MAX_YEAR, parseInt(match[1])));
      const end = Math.max(start, Math.min(MAX_YEAR, parseInt(match[2])));
      setYearRange([start, end]);
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
          value={yearRange}
          onChange={(val) => {
            if (Array.isArray(val)) setYearRange([val[0], val[1]]);
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