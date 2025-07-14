import { Heading, BodyShort, BodyLong } from "@navikt/ds-react";
import { useMetaData } from "../data/useMetaData";
import {
  CalendarIcon,
  ArchiveIcon,
  FolderIcon,
  CogIcon,
  ExclamationmarkTriangleFillIcon,
  ClockIcon,
  MonitorIcon,
  MegaphoneIcon,
  NotePencilIcon,
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
            Prosjekt
          </Heading>
          <BodyLong>
            Denne landingssiden har vært en del av et prosjekt for sommerstudentene i 2025.
          </BodyLong>

          <BodyLong>
            Dataene representerer et øyeblikksbilde av nåværende ansatte i Arbeids- og velferdsdirektoratet.
          </BodyLong>

          <BodyLong>
            Siden er ment for innsikt og overblikk over Navs interne mangfold hos ansatte, og er bare nyttig som statistikk på høyt nivå. Denne siden er kun ment til intern bruk, men skal være tilgjengelig for alle ansatte i direktoratet.
          </BodyLong>

          <BodyLong>
            Merk: For øyeblikket er datagrunnlaget for dashboardet kun basert på aktivt ansatte i Nav, og kan altså ikke brukes til å studere historisk utvikling. Det er særlig ønskelig å vise mangfold i nyrekrutterte kontra overblikksbildet som er gjengitt på forsiden, men dette ville bli en særdeles misvisende fremstilling uten å inkludere personer som har sluttet f. eks. etter mindre enn ett år hos Nav. Vi har da valgt å legge inkludering av historisk data som et forbedringsprosjekt til framtidig utvikling.
          </BodyLong>
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
          <BodyLong>
            Dataene er hentet fra Navs HR-system og koblet opp mot data fra teamkatalogen. Det brukes en servicebruker i Navs datavarehus for å hente ut data til BigQuery etter prosessering og aggregering, som presenteres i dashboardet.
          </BodyLong>
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
          <BodyLong>Det opprinnelige datasettet inneholder følgende opplysningstyper om ansatte i Nav:</BodyLong>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li><BodyShort>Alder (gruppert i aldersgrupper)</BodyShort></li>
            <li><BodyShort>Ansiennitet (gruppert)</BodyShort></li>
            <li><BodyShort>Kjønn (juridisk kjønn)</BodyShort></li>
            <li><BodyShort>Avdeling og seksjonstilhørighet</BodyShort></li>
            <li><BodyShort>Stillingsnavn og nivå i Navs hierarki</BodyShort></li>
            <li><BodyShort>Roller og seksjonstilhørighet fra teamkatalogen</BodyShort></li>
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
          <BodyLong style={{ marginTop: "0.75rem" }}>
            Data fra personalsystemet er mer komplett og entydig enn data fra teamkatalogen, men reflekterer ikke like godt hvordan folk selv synes de jobber i Nav. Noens stillingstittel sier lite om deres daglige oppgaver, men kan gi innsikt i deres formelle posisjon. Rollen deres, fra teamkatalogen, sier mer om hvordan folk jobber daglig.
          </BodyLong>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <NotePencilIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Merknader om dataen som vises
          </Heading>
          <BodyLong>  
            Seksjon kalles "område" i teamkatalogen av historiske grunner, men skal etter 2025 representere seksjon i organisasjonskartet.
          </BodyLong>

          <BodyLong>
            I Nav finnes det et misforhold mellom navnet på ledertitler og typen enhet man leder. Det er altså mange flere "avdelingsdirektører" enn det finnes avdelinger, og dette er som forventet.
          </BodyLong>
          <BodyLong>
            I dashboardet er det mulig å se "ledernivå", dette er en tittel som svarer til en posisjon i hierarkiet i Nav, og vi har brukt følgende inndeling:
          </BodyLong>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li><BodyShort>"Arbeids- og velferdsdirektør" (leder for hele Nav, høyeste nivå)</BodyShort></li>
            <li><BodyShort>"Direktør" (nest høyeste nivå, leder for avdelinger, altså Teknologidirektør, Kommunikasjonsdirektør osv.)</BodyShort></li>
            <li><BodyShort>"Avdelingsdirektør" (leder for seksjon)</BodyShort></li>
            <li><BodyShort>"Seksjonssjef"(leder for "enhet")</BodyShort></li>
            <li><BodyShort>"Kontorsjef" (personalleder innad i en enhet)</BodyShort></li>
            <li><BodyShort>"Ressurs" (nederste nivå)</BodyShort></li>
          </ul>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <CogIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Behandling av data, personvern
          </Heading>
          <BodyLong>
            Dataene er <strong>pseudonymisert</strong>, og filtrert for kun å inkludere nåværende faste ansatte i direktoratet. Dataen inkluderer ikke tidligere ansatte. Personopplysningene er <strong>aggregert</strong> og presenteres kun på gruppenivå. Det skal ikke være mulig å identifisere enkeltpersoner.
          </BodyLong>

          <BodyLong>
            Total-grupperinger med færre enn 5 personer er ikke vist da disse gir dårlig statistisk grunnlag, og også av personvernshensyn for individer. Totalgrupperingen tar hensyn til seksjoner og stillinger, og det <strong>kan</strong> altså vises data i de tilfeller der en liten gruppe tilhører en større total, siden det ikke finnes en åpenbar knytning tilbake til individer. Nav har en lovlig forpliktelse å jobbe for mangfold og likestilling for ansatte i etaten, og det er derfor gjort en oppveiing av personvernhensyn mot verdien av å tilgjengilgjøre statistikken internt.
          </BodyLong>

          <BodyLong>
            Python og Airflow (gjennom plattformen KNADA) benyttes for daglig oppdatering og prosessering.
          </BodyLong>
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
            <li><BodyShort>Dataen viser bare nåværende ansatte i direktoratet. Når man slutter i direktoratet, blir man fjernet fra vårt uttrekk av data.</BodyShort></li>
            <li><BodyShort>Eksterne eller kommunale ansatte er ikke inkludert, slik som konsulenter.</BodyShort></li>
            <li><BodyShort>Seksjonstilhørighet kan komme fra enten HR-systemet eller teamkatalogen.</BodyShort></li>
            <li><BodyShort>Personer med flere roller eller seksjonstilhørigheter blir telt flere ganger for hver relevante kategori. Grafer med teamkatalog-tilknytning representerer altså ikke rent antall personer som finnes i direktoratet.</BodyShort></li>
            <li><BodyShort>Grafer med data fra personalsystemet skal i motsetning svare til reelle personaltall.</BodyShort></li>
            <li><BodyShort>Totalgrupperinger (i praksis seksjoner eller stillingsgrupper) som er for små kan ikke vises da datagrunnlaget ikke er godt nok.</BodyShort></li>
            <li><BodyShort>"Ukjent", eller en deskriptiv variant, brukes som verdi når informasjon mangler i kildesystemene.</BodyShort></li>
          </ul>

          <BodyLong>  
            Merk at detaljer i hvordan (og hvilke) personer man teller opp har mye å si for resultatet, og det er usannsynlig at tellinger fra andre steder (slik som teamkatalogen) svarer nøyaktig til antall man finner frem til i dette dashboardet.
            Husk at bare denne siden bare dekker personer som er statlige ansatte, slik at alle tellinger som inkluderer konsulenter ikke samsvarer.
          </BodyLong>
          <BodyLong>
            En annen faktor som kan ha utslag på tellinger, er at i NOM og Teamkatalogen er ledere for en avdeling ført opp som medlem av en fiktiv seksjon med samme navn som avdelingen. Disse fiktive "seksjonene" er filtrert ut i grafer som omhandler seksjoner. Men ledere er inkludert i tellinger på avdelingsnivå, og svarer da til et par ekstra personer i de ulike avdelingene sammenlignet med en ren sum av personer per seksjon.
          </BodyLong>
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
          <BodyLong>
            {lastUpdated 
              ? (
                  <>
                  Dataene ble sist oppdatert: <strong>{lastUpdated}</strong>.

                  Daglig oppdatering skjer gjennom automatiserte skript (Python via KNADA).
                  </>
                )
              : "Venter på data om oppdateringsinformasjon..."}
          </BodyLong>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <MonitorIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Teknologier
          </Heading>
          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li><BodyShort>Data ETL-prosess kjøres via Python på KNADA-platformen.</BodyShort></li>
            <li><BodyShort>Data lagres i Google BigQuery.</BodyShort></li>
            <li><BodyShort>Denne nettsiden kjøres på nais-platformen, og bruker React til frontend og Kotlin til backend.</BodyShort></li>
            {
            // burde kanskje ha linker til github repositories her? 
            }
          </ul>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={iconWrapperStyle}>
          <MegaphoneIcon aria-hidden fontSize="1.75rem" />
        </div>
        <div>
          <Heading level="4" size="xsmall" spacing>
            Kontakt
          </Heading>
          <BodyLong>
            Prosjektet er organisert under team heda. Se Slack-kanalen{" "}
            <a
              href="https://nav-it.slack.com/archives/C08TXNNMBAT"
              target="_blank"
              rel="noopener noreferrer"
              style={{ wordBreak: "break-all" }}
            >
              #sommerstudent-prosjekt-mangfold
            </a>{" "}
            for mer informasjon om prosjektet og videre organisering. Se også #team-heda.
          </BodyLong>
        </div>
      </div>

    </div>
  );
}
