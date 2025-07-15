export function getAlderFarger(grupper: string[]) {
  const farger = [
    "#FFC166", 
    "#3385d1", 
    "#ad95db",
    "#ef6f61",
    "#b3866a",
    "#D9B47C",
  ];
  return new Map(grupper.map((g, i) => [g, farger[i % farger.length]]));
}