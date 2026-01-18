import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UpdateUserRequest {
  userId: string;
  fullName?: string;
  department?: string;
  role?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: requestingUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if requesting user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin.rpc(
      "get_user_role",
      { user_id: requestingUser.id },
    );

    if (roleError || roleData !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only administrators can update users" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse request body
    const { userId, fullName, department, role }: UpdateUserRequest =
      await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: userId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate role if provided
    if (role && !["admin", "legal_officer"].includes(role)) {
      return new Response(
        JSON.stringify({
          error: "Invalid role. Must be 'admin' or 'legal_officer'",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile if name or department provided
    if (fullName || department) {
      const updateData: any = {};
      if (fullName) updateData.full_name = fullName;
      if (department) updateData.department = department;

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return new Response(
          JSON.stringify({ error: "Failed to update user profile" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Update role if provided
    if (role) {
      // First delete existing role
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);

      // Then insert new role
      const { error: roleAssignError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: userId,
          role: role,
        });

      if (roleAssignError) {
        console.error("Error updating role:", roleAssignError);
        return new Response(
          JSON.stringify({ error: "Failed to update user role" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    console.log(`User updated successfully: ${existingUser.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User updated successfully",
        user: {
          id: userId,
          email: existingUser.email,
          fullName: fullName || existingUser.full_name,
          department: department,
          role: role,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
