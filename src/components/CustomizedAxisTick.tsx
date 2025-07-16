export function CustomizedAxisTick({ x, y, payload, visibleTicksCount = 0 }: any) {
  const angle = visibleTicksCount > 6 ? -35 : 0;
  const anchor = visibleTicksCount > 6 ? "end" : "middle";
  const fontSize = visibleTicksCount > 10 ? 10 : visibleTicksCount > 6 ? 14 : 18;

  const dy = 10;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
  x={0}
  y={0}
  dy={dy}
  textAnchor={anchor}
  transform={`rotate(${angle})`}
  fill="#262626"
  style={{
    fontFamily: "Arial, sans-serif",
    fontWeight: 400,
    fontSize: `${fontSize}px`,
  }}
>
  {payload.value}
</text>

    </g>
  );
}
