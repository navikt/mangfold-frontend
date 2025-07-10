import { BodyShort, Heading } from "@navikt/ds-react";
import GenderIconCard from "./GenderIconCard";
import "../css/GenderIconCard.css";
import StatistikkPanel from "./StatistikkPanel";
import StatistikkExplorer from "./StatistikkExplorer";
import "../css/ DashboardContent.css"
import { useEffect, useState } from "react";

type KjønnStatistikk = {
  kjonn: "kvinne" | "mann";
  antall: number;
};
export default function DashboardContent() {
  const [statistikk, setStatistikk] = useState<KjønnStatistikk[] | null>(null);
  useEffect(() => {
    async function fetchStatistikk() {
      const res = await fetch("https://mangfold-backend.intern.nav.no/kjonn-statistikk");
      const data: KjønnStatistikk[] = await res.json();
      setStatistikk(data);
    }
    fetchStatistikk();
  }, []);

  // Finn antall og prosent
  const femaleCount = statistikk?.find((s) => s.kjonn === "kvinne")?.antall ?? 0;
  const maleCount = statistikk?.find((s) => s.kjonn === "mann")?.antall ?? 0;
  const total = femaleCount + maleCount;
  const femalePercentage = total ? Number(((femaleCount / total) * 100).toFixed(1)) : 0;
  const malePercentage = total ? Number(((maleCount / total) * 100).toFixed(1)) : 0;

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
          female={femalePercentage}
          male={malePercentage}
          mode="prosent"
        />

        <GenderIconCard
          title="Kjønnsfordelingen totalt i antall"
          female={femaleCount}
          male={maleCount}
          mode="antall"
        />
      </div>
      <StatistikkPanel />

      <StatistikkExplorer />
    </section>
  );
}