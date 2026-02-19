import { createAuthRouter as createSaflibAuthRouter } from "@saflib/auth";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks, rootLinks } from "@sderickson/hub-links";

export const createAuthRouter = () => {
  return createSaflibAuthRouter({
    loginRedirect: linkToHrefWithHost(appLinks.home),
    registerRedirect: linkToHrefWithHost(appLinks.home),
    logoutRedirect: linkToHrefWithHost(rootLinks.home),
  });
};
