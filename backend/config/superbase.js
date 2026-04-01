// Backward-compat shim for old misspelled imports.
// Prefer: require("../config/supabase")
module.exports = require("./supabase").client;
