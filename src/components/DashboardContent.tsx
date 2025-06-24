import { BodyShort, Heading } from "@navikt/ds-react";
import { genderData } from "../data/genderStats";
import GenderIconCard from "./GenderIconCard";
import "../css/GenderIconCard.css";
import StatistikkPanel from "./StatistikkPanel";
import StatistikkExplorer from "./StatistikkExplorer";
import "../css/ DashboardContent.css"

export default function DashboardContent() {

  return (
    <section className="dashboard-body">
      <Heading level="2" size="medium" spacing>
        Mangfold og likestilling i etaten
      </Heading>

      <BodyShort spacing>
        Nav har en forpliktelse til å jobbe for mangfold og likestilling for ansatte i etaten. Denne nettsiden er tiltenkt som et verktøy for å
        spre bevissthet om mangfoldet for hele organisasjonen og samtidig gi innsikt til videre arbeid med inkludering og representasjon.
      </BodyShort>

      <BodyShort spacing>
        Her kan du sortere på blant annet kjønn, alder, stillingsgrupper.
      </BodyShort>

      <div className="card-container">
        <GenderIconCard
          title="Kjønnsfordelingen totalt i etaten"
          malePercentage={genderData.total.male}
          femalePercentage={genderData.total.female}
        />

        <GenderIconCard
          title="Kjønnsfordelingen totalt blant nyrekrutterte"
          malePercentage={genderData.newHires.male}
          femalePercentage={genderData.newHires.female}
        />
      </div>

      <StatistikkPanel />

      <hr className="section-divider" />
     

      <StatistikkExplorer />

    </section>
  );
}