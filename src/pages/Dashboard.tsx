import { useState } from "react";
import DashboardContent from "../components/DashboardContent";
import Nyrekruttering from "../components/Nyrekruttering";
import Oppsigelse from "../components/Oppsigelse";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"hoved" | "nyrekruttering" | "oppsigelse">("hoved");

  return (
    <main style={{ padding: "2rem" }}>
      {/* Tabs for å bytte mellom visninger */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => setActiveTab("hoved")}>
          Hovedoversikt
        </button>
        <button onClick={() => setActiveTab("nyrekruttering")}>
          Nyrekruttering
        </button>
        <button onClick={() => setActiveTab("oppsigelse")}>
          Oppsigelse
        </button>
      </div>

      {/* Dynamisk innhold basert på valgt tab */}
      {activeTab === "hoved" && <DashboardContent />}
      {activeTab === "nyrekruttering" && <Nyrekruttering />}
      {activeTab === "oppsigelse" && <Oppsigelse />}
    </main>
  );
}
