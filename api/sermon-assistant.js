export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, sermonText, prompt } = request.body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return response.status(500).json({
        error: "OPENAI_API_KEY is missing in Vercel environment variables.",
      });
    }

    const instructionMap = {
      outline:
        "Create a clear sermon outline with introduction, 3 to 5 main points, scriptures, illustrations, application, and conclusion.",
      expand:
        "Expand the selected sermon point into a stronger preaching section with explanation, scripture application, practical example, and transition.",
      prayer:
        "Create prayer points based on this sermon. Make them clear, biblical, and suitable for corporate prayer.",
      altar:
        "Create a powerful but respectful altar call based on this sermon.",
      summary:
        "Summarize this sermon into a clear brief summary with key message, main scriptures, and action points.",
      cleanup:
        "Clean up and structure this sermon note. Improve flow, headings, spacing, clarity, and preaching order without changing the core message.",
    };

    const selectedInstruction =
      instructionMap[action] || "Help improve this sermon note.";

    const finalPrompt = `
You are an experienced Christian sermon preparation assistant.

Task:
${selectedInstruction}

Additional user instruction:
${prompt || "None"}

Sermon / Notes:
${sermonText || "No sermon text provided."}
`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You help pastors, preachers, teachers, and speakers prepare clear, biblical, practical, and well-structured sermon content.",
          },
          {
            role: "user",
            content: finalPrompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return response.status(500).json({
        error: data.error?.message || "AI request failed.",
      });
    }

    return response.status(200).json({
      result: data.choices?.[0]?.message?.content || "",
    });
  } catch (error) {
    return response.status(500).json({
      error: error.message || "Something went wrong.",
    });
  }
}