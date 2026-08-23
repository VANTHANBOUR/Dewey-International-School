import React from 'react';
import { BarChart2, TrendingUp, Users, Clock, BookOpen, Award, CheckCircle } from 'lucide-react';
import { Resource } from '../../types';

interface AnalyticsViewProps {
  resources: Resource[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ resources }) => {
  const totalViews = resources.reduce((acc, curr) => acc + curr.viewsCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Curriculum & Reading Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Dewey International School student engagement metrics, STEAM textbook utilization, and reader trends.
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Resource Reads</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">+14.2% from last month</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Student Readers</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">1,842</div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">98% of enrolled STEAM pupils</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Avg. Time per Session</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">24.5 mins</div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">+3.1 mins flipbook retention</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Concept Checks Solved</span>
            <Award size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">8,920</div>
          <div className="text-[11px] text-purple-600 font-bold mt-1">87.4% average accuracy</div>
        </div>
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Read Textbooks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 mb-4">Most Read Curriculum Titles</h3>
          <div className="space-y-4">
            {resources.slice(0, 5).map((res, idx) => (
              <div key={res.id} className="flex items-center gap-3">
                <span className="w-6 text-xs font-black text-slate-400">#{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span className="truncate">{res.title}</span>
                    <span>{res.viewsCount} reads</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (res.viewsCount / 2500) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Utilization Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 mb-4">STEAM Subject Engagement</h3>
          <div className="space-y-3.5">
            {[
              { subject: 'Science & Lab Manuals', percentage: 38, color: 'bg-emerald-500' },
              { subject: 'Mathematics & Algebra', percentage: 28, color: 'bg-purple-500' },
              { subject: 'English & Literature', percentage: 18, color: 'bg-blue-500' },
              { subject: 'Technology & Robotics', percentage: 10, color: 'bg-cyan-500' },
              { subject: 'Social Studies & History', percentage: 6, color: 'bg-orange-500' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{item.subject}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
