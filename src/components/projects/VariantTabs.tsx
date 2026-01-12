import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Clock } from 'lucide-react';
import { UrlVariant } from '@/hooks/useProjects';
import { formatDistanceToNow } from 'date-fns';

interface VariantTabsProps {
  variants: UrlVariant[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const VariantTabs = ({ variants, onApprove, onReject }: VariantTabsProps) => {
  const pendingVariants = variants.filter(v => v.status === 'pending');
  const approvedVariants = variants.filter(v => v.status === 'approved');

  const VariantCard = ({ variant, showActions }: { variant: UrlVariant; showActions?: boolean }) => (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted relative">
        {variant.frame ? (
          <img
            src={variant.frame}
            alt={variant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{variant.name}</h4>
            {variant.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {variant.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={variant.status === 'approved' ? 'default' : 'secondary'}>
                {variant.status}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(variant.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {showActions && variant.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onApprove(variant.id)}
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => onReject(variant.id)}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList>
        <TabsTrigger value="pending" className="gap-2">
          Pending
          {pendingVariants.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingVariants.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved" className="gap-2">
          Approved
          {approvedVariants.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {approvedVariants.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4">
        {pendingVariants.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pending variants</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingVariants.map(variant => (
              <VariantCard key={variant.id} variant={variant} showActions />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="approved" className="mt-4">
        {approvedVariants.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No approved variants yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedVariants.map(variant => (
              <VariantCard key={variant.id} variant={variant} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
