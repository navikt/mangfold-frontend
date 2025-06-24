// Horisontalt stablet stolpediagram for kjønnsfordeling per seksjon med filtrering
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Heading } from "@navikt/ds-react";
import YearRangeFilter from "./YearRangeFilter";
import DepartmentSelector from "./DepartmentSelector";
import { kjonnData } from "../data/kjonnData";
import "../css/KjonnPerSeksjonChart.css";

interface DataEntry {
    section: string;
    department: string;
    femaleCount: number;
    maleCount: number;
    unknownCount: number;
    total: number;
}

interface ChartEntry extends DataEntry {
    female: number;
    male: number;
    unknown: number;
}


interface DataEntry {
  section: string;
  femaleCount: number;
  maleCount: number;
  unknownCount: number;
  total: number;
}


function normalizeTo100(f: number, m: number, u: number) {
    const total = f + m + u;
    if (total === 0) return { female: 0, male: 0, unknown: 0 };

    const rawF = (f / total) * 100;
    const rawM = (m / total) * 100;
    const rawU = (u / total) * 100;

    let female = Math.round(rawF);
    let male = Math.round(rawM);
    let unknown = 100 - female - male;

    if (unknown < 0) {
        unknown = Math.max(0, Math.round(rawU));
        male = Math.max(0, 100 - female - unknown);
    }

    return { female, male, unknown };
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;

    return (
        <div className="tooltip-box">
            <strong>{label}</strong>
            <div style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
                <div>🟩 Kvinner: {entry.femaleCount} ({entry.female}%)</div>
                <div>⚫ Menn: {entry.maleCount} ({entry.male}%)</div>
                <div>🔘 Ukjent: {entry.unknownCount} ({entry.unknown}%)</div>
                <hr style={{ margin: "0.3rem 0", opacity: 0.3 }} />
                <strong>Total: {entry.total}</strong>
            </div>
        </div>
    );
}

export default function KjonnPerSeksjonChart() {
    const [yearRange, setYearRange] = useState<[number, number]>([2021, 2024]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

    const filteredData: DataEntry[] = kjonnData
        .filter(
            (entry) =>
                selectedDepartments.length === 0 ||
                selectedDepartments.includes(entry.department)
        )
        .map((entry) => ({
            ...entry,
            femaleCount: entry.female,
            maleCount: entry.male,
            unknownCount: entry.unknown,
        }));

    const chartData: ChartEntry[] = filteredData.map((entry) => {
        const { female, male, unknown } = normalizeTo100(
            entry.femaleCount,
            entry.maleCount,
            entry.unknownCount
        );
        return {
            ...entry,
            female,
            male,
            unknown,
        };
    });

    const sortedData = [...chartData].sort((a, b) => b.female - a.female);

    return (
        <div>
            <Heading level="2" size="medium" spacing>
                Kjønnsfordeling per seksjon
            </Heading>

            <DepartmentSelector selected={selectedDepartments} setSelected={setSelectedDepartments} />

            <div className="control-row" style={{ marginBottom: "1rem" }}>
                <YearRangeFilter yearRange={yearRange} setYearRange={setYearRange} />
            </div>

            <ResponsiveContainer width="100%" height={sortedData.length * 30 + 60}>
                <BarChart
                    layout="vertical"
                    data={sortedData}
                    margin={{ top: 20, right: 60, bottom: 20, left: 220 }}
                >
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis
                        type="category"
                        dataKey="section"
                        width={220}
                        tick={{ fontSize: 13 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="female" stackId="a" fill="#22c55e" name="Kvinner" />
                    <Bar dataKey="male" stackId="a" fill="#1e293b" name="Menn" />
                    <Bar dataKey="unknown" stackId="a" fill="#e5e7eb" name="Ukjent" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
