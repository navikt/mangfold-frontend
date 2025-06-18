import { Heading } from '@navikt/ds-react';

export default function About() {
  return (
    <div style={{ padding: "2rem" }}>
      <Heading size="medium">Om prosjektet</Heading>
      <p>Dette er et sommerprosjekt for å analysere og visualisere mangfoldsdata i NAV.</p>
    </div>
  );
}