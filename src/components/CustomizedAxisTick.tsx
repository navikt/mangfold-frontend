import { Text } from "recharts";

export function CustomizedAxisTick(props: any) {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <Text
        x={0}
        y={0}
        dy={10} 
        textAnchor="end"
        transform="rotate(-40)" 
        fontSize={14}      >
        {payload.value}
      </Text>
    </g>
  );
}