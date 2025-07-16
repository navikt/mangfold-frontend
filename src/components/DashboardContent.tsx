import { BodyShort, Heading } from "@navikt/ds-react";
import GenderIconCard from "./GenderIconCard";
import "../css/GenderIconCard.css";
import StatistikkPanel from "./StatistikkPanel";
import StatistikkExplorer from "./StatistikkExplorer";
import "../css/DashboardContent.css"
import { useEffect, useState } from "react";
import { Box } from "@navikt/ds-react";

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
      <Heading size="xlarge" spacing>
        Mangfold og likestilling i Arbeids- og velferdsdirektoratet
      </Heading>

      <BodyShort size="large" spacing>
        Nav har en forpliktelse til å jobbe for mangfold og likestilling for ansatte i etaten. Dette dashboardet er tiltenkt som et verktøy for å
        spre bevissthet om mangfoldet innad i direktoratet og samtidig gi innsikt til videre arbeid med inkludering og representasjon.
      </BodyShort>

      <BodyShort size="large" spacing>
        Visualiseringene og fordelingene er basert på den enkeltes ansettelsesforhold.
      </BodyShort>

      <BodyShort size="large" spacing>
        Her ser du noen utvalgte nøkkelvisninger. Du kan konstruere dine egne visualiseringer under fanen "Utforsk".
      </BodyShort>

      <div className="card-container">
        <GenderIconCard
          title="Kjønnsfordelingen totalt (prosent)"
          female={femalePercentage}
          male={malePercentage}
          mode="prosent"
        />

        <GenderIconCard
          title="Kjønnsfordelingen totalt (antall)"
          female={femaleCount}
          male={maleCount}
          mode="antall"
        />
      </div>

      <Box
        padding="6"
        marginBlock="6"
        borderRadius="large"
        background-color="subtle"
        shadow="medium"
      >
        <StatistikkPanel />
      </Box>

      <StatistikkExplorer />
    </section>
  );
}