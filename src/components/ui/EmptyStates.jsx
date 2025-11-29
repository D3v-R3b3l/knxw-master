import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  FileX, 
  Users, 
  BarChart, 
  Settings,
  RefreshCw,
  AlertTriangle,
  Wifi,
  Database
} from 'lucide-react';
import { cn } from "@/lib/utils";

const iconMap = {
  search: Search,
  filter: Filter,
  file: FileX,
  users: Users,
  chart: BarChart,
  settings: Settings,
  network: Wifi,
  database: Database,
  error: AlertTriangle
};

export default function EmptyState({
  icon = "file",
  title,
  description,
  action,
  secondaryAction,
  className = "",
  size = "default"
}) {
  const Icon = iconMap[icon] || FileX;
  
  const sizeClasses = {
    sm: "py-8",
    default: "py-12", 
    lg: "py-16"
  };

  const iconSizes = {
    sm: "w-12 h-12",
    default: "w-16 h-16",
    lg: "w-20 h-20"
  };

  return (
    <div className={cn("text-center", sizeClasses[size], className)}>
      <div className={cn(
        "bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4",
        iconSizes[size]
      )}>
        <Icon className="w-8 h-8 text-[#a3a3a3]" />
      </div>
      
      {title && (
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      )}
      
      {description && (
        <p className="text-[#a3a3a3] mb-6 max-w-md mx-auto">{description}</p>
      )}
      
      {action && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={action.onClick}
            className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 mr-2" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized empty states
export const NoDataFound = ({ onRefresh, onClearFilters }) => (
  <EmptyState
    icon="search"
    title="No data found"
    description="We couldn't find any results matching your criteria. Try adjusting your search or filters."
    action={{
      label: "Clear Filters",
      onClick: onClearFilters,
      icon: Filter
    }}
    secondaryAction={onRefresh ? {
      label: "Refresh",
      onClick: onRefresh,
      icon: RefreshCw
    } : null}
  />
);

export const NoUsers = ({ onCreate }) => (
  <EmptyState
    icon="users"
    title="No users yet"
    description="Get started by adding your first user or importing from an external system."
    action={{
      label: "Add User",
      onClick: onCreate,
      icon: Plus
    }}
  />
);

export const NoInsights = ({ onAnalyze }) => (
  <EmptyState
    icon="chart"
    title="No insights available"
    description="Insights will appear here once we have enough behavioral data to analyze. Make sure tracking is properly configured."
    action={onAnalyze ? {
      label: "Run Analysis",
      onClick: onAnalyze,
      icon: BarChart
    } : null}
  />
);

export const ConnectionError = ({ onRetry }) => (
  <EmptyState
    icon="network"
    title="Connection Error"
    description="We're having trouble connecting to our servers. Please check your internet connection and try again."
    action={{
      label: "Try Again",
      onClick: onRetry,
      icon: RefreshCw
    }}
    size="lg"
  />
);

export const DatabaseError = ({ onRetry, onContact }) => (
  <EmptyState
    icon="database"
    title="Database Error"
    description="We're experiencing technical difficulties. Our team has been notified and is working on a fix."
    action={onRetry ? {
      label: "Retry",
      onClick: onRetry,
      icon: RefreshCw
    } : null}
    secondaryAction={onContact ? {
      label: "Contact Support",
      onClick: onContact,
      icon: Settings
    } : null}
    size="lg"
  />
);

export const ComingSoon = ({ feature, onNotify }) => (
  <EmptyState
    icon="settings"
    title="Coming Soon"
    description={`${feature} is currently in development. We'll notify you when it's ready.`}
    action={onNotify ? {
      label: "Get Notified",
      onClick: onNotify,
      icon: Settings
    } : null}
  />
);