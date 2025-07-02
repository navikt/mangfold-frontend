import GenderBarChart from "./GenderBarChart";

interface Props {
  showTable: boolean;
  aggregatedData: {
    label: string;
    female: number;
    male: number;
    femaleCount?: number;
    maleCount?: number;
  }[];
}

export default function ChartTableView({ showTable, aggregatedData}: Props) {
  // if (aggregatedData.length === 0) {
  //   return (
  //     <p style={{ marginTop: "1rem" }}>
  //       Ingen data for perioden {year[0]}–{year[1]}.
  //     </p>
  //   );
  // }

  return showTable ? (
    <table className="gender-table">
      <thead>
        <tr>
          <th>Avdeling</th>
          <th>Kvinner</th>
          <th>Menn</th>
        </tr>
      </thead>
      <tbody>
        {aggregatedData.map((entry, idx) => (
          <tr key={idx}>
            <td>{entry.label}</td>
            <td>
              <strong>{entry.female}%</strong>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                ({entry.femaleCount ?? "–"} personer)
              </div>
            </td>
            <td>
              <strong>{entry.male}%</strong>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                ({entry.maleCount ?? "–"} personer)
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <GenderBarChart
      //title={`Data for ${year[0]}–${yearRange[1]}`}
      data={aggregatedData}
    />
  );
}