import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalyzeResponse } from '@/api/types';

interface PDFExportProps {
  results: AnalyzeResponse;
}

export function PDFExport({ results }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Create a printable HTML document
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download the PDF');
        return;
      }

      const { sentiment, channel_insights, video_metadata, topics, agent_summaries, report } = results;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>TubeInsight Analysis - ${video_metadata.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #dc2626; border-bottom: 3px solid #dc2626; padding-bottom: 10px; }
            h2 { color: #444; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
            h3 { color: #666; }
            .header { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-value { font-size: 24px; font-weight: bold; color: #dc2626; }
            .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
            .topic { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
            .sentiment-positive { color: #22c55e; }
            .sentiment-negative { color: #ef4444; }
            .sentiment-neutral { color: #eab308; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .card { background: #f9fafb; padding: 20px; border-radius: 8px; }
            .comment { background: #fff; border: 1px solid #e5e7eb; padding: 12px; margin: 8px 0; border-radius: 6px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
          <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
              🖨️ Print / Save as PDF
            </button>
          </div>

          <h1>📊 TubeInsight Analysis Report</h1>

          <div class="header">
            <h2>${video_metadata.title}</h2>
            <p><strong>Channel:</strong> ${channel_insights.channel_name}</p>
            <p><strong>Video URL:</strong> ${video_metadata.url}</p>
            <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="grid">
            <div class="metric">
              <div class="metric-value">${formatNumber(video_metadata.views)}</div>
              <div class="metric-label">Views</div>
            </div>
            <div class="metric">
              <div class="metric-value">${formatNumber(video_metadata.likes)}</div>
              <div class="metric-label">Likes</div>
            </div>
            <div class="metric">
              <div class="metric-value">${video_metadata.comment_count}</div>
              <div class="metric-label">Comments Analyzed</div>
            </div>
            <div class="metric">
              <div class="metric-value">${channel_insights.subscriber_count > 0 ? formatNumber(channel_insights.subscriber_count) : 'N/A'}</div>
              <div class="metric-label">Subscribers</div>
            </div>
          </div>

          <h2>💭 Sentiment Analysis</h2>
          <div class="grid">
            <div class="card">
              <h3>Overall Sentiment</h3>
              <p class="sentiment-${sentiment.label}">${sentiment.label.toUpperCase()}</p>
              <p>Score: ${sentiment.score.toFixed(2)}</p>
            </div>
            <div class="card">
              <h3>Scores</h3>
              <p>Vibe Score: ${sentiment.vibe_score}/10</p>
              <p>Likeness: ${sentiment.likeness_score}/10</p>
              <p>Toxicity: ${sentiment.toxicity_level}</p>
            </div>
          </div>

          ${sentiment.top_praises?.length ? `
          <h2>👍 What Viewers Loved</h2>
          <ul>
            ${sentiment.top_praises.map(p => `<li>${p}</li>`).join('')}
          </ul>
          ` : ''}

          ${sentiment.top_criticisms?.length ? `
          <h2>⚠️ Areas for Improvement</h2>
          <ul>
            ${sentiment.top_criticisms.map(c => `<li>${c}</li>`).join('')}
          </ul>
          ` : ''}

          ${sentiment.top_questions?.length ? `
          <h2>❓ Top Questions</h2>
          <ul>
            ${sentiment.top_questions.map(q => `<li>${q}</li>`).join('')}
          </ul>
          ` : ''}

          <h2>📌 Key Topics (${topics.length} identified)</h2>
          ${topics.map((t, i) => `
            <div class="topic">
              <strong>${i + 1}. ${t.label || t.name}</strong> (${t.size || t.comment_count} comments)
              ${t.description ? `<p>${t.description}</p>` : ''}
            </div>
          `).join('')}

          ${report ? `
          <h2>📝 Full Report</h2>
          <div class="card">
            <pre style="white-space: pre-wrap; font-family: inherit;">${report}</pre>
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by TubeInsight AI - ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      className="border-white/20 text-white hover:bg-white/10 hover:text-white"
    >
      <FileText className="w-4 h-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
