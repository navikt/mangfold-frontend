export function getAlderFarger(grupper: string[]) {
  const farger = [
    "#A3E635", // Lys grønn
    "#22C55E", // Grønn
    "#166534", // Mørk grønn
    "#6B7280", // Grå (Ukjent)
  ];
  return new Map(grupper.map((g, i) => [g, farger[i % farger.length]]));
}