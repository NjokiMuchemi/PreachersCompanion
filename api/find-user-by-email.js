export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { adminEmail, recipientEmail } = request.body;

    if (!recipientEmail) {
      return response.status(400).json({
        error: "Recipient email is required.",
      });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return response.status(500).json({
        error: "Supabase server environment variables are missing.",
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

    const user = (data.users || []).find(
      (item) =>
        item.email &&
        item.email.toLowerCase() === recipientEmail.toLowerCase()
    );

    if (!user) {
      return response.status(404).json({
        error: "No approved user found with that email.",
      });
    }

    return response.status(200).json({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || "",
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message || "Something went wrong.",
    });
  }
}