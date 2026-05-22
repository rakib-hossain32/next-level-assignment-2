export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
}