// The validation statuses a page can have, and the label each one shows.
export const statuses = ["technical-test"] as const;

export type Status = (typeof statuses)[number];

export const statusLabels: Record<Status, string> = {
  "technical-test": "Technical test, not a lesson",
};
