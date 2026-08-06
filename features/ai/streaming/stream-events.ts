export type AIStreamUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type AIStreamCitation = {
  sourceId: string;
  sourceTitle: string;
  citationNumbers: number[];
};

export type AIStreamEvent =
  | {
      type: "conversation";
      conversationId: string;
    }
  | {
      type: "user_message";
      message: {
        id: string;
        content: string;
        createdAt: string;
      };
    }
  | {
      type: "assistant_message_started";
      messageId: string;
      createdAt: string;
    }
  | {
      type: "delta";
      messageId: string;
      delta: string;
    }
  | {
      type: "assistant_message";
      message: {
        id: string;
        content: string;
        createdAt: string;
      };
      citations: AIStreamCitation[];
    }
  | {
      type: "debug";
      model: string;
      latencyMs: number;
      usage: AIStreamUsage;
      knowledgeSources: number;
    }
  | {
      type: "done";
      conversationId: string;
    }
  | {
      type: "error";
      error: string;
      code?: string;
      conversationId?: string;
    };

const encoder = new TextEncoder();

export function encodeAIStreamEvent(
  event: AIStreamEvent,
) {
  return encoder.encode(
    `${JSON.stringify(event)}\n`,
  );
}

export function createAIStreamHeaders() {
  return new Headers({
    "Content-Type":
      "application/x-ndjson; charset=utf-8",
    "Cache-Control":
      "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Content-Type-Options": "nosniff",
  });
}
