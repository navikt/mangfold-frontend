import { useState } from "react";
import DashboardContent from "../components/DashboardContent";
import DatagrunnlagInfo from "../components/DatagrunnlagInfo";
import StatistikkExplorerTab from "../components/StatistikkExplorerTab";
// import Nyrekruttering from "../components/Nyrekruttering";
// import Oppsigelse from "../components/Oppsigelse"; // fjernet siden vi ikke viser den

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"hoved" | "kategori" | "data">("hoved");

  const navLinkStyle = (tab: string) => ({
    color: activeTab === tab ? "#0056b4" : "#333",
    textDecoration: "none",
    cursor: "pointer",
    borderBottom: activeTab === tab ? "3px solid #0056b4" : "none",
    paddingBottom: "0.5rem",
    transition: "color 0.2s ease",
  });

  return (
    <main>
      {/* Subnavigation */}
      <nav
        style={{
          backgroundColor: "#ffffff",
          padding: "1rem 2rem",
          display: "flex",
          gap: "2rem",
          fontWeight: 600,
          fontSize: "1.1rem",
          borderBottom: "1px solid #D0D5DD",
        }}
      >
        <span onClick={() => setActiveTab("hoved")} style={navLinkStyle("hoved")}>
          Hovedoversikt
        </span>
        <span onClick={() => setActiveTab("kategori")} style={navLinkStyle("kategori")}>
          Kategorier
        </span>
        <span onClick={() => setActiveTab("data")} style={navLinkStyle("data")}>
          Om data
        </span>

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
      </nav>

      {/* Innholdet */}
      <div style={{ padding: "2rem" }}>
        {activeTab === "hoved" && <DashboardContent />}
        {activeTab === "kategori" && <StatistikkExplorerTab />}
        {activeTab === "data" && <DatagrunnlagInfo />}
        {/* {activeTab === "nyrekruttering" && <Nyrekruttering />} */}
        {/* {activeTab === "oppsigelse" && <Oppsigelse />} */}
      </div>
    </main>
  );
}

