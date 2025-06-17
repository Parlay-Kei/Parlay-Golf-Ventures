import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Calendar, List } from 'lucide-react';
import RoadmapChart from './RoadmapChart';

interface Task {
  id: string;
  name: string;
  startDate: Date;
  duration: number; // in days
  section: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'delayed';
}

// Parse the roadmap data
const roadmapTasks: Task[] = [
  // Week 1: Onboarding
  { id: 'a1', name: 'Guided Onboarding Flow', startDate: new Date('2025-04-23'), duration: 5, section: 'Week 1: Onboarding', status: 'not-started' },
  { id: 'a2', name: 'PGV 101 Intro Page', startDate: new Date('2025-04-23'), duration: 5, section: 'Week 1: Onboarding', status: 'not-started' },
  
  // Week 2: Mentorship Visibility
  { id: 'b1', name: 'Mentor Profile Cards', startDate: new Date('2025-04-30'), duration: 5, section: 'Week 2: Mentorship Visibility', status: 'not-started' },
  { id: 'b2', name: 'Mentor Feedback Showcase', startDate: new Date('2025-05-01'), duration: 4, section: 'Week 2: Mentorship Visibility', status: 'not-started' },
  
  // Week 3: Sharability & Creator Profiles
  { id: 'c1', name: 'Social Share Card Generator', startDate: new Date('2025-05-06'), duration: 4, section: 'Week 3: Sharability & Creator Profiles', status: 'not-started' },
  { id: 'c2', name: 'Creator Landing Pages', startDate: new Date('2025-05-07'), duration: 5, section: 'Week 3: Sharability & Creator Profiles', status: 'not-started' },
  
  // Week 4: Brand Clarity & Site Flow
  { id: 'd1', name: 'PGV Identity Page', startDate: new Date('2025-05-13'), duration: 4, section: 'Week 4: Brand Clarity & Site Flow', status: 'not-started' },
  { id: 'd2', name: 'Home Page Brand Structure', startDate: new Date('2025-05-13'), duration: 4, section: 'Week 4: Brand Clarity & Site Flow', status: 'not-started' },
  { id: 'd3', name: 'Tier Badge Display', startDate: new Date('2025-05-14'), duration: 3, section: 'Week 4: Brand Clarity & Site Flow', status: 'not-started' },
  
  // Week 5: Engagement & Growth Loops
  { id: 'e1', name: 'Weekly Challenge System', startDate: new Date('2025-05-20'), duration: 4, section: 'Week 5: Engagement & Growth Loops', status: 'not-started' },
  { id: 'e2', name: 'Progression Points System', startDate: new Date('2025-05-21'), duration: 5, section: 'Week 5: Engagement & Growth Loops', status: 'not-started' },
  
  // Week 6: Optimization
  { id: 'f1', name: 'Metric Tracking + Feedback Review', startDate: new Date('2025-05-27'), duration: 4, section: 'Week 6: Optimization', status: 'not-started' },
  { id: 'f2', name: 'Funnel Refinement & Hard Launch Prep', startDate: new Date('2025-05-29'), duration: 5, section: 'Week 6: Optimization', status: 'not-started' },
];

export default function GoLiveRoadmap() {
  const [view, setView] = useState<'chart' | 'list'>('chart');
  
  // Calculate overall progress
  const completedTasks = roadmapTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = roadmapTasks.filter(task => task.status === 'in-progress').length;
  const totalTasks = roadmapTasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
  
  // Get start and end dates
  const startDate = new Date(Math.min(...roadmapTasks.map(t => t.startDate.getTime())));
  const endDate = new Date(Math.max(...roadmapTasks.map(t => {
    const end = new Date(t.startDate);
    end.setDate(end.getDate() + t.duration);
    return end.getTime();
  })));
  
  // Format date as MM/DD/YYYY
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };
  
  // Calculate days until launch
  const daysUntilLaunch = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Group tasks by section for list view
  const tasksBySection = roadmapTasks.reduce((acc, task) => {
    if (!acc[task.section]) {
      acc[task.section] = [];
    }
    acc[task.section].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case 'in-progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>;
      case 'delayed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Delayed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Started</span>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>60-Day Go Live Execution Roadmap</CardTitle>
            <CardDescription>
              {formatDate(startDate)} - {formatDate(endDate)}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setView('chart')} className={view === 'chart' ? 'bg-gray-100' : ''}>
              <Calendar className="h-4 w-4 mr-1" />
              Chart
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView('list')} className={view === 'list' ? 'bg-gray-100' : ''}>
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Progress summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Overall Progress</div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-2xl font-semibold">{progressPercentage}%</div>
              <div className="text-sm text-gray-500">{completedTasks} of {totalTasks} tasks</div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Current Status</div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-2xl font-semibold">{inProgressTasks} Tasks</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {daysUntilLaunch > 0 ? `${daysUntilLaunch} days until launch` : 'Launch day!'}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Next Milestone</div>
            <div className="mt-1 text-lg font-semibold">
              {roadmapTasks.find(t => t.status !== 'completed')?.name || 'All tasks completed!'}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Due {formatDate(roadmapTasks.find(t => t.status !== 'completed')?.startDate || new Date())}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {view === 'chart' ? (
          <RoadmapChart 
            title="" 
            tasks={roadmapTasks} 
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksBySection).map(([section, tasks]) => (
              <div key={section} className="space-y-3">
                <h3 className="font-medium text-gray-900">{section}</h3>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(task.startDate)} - 
                          {formatDate(new Date(task.startDate.getTime() + task.duration * 24 * 60 * 60 * 1000))}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
