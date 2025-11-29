import React from 'react';

export default function Section({ title, id, icon: Icon, children }) {
  return (
    <section className="mb-8" id={id}>
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#262626]">
          {Icon && <Icon className="w-6 h-6 text-[#00d4ff]" />}
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
        </div>
      )}
      <div className="prose prose-invert max-w-none">
        {children}
      </div>
    </section>
  );
}