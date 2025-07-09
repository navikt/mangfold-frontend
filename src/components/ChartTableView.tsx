import { useState } from "react";
import GenderBarChart from "./GenderBarChart";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
} from "@navikt/aksel-icons";

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

type SortKey = "label" | "female" | "male";
type SortOrder = "asc" | "desc";

export default function ChartTableView({ showTable, aggregatedData }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = [...aggregatedData].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const renderIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowsUpDownIcon fontSize="1rem" aria-hidden />;
    return sortOrder === "asc" ? (
      <ChevronUpIcon fontSize="1rem" aria-hidden />
    ) : (
      <ChevronDownIcon fontSize="1rem" aria-hidden />
    );
  };

  const renderTable = () => (
    <table className="gender-table">
      <thead>
        <tr>
          {(["label", "female", "male"] as SortKey[]).map((key) => {
            const labelMap: Record<SortKey, string> = {
              label: "Avdeling",
              female: "Kvinner",
              male: "Menn",
            };

            return (
              <th
                key={key}
                onClick={() => handleSort(key)}
                style={{
                  cursor: "pointer",
                  fontWeight: sortKey === key ? 700 : 500,
                  userSelect: "none",
                  padding: "0.5rem 1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  {labelMap[key]} {renderIcon(key)}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((entry, idx) => (
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
  );

  return showTable ? renderTable() : <GenderBarChart data={aggregatedData} />;
}
