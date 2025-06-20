import StatistikkSideLayout from "../components/StatistikkSideLayout";
import { nyrekrutteringData } from "../data/nyrekrutteringData";

export default function Nyrekruttering() {
    return (
        <StatistikkSideLayout
            title="Nyrekruttering"
            description="Her kan du se hvordan..."
            data={nyrekrutteringData}
            yearRange={[2020, 2024]}
        />
    );
}