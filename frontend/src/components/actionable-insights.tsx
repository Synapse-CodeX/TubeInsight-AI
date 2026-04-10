import React from 'react';
import { ThumbsUp, AlertTriangle, HelpCircle, Sparkles, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionableInsightsProps {
  topPraises?: string[];
  topCriticisms?: string[];
  topQuestions?: string[];
  vibeScore?: number;
  tips?: string[];
}

export function ActionableInsights({
  topPraises = [],
  topCriticisms = [],
  topQuestions = [],
  vibeScore = 5,
  tips = [],
}: ActionableInsightsProps) {
  // Generate tips if not provided
  const generatedTips = tips.length > 0 ? tips : generateTips(vibeScore, topPraises, topCriticisms);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* What They Loved */}
      <Card className="bg-zinc-900/60 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-green-500" />
            </div>
            What They Loved
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPraises.length === 0 ? (
            <p className="text-white/40 text-sm">No specific praises identified</p>
          ) : (
            <ul className="space-y-2">
              {topPraises.slice(0, 5).map((praise, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{praise}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* What Needs Work */}
      <Card className="bg-zinc-900/60 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            What Needs Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCriticisms.length === 0 ? (
            <p className="text-white/40 text-sm">No major criticisms identified</p>
          ) : (
            <ul className="space-y-2">
              {topCriticisms.slice(0, 5).map((criticism, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-red-500 mt-0.5">!</span>
                  <span>{criticism}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Top Questions */}
      <Card className="bg-zinc-900/60 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-blue-500" />
            </div>
            Top Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topQuestions.length === 0 ? (
            <p className="text-white/40 text-sm">No common questions identified</p>
          ) : (
            <ul className="space-y-2">
              {topQuestions.slice(0, 5).map((question, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-blue-500 mt-0.5">?</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Vibe */}
      <Card className="bg-zinc-900/60 border-white/10 md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            Vibe Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-4xl font-bold text-white">{vibeScore}</div>
            <div className="text-sm text-white/50">out of 10</div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${vibeScore * 10}%` }}
            />
          </div>
          <p className="text-sm text-white/70">
            {vibeScore >= 7
              ? 'High energy and enthusiasm from viewers!'
              : vibeScore >= 5
              ? 'Moderate engagement with room for improvement.'
              : 'Low energy - consider more engaging content.'}
          </p>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-zinc-900/60 border-white/10 md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
            </div>
            AI Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {generatedTips.slice(0, 4).map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-yellow-500 mt-0.5">★</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function generateTips(vibeScore: number, praises: string[], criticisms: string[]): string[] {
  const tips: string[] = [];

  if (vibeScore >= 7) {
    tips.push('Your content is resonating well! Double down on what\'s working.');
  } else if (vibeScore <= 4) {
    tips.push('Consider experimenting with different content formats to boost engagement.');
  }

  if (criticisms.length > 0) {
    tips.push(`Address the top concern: "${criticisms[0]}" in your next video.`);
  }

  if (praises.length > 0) {
    tips.push(`Viewers love: "${praises[0]}" - feature this more prominently.`);
  }

  tips.push('Engage with commenters to build community loyalty.');
  tips.push('Pin a comment addressing the most common question.');

  return tips;
}
