import { StatusMap } from "elysia";
import { NotFound } from "@/errors/NotFound";

import { type Response } from "@/types/Response";

type Query = {
  tag: string;
};

export async function coc({ tag }: Query) {
  const hit = await fetch("https://order-sg.codashop.com/initPayment.action", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://www.codashop.com",
      Referer: "https://www.codashop.com/",
    },
    body: new URLSearchParams({
      "voucherPricePoint.id": "40948",
      "voucherPricePoint.price": "16500",
      "voucherPricePoint.variablePrice": "0",
      "user.userId": tag.startsWith("#") ? tag : `#${tag}`,
      "user.zoneId": "",
      voucherTypeName: "CLASH_OF_CLANS",
      shopLang: "id_ID",
    }),
  });

  const response: Pick<Response, "success" | "confirmationFields" | "user"> = await hit.json();

  if (!response.success) {
    throw new NotFound("Player Tag Tidak Ditemukan");
  }

  return {
    success: true,
    code: StatusMap.OK,
    data: {
      game: response.confirmationFields.productName,
      account: {
        ign: formatResponse(response.confirmationFields.username),
        tag: response.user.userId,
      },
    },
  };
}

function formatResponse(text: string) {
  return text.replace(/\+/g, " ");
}
