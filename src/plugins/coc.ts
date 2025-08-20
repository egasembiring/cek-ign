import { Elysia, t, StatusMap } from "elysia";

import { coc } from "@/handlers/coc";

export default new Elysia({ name: "coc" })
  .model({
    "coc.query": t.Object({
      tag: t.String(),
    }),
    "coc.response": t.Object({
      success: t.Boolean(),
      code: t.Numeric(),
      data: t.Object({
        game: t.String(),
        account: t.Object({
          ign: t.String(),
          tag: t.String(),
        }),
      }),
    }),
  })
  .get("/coc", ({ query: { tag } }) => coc({ tag }), {
    query: "coc.query",
    response: "coc.response",
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
