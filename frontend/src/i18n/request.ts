import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const messages = (await import("./messages/ar.json")).default;
  return {
    locale: "ar",
    messages,
  };
});
