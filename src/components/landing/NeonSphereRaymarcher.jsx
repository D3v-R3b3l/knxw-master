import React from 'react';

/**
 * NeonSphereRaymarcher - Simplified CSS version
 * Replaces complex 3D shader with CSS gradients for stability
 */
export default function NeonSphereRaymarcher({ className = "" }) {
  return (
    <div className={`w-full h-full ${className} relative overflow-hidden bg-[#0a0a0a]`}>
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Cyan orb */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)',
            top: '20%',
            left: '30%',
            animationDuration: '4s'
          }}
        />
        
        {/* Purple orb */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
            top: '50%',
            right: '20%',
            animationDuration: '5s',
            animationDelay: '1s'
          }}
        />
        
        {/* Blue orb */}
        <div 
          className="absolute w-[350px] h-[350px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)',
            bottom: '20%',
            left: '40%',
            animationDuration: '6s',
            animationDelay: '2s'
          }}
        />
      </div>
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}