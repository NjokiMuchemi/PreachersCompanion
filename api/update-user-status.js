export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { adminEmail, userId, action } = request.body;

    if (!adminEmail || !userId || !action) {
      return response.status(400).json({
        error: "Admin email, user ID, and action are required.",
      });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return response.status(500).json({
        error: "Supabase server environment variables are missing.",
      });
    }

    const adminCheck = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(adminEmail)}&select=email`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const admins = await adminCheck.json();

    if (!Array.isArray(admins) || admins.length === 0) {
      return response.status(403).json({
        error: "You are not authorized.",
      });
    }

    const banDuration = action === "suspend" ? "876000h" : "none";

    const updateResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        method: "PUT",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ban_duration: banDuration,
        }),
      }
    );

    const data = await updateResponse.json();

    if (!updateResponse.ok) {
      return response.status(400).json({
        error: data.msg || data.error_description || "Could not update user.",
      });
    }

    return response.status(200).json({
      message: action === "suspend" ? "User suspended." : "User reactivated.",
      user: data,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message || "Something went wrong.",
    });
  }
}