export function isAuthenticated() {
  return Boolean(sessionStorage.getItem("token"));
}
