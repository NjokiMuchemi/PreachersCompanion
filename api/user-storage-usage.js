export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = request.body;

    if (!userId) {
      return response.status(400).json({ error: "User ID is required." });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return response.status(500).json({
        error: "Supabase server environment variables are missing.",
      });
    }

    const sermonsResponse = await fetch(
      `${supabaseUrl}/rest/v1/sermons?user_id=eq.${userId}&select=title,category,scripture,content,tags`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const sermons = await sermonsResponse.json();

    if (!sermonsResponse.ok) {
      return response.status(400).json({
        error: sermons.message || "Could not calculate sermon storage.",
      });
    }

    const sermonBytes = new TextEncoder().encode(
      JSON.stringify(sermons || [])
    ).length;

    const storageResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/list/sermon-images`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefix: `${userId}/`,
          limit: 1000,
          offset: 0,
          sortBy: {
            column: "name",
            order: "asc",
          },
        }),
      }
    );

    const files = await storageResponse.json();

    let imageBytes = 0;

    if (storageResponse.ok && Array.isArray(files)) {
      imageBytes = files.reduce((total, file) => {
        return total + (file.metadata?.size || 0);
      }, 0);
    }

    const totalBytes = sermonBytes + imageBytes;
    const usedMb = totalBytes / (1024 * 1024);
    const limitMb = 30;
    const remainingMb = Math.max(limitMb - usedMb, 0);

    const approximateSermonSizeMb = 0.06;
    const approximateSermonsRemaining = Math.floor(
      remainingMb / approximateSermonSizeMb
    );

    return response.status(200).json({
      limit_mb: limitMb,
      used_mb: Number(usedMb.toFixed(2)),
      remaining_mb: Number(remainingMb.toFixed(2)),
      percent_used: Number(((usedMb / limitMb) * 100).toFixed(1)),
      sermon_storage_mb: Number((sermonBytes / (1024 * 1024)).toFixed(2)),
      image_storage_mb: Number((imageBytes / (1024 * 1024)).toFixed(2)),
      approximate_sermons_remaining: approximateSermonsRemaining,
      max_image_size_kb: 500,
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message || "Something went wrong.",
    });
  }
}