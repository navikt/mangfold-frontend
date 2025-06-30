import { useState } from "react";
import { Tooltip, Button } from "@navikt/ds-react";
import DashboardContent from "../components/DashboardContent";
import Nyrekruttering from "../components/Nyrekruttering";
// import Oppsigelse from "../components/Oppsigelse"; // fjernet siden vi ikke viser den

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"hoved" | "nyrekruttering">("hoved");

  return (
    <main style={{ padding: "2rem" }}>
      {/* Tabs for å bytte mellom visninger */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <Button
          variant={activeTab === "hoved" ? "primary" : "secondary"}
          onClick={() => setActiveTab("hoved")}
        >
          Hovedoversikt
        </Button>

        <Button
          variant={activeTab === "nyrekruttering" ? "primary" : "secondary"}
          onClick={() => setActiveTab("nyrekruttering")}
        >
          Nyrekruttering
        </Button>

        <Tooltip content="Oppsigelse er ikke tilgjengelig fordi historiske data mangler.">
          <span>
            <Button variant="secondary" disabled>
              Oppsigelse
            </Button>
          </span>
        </Tooltip>
      </div>

      {activeTab === "hoved" && <DashboardContent />}
      {activeTab === "nyrekruttering" && <Nyrekruttering />}
      {/* {activeTab === "oppsigelse" && <Oppsigelse />}*/}
    </main>
  );
}
