import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Comment } from '@/api/types';

interface ViewAllCommentsProps {
  comments: Comment[];
}

const COMMENTS_PER_PAGE = 20;

export function ViewAllComments({ comments }: ViewAllCommentsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!comments || comments.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
  const paginatedComments = comments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);

  return (
    <Card className="bg-zinc-900/60 border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <MessageCircle className="w-5 h-5 text-red-500" />
            All Comments ({comments.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            {isExpanded ? 'Hide Comments' : 'View All Comments'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {paginatedComments.map((comment, index) => (
              <div
                key={startIndex + index}
                className="bg-white/5 rounded-lg p-3 border border-white/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-white/90 mb-2">{comment.text}</p>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="font-medium text-white/60">{comment.author || 'Anonymous'}</span>
                      {comment.like_count > 0 && (
                        <span>👍 {comment.like_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-white/50">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
