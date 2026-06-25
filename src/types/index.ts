export * from "../lib/schema";

export interface StreamEvent {
  type: string;
  data: any;
  message: string;
}
