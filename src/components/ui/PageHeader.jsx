import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  docSection,
  actions 
}) {
  return (
    <div className="mb-8 pb-6 border-b border-white/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="p-3 rounded-2xl bg-[#1a1a1a] border border-[#262626] shadow-lg">
              <Icon className="w-6 h-6 text-[#00d4ff]" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {title}
              </h1>
              {docSection && (
                <Link to={`${createPageUrl('Documentation')}#${docSection}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-[#6b7280] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-full"
                    title="View documentation"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
            {description && (
              <p className="text-[#a3a3a3] text-sm md:text-base leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3 pl-14 md:pl-0">{actions}</div>}
      </div>
    </div>
  );
}