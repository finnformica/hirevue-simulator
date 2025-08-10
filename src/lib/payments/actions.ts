"use server";

import { withUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { createCheckoutSession, createCustomerPortalSession } from "./stripe";

export const checkoutAction = withUser(async (formData, _) => {
  const priceId = formData.get("priceId") as string;
  await createCheckoutSession({ priceId });
});

export const customerPortalAction = withUser(async (_, user) => {
  const portalSession = await createCustomerPortalSession(user);
  redirect(portalSession.url);
});
