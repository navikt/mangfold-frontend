import FordelingEtterAvdelinger from "./FordelingEtterAvdeling";
import FordelingEtterStilling from "./FordelingEtterStilling";

export default function StatistikkExplorer() {
  return (
    <div className="chart-toggle-wrapper">
      <FordelingEtterAvdelinger />
      <FordelingEtterStilling />
    </div>
  );
}