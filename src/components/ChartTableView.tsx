import { useState } from "react";
import { Table } from "@navikt/ds-react";
import GenderBarChart from "./GenderBarChart";

interface AggregatedData {
  label: string;
  female: number;
  male: number;
  femaleCount?: number;
  maleCount?: number;
}

type SortKey = "label" | "female" | "male";
type SortDirection = "ascending" | "descending" | "none";
type SortState = { orderBy: SortKey; direction: SortDirection };

interface Props {
  showTable: boolean;
  aggregatedData: AggregatedData[];
}

export default function ChartTableView({ showTable, aggregatedData }: Props) {
  const [sort, setSort] = useState<SortState>({
    orderBy: "label",
    direction: "ascending"
  });

  const handleSortChange = (sortKey: string) => {
    setSort(prev => {
      if (prev.orderBy === sortKey) {
        // Toggle direction
        const nextDirection = prev.direction === "ascending" ? "descending" : "ascending";
        return { orderBy: sortKey as SortKey, direction: nextDirection };
      } else {
        // Ny kolonne, start med ascending
        return { orderBy: sortKey as SortKey, direction: "ascending" };
      }
    });
  };

  // Sorter data i henhold til sort-state
  const sortedData = [...aggregatedData].sort((a, b) => {
    const aValue = a[sort.orderBy];
    const bValue = b[sort.orderBy];
    if (sort.direction === "none") return 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sort.direction === "ascending"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sort.direction === "ascending"
        ? aValue - bValue
        : bValue - aValue;
    }
    return 0;
  });

  if (!showTable) return <GenderBarChart data={aggregatedData} />;

  return (
    <Table
      sort={{ orderBy: sort.orderBy, direction: sort.direction }}
      onSortChange={handleSortChange}
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader sortKey="label" sortable>
            Avdeling
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="female" sortable>
            Kvinner
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="male" sortable>
            Menn
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedData.map((entry, idx) => (
          <Table.Row key={idx}>
            <Table.DataCell>{entry.label}</Table.DataCell>
            <Table.DataCell>
              <strong>{entry.female}%</strong>
              <div style={{ fontSize: "0.93em", color: "#888" }}>
                ({entry.femaleCount ?? "–"} personer)
              </div>
            </Table.DataCell>
            <Table.DataCell>
              <strong>{entry.male}%</strong>
              <div style={{ fontSize: "0.93em", color: "#888" }}>
                ({entry.maleCount ?? "–"} personer)
              </div>
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}