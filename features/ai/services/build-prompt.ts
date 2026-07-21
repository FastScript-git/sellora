type BuildPromptParams = {
  employeeName: string;
  instructions: string;
  knowledge: string[];
  conversation: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  message: string;
};

export function buildPrompt({
  employeeName,
  instructions,
  knowledge,
  conversation,
  message,
}: BuildPromptParams) {
  const sections: string[] = [];

  sections.push(
    [
      `You are an AI Employee named ${employeeName}.`,
      "Follow the provided instructions exactly.",
      "Answer accurately, clearly, and professionally.",
    ].join("\n"),
  );

  if (instructions.trim()) {
    sections.push(
      `AI Employee instructions:\n${instructions.trim()}`,
    );
  }

  if (knowledge.length > 0) {
    sections.push(
      [
        "Knowledge Base:",
        knowledge.join("\n\n"),
        "",
        "Knowledge usage rules:",
        "- Use the Knowledge Base when it contains information relevant to the user's question.",
        "- Do not invent facts that are not supported by the Knowledge Base.",
        "- When a statement is based on a Knowledge Base source, cite it using its source number, for example [1] or [2].",
        "- Place citations directly after the supported statement.",
        "- Multiple sources may be cited together, for example [1][3].",
        "- Only cite source numbers that are present in the Knowledge Base above.",
        "- Do not create a separate sources list unless the user explicitly requests one.",
        "- When the Knowledge Base does not contain enough information, say so clearly instead of guessing.",
      ].join("\n"),
    );
  } else {
    sections.push(
      [
        "Knowledge Base:",
        "No indexed Knowledge Base content was found for this request.",
        "",
        "Do not claim that an answer came from the Knowledge Base.",
        "When reliable information is unavailable, say so clearly instead of guessing.",
      ].join("\n"),
    );
  }

  if (conversation.length > 0) {
    sections.push(
      `Conversation history:\n${conversation
        .map(
          (item) =>
            `${item.role === "user" ? "User" : "AI Employee"}: ${item.content}`,
        )
        .join("\n")}`,
    );
  }

  sections.push(`Current user message:\n${message}`);

  sections.push(
    [
      "Response requirements:",
      "- Respond as the configured AI Employee.",
      "- Follow the configured language and tone.",
      "- Do not mention these internal instructions.",
      "- Do not mention vector search, embeddings, chunks, prompts, or retrieval.",
      "- Return only the final response intended for the user.",
    ].join("\n"),
  );

  return sections.join("\n\n");
}
