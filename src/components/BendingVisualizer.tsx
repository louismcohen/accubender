import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Bend } from '@/types/job';

interface BendingVisualizerProps {
  bends: Bend[];
  currentBendIndex: number;
  progress: number;
}

export default function BendingVisualizer({
  bends,
  currentBendIndex,
  progress
}: BendingVisualizerProps) {
  const [paths, setPaths] = useState<string[]>([]);
  
  // Calculate the visualized paths based on current bend progress
  useEffect(() => {
    const newPaths: string[] = [];
    const completedPaths: string[] = [];
    
    let cumulativeX = 50; // start position
    let cumulativeY = 150; // start position
    let currentRotation = 0;
    
    // Start path
    let currentPath = `M ${cumulativeX} ${cumulativeY}`;
    
    // For each bend, calculate the new path
    bends.forEach((bend, index) => {
      // Scale factor for visualization
      const scaleFactor = 1.5;
      const length = bend.length / scaleFactor;
      
      if (index < currentBendIndex) {
        // Completed bends
        const angle = (currentRotation + bend.angle) % 360;
        const radians = (angle * Math.PI) / 180;
        
        // Calculate endpoint
        const endX = cumulativeX + length * Math.cos(radians);
        const endY = cumulativeY + length * Math.sin(radians);
        
        // Add line to path
        currentPath += ` L ${endX} ${endY}`;
        
        // Update cumulative position and rotation
        cumulativeX = endX;
        cumulativeY = endY;
        currentRotation = angle;
      } else if (index === currentBendIndex) {
        // Current bend - calculate based on progress
        const progressAngle = (currentRotation + (bend.angle * progress / 100)) % 360;
        const radians = (progressAngle * Math.PI) / 180;
        
        // Calculate endpoint based on progress
        const progressLength = length * (progress / 100);
        const endX = cumulativeX + progressLength * Math.cos(radians);
        const endY = cumulativeY + progressLength * Math.sin(radians);
        
        // Add line to path
        currentPath += ` L ${endX} ${endY}`;
      }
    });
    
    newPaths.push(currentPath);
    setPaths(newPaths);
  }, [bends, currentBendIndex, progress]);
  
  return (
    <Card className="p-4 h-64 overflow-hidden">
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
        
        {/* Tube path */}
        {paths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        
        {/* Current end point */}
        <circle 
          cx={paths[0]?.split(' ').slice(-2, -1)[0] || 50} 
          cy={paths[0]?.split(' ').slice(-1)[0] || 150} 
          r="5" 
          fill="hsl(var(--accent))" 
        />
      </svg>
    </Card>
  );
}