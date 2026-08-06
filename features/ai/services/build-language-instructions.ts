type BuildLanguageInstructionsParams = {
  language: "EN" | "UK";
};

export function buildLanguageInstructions({
  language,
}: BuildLanguageInstructionsParams) {
  const fallbackLanguage =
    language === "UK"
      ? "Ukrainian"
      : "English";

  return [
    "Language rules:",
    "- Always respond in the same language as the user's latest message.",
    "- If the user changes language, switch to that language immediately.",
    "- Do not mention or explain the language switch.",
    `- Use ${fallbackLanguage} only when the user's language cannot be determined.`,
  ].join("\n");
}
