type Status = "open" | "in_progress" | "resolved";

export interface IIssueCreate {
  title: string;
  description: string;
  type: string;
  status?: Status;
}
