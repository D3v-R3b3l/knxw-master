import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
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
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <Icon className="w-6 h-6 text-[#0a0a0a]" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {title}
              </h1>
              {docSection && (
                <Link to={`${createPageUrl('Documentation')}#${docSection}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-[#6b7280] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10"
                    title="View documentation for this page"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
            {description && (
              <p className="text-[#a3a3a3] text-lg mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}