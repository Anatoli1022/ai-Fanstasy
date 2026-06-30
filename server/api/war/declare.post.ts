// server/api/war/declare.post.ts
import { readBody } from "h3";
import { declareWar } from "../../game/loop";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { worldId, action, race1, race2, duration } = body;

  if (!worldId) return { success: false, message: "No worldId" };

  if (action === "declare-war") {
    const success = declareWar(worldId, race1, race2, duration || 5);
    return {
      success,
      message: success ? `War declared: ${race1} vs ${race2}` : "Failed",
    };
  }

  if (action === "set-relation") {
    const success = setRelation(worldId, race1, race2, body.relation);
    return { success, message: success ? `Relation updated` : "Failed" };
  }

  return { success: false, message: "Unknown action" };
});
