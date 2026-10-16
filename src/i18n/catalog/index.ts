import type { Catalog } from "./types";
import admin from "./admin";
import auth from "./auth";
import common from "./common";
import design from "./design";
import home from "./home";
import learn from "./learn";
import learn2 from "./learn2";
import legal from "./legal";
import member from "./member";
import messages from "./messages";
import requests from "./requests";
import site from "./site";
import stories from "./stories";
import volunteer from "./volunteer";

/* One catalog per area of the site. Simple, everyday Hindi (the way people
 * speak), keeping familiar English words such as डोनर, ब्लड ग्रुप, SDP. */
/**
 * Messages produced outside the UI (server actions, database notifications and
 * errors) arrive with their values already inside, so only these templates are
 * matched against finished text. Page templates always get their values passed.
 */
export const MESSAGE_TEMPLATES: Catalog = messages;

export const HINDI: Catalog = {
  ...common,
  ...messages,
  ...home,
  ...learn,
  ...learn2,
  ...legal,
  ...site,
  ...requests,
  ...auth,
  ...member,
  ...stories,
  ...volunteer,
  ...admin,
  ...design,
};
