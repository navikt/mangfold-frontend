//Håndterer kategoribasert statistikk (alder, stillingsgruppe, osv.) med tabs og visning.
import { useState } from "react";
import { Button } from "@navikt/ds-react";
import YearRangeFilter from "./YearRangeFilter";
import SimpleLineChart from "./SimpleLineChart";
import type { StatCategory, StatEntry} from "../data/NyrekrutteringData";
import ChartTableView from "./ChartTableView";

interface Props {
    title: string;
    description: string;
    data: Record<StatCategory, StatEntry[]>;
    yearRange: [number, number];
}

const CATEGORY_LABELS: { key: StatCategory; label: string }[] = [
    { key: "Totalt oversikt", label: "Total oversikt" },
    { key: "alder", label: "Alder" },
    { key: "stillingsgruppe", label: "Stillingsgruppe" },
    { key: "utdanningsniva", label: "Utdannivå" }
];

export default function StatistikkSideLayout({ title, description, data, yearRange }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<StatCategory>("Totalt oversikt");
    const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>(yearRange);
    const [showTable, setShowTable] = useState(false);

    const isYearBasedCategory = selectedCategory === "Totalt oversikt";

    const filteredData = data[selectedCategory].filter((entry) => {
        if (isYearBasedCategory) {
            const year = parseInt(entry.label);
            return !isNaN(year) && year >= selectedYearRange[0] && year <= selectedYearRange[1];
        }
        return true;
    });

    return (
        <section className="dashboard-body" style={{ padding: "1rem" }}>
            <h2>{title}</h2>
            <p>{description}</p>

            <div className="control-row" style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <YearRangeFilter yearRange={selectedYearRange} setYearRange={setSelectedYearRange} />
                <Button
                    variant="secondary"
                    onClick={() => setShowTable(prev => !prev)}
                >
                    {showTable ? "Vis som figur" : "Vis som tabell"}
                </Button>
            </div>

            <div className="category-tabs" style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
                {CATEGORY_LABELS.map((cat) => (
                    <Button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        variant={selectedCategory === cat.key ? "primary" : "tertiary"}
                        size="small"
                    >
                        {cat.label}
                    </Button>
                ))}
            </div>

            <div style={{ marginTop: "1rem" }}>
                {showTable ? (
                    <ChartTableView
                        showTable={true}
                        aggregatedData={filteredData}
                        yearRange={selectedYearRange}
                    />
                ) : (
                    <SimpleLineChart
                        data={filteredData.map(entry => ({
                            år: !isNaN(Number(entry.label)) ? Number(entry.label) : entry.label,
                            kvinner: entry.female,
                            menn: entry.male
                        }))}
                        title={CATEGORY_LABELS.find(c => c.key === selectedCategory)?.label || ""}
                    />
                )}
            </div>
        </section>
    );
}
