import GenderBarChart from "./GenderBarChart";

interface Props {
  showTable: boolean;
  aggregatedData: { label: string; female: number; male: number }[];
  yearRange: [number, number];
}

export default function ChartTableView({ showTable, aggregatedData, yearRange }: Props) {
  if (aggregatedData.length === 0) {
    return (
      <p style={{ marginTop: "1rem" }}>
        Ingen data for perioden {yearRange[0]}–{yearRange[1]}.
      </p>
    );
  }

  return showTable ? (
    <table className="gender-table">
      <thead>
        <tr>
          <th>Kategori</th>
          <th>Kvinner (%)</th>
          <th>Menn (%)</th>
        </tr>
      </thead>
      <tbody>
        {aggregatedData.map((entry, idx) => (
          <tr key={idx}>
            <td>{entry.label}</td>
            <td>{entry.female}</td>
            <td>{entry.male}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <GenderBarChart
      title={`Data for ${yearRange[0]}–${yearRange[1]}`}
      data={aggregatedData}
    />
  );
}
