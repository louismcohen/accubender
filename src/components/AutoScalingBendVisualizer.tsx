import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { InspectionResult, Bend } from '@/types/job';

interface AutoScalingBendVisualizerProps {
  results: InspectionResult[];
  bends: Bend[];
}

interface Point {
  x: number;
  y: number;
}

interface PathBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export default function AutoScalingBendVisualizer({
  results,
  bends
}: AutoScalingBendVisualizerProps) {
  // Find failed inspection(s)
  const failedInspections = results.filter(result => !result.pass);
  
  // Calculate visualization data
  const findResult = (position: number) => 
    results.find(result => result.bendPosition === position);
  
  // Use useMemo to calculate paths and scaling information
  const { paths, viewBox, transform, points } = useMemo(() => {
    const expectedPath: string[] = [];
    const actualPath: string[] = [];
    const allPoints: Point[] = [];
    
    let cumulativeX = 50; // start position
    let cumulativeY = 150; // start position
    let expectedRotation = 0;
    let actualRotation = 0;
    
    // Initial point
    allPoints.push({ x: cumulativeX, y: cumulativeY });
    
    // Start paths
    expectedPath.push(`M ${cumulativeX} ${cumulativeY}`);
    actualPath.push(`M ${cumulativeX} ${cumulativeY}`);
    
    // Calculate expected and actual points for each bend
    const bendPoints: { expected: Point; actual: Point }[] = [];
    
    // For each bend, calculate the paths
    bends.forEach((bend) => {
      // Scale factor for visualization
      const scaleFactor = 1.5;
      const length = bend.length / scaleFactor;
      const result = findResult(bend.position);
      
      // Expected path
      const expectedAngle = (expectedRotation + bend.angle) % 360;
      const expectedRadians = (expectedAngle * Math.PI) / 180;
      const expectedEndX = cumulativeX + length * Math.cos(expectedRadians);
      const expectedEndY = cumulativeY + length * Math.sin(expectedRadians);
      expectedPath.push(`L ${expectedEndX} ${expectedEndY}`);
      allPoints.push({ x: expectedEndX, y: expectedEndY });
      
      // Actual path (with deviation if exists)
      const actualAngle = result 
        ? (actualRotation + result.actual) % 360 
        : expectedAngle;
      const actualRadians = (actualAngle * Math.PI) / 180;
      const actualEndX = cumulativeX + length * Math.cos(actualRadians);
      const actualEndY = cumulativeY + length * Math.sin(actualRadians);
      actualPath.push(`L ${actualEndX} ${actualEndY}`);
      allPoints.push({ x: actualEndX, y: actualEndY });
      
      bendPoints.push({
        expected: { x: expectedEndX, y: expectedEndY },
        actual: { x: actualEndX, y: actualEndY }
      });
      
      // Update for next segment
      cumulativeX = expectedEndX; // Keep using expected as reference point
      cumulativeY = expectedEndY;
      expectedRotation = expectedAngle;
      actualRotation = actualAngle;
    });
    
    // Calculate the bounds of all points
    const bounds: PathBounds = allPoints.reduce(
      (acc, point) => ({
        minX: Math.min(acc.minX, point.x),
        maxX: Math.max(acc.maxX, point.x),
        minY: Math.min(acc.minY, point.y),
        maxY: Math.max(acc.maxY, point.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );
    
    // Add padding to the bounds
    const padding = 30;
    bounds.minX -= padding;
    bounds.maxX += padding;
    bounds.minY -= padding;
    bounds.maxY += padding;
    
    // Calculate width and height
    bounds.width = bounds.maxX - bounds.minX;
    bounds.height = bounds.maxY - bounds.minY;
    
    // Calculate scaling factor to fit within the 300x300 viewBox
    const svgWidth = 300;
    const svgHeight = 300;
    const scaleX = svgWidth / bounds.width;
    const scaleY = svgHeight / bounds.height;
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate translation to center the diagram
    const translateX = -bounds.minX * scale + (svgWidth - bounds.width * scale) / 2;
    const translateY = -bounds.minY * scale + (svgHeight - bounds.height * scale) / 2;
    
    // Set the viewBox and transform
    const viewBox = `0 0 ${svgWidth} ${svgHeight}`;
    const transform = `translate(${translateX}, ${translateY}) scale(${scale})`;
    
    return {
      paths: {
        expected: expectedPath.join(' '),
        actual: actualPath.join(' ')
      },
      points: bendPoints,
      bounds,
      viewBox,
      transform
    };
  }, [bends, results]);
  
  // Extract scale value from transform string for adjusting stroke widths and font sizes
  const scaleValue = useMemo(() => {
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    return scaleMatch ? parseFloat(scaleMatch[1]) : 1;
  }, [transform]);
  
  return (
    <Card className="p-4 mb-4">
      <div className="mb-3">
        <h3 className="font-medium">Visual Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Showing deviation between expected (blue) and actual (red) bends
        </p>
      </div>
      
      <div className="h-64 overflow-hidden">
        <svg width="100%" height="100%" viewBox={viewBox} className="overflow-visible">
          {/* Grid for reference */}
          <g stroke="#f0f0f0" strokeWidth="0.5">
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 30} x2="300" y2={i * 30} />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 30} y1="0" x2={i * 30} y2="300" />
            ))}
          </g>
          
          {/* Main visualization group with auto-scaling */}
          <g transform={transform}>
            {/* Starting point */}
            <circle cx="50" cy="150" r={4 / Math.sqrt(scaleValue)} fill="#888" />
            
            {/* Expected path */}
            <path
              d={paths.expected}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={4 / Math.sqrt(scaleValue)}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />
            
            {/* Actual path */}
            <path
              d={paths.actual}
              fill="none"
              stroke={failedInspections.length > 0 ? "#ef4444" : "#10b981"}
              strokeWidth={5 / Math.sqrt(scaleValue)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Annotations for failed inspections */}
            {failedInspections.map(failure => {
              const bendIndex = bends.findIndex(bend => bend.position === failure.bendPosition);
              
              if (bendIndex >= 0 && bendIndex < points.length) {
                const point = points[bendIndex].actual;
                
                return (
                  <g key={failure.bendPosition}>
                    <circle 
                      cx={point.x} 
                      cy={point.y} 
                      r={6 / Math.sqrt(scaleValue)} 
                      fill="#ef4444" 
                    />
                    <circle 
                      cx={point.x} 
                      cy={point.y} 
                      r={12 / Math.sqrt(scaleValue)} 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth={2 / Math.sqrt(scaleValue)} 
                      strokeDasharray="2 2" 
                    />
                    <text 
                      x={point.x + 15 / Math.sqrt(scaleValue)} 
                      y={point.y - 10 / Math.sqrt(scaleValue)}
                      className="text-xs font-semibold fill-current"
                      style={{ fontSize: `${12 / Math.sqrt(scaleValue)}px` }}
                    >
                      Bend {failure.bendPosition}
                    </text>
                    <text 
                      x={point.x + 15 / Math.sqrt(scaleValue)} 
                      y={point.y + 5 / Math.sqrt(scaleValue)}
                      className="text-xs fill-current"
                      style={{ fontSize: `${10 / Math.sqrt(scaleValue)}px` }}
                    >
                      Δ {Math.abs(failure.deviation).toFixed(1)}°
                    </text>
                  </g>
                );
              }
              return null;
            })}
          </g>
          
          {/* Legend (fixed position) */}
          <g transform="translate(20, 40)">
            <line x1="0" y1="0" x2="25" y2="0" stroke="#3b82f6" strokeWidth="3" strokeDasharray="4 2" />
            <text x="30" y="5" className="text-xs fill-current">Expected</text>
            
            <line x1="0" y1="20" x2="25" y2="20" stroke={failedInspections.length > 0 ? "#ef4444" : "#10b981"} strokeWidth="4" />
            <text x="30" y="25" className="text-xs fill-current">Actual</text>
          </g>
        </svg>
      </div>
      
      {failedInspections.length > 0 && (
        <div className="mt-4 p-3 border rounded-md bg-red-50 text-red-700 text-sm">
          <p className="font-medium">Inspection Issues</p>
          <ul className="list-disc list-inside mt-1">
            {failedInspections.map(failure => (
              <li key={failure.bendPosition}>
                Bend {failure.bendPosition}: Expected {failure.expected}°, measured {failure.actual.toFixed(1)}° 
                (deviation: {Math.abs(failure.deviation).toFixed(1)}°)
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}