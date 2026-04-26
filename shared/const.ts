export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const ONE_DAY_MS = 1000 * 60 * 60 * 24;
/** Session JWT and cookie lifetime — 30 days, industry-standard */
export const SESSION_TTL_MS = 30 * ONE_DAY_MS;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
