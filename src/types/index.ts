export * from "../lib/schema";

export interface StreamEvent {
  type: string;
  data: unknown;
  message: string;
}
