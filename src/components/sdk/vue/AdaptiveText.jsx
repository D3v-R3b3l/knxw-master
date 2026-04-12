import React from 'react';

export default function AdaptiveTextVue({ baseText = '', as: Component = 'span', className = '' }) {
  return <Component className={className}>{baseText}</Component>;
}