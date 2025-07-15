import FordelingEtterAvdelinger from "./FordelingEtterAvdeling";
import FordelingEtterStilling from "./FordelingEtterStilling";
import { Box } from "@navikt/ds-react";

export default function StatistikkExplorer() {
  return (
    <div className="chart-toggle-wrapper">
      <Box
        padding="6"
        marginBlock="6"
        borderRadius="large"
        background-color="subtle"
        shadow="medium"
      >
        <FordelingEtterAvdelinger />
      </Box>

      <Box
        padding="6"
        marginBlock="6"
        borderRadius="large"
        background-color="subtle"
        shadow="medium"
      >
        <FordelingEtterStilling />
      </Box>
    </div>
  );
}