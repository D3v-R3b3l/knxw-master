// Preserve casing so that <Link to={createPageUrl('Dashboard')}> resolves to /Dashboard,
// which matches the PascalCase routes registered in App.jsx / pages.config.js.
// Spaces are replaced with hyphens for human-friendly names.
export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}