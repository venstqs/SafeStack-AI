import React from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Svg, { Line, Path, Rect, Circle, G, Text as SvgText } from 'react-native-svg';

interface TelemetryGraphProps {
  mode: 'rack' | 'line';
  data: number[] | number; // Array of points for 'line', or single millimeter deflection for 'rack'
  width?: number;
  height?: number;
}

export const TelemetryGraph: React.FC<TelemetryGraphProps> = ({ 
  mode, 
  data, 
  height = 180 
}) => {
  const { width: screenWidth } = useWindowDimensions();
  // 16px horizontal padding on each side inside ScrollView padding (16) = 32 + 16 = 48px total
  const width = screenWidth - 80;
  if (mode === 'rack') {
    const deflection = typeof data === 'number' ? data : 0;
    const isOverLimit = deflection > 12.0;
    const scale = 3; // exaggerate slightly for visualization
    const bendOffset = deflection * scale;

    // Draw coordinates
    const startX = width / 2;
    const endX = startX + bendOffset;
    
    // Path for bent racking column
    const columnPath = `M ${startX} 20 Q ${startX + bendOffset * 1.5} ${height / 2} ${startX} ${height - 20}`;

    return (
      <View style={styles.container}>
        <Svg width={width} height={height}>
          {/* Grid Background Lines */}
          <Line x1={20} y1={20} x2={width - 20} y2={20} stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />
          <Line x1={20} y1={height / 2} x2={width - 20} y2={height / 2} stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />
          <Line x1={20} y1={height - 20} x2={width - 20} y2={height - 20} stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />
          
          {/* Reference Safe Column (Green dotted line) */}
          <Line 
            x1={startX} 
            y1={20} 
            x2={startX} 
            y2={height - 20} 
            stroke="#10B981" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            opacity={0.4} 
          />

          {/* Racking Shelves horizontal structure */}
          <Rect x={startX - 60} y={40} width={120} height={8} fill="#1E293B" stroke="#475569" strokeWidth={1.5} rx={2} />
          <Rect x={startX - 60} y={100} width={120} height={8} fill="#1E293B" stroke="#475569" strokeWidth={1.5} rx={2} />
          
          {/* Actual Column Path (Shows structural deflection deviation) */}
          <Path 
            d={columnPath} 
            fill="none" 
            stroke={isOverLimit ? "#EF4444" : "#F59E0B"} 
            strokeWidth={4} 
          />

          {/* Core stress point circle indicator */}
          <Circle 
            cx={startX + bendOffset * 0.75} 
            cy={height / 2} 
            r={6} 
            fill={isOverLimit ? "#EF4444" : "#F59E0B"} 
          />

          {/* Graph labels */}
          <SvgText x={25} y={35} fill="#64748B" fontSize="10" fontWeight="bold">TOLERANCE LIMIT: 12.0mm</SvgText>
          <SvgText x={25} y={height - 30} fill="#94A3B8" fontSize="10">DEFLECTION SENSORS: ONLINE</SvgText>
          <SvgText 
            x={width - 120} 
            y={height - 30} 
            fill={isOverLimit ? "#FCA5A5" : "#FDE047"} 
            fontSize="11" 
            fontWeight="bold"
          >
            DEV: {deflection.toFixed(1)}mm
          </SvgText>
        </Svg>
      </View>
    );
  }

  // Draw line graph
  const points = Array.isArray(data) ? data : [0, 2, 1, 4, 3, 5];
  const maxVal = Math.max(...points, 10);
  const minVal = Math.min(...points, 0);
  const valRange = maxVal - minVal || 1;

  // Convert points to SVG coordinates
  const paddingX = 25;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const svgPoints = points.map((val, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((val - minVal) / valRange) * chartHeight;
    return { x, y };
  });

  let linePath = '';
  if (svgPoints.length > 0) {
    linePath = `M ${svgPoints[0].x} ${svgPoints[0].y} ` + 
      svgPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Horizontal grid lines */}
        <Line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />
        <Line x1={paddingX} y1={paddingY + chartHeight / 2} x2={width - paddingX} y2={paddingY + chartHeight / 2} stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />
        <Line x1={paddingX} y1={paddingY + chartHeight} x2={width - paddingX} y2={paddingY + chartHeight} stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />

        {/* The data line path */}
        {linePath && (
          <Path 
            d={linePath} 
            fill="none" 
            stroke="#10B981" 
            strokeWidth={2.5} 
          />
        )}

        {/* Data points dots */}
        {svgPoints.map((p, idx) => (
          <Circle 
            key={idx}
            cx={p.x} 
            cy={p.y} 
            r={3.5} 
            fill="#34D399" 
            stroke="#1E293B"
            strokeWidth={1}
          />
        ))}

        {/* Labels */}
        <SvgText x={paddingX - 10} y={paddingY + 4} fill="#64748B" fontSize="8" textAnchor="end">{maxVal.toFixed(0)}</SvgText>
        <SvgText x={paddingX - 10} y={paddingY + chartHeight / 2 + 4} fill="#64748B" fontSize="8" textAnchor="end">{((maxVal + minVal) / 2).toFixed(0)}</SvgText>
        <SvgText x={paddingX - 10} y={paddingY + chartHeight + 4} fill="#64748B" fontSize="8" textAnchor="end">{minVal.toFixed(0)}</SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: '#0F172A', // Slate 900
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
  }
});

export default TelemetryGraph;
