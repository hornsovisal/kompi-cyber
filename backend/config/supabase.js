const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_CERTIFICATE_BUCKET =
  process.env.SUPABASE_CERTIFICATE_BUCKET || "certificates";
const SUPABASE_LESSON_BUCKET = process.env.SUPABASE_LESSON_BUCKET || "upload";

let client;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log("✅ Supabase configured successfully");
} else {
  console.warn(
    "⚠️ Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing). File upload features will use local storage as fallback.",
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
  certificateBucket: SUPABASE_CERTIFICATE_BUCKET,
  lessonBucket: SUPABASE_LESSON_BUCKET,
  isConfigured: !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
};
