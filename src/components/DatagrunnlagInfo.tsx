import { Heading, BodyShort, Detail, ExpansionCard } from "@navikt/ds-react";

export default function DatagrunnlagInfo() {
  const datagrunnlag = {
    tittel: "Datagrunnlag for mangfoldsoversikten",
    beskrivelse:
      "Statistikken er basert på anonymiserte, aggregerte data fra HR-systemet og inkluderer informasjon om kjønn, avdelinger, stillingskategorier m.m. Den dekker hele virksomheten og oppdateres jevnlig.",
    kilde: "NAV HR-system (SAP, 2025)",
    sistOppdatert: "Juli 2025",
    bruktTil: [
      "Fordeling av kjønn i hele direktoratet",
      "Visualisering per avdeling og seksjon",
      "Analyse av stillingsnivå og ansiennitet",
      "Grunnlag for likestillingsarbeid",
    ],
  };

  const { tittel, beskrivelse, kilde, sistOppdatert, bruktTil } = datagrunnlag;

  return (
    <div className="datagrunnlag-info">
      <ExpansionCard size="small" aria-label="Datagrunnlag for statistikken">
        <ExpansionCard.Header>
          <Heading size="small" level="3">{tittel}</Heading>
        </ExpansionCard.Header>

        <ExpansionCard.Content>
          <BodyShort spacing>{beskrivelse}</BodyShort>

          <Detail>Kilde: {kilde}</Detail>
          <Detail>Sist oppdatert: {sistOppdatert}</Detail>

          <Heading size="xsmall" level="4" spacing>Brukt til</Heading>
          <ul>
            {bruktTil.map((bruk, i) => (
              <li key={i}>
                <BodyShort>{bruk}</BodyShort>
              </li>
            ))}
          </ul>
        </ExpansionCard.Content>
      </ExpansionCard>
    </div>
  );
}
