import { useState } from "react";
import { useMetaData } from "../data/useMetaData";
import DashboardContent from "../components/DashboardContent";
import DatagrunnlagInfo from "../components/DatagrunnlagInfo";
import StatistikkExplorerTab from "../components/StatistikkExplorerTab";
import Nyrekruttering from "../components/Nyrekruttering";
import Oppsigelse from "../components/Oppsigelse";
import { Tooltip } from "@navikt/ds-react";

export default function Dashboard() {
  type TabType = "hoved" | "Utforsk" | "data" | "nyrekruttering" | "oppsigelse";
  const [activeTab, setActiveTab] = useState<TabType>("hoved");
  const { lastUpdated } = useMetaData();


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
      <nav
        style={{
          backgroundColor: "#ffffff",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2rem",
          fontWeight: 600,
          fontSize: "1.1rem",
          borderBottom: "1px solid #D0D5DD",
        }}
      >
        <div style={{ display: "flex", gap: "2rem" }}>
          <span onClick={() => setActiveTab("hoved")} style={navLinkStyle("hoved")}>
            Hovedoversikt
          </span>
          <span onClick={() => setActiveTab("Utforsk")} style={navLinkStyle("Utforsk")}>
            Utforsk
          </span>
          
          <Tooltip content="Ingen data tilgjengelig enda">
            <span style={navLinkStyle("nyrekruttering")}>
              Nyrekruttering
            </span>
          </Tooltip>

          <Tooltip content="Ingen data tilgjengelig enda">
            <span style={navLinkStyle("oppsigelse")}>
              Oppsigelse
            </span>
          </Tooltip>

          <span onClick={() => setActiveTab("data")} style={navLinkStyle("data")}>
            Om data
          </span>
        </div>

        {lastUpdated && (
          <span style={{
            fontSize: "0.9rem",
            color: "#666",
            fontWeight: "normal"
          }}>
            Sist oppdatert: {lastUpdated}
          </span>
        )}
      </nav>

      <div style={{ padding: "2rem" }}>
        {activeTab === "hoved" && <DashboardContent />}
        {activeTab === "Utforsk" && <StatistikkExplorerTab />}
        {activeTab === "data" && <DatagrunnlagInfo />}
        {activeTab === "nyrekruttering" && <Nyrekruttering />}
        {activeTab === "oppsigelse" && <Oppsigelse />}
      </div>
    </main>
  );
}

