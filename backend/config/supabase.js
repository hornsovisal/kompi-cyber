const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "certificates";

let client;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
} else {
  console.warn(
    "Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing). Certificate upload features are disabled.",
  );

  client = {
    storage: {
      from: () => ({
        upload: async () => ({
          data: null,
          error: new Error("Supabase is not configured."),
        }),
        getPublicUrl: () => ({ data: { publicUrl: null } }),
      }),
    },
  };
}

module.exports = {
  client,
  bucket: SUPABASE_BUCKET,
};
