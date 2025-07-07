import { useState } from "react";
import { Button } from "@navikt/ds-react";
import DashboardContent from "../components/DashboardContent";
import DatagrunnlagInfo from "../components/DatagrunnlagInfo";
import StatistikkExplorerTab from "../components/StatistikkExplorerTab";
// import Nyrekruttering from "../components/Nyrekruttering";
// import Oppsigelse from "../components/Oppsigelse"; // fjernet siden vi ikke viser den

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"hoved" | "nyrekruttering" | "kategori" | "data">("hoved");

  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <Button
          variant={activeTab === "hoved" ? "primary" : "secondary"}
          onClick={() => setActiveTab("hoved")}
        >
          Hovedoversikt
        </Button>

        <Button
          variant={activeTab === "kategori" ? "primary" : "secondary"}
          onClick={() => setActiveTab("kategori")}
        >
          Kategorier
        </Button>

        {/* <Button
          variant={activeTab === "nyrekruttering" ? "primary" : "secondary"}
          onClick={() => setActiveTab("nyrekruttering")}
        >
          Nyrekruttering
        </Button> */}

        {/* <Tooltip content="Oppsigelse er ikke tilgjengelig fordi historiske data mangler.">
          <span>
            <Button variant="secondary" disabled>
              Oppsigelse
            </Button>
          </span>
        </Tooltip> */}

        <Button
          variant={activeTab === "data" ? "primary" : "secondary"}
          onClick={() => setActiveTab("data")}
        >
          Om data
        </Button>
      </div>

      {activeTab === "hoved" && <DashboardContent />}
      {/* {activeTab === "nyrekruttering" && <Nyrekruttering />} */}
      {activeTab === "data" && <DatagrunnlagInfo />}
      {/* {activeTab === "oppsigelse" && <Oppsigelse />} */}
      {activeTab === "kategori" && <StatistikkExplorerTab />}
    </main>
  );
}
