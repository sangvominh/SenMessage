import Dexie, { type Table } from "dexie";
import type { Conversation, Message, AnalysisBatch } from "../../models/types";

export class SenMessageDB extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  batches!: Table<AnalysisBatch>;

  constructor() {
    super("SenMessageDB");
    this.version(1).stores({
      conversations: "id, title, messageCount",
      messages: "id, [conversationId+order], [conversationId+sweetnessScore], conversationId",
      batches: "++id, conversationId, status",
    });
  }
}

export const db = new SenMessageDB();
