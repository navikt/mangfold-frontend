import { Label } from "@navikt/ds-react";
import { FaFemale, FaMale } from "react-icons/fa";
import "../css/GenderIconCard.css";

type GenderIconCardMode = "prosent" | "antall";

interface GenderIconCardProps {
  title: string;
  female: number;
  male: number;
  mode: GenderIconCardMode;
}

export default function GenderIconCard({
  title,
  female,
  male,
  mode,
}: GenderIconCardProps) {
  return (
    <div className="gender-icon-card">
      <Label className="card-title">{title}</Label>
      <div className="gender-figures">
        <div className="gender-icon-block">
          <FaFemale title="Kvinne" size={32} color="#e75480" />
          <span className="gender-value">
            {mode === "prosent" ? `${female}%` : `${female} personer`}
          </span>
        </div>
        <div className="gender-icon-block">
          <FaMale title="Mann" size={32} color="#4287f5" />
          <span className="gender-value">
            {mode === "prosent" ? `${male}%` : `${male} personer`}
          </span>
        </div>
      </div>
    </div>
  );
}
