import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "./DashboardStore";

// Normalize domain for display
function normalizeDisplayDomain(domain) {
  if (!domain) return '';
  
  let normalized = domain.trim().toLowerCase();
  
  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '');
  
  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');
  
  // Handle localhost
  if (normalized.startsWith('localhost') || normalized.startsWith('127.0.0.1')) {
    return 'localhost';
  }
  
  return normalized;
}

export default function AppSelector() {
  const { apps, selectedAppId, selectApp } = useDashboardStore();
  const [displayApps, setDisplayApps] = useState([]);

  useEffect(() => {
    if (!apps || !Array.isArray(apps) || apps.length === 0) {
      setDisplayApps([]);
      return;
    }

    // Deduplicate apps by normalizing domains
    const appMap = new Map();
    
    apps.forEach(app => {
      if (!app || !app.id) return;
      
      // Normalize authorized domains
      const normalizedDomains = (app.authorized_domains || [])
        .map(d => normalizeDisplayDomain(d))
        .filter(Boolean);
      
      // Create unique key based on owner and first domain
      const firstDomain = normalizedDomains[0] || 'unknown';
      const key = `${app.owner_id}_${firstDomain}`;
      
      // If we already have this app (by key), merge domains
      if (appMap.has(key)) {
        const existing = appMap.get(key);
        const mergedDomains = [...new Set([...existing.displayDomains, ...normalizedDomains])];
        appMap.set(key, { ...existing, displayDomains: mergedDomains });
      } else {
        appMap.set(key, {
          ...app,
          displayDomains: normalizedDomains
        });
      }
    });

    setDisplayApps(Array.from(appMap.values()));
  }, [apps]);

  if (!displayApps || displayApps.length === 0) return null;

  return (
    <div className="w-full md:w-72">
      <Select value={selectedAppId || ""} onValueChange={(v) => selectApp(v || null)}>
        <SelectTrigger className="bg-[#111111] border-[#262626] text-white">
          <SelectValue placeholder="Select App / Domain" />
        </SelectTrigger>
        <SelectContent className="bg-[#111111] border-[#262626] text-white">
          {displayApps.map((app) => (
            <SelectItem key={app.id} value={app.id} className="text-white hover:bg-[#262626] focus:bg-[#262626]">
              <div className="flex flex-col">
                <span className="font-medium">{app.name}</span>
                {app.displayDomains && app.displayDomains.length > 0 && (
                  <span className="text-xs text-[#a3a3a3]">
                    {app.displayDomains.slice(0, 2).join(", ")}
                    {app.displayDomains.length > 2 ? "…" : ""}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}