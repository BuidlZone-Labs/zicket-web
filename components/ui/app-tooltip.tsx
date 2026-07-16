import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function AppTooltip({
  label,
  children,
  side = 'top',
  delayDuration = 200,
  ...props
}: {
  label: string;
  children: React.ReactNode;
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>['side'];
  delayDuration?: number;
}) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger data-slot='app-tooltip-trigger' asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent data-slot='app-tooltip-content' side={side} {...props}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export { AppTooltip };