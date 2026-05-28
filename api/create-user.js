export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { adminEmail, email, password, fullName } = request.body;

    if (!adminEmail || !email || !password) {
      return response.status(400).json({
        error: "Admin email, user email, and password are required.",
      });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return response.status(500).json({
        error: "Supabase server environment variables are missing.",
      });
    }

    const adminCheck = await fetch(`${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(adminEmail)}&select=email`, {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    const admins = await adminCheck.json();

    if (!Array.isArray(admins) || admins.length === 0) {
      return response.status(403).json({
        error: "You are not authorized to create users.",
      });
    }

    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || "",
        },
      }),
    });

    const createdUser = await createUserResponse.json();

    if (!createUserResponse.ok) {
      return response.status(400).json({
        error: createdUser.msg || createdUser.error_description || "Could not create user.",
      });
    }

    return response.status(200).json({
      message: "User created successfully.",
      user: createdUser,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message || "Something went wrong.",
    });
  }
}