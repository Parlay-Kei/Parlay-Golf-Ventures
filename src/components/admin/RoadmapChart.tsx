import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  name: string;
  startDate: Date;
  duration: number; // in days
  section: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'delayed';
}

interface RoadmapChartProps {
  title: string;
  tasks: Task[];
  startDate?: Date;
  endDate?: Date;
  showProgress?: boolean;
}

export default function RoadmapChart({
  title,
  tasks,
  startDate: propStartDate,
  endDate: propEndDate,
  showProgress = true,
}: RoadmapChartProps) {
  // Calculate start and end dates if not provided
  const startDate = propStartDate || new Date(Math.min(...tasks.map(t => t.startDate.getTime())));
  const endDate = propEndDate || new Date(Math.max(...tasks.map(t => {
    const endTime = new Date(t.startDate);
    endTime.setDate(endTime.getDate() + t.duration);
    return endTime.getTime();
  })));

  // Calculate total duration in days
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Group tasks by section
  const sections = tasks.reduce((acc, task) => {
    if (!acc[task.section]) {
      acc[task.section] = [];
    }
    acc[task.section].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Get current date for progress indicator
  const currentDate = new Date();
  const daysPassed = Math.max(0, Math.min(
    Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    totalDays
  ));
  const progressPercentage = (daysPassed / totalDays) * 100;

  // Format date as MM/DD
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getTaskPosition = (task: Task) => {
    const taskStart = Math.ceil((task.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const startPercent = (taskStart / totalDays) * 100;
    const widthPercent = (task.duration / totalDays) * 100;
    return { left: `${startPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {formatDate(startDate)} - {formatDate(endDate)} ({totalDays} days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Timeline header with dates */}
        <div className="relative mb-6 mt-2">
          <div className="flex justify-between text-xs text-gray-500">
            {Array.from({ length: 9 }).map((_, i) => {
              const date = new Date(startDate);
              date.setDate(date.getDate() + Math.floor(i * totalDays / 8));
              return (
                <div key={i} className="text-center" style={{ width: '30px' }}>
                  {formatDate(date)}
                </div>
              );
            })}
          </div>
          <div className="h-1 w-full bg-gray-200 mt-2 rounded-full">
            {showProgress && (
              <div 
                className="h-1 bg-blue-600 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              />
            )}
          </div>
          {showProgress && (
            <div 
              className="absolute top-6 w-0.5 h-full bg-blue-600" 
              style={{ left: `${progressPercentage}%` }}
            />
          )}
        </div>

        {/* Gantt chart sections */}
        <div className="space-y-8">
          {Object.entries(sections).map(([sectionName, sectionTasks]) => (
            <div key={sectionName} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">{sectionName}</h3>
              <div className="space-y-3">
                {sectionTasks.map(task => (
                  <div key={task.id} className="relative h-8">
                    <div className="absolute inset-y-0 left-0 w-full bg-gray-100 rounded-md">
                      <div 
                        className={`absolute inset-y-0 ${getStatusColor(task.status)} rounded-md flex items-center px-2 text-xs text-white font-medium truncate`}
                        style={getTaskPosition(task)}
                      >
                        {task.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
            <span>Not Started</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Delayed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
