// Centralized brand assets. Update the URL here to swap the logo app-wide.
// Logo guidance: SVG preferred. If raster, PNG with transparent background,
// ≥256px tall (sharp at 2x for the largest in-app render size of h-16).
//
// Self-hosted Keycove mark: drop the file at client/public/keycove-logo.png
// (transparent background ideal). Served same-origin, so it survives the
// leasely.net → keycove.net domain move with no URL change. If the file is
// missing, the <img onError> in Navbar/DashboardLayout hides it gracefully.
export const LOGO_URL = "/keycove-logo.png";
