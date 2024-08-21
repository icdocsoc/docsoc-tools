export type StatusReturn =
    | {
          status: "success";
          message?: string;
      }
    | {
          status: "error";
          error: string;
      }
    | {
          status: "pending";
      };
