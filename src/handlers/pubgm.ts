import { StatusMap } from "elysia";
import { NotFound } from "@/errors/NotFound";

import { type Response } from "@/types/Response";

type Query = {
  id: string;
};

export async function pubgm({ id }: Query) {
  const hit = await fetch("https://order-sg.codashop.com/initPayment.action", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://www.codashop.com",
      Referer: "https://www.codashop.com/",
    },
    body: new URLSearchParams({
      "voucherPricePoint.id": "58717",
      "voucherPricePoint.price": "16500",
      "voucherPricePoint.variablePrice": "0",
      "user.userId": id,
      "user.zoneId": "",
      voucherTypeName: "PUBG_MOBILE",
      shopLang: "id_ID",
    }),
  });

  const response: Pick<Response, "success" | "confirmationFields" | "user"> = await hit.json();

  if (!response.success) {
    throw new NotFound("IGN Tidak Ditemukan");
  }

  return {
    success: true,
    code: StatusMap.OK,
    data: {
      game: response.confirmationFields.productName,
      account: {
        ign: formatResponse(response.confirmationFields.username),
        id: response.user.userId,
      },
    },
  };
}

function formatResponse(text: string) {
  return text.replace(/\+/g, " ");
}
