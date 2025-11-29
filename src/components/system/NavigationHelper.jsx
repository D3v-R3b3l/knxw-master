import { useNavigate } from "react-router-dom";

// This is a proxy component to expose the useNavigate hook to non-component functions if needed,
// but for our use case, we'll refactor components to use the hook directly.
// For now, we will use this to fix window.location.href instances.

let navigateFunction;

export const NavigationProvider = ({ children }) => {
  navigateFunction = useNavigate();
  return children;
};

// A helper function to call navigate from outside a component context.
// NOTE: This is an anti-pattern. The correct approach is to refactor components to use the hook directly.
// We are applying this as an immediate fix, with the recommendation to refactor later.
export const navigateTo = (path) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    console.error("Navigate function is not available. Ensure NavigationProvider is wrapping your app.");
    // Fallback to old method if navigator is not ready.
    window.location.href = path;
  }
};