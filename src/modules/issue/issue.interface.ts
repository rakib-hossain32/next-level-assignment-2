type Status = "open" | "in_progress" | "resolved";

export interface IIssueCreate {
  title: string;
  description: string;
  type: string;
  status?: Status;
}

export interface IParams {
  sort: "newest" | "oldest";
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
}
