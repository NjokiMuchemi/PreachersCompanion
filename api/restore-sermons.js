export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { adminEmail, backup } = request.body;

    if (!adminEmail || !backup) {
      return response.status(400).json({
        error: "Admin email and backup data are required.",
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
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const admins = await adminCheck.json();

    if (!Array.isArray(admins) || admins.length === 0) {
      return response.status(403).json({
        error: "You are not authorized to restore sermons.",
      });
    }

    const sermons = Array.isArray(backup.sermons) ? backup.sermons : [];

    if (sermons.length === 0) {
      return response.status(400).json({
        error: "Backup file does not contain sermons.",
      });
    }

    const cleanedSermons = sermons.map((sermon) => ({
      id: sermon.id,
      user_id: sermon.user_id,
      title: sermon.title || "Untitled Sermon",
      category: sermon.category || "",
      scripture: sermon.scripture || "",
      content: sermon.content || "",
      tags: Array.isArray(sermon.tags) ? sermon.tags : [],
      is_favorite: sermon.is_favorite || false,
      is_deleted: sermon.is_deleted || false,
      created_at: sermon.created_at || new Date().toISOString(),
      updated_at: sermon.updated_at || new Date().toISOString(),
    }));

    const restoreResponse = await fetch(
      `${supabaseUrl}/rest/v1/sermons?on_conflict=id`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(cleanedSermons),
      }
    );

    const restored = await restoreResponse.json();

    if (!restoreResponse.ok) {
      return response.status(400).json({
        error:
          restored.message ||
          restored.details ||
          "Could not restore sermon backup.",
      });
    }

    return response.status(200).json({
      message: "Backup restored successfully.",
      restored_count: restored.length,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message || "Something went wrong.",
    });
  }
}