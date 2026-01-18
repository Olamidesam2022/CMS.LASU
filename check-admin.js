import { createClient } from "@supabase/supabase-js";

// You'll need to replace these with your actual Supabase URL and anon key
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAdminSetup() {
  console.log("🔍 Checking admin user setup...\n");

  try {
    // Check user_roles table for admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select(
        `
        user_id,
        role,
        profiles (
          email,
          full_name,
          department
        )
      `,
      )
      .eq("role", "admin");

    if (rolesError) {
      console.error("❌ Error fetching admin roles:", rolesError.message);
      return;
    }

    console.log("👤 Admin users in user_roles table:");
    if (adminRoles && adminRoles.length > 0) {
      adminRoles.forEach((role, index) => {
        console.log(`  ${index + 1}. User ID: ${role.user_id}`);
        console.log(`     Role: ${role.role}`);
        console.log(`     Email: ${role.profiles?.email || "N/A"}`);
        console.log(`     Name: ${role.profiles?.full_name || "N/A"}`);
        console.log(`     Department: ${role.profiles?.department || "N/A"}`);
        console.log("");
      });
    } else {
      console.log("  ❌ No admin users found in user_roles table");
    }

    // Check auth.users for the admin email
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Error fetching auth users:", authError.message);
    } else {
      const adminUser = authUsers.users.find(
        (u) => u.email === "admin@lasu.edu.ng",
      );
      if (adminUser) {
        console.log("✅ Admin user found in auth.users:");
        console.log(`  Email: ${adminUser.email}`);
        console.log(`  User ID: ${adminUser.id}`);
        console.log(
          `  Confirmed: ${adminUser.email_confirmed_at ? "Yes" : "No"}`,
        );
        console.log(`  Created: ${adminUser.created_at}`);
      } else {
        console.log("❌ Admin user NOT found in auth.users table");
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

checkAdminSetup();
