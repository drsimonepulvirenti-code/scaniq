import { useState } from 'react';
import { Send, FileText, CheckCircle2, AlertTriangle, XCircle, ThumbsUp, ThumbsDown, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Source {
  documentName: string;
  excerpt: string;
  similarity: number;
  chunkIndex: number;
}

interface QueryResult {
  answer: string;
  coverage: 'fully_supported' | 'partially_supported' | 'not_found';
  sources: Source[];
  chunksUsed: number;
}

interface KBTestModeProps {
  onBack: () => void;
  isKBReady: boolean;
  activeDocCount: number;
}

export const KBTestMode = ({ onBack, isKBReady, activeDocCount }: KBTestModeProps) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleSubmit = async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setFeedback(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to test the Knowledge Base');
        return;
      }

      const { data, error } = await supabase.functions.invoke('query-knowledge-base', {
        body: { question: question.trim(), userId: user.id }
      });

      if (error) throw error;

      setResult(data);
    } catch (error) {
      console.error('Error querying KB:', error);
      toast.error('Failed to query Knowledge Base');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (type: 'correct' | 'wrong') => {
    setFeedback(type);
    toast.success(type === 'correct' ? 'Marked as correct' : 'Marked as incorrect - thank you for the feedback');
    // In production, you'd log this feedback for system improvement
    console.log('User feedback:', { question, result, feedback: type });
  };

  const getCoverageBadge = (coverage: string) => {
    switch (coverage) {
      case 'fully_supported':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Fully Supported by KB
          </Badge>
        );
      case 'partially_supported':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
            <AlertTriangle className="w-3 h-3" />
            Partially Supported
          </Badge>
        );
      case 'not_found':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 gap-1">
            <XCircle className="w-3 h-3" />
            Not Found in KB
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Test Knowledge Base</h2>
              <p className="text-sm text-muted-foreground">
                Verify your KB answers correctly using only your documents
              </p>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        {!isKBReady ? (
          <Card className="p-6 mb-6 bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-medium text-foreground">Knowledge Base Not Ready</h3>
                <p className="text-sm text-muted-foreground">
                  {activeDocCount === 0 
                    ? "Upload at least one document to activate the Knowledge Base."
                    : "Documents are still processing. Test mode will be available shortly."}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 mb-6 bg-green-500/5 border-green-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <span className="font-medium text-foreground">Knowledge Base Active</span>
                <span className="text-muted-foreground ml-2">
                  {activeDocCount} document{activeDocCount !== 1 ? 's' : ''} ready
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Question input */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-3">
            <Textarea
              placeholder="Ask a question to test your Knowledge Base..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={!isKBReady || isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  handleSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Press ⌘+Enter to submit
              </span>
              <Button 
                onClick={handleSubmit} 
                disabled={!question.trim() || !isKBReady || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Querying...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Ask Question
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Answer */}
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-semibold text-foreground">Answer</h3>
                {getCoverageBadge(result.coverage)}
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                <p className="text-foreground whitespace-pre-wrap">{result.answer}</p>
              </div>

              {/* Validation controls */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Was this answer correct?</span>
                <div className="flex gap-2">
                  <Button
                    variant={feedback === 'correct' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback('correct')}
                    className={cn(
                      "gap-1.5",
                      feedback === 'correct' && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Correct
                  </Button>
                  <Button
                    variant={feedback === 'wrong' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback('wrong')}
                    className={cn(
                      "gap-1.5",
                      feedback === 'wrong' && "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Wrong
                  </Button>
                </div>
              </div>
            </Card>

            {/* Sources */}
            {result.sources.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Sources Used ({result.sources.length})
                </h3>
                <div className="space-y-3">
                  {result.sources.map((source, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-muted/30 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground text-sm">
                          {source.documentName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {source.similarity}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        "{source.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* No sources warning */}
            {result.sources.length === 0 && result.coverage === 'not_found' && (
              <Card className="p-6 bg-muted/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">No Matching Content Found</h4>
                    <p className="text-sm text-muted-foreground">
                      The Knowledge Base doesn't contain information relevant to this question. 
                      Consider uploading additional documents covering this topic.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Help text */}
        {!result && isKBReady && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              Ask any question to verify the AI uses your Knowledge Base correctly.
              <br />
              Answers will show source documents and coverage level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
