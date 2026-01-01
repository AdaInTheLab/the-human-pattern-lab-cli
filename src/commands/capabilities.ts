/* ===========================================================
   🌌 HUMAN PATTERN LAB — COMMAND: capabilities
   =========================================================== */

import { getAlphaIntent } from "../contract/intents";
import { ok } from "../contract/envelope";
import { getCapabilitiesAlpha } from "../contract/capabilities";

export function runCapabilities(commandName = "capabilities") {
  const intent = getAlphaIntent("show_capabilities");
  return ok(commandName, intent, getCapabilitiesAlpha());
}
