import React from "react"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#262626] ${className}`}
      {...props}
    />
  )
}

export { Skeleton }