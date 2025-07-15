import { Text } from "recharts";

export function CustomizedAxisTick(props: any) {
  const { x, y, payload, visibleTicksCount = 0 } = props;

  const angle = visibleTicksCount > 6 ? -48 : 0;
  const anchor = visibleTicksCount > 6 ? "end" : "middle";
  const fontSize = visibleTicksCount > 6 ? 12 : 14;
  const dy = angle < 0 ? 10 : 10; 

  return (
    <g transform={`translate(${x},${y})`}>
      <Text
        x={0}
        y={0}
        dy={dy}
        textAnchor={anchor}
        transform={`rotate(${angle})`}
        fontSize={fontSize}
      >
        {payload.value}
      </Text>
    </g>
  );
}
