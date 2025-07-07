// import { useState } from "react";
// import { Button, Tooltip } from "@navikt/ds-react";
// import SingleYearFilter from "./SingleYearFilter";
// // import type { StatCategory, StatEntry } from "../data/NyrekrutteringData";
// import ChartTableView from "./ChartTableView";
// import StatBarChart from "./StatBarChart";
// import GenderIconCard from "./GenderIconCard";

// interface Props {
//   title: string;
//   data: Record<StatCategory, StatEntry[]>;
//   variant: "nyrekruttering" | "oppsigelse";
// }

// const CATEGORY_LABELS: { key: StatCategory; label: string }[] = [
//   { key: "Totalt oversikt", label: "Total oversikt" },
//   { key: "alder", label: "Alder" },
//   { key: "stillingsgruppe", label: "Stillingsgruppe" },
//   { key: "utdanningsniva", label: "Utdannivå" },
// ];

// export default function StatistikkSideLayout({
//   title,
//   data,
//   variant,
// }: Props) {
//   const [selectedCategory, setSelectedCategory] = useState<StatCategory>("Totalt oversikt");
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [showTable, setShowTable] = useState(false);


//   const filteredData = data[selectedCategory].filter((entry) => {
//     if (selectedCategory === "Totalt oversikt") {
//       return entry.label === selectedYear.toString();
//     }
//     return true;
//   });


//   const descriptionsNyrekruttering: Record<StatCategory, string> = {
//     "Totalt oversikt":
//       "Her kan du se hvordan kjønnsfordelingen blant nyrekrutterte har utviklet seg over tid. Oversikten viser hvor mange kvinner og menn som ble ansatt i valgt år, både i prosent og i antall.",
//     alder:
//       "Her vises kjønnsfordelingen blant nyrekrutterte fordelt på aldersgrupper for valgt år.",
//     stillingsgruppe:
//       "Denne visningen viser kjønnsfordelingen fordelt på stillingskategorier blant nyrekrutterte.",
//     utdanningsniva:
//       "Her kan du se kjønnsfordelingen fordelt på utdanningsnivåer (når data blir tilgjengelig).",
//   };

//   const descriptionsOppsigelse: Record<StatCategory, string> = {
//     "Totalt oversikt":
//       "Her kan du se hvordan kjønnsfordelingen blant oppsigelser har utviklet seg over tid. Oversikten viser hvor mange kvinner og menn som sluttet i valgt år, både i prosent og i antall.",
//     alder:
//       "Her vises kjønnsfordelingen blant oppsagte fordelt på aldersgrupper for valgt år.",
//     stillingsgruppe:
//       "Denne visningen viser kjønnsfordelingen fordelt på stillingskategorier blant oppsagte.",
//     utdanningsniva:
//       "Her kan du se kjønnsfordelingen fordelt på utdanningsnivåer (når data blir tilgjengelig).",
//   };

//   const categoryDescriptions =
//     variant === "nyrekruttering" ? descriptionsNyrekruttering : descriptionsOppsigelse;

//   const showGenderSummary = selectedCategory === "Totalt oversikt";
//   const totalFemale = filteredData.reduce((sum, d) => sum + (d.femaleCount ?? d.female ?? 0), 0);
//   const totalMale = filteredData.reduce((sum, d) => sum + (d.maleCount ?? d.male ?? 0), 0);
//   const total = totalFemale + totalMale;
//   const percentFemale = total ? Math.round((totalFemale / total) * 100) : 0;
//   const percentMale = total ? 100 - percentFemale : 0;

//   return (
//     <section className="dashboard-body" style={{ padding: "1rem" }}>
//       <h2>{title}</h2>
//       <p>{categoryDescriptions[selectedCategory]}</p>

//       {showGenderSummary && (
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             gap: "1rem",
//             margin: "1rem 0 2rem 0",
//           }}
//         >
//           <GenderIconCard
//             title={`Kjønnsfordelingen totalt i prosent – ${selectedYear}`}
//             female={percentFemale}
//             male={percentMale}
//             mode="prosent"
//           />
//           <GenderIconCard
//             title={`Kjønnsfordelingen totalt i antall – ${selectedYear}`}
//             female={totalFemale}
//             male={totalMale}
//             mode="antall"
//           />
//         </div>
//       )}

//       <div
//         className="control-row"
//         style={{
//           marginBottom: "1rem",
//           display: "flex",
//           gap: "1rem",
//           alignItems: "center",
//         }}
//       >
//         <SingleYearFilter year={selectedYear} setYear={setSelectedYear} />

//         <Button variant="secondary" onClick={() => setShowTable((prev) => !prev)}>
//           {showTable ? "Vis som figur" : "Vis som tabell"}
//         </Button>
//       </div>

//       <div className="category-tabs" style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
//         {CATEGORY_LABELS.map((cat) => {
//           const isDisabled = cat.key === "utdanningsniva";
//           if (isDisabled) {
//             return (
//               <Tooltip key={cat.key} content="Denne kategorien er deaktivert fordi vi mangler data.">
//                 <span
//                   style={{
//                     display: "inline-block",
//                     border: "2px solid #0067C5",
//                     borderRadius: "0.375rem",
//                     padding: "0.375rem 0.75rem",
//                     fontSize: "0.875rem",
//                     fontWeight: 500,
//                     color: "#0067C5",
//                     cursor: "not-allowed",
//                     backgroundColor: "#f9fafb",
//                   }}
//                 >
//                   {cat.label}
//                 </span>
//               </Tooltip>
//             );
//           }

//           return (
//             <Button
//               key={cat.key}
//               onClick={() => setSelectedCategory(cat.key)}
//               variant={selectedCategory === cat.key ? "primary" : "tertiary"}
//               size="small"
//             >
//               {cat.label}
//             </Button>
//           );
//         })}
//       </div>

//       <div style={{ marginTop: "1rem" }}>
//         {filteredData.length === 0 ? (
//           <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
//             Ingen data tilgjengelig for valgt år.
//           </p>
//         ) : showTable ? (
//           <ChartTableView
//             showTable={true}
//             aggregatedData={filteredData}
//             // year={[selectedYear, selectedYear]}
//           />
//         ) : (
//           <StatBarChart data={filteredData} />
//         )}
//       </div>

//       {selectedCategory === "alder" && (
//         <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#000000", marginTop: "0.5rem" }}>
//           Aldersgruppene er aggregert for å gjøre fordelingen tydeligere ({selectedYear})
//         </p>
//       )}
//     </section>
//   );
// }