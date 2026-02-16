import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RoomAnalysis } from '../types';

interface AnalysisChartProps {
  analysis: RoomAnalysis | null;
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <h3 className="text-xl font-semibold text-white">AI Space Analysis</h3>
        <span className="bg-lumina-500/20 text-lumina-300 px-3 py-1 rounded-full text-xs font-mono border border-lumina-500/30">
          {analysis.roomType}
        </span>
      </div>
      
      <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/30 p-3 rounded-lg">
                <label className="text-xs uppercase tracking-wider text-slate-400">Current Style</label>
                <p className="text-lg font-medium text-white">{analysis.style}</p>
            </div>
            <div className="bg-slate-700/30 p-3 rounded-lg">
                <label className="text-xs uppercase tracking-wider text-slate-400">Lighting</label>
                <p className="text-sm font-medium text-white">{analysis.lighting}</p>
            </div>
          </div>
          
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 block mb-2">Color DNA</label>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={analysis.colors}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="percentage"
                    >
                        {analysis.colors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.hex} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400">AI Recommendations</label>
            <ul className="mt-2 space-y-2">
              {analysis.suggestions?.map((suggestion, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-lumina-400 mt-1">●</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
      </div>
    </div>
  );
};

export default AnalysisChart;