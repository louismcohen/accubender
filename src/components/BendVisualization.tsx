import { Card } from '@/components/ui/card';
import { InspectionResult, Bend } from '@/types/job';

interface BendVisualizationProps {
  results: InspectionResult[];
  bends: Bend[];
}

export default function BendVisualization({
  results,
  bends
}: BendVisualizationProps) {
  // Find failed inspection(s)
  const failedInspections = results.filter(result => !result.pass);
  
  // Calculate visualization data
  const findResult = (position: number) => 
    results.find(result => result.bendPosition === position);
  
  // Generate paths for expected vs actual
  const generatePaths = () => {
    const expectedPath: string[] = [];
    const actualPath: string[] = [];
    
    let cumulativeX = 50; // start position
    let cumulativeY = 150; // start position
    let expectedRotation = 0;
    let actualRotation = 0;
    
    // Start paths
    expectedPath.push(`M ${cumulativeX} ${cumulativeY}`);
    actualPath.push(`M ${cumulativeX} ${cumulativeY}`);
    
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
      
      // Actual path (with deviation if exists)
      const actualAngle = result 
        ? (actualRotation + result.actual) % 360 
        : expectedAngle;
      const actualRadians = (actualAngle * Math.PI) / 180;
      const actualEndX = cumulativeX + length * Math.cos(actualRadians);
      const actualEndY = cumulativeY + length * Math.sin(actualRadians);
      actualPath.push(`L ${actualEndX} ${actualEndY}`);
      
      // Update for next segment
      cumulativeX = expectedEndX; // Keep using expected as reference point
      cumulativeY = expectedEndY;
      expectedRotation = expectedAngle;
      actualRotation = actualAngle;
    });
    
    return {
      expected: expectedPath.join(' '),
      actual: actualPath.join(' ')
    };
  };
  
  const paths = generatePaths();
  
  return (
    <Card className="p-4 mb-4">
      <div className="mb-3">
        <h3 className="font-medium">Visual Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Showing deviation between expected (blue) and actual (red) bends
        </p>
      </div>
      
      <div className="h-64 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 300 300" className="overflow-visible">
          {/* Grid for reference */}
          <g stroke="#f0f0f0" strokeWidth="0.5">
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 30} x2="300" y2={i * 30} />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 30} y1="0" x2={i * 30} y2="300" />
            ))}
          </g>
          
          {/* Starting point */}
          <circle cx="50" cy="150" r="4" fill="#888" />
          
          {/* Expected path */}
          <path
            d={paths.expected}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 2"
          />
          
          {/* Actual path */}
          <path
            d={paths.actual}
            fill="none"
            stroke={failedInspections.length > 0 ? "#ef4444" : "#10b981"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Legend */}
          <g transform="translate(20, 40)">
            <line x1="0" y1="0" x2="25" y2="0" stroke="#3b82f6" strokeWidth="3" strokeDasharray="4 2" />
            <text x="30" y="5" className="text-xs fill-current">Expected</text>
            
            <line x1="0" y1="20" x2="25" y2="20" stroke={failedInspections.length > 0 ? "#ef4444" : "#10b981"} strokeWidth="4" />
            <text x="30" y="25" className="text-xs fill-current">Actual</text>
          </g>
          
          {/* Annotations for failed inspections */}
          {failedInspections.map(failure => {
            // Find position in visualization where failure occurs
            const bendIndex = bends.findIndex(bend => bend.position === failure.bendPosition);
            const segments = paths.actual.split(' L ');
            
            if (bendIndex < segments.length - 1) {
              const coords = segments[bendIndex + 1].split(' ');
              const x = parseFloat(coords[0]);
              const y = parseFloat(coords[1]);
              
              return (
                <g key={failure.bendPosition}>
                  <circle cx={x} cy={y} r="6" fill="#ef4444" />
                  <circle cx={x} cy={y} r="12" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
                  <text x={x + 15} y={y - 10} className="text-xs font-semibold fill-current">
                    Bend {failure.bendPosition}
                  </text>
                  <text x={x + 15} y={y + 5} className="text-xs fill-current">
                    Δ {Math.abs(failure.deviation).toFixed(1)}°
                  </text>
                </g>
              );
            }
            return null;
          })}
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