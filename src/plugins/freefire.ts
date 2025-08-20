import { Elysia, t, StatusMap } from "elysia";

import { freefire } from "@/handlers/freefire";

export default new Elysia({ name: "freefire" })
  .model({
    "freefire.query": t.Object({
      id: t.String(),
    }),
    "freefire.response": t.Object({
      success: t.Boolean(),
      code: t.Numeric(),
      data: t.Object({
        game: t.String(),
        account: t.Object({
          ign: t.String(),
          id: t.String(),
        }),
      }),
    }),
  })
  .get("/freefire", ({ query: { id } }) => freefire({ id }), {
    query: "freefire.query",
    response: "freefire.response",
    error({ code, error, set }) {
      if (code === "VALIDATION") {
        set.status = "Bad Request";

        return {
          success: false,
          code: StatusMap["Bad Request"],
          errors: error.all
            .filter((err) => {
              return "type" in err && err.type === 54;
            })
            .map((err) => {
              return {
                path: "path" in err && err.path,
                name: "message" in err && err.message,
                message: err.summary,
              };
            }),
        };
      }

      if (code === "UNKNOWN") {
        set.status = "Not Found";

        return {
          success: false,
          code: StatusMap["Not Found"],
          error: {
            name: error.name,
            message: error.message,
          },
        };
      }
    },
  });
