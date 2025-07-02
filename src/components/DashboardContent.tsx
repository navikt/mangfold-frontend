import { BodyShort, Heading } from "@navikt/ds-react";
import GenderIconCard from "./GenderIconCard";
import "../css/GenderIconCard.css";
import StatistikkPanel from "./StatistikkPanel";
import StatistikkExplorer from "./StatistikkExplorer";
import "../css/ DashboardContent.css"

export default function DashboardContent() {

  return (
    <section className="dashboard-body">
      <Heading level="2" size="medium" spacing>
        Mangfold og likestilling i Direktoratet
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
          title="Kjønnsfordelingen totalt i Direktoratet"
          femalePercentage={33}
          malePercentage={67}
          femaleCount={198}
          maleCount={402}
          mode="prosent"
        />

        <GenderIconCard
          title="Kjønnsfordelingen totalt i antall"
          femalePercentage={33}
          malePercentage={67}
          femaleCount={198}
          maleCount={402}
          mode="antall"
        />
      </div>
      <StatistikkPanel />

      <StatistikkExplorer />
      
    </section>
  );
}