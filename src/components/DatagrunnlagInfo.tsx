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
            Dataene representerer et øyeblikksbilde av ansatte i Arbeids- og velferdsdirektoratet.
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
            Dataene er hentet fra NAVs HR-system og teamkatalog via datavarehuset.
            En servicebruker i NAVs datavarehus henter og prosesserer dataene.
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
          <BodyShort>Datasettet inneholder følgende opplysningstyper om ansatte i NAV:</BodyShort>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li><BodyShort>Alder (gruppert i aldersgrupper)</BodyShort></li>
            <li><BodyShort>Ansiennitet (gruppert)</BodyShort></li>
            <li><BodyShort>Kjønn</BodyShort></li>
            <li><BodyShort>Avdeling og seksjonstilhørighet</BodyShort></li>
            <li><BodyShort>Stillingsnavn og ledernivå</BodyShort></li>
            <li><BodyShort>Roller og teamtilhørighet fra teamkatalogen</BodyShort></li>
          </ul>
          <BodyShort style={{ marginTop: "0.75rem" }}>
            Dataene er aggregert etter:
          </BodyShort>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li><BodyShort>HR-data: avdeling, seksjon og stilling</BodyShort></li>
            <li>
              <BodyShort>
                Teamkatalog-data: seksjon/område og roller. Én person kan ha flere roller og tilhørighet til flere seksjoner.
              </BodyShort>
            </li>
          </ul>
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
            Dataene er pseudonymisert og filtrert for å inkludere kun faste ansatte med status "Nav Statlig".
            Personopplysningene er aggregert og presenteres kun på gruppenivå – det er ikke mulig å identifisere enkeltpersoner.
            Daglig oppdatering og prosessering skjer med Python og Airflow.
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
            <li><BodyShort>Midlertidige, eksterne og kommunale ansatte er ikke inkludert</BodyShort></li>
            <li><BodyShort>Seksjonstilhørighet kan komme fra enten HR-systemet eller teamkatalogen</BodyShort></li>
            <li><BodyShort>Ansatte med flere roller/seksjoner telles i hver relevante kategori</BodyShort></li>
            <li><BodyShort>"Ukjent" brukes dersom informasjon mangler i kildesystemene</BodyShort></li>
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
              ? `Dataene ble sist oppdatert: ${lastUpdated}. Oppdateres daglig via automatiserte skript (Airflow og Python).`
              : "Ingen oppdateringsinformasjon tilgjengelig."}
          </BodyShort>
        </div>
      </div>
    </div>
  );
}