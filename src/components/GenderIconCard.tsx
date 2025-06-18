import { Label } from "@navikt/ds-react";
import { FaFemale, FaMale } from "react-icons/fa";
import "../css/GenderIconCard.css";

interface GenderIconCardProps {
  title: string;
  malePercentage: number;
  femalePercentage: number;
}

export default function GenderIconCard({
  title,
  malePercentage,
  femalePercentage,
}: GenderIconCardProps) {
  return (
    <div className="gender-icon-card">
      <Label className="card-title">{title}</Label>
      <div className="gender-figures">
        <div className="gender-icon-block">
          <FaFemale title="Kvinne" size={32} color="#e75480" />
          <span className="gender-percent">{femalePercentage}%</span>
        </div>
        <div className="gender-icon-block">
          <FaMale title="Mann" size={32} color="#4287f5" />
          <span className="gender-percent">{malePercentage}%</span>
        </div>
      </div>
    </div>
  );
}