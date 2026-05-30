export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { adminEmail } = request.body;

    if (!adminEmail) {
      return response.status(400).json({
        error: "Admin email is required.",
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
      `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(
        adminEmail
      )}&select=email`,
      {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const admins = await adminCheck.json();

    if (!Array.isArray(admins) || admins.length === 0) {
      return response.status(403).json({
        error: "You are not authorized to view users.",
      });
    }

    const usersResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users`,
      {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await usersResponse.json();

    if (!usersResponse.ok) {
      return response.status(400).json({
        error: data.msg || data.error_description || "Could not fetch users.",
      });
    }

    return response.status(200).json({
      users: data.users || [],
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message || "Something went wrong.",
    });
  }
}