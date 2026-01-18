import fetch from "node-fetch"; // Install with: npm install node-fetch

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://hlomprczvofoeuzgtuqr.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "sb_publishable_oPJe5fFp-m__7JVpVvuE_g_P2c4w5Zw";

async function createAdmin() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/bootstrap-admin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "legal@lasu.edu.ng",
      password: "password123",
      fullName: "LASU LEGAL Admin",
    }),
  });

  const data = await response.json();
  console.log(data);
}

createAdmin();
