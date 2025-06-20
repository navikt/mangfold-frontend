import { oppsigelseData } from "../data/OppsigelseData";
import StatistikkSideLayout from "./StatistikkSideLayout";

export default function Oppsigelse() {
    return (
        <StatistikkSideLayout
            title="Oppsigelser"
            description="Se hvordan oppsigelser fordeler seg over tid på kjønn, alder, ansiennitet og stillingsgruppe."
            data={oppsigelseData}
            yearRange={[2020, 2024]}
        />
    );
}
