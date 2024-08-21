export type StatusReturn =
    | {
          status: "success";
      }
    | {
          status: "error";
          error: string;
      };
