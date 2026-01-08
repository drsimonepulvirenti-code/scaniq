import { useState, useCallback } from 'react';
import { Upload, Loader2, AlertTriangle, AlertCircle, Info, CheckCircle, Eye, EyeOff, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExperimentIssue {
  id: string;
  element_name: string;
  approximate_location: string;
  description: string;
  kb_rule_reference: string;
  severity: 'error' | 'warning' | 'info';
}

interface AnalysisResult {
  issues: ExperimentIssue[];
  summary: string;
}

type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

export const Experiments = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const analyzeScreenshot = async (base64: string, mime: string) => {
    setStatus('processing');
    try {
      const { data, error } = await supabase.functions.invoke('analyze-experiment', {
        body: { imageBase64: base64, mimeType: mime }
      });

      if (error) throw error;
      
      setResult(data);
      setStatus('ready');
      
      if (data.issues?.length === 0) {
        toast.success('No issues found!');
      } else {
        toast.info(`Found ${data.issues?.length || 0} issues`);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setStatus('failed');
      toast.error('Analysis failed. Please try again.');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setStatus('uploading');
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setScreenshot(dataUrl);
      setMimeType(file.type);
      await analyzeScreenshot(base64, file.type);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled: status === 'uploading' || status === 'processing',
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Warning</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getLocationPosition = (location: string): { top: string; left: string } => {
    const loc = location.toLowerCase();
    if (loc.includes('top') && loc.includes('left')) return { top: '10%', left: '15%' };
    if (loc.includes('top') && loc.includes('right')) return { top: '10%', left: '85%' };
    if (loc.includes('bottom') && loc.includes('left')) return { top: '85%', left: '15%' };
    if (loc.includes('bottom') && loc.includes('right')) return { top: '85%', left: '85%' };
    if (loc.includes('top')) return { top: '10%', left: '50%' };
    if (loc.includes('bottom')) return { top: '85%', left: '50%' };
    if (loc.includes('left')) return { top: '50%', left: '15%' };
    if (loc.includes('right')) return { top: '50%', left: '85%' };
    if (loc.includes('center')) return { top: '50%', left: '50%' };
    return { top: '50%', left: '50%' };
  };

  const reset = () => {
    setScreenshot(null);
    setResult(null);
    setStatus('idle');
    setShowOverlay(false);
    setExpandedIssue(null);
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Experiments Feedback</h2>
          <p className="text-muted-foreground">
            Upload experiment screenshots to validate against Knowledge Base rules and get structured feedback.
          </p>
        </div>

        {!screenshot ? (
          // Upload state
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
              (status === 'uploading' || status === 'processing') && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {isDragActive ? 'Drop screenshot here' : 'Upload experiment screenshot'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a screenshot, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: PNG, JPG (max 10MB)
            </p>
          </div>
        ) : (
          // Results view
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Screenshot preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={reset} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  New Screenshot
                </Button>
                {result && result.issues.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show overlay</span>
                    <Switch checked={showOverlay} onCheckedChange={setShowOverlay} />
                  </div>
                )}
              </div>

              <Card className="overflow-hidden relative">
                <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Experiment Screenshot</span>
                  {status === 'processing' && (
                    <Badge variant="secondary" className="ml-auto">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Analyzing...
                    </Badge>
                  )}
                  {status === 'ready' && (
                    <Badge variant="default" className="ml-auto bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>

                <div className="relative">
                  <img 
                    src={screenshot} 
                    alt="Experiment screenshot" 
                    className="w-full h-auto"
                  />

                  {/* Overlay balloons */}
                  {showOverlay && result?.issues.map((issue) => {
                    const pos = getLocationPosition(issue.approximate_location);
                    return (
                      <div
                        key={issue.id}
                        className={cn(
                          'absolute w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 shadow-lg',
                          issue.severity === 'error' && 'bg-destructive',
                          issue.severity === 'warning' && 'bg-yellow-500',
                          issue.severity === 'info' && 'bg-blue-500',
                          expandedIssue === issue.id && 'ring-2 ring-offset-2 ring-offset-background'
                        )}
                        style={{ top: pos.top, left: pos.left }}
                        onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                      >
                        <span className="text-white text-xs font-bold">
                          {result.issues.indexOf(issue) + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Issues panel */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Analysis Results
              </h3>

              {status === 'processing' && (
                <Card className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Analyzing screenshot against KB rules...</p>
                </Card>
              )}

              {status === 'failed' && (
                <Card className="p-8 text-center border-destructive/50">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
                  <p className="text-foreground font-medium mb-2">Analysis Failed</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unable to analyze the screenshot. Please try again.
                  </p>
                  <Button onClick={reset}>Try Again</Button>
                </Card>
              )}

              {status === 'ready' && result && (
                <>
                  {/* Summary */}
                  {result.summary && (
                    <Card className="p-4 mb-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">{result.summary}</p>
                    </Card>
                  )}

                  {/* Issues list */}
                  {result.issues.length === 0 ? (
                    <Card className="p-8 text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-500" />
                      <p className="text-foreground font-medium mb-2">No Issues Found</p>
                      <p className="text-sm text-muted-foreground">
                        This experiment screenshot passes all Knowledge Base checks.
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {result.issues.map((issue, index) => (
                        <Card 
                          key={issue.id}
                          className={cn(
                            'p-4 cursor-pointer transition-all',
                            expandedIssue === issue.id && 'ring-2 ring-primary'
                          )}
                          onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold',
                              issue.severity === 'error' && 'bg-destructive',
                              issue.severity === 'warning' && 'bg-yellow-500',
                              issue.severity === 'info' && 'bg-blue-500'
                            )}>
                              {index + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground">{issue.element_name}</h4>
                                {getSeverityBadge(issue.severity)}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {issue.description}
                              </p>

                              {expandedIssue === issue.id && (
                                <div className="mt-3 pt-3 border-t border-border space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Location:</span>
                                    <span className="text-foreground">{issue.approximate_location}</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm">
                                    <span className="text-muted-foreground shrink-0">KB Rule:</span>
                                    <span className="text-foreground">{issue.kb_rule_reference}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Info section */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">How it works</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Upload a screenshot from your experiment variant</li>
            <li>• AI analyzes the screenshot against your active Knowledge Base rules</li>
            <li>• Issues are highlighted with element names, locations, and rule references</li>
            <li>• Toggle overlay to see issues directly on the screenshot</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
