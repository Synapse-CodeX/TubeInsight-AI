import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SentimentData } from '@/api/types';

interface SentimentTabProps {
  sentiment: SentimentData;
}

const COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#eab308',
  joy: '#f59e0b',
  anger: '#dc2626',
  love: '#ec4899',
  surprise: '#8b5cf6',
  sadness: '#3b82f6',
};

export function SentimentTab({ sentiment }: SentimentTabProps) {
  // Prepare sentiment distribution data for pie chart
  const sentimentData = sentiment.sentiment_distribution
    ? [
        { name: 'Positive', value: sentiment.sentiment_distribution.positive, color: COLORS.positive },
        { name: 'Negative', value: sentiment.sentiment_distribution.negative, color: COLORS.negative },
        { name: 'Neutral', value: sentiment.sentiment_distribution.neutral, color: COLORS.neutral },
      ]
    : [
        { name: 'Positive', value: 33, color: COLORS.positive },
        { name: 'Negative', value: 33, color: COLORS.negative },
        { name: 'Neutral', value: 34, color: COLORS.neutral },
      ];

  // Prepare emotion breakdown data for bar chart
  const emotionData = sentiment.emotion_breakdown
    ? [
        { name: 'Joy', value: sentiment.emotion_breakdown.joy, color: COLORS.joy },
        { name: 'Love', value: sentiment.emotion_breakdown.love, color: COLORS.love },
        { name: 'Surprise', value: sentiment.emotion_breakdown.surprise, color: COLORS.surprise },
        { name: 'Anger', value: sentiment.emotion_breakdown.anger, color: COLORS.anger },
        { name: 'Sadness', value: sentiment.emotion_breakdown.sadness, color: COLORS.sadness },
      ]
    : [
        { name: 'Joy', value: 20, color: COLORS.joy },
        { name: 'Love', value: 20, color: COLORS.love },
        { name: 'Surprise', value: 20, color: COLORS.surprise },
        { name: 'Anger', value: 20, color: COLORS.anger },
        { name: 'Sadness', value: 20, color: COLORS.sadness },
      ];

  return (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Distribution Pie Chart */}
        <Card className="bg-zinc-900/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Sentiment Distribution</CardTitle>
            <CardDescription className="text-white/50">
              Breakdown of comment sentiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-white/70">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emotion Breakdown Bar Chart */}
        <Card className="bg-zinc-900/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Emotion Breakdown</CardTitle>
            <CardDescription className="text-white/50">
              Emotional tone of comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={emotionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
