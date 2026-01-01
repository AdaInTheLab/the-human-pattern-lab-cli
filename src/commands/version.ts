/* ===========================================================
   🌌 HUMAN PATTERN LAB — COMMAND: version
   =========================================================== */

import { createRequire } from "node:module";
import { getAlphaIntent } from "../contract/intents";
import { ok } from "../contract/envelope";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { name: string; version: string };

export function runVersion(commandName = "version") {
  const intent = getAlphaIntent("show_version");
  return ok(commandName, intent, { name: pkg.name, version: pkg.version });
}
