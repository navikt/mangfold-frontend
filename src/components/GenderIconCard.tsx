import { Heading, BodyShort } from "@navikt/ds-react";
import { FaFemale, FaMale } from "react-icons/fa";
import { getKjonnFarger } from "../utils/kjonnFarger";
import "../css/GenderIconCard.css";

type GenderIconCardMode = "prosent" | "antall";

interface GenderIconCardProps {
  title: string;
  female: number;
  male: number;
  mode: GenderIconCardMode;
}

const kjonnFarger = getKjonnFarger();

export default function GenderIconCard({
  title,
  female,
  male,
  mode,
}: GenderIconCardProps) {
  return (
    <div className="gender-icon-card">
      <Heading size="medium" spacing className="card-title">
        {title}
      </Heading>

      <div className="gender-figures">
        <div className="gender-icon-block">
          <FaFemale title="Kvinne" size={60} color={kjonnFarger.get("female")} />
          <BodyShort size="large" style={{ fontWeight: "bold"}} className="gender-value">
            {mode === "prosent" ? `${female}%` : `${female} personer`}
          </BodyShort>
        </div>
        <div className="gender-icon-block">
          <FaMale title="Mann" size={60} color={kjonnFarger.get("male")} />
          <BodyShort size="large" style={{ fontWeight: "bold" }} className="gender-value">
            {mode === "prosent" ? `${male}%` : `${male} personer`}
          </BodyShort>
        </div>
      </div>
    </div>
  );
}
