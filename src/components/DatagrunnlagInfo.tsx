import { Heading, BodyShort } from "@navikt/ds-react";
import { useMetaData } from "../data/useMetaData";
import {
  CalendarIcon,
  ArchiveIcon,
  FolderIcon,
  CogIcon,
  ExclamationmarkTriangleFillIcon,
  ClockIcon,
} from "@navikt/aksel-icons";

export default function DatagrunnlagInfo() {
  const { lastUpdated } = useMetaData();

  const sectionStyle = {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  };

  const iconWrapperStyle = {
    flexShrink: 0,
    width: "2rem",
    height: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "0.25rem",
  };

  return (
    <div
      style={{
        border: "1px solid #D0D5DD",
        borderRadius: "8px",
        padding: "2rem",
        backgroundColor: "#f9fafb",
        marginTop: "2rem",
        width: "100%",
      }}
    >
      <Heading level="3" size="medium" spacing>
        Om dataene
      </Heading>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <CalendarIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Periode
          </Heading>
          <BodyShort>
            Denne landingssiden har vært en del av et prosjekt for sommerstudentene i 2025.
            Dataene representerer et øyeblikksbilde av nåværende ansatte i Arbeids- og velferdsdirektoratet.
            Siden er ment for innsikt og overblikk over Navs interne mangfold hos ansatte, og er bare nyttig som statistikk på høyt nivå.
          </BodyShort>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <ArchiveIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Kilder
          </Heading>
          <BodyShort>
            Dataene er hentet fra NAVs HR-system og koblet opp mot data fra teamkatalogen. Det brukes en servicebruker i NAVs datavarehus for å hente ut data til BigQuery etter prosessering og aggregering, som presenteres i dashboardet.
          </BodyShort>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <FolderIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Datatyper og kategorier
          </Heading>
          <BodyShort>Det opprinnelige datasettet inneholder følgende opplysningstyper om ansatte i NAV:</BodyShort>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li><BodyShort>Alder (gruppert i aldersgrupper)</BodyShort></li>
            <li><BodyShort>Ansiennitet (gruppert)</BodyShort></li>
            <li><BodyShort>Kjønn</BodyShort></li>
            <li><BodyShort>Avdeling og seksjonstilhørighet</BodyShort></li>
            <li><BodyShort>Stillingsnavn og nivå i Navs hierarki</BodyShort></li>
            <li><BodyShort>Roller og teamtilhørighet fra teamkatalogen</BodyShort></li>
          </ul>
          <BodyShort style={{ marginTop: "0.75rem" }}>
            Det finnes to hovedkilder for ulike data:
          </BodyShort>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li>
              <BodyShort>
                Ansettelses-data: avdeling, seksjon og stilling. Én person er ansatt ett sted med en type stilling.
              </BodyShort>
            </li>
            <li>
              <BodyShort>
                Teamkatalog-data: seksjon/område og roller. Én person kan ha flere roller og tilhørighet til flere seksjoner.
              </BodyShort>
            </li>
          </ul>
          <BodyShort style={{ marginTop: "0.75rem" }}>
            Data fra personalsystemet er mer komplett og entydig enn data fra teamkatalogen, men reflekterer ikke like godt hvordan folk selv synes de jobber i Nav. Noens stillingstittel sier lite om deres daglige oppgaver, men kan gi innsikt i deres formelle posisjon. Rollen deres, fra teamkatalogen, sier mer om hvordan folk jobber daglig.
          </BodyShort>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <CogIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Hvordan dataene er behandlet
          </Heading>
          <BodyShort>
            Dataene er <strong>pseudonymisert</strong>, og filtrert for kun å inkludere nåværende faste ansatte i direktoratet. Dataen inkluderer ikke tidligere ansatte. Personopplysningene er <strong>aggregert</strong> og presenteres kun på gruppenivå. Det skal ikke være mulig å identifisere enkeltpersoner.

            Python og Airflow benyttes for daglig oppdatering og prosessering.
          </BodyShort>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <ExclamationmarkTriangleFillIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Begrensninger
          </Heading>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li><BodyShort>Eksterne eller kommunale ansatte er ikke inkludert, slik som konsulenter.</BodyShort></li>
            <li><BodyShort>Seksjonstilhørighet kan komme fra enten HR-systemet eller teamkatalogen.</BodyShort></li>
            <li><BodyShort>Personer med flere roller eller seksjonstilhørigheter blir telt flere ganger for hver relevante kategori.</BodyShort></li>
            <li><BodyShort>"Ukjent", eller en deskriptiv variant, brukes som verdi når informasjon mangler i kildesystemene.</BodyShort></li>
          </ul>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <ClockIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Oppdatering
          </Heading>
          <BodyShort>
            {lastUpdated 
              ? `Dataene ble sist oppdatert: <strong>${lastUpdated}</strong>.
            Daglig oppdatering skjer via automatiserte skript (Python via Airflow).`
              : "Ingen oppdateringsinformasjon tilgjengelig."}
          </BodyShort>
        </div>
      </div>
    </div>
  );
}