export interface Department {
  name: string;
  sections: string[];
}

export const departments: Department[] = [
  {
    name: "Arbeidsavdelingen",
    sections: [
      "Arbeid og helse",
      "Arbeidsoppfølging",
      "Arbeidsgivertjenester",
      "Arbeidsmarkedstiltak",
      "Styring",
    ],
  },
  {
    name: "Velferdsavdelingen",
    sections: [
      "Sosiale tjenester",
      "Hjelpemidler og tilrettelegging",
      "Styring",
    ],
  },
  {
    name: "Ytelsesavdelingen",
    sections: [
      "Helseytelser",
      "Arbeidsytelser",
      "Arbeidsavklaringspenger (AAP)",
      "Familieytelser",
      "Pensjon og uføretrygd",
      "Kontroll og internasjonalt",
      "Styring",
    ],
  },
  {
    name: "Avdeling for brukeropplevelse",
    sections: [
        "Brukerinnsikt",
        "Brukerflater", 
        "Design"],
  },
  {
    name: "Teknologiavdelingen",
    sections: [
      "Utvikling",
      "Produkutvikling",
      "Digital sikkerhet",
      "Plattform og infrastruktur",
      "Data og informasjonsforvaltning",
      "Digital ansattopplevelse",
      "Organisasjon og styring",
    ],
  },
  {
    name: "Kommunikasjonsavdelingen",
    sections: [
      "Samfunnskontakt",
      "Språk og innhold",
      "Virksomhetskommunikasjon",
      "Formidling",
    ],
  },
  {
    name: "Kunnskapsavdelingen",
    sections: [
      "Kunnskapsbasert læring",
      "Forskning",
      "FoU",
      "Prognose",
      "Styringsinformasjon",
      "Statistikk",
      "Styring",
    ],
  },
  {
    name: "Avdeling for mennesker og organisasjon",
    sections: ["Juridisk", "Ledelse", "Innsikt og digital utvikling", "Rekruttering"],
  },
  {
    name: "Økonomi- og styringsavdelingen",
    sections: [
      "Anskaffelser",
      "Brukeranskaffelser",
      "Driftsanskaffelser",
      "Eiendom",
      "Økonomi og virksomhetsstyring",
      "Helhetlig sikkerhet og beredskap",
      "Strategi og etatsstyring",
      "Gevinst",
      "Utbetaling",
    ],
  },
  {
    name: "Juridisk avdeling",
    sections: ["Rettsavklaring", "Personvern og forvaltningsrett", "Styring"],
  },
  {
    name: "Nav Klageinstans",
    sections: [
      "Nav klageinstans Oslo og Akershus",
      "Nav klageinstans Midt-Norge",
      "Nav klageinstans nord",
      "Nav klageinstans vest",
      "Nav klageinstans sør",
      "Nav klageinstans øst",
    ],
  },
];
