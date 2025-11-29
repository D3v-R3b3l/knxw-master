import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, Shield } from 'lucide-react';

const calloutTypes = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    iconColor: 'text-blue-500'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    iconColor: 'text-yellow-500'
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    iconColor: 'text-green-500'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    iconColor: 'text-red-500'
  },
  security: {
    icon: Shield,
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    iconColor: 'text-purple-500'
  },
  strategy: {
    icon: Info,
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    iconColor: 'text-cyan-500'
  }
};

export default function Callout({ type = 'info', title, children }) {
  const config = calloutTypes[type] || calloutTypes.info;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 my-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${config.textColor} mb-2`}>
              {title}
            </h4>
          )}
          <div className="text-[#cbd5e1] text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}