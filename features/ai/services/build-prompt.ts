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
    `You are an AI Employee named ${employeeName}.`,
  );

  if (instructions.trim()) {
    sections.push(
      `Instructions:\n${instructions.trim()}`,
    );
  }

  if (knowledge.length > 0) {
    sections.push(
      `Knowledge:\n${knowledge.join("\n\n")}`,
    );
  }

  if (conversation.length > 0) {
    sections.push(
      `Conversation:\n${conversation
        .map(
          (item) =>
            `${item.role}: ${item.content}`,
        )
        .join("\n")}`,
    );
  }

  sections.push(`User:\n${message}`);

  return sections.join("\n\n");
}