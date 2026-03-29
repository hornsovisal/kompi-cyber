const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn(
    "Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing). Certificate upload features are disabled.",
  );

  supabase = {
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error("Supabase is not configured.") }),
        getPublicUrl: () => ({ data: { publicUrl: null } }),
      }),
    },
  };
}

module.exports = supabase;
