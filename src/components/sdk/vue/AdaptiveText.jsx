import React from 'react';

export default function AdaptiveTextVue({ baseText = '', as: Tag = 'span', className = '' }) {
  return <Tag className={className}>{baseText}</Tag>;
}