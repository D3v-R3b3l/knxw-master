import React from 'react';

export default function AdaptiveButtonVue({ children, ...props }) {
  return <button {...props}>{children}</button>;
}