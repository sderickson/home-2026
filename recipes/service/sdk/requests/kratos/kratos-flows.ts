import type { LoginFlow, LogoutFlow, RegistrationFlow } from "@ory/client";
import { getKratosFrontendApi } from "./kratos-client.ts";

export async function fetchBrowserLoginFlow(): Promise<LoginFlow> {
  const res = await getKratosFrontendApi().createBrowserLoginFlow({});
  return res.data;
}

/** `returnTo` is sent to Kratos as `return_to` and echoed on {@link RegistrationFlow.return_to}. */
export async function fetchBrowserRegistrationFlow(
  returnTo?: string,
): Promise<RegistrationFlow> {
  const res = await getKratosFrontendApi().createBrowserRegistrationFlow(
    returnTo ? { returnTo } : {},
  );
  return res.data;
}

export async function fetchLoginFlowById(flowId: string): Promise<LoginFlow> {
  const res = await getKratosFrontendApi().getLoginFlow({ id: flowId });
  return res.data;
}

export async function fetchRegistrationFlowById(flowId: string): Promise<RegistrationFlow> {
  const res = await getKratosFrontendApi().getRegistrationFlow({ id: flowId });
  return res.data;
}

export async function fetchBrowserLogoutFlow(returnTo?: string): Promise<LogoutFlow> {
  const res = await getKratosFrontendApi().createBrowserLogoutFlow({ returnTo });
  return res.data;
}
