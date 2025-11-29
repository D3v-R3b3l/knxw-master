import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { SkipToMain, SROnly } from '../ui/AccessibilityHelpers';
import ErrorBoundary from '../ui/ErrorBoundary';

export const DashboardGrid = ({ children, className = '' }) => (
  <div className={cn('grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6', className)}>
    {children}
  </div>
);

export const DashboardCard = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  headerAction,
  loading = false,
  error = null,
  'aria-label': ariaLabel
}) => (
  <Card 
    className={cn('bg-[#111111] border-[#262626]', className)}
    aria-label={ariaLabel || title}
  >
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-white text-lg">{title}</CardTitle>
          {subtitle && (
            <p className="text-[#a3a3a3] text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {headerAction}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <ErrorBoundary fallbackMessage={`Error loading ${title}`}>
        {error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]" />
            <SROnly>Loading {title}...</SROnly>
          </div>
        ) : children}
      </ErrorBoundary>
    </CardContent>
  </Card>
);

export const DashboardHeader = ({ title, subtitle, actions, className = '' }) => (
  <header className={cn('mb-8', className)}>
    <SkipToMain />
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-[#a3a3a3] mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  </header>
);

export const DashboardSection = ({ title, description, children, className = '' }) => (
  <section className={cn('mb-8', className)} aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <div className="mb-4">
      <h2 
        id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="text-xl font-semibold text-white"
      >
        {title}
      </h2>
      {description && (
        <p className="text-[#a3a3a3] text-sm mt-1">{description}</p>
      )}
    </div>
    {children}
  </section>
);