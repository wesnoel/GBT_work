/* Novel-scenario path — STUB ONLY, not wired to a live model.
   This is the centerpiece of the eventual demo: it's the seam that proves
   this panel is reasoning over MINI_CARD_SCHEMA rather than being a bigger
   switch statement, for a trip context nobody wrote a rule for in
   rules-engine.js. No Netlify project exists yet for this repo, so this
   function does not call anything live — it just returns the shape the
   real call will need, so wiring it later is a fetch() swap, not a rebuild.

   TODO (when a Netlify project exists):
   - Create /.netlify/functions/generate-render-plan
   - POST the `request` object built below to it
   - The function's job server-side: send { schema, context, datasets,
     description } to Claude, get back a plan conforming to
     MINI_CARD_SCHEMA, run it through validateRenderPlan() same as the
     rules engine's output, and return it.

   Request shape (what this stub already builds, unchanged by the swap):
     {
       schema: MINI_CARD_SCHEMA,
       context: <the same context object the rules engine reads>,
       datasets: HOTEL_DATASETS,
       description: <free-text scenario the user typed>
     }

   Response shape (what the real endpoint should return):
     {
       plan: <RenderPlan — identical shape to runRulesEngine()'s return value>,
       rationale: <string — model's explanation of the choices it made>
     }
*/
async function generateRenderPlanFromNovelScenario(description, context, datasets) {
  const request = {
    schema: MINI_CARD_SCHEMA,
    context: Object.assign({}, context),
    datasets,
    description
  };

  // STUB: no live model call. Swap this block for a fetch() to the Netlify
  // function above once it exists — everything else (validation, render,
  // logging) already accepts whatever shape that call returns.
  return {
    request,
    plan: null,
    rationale: "Stub only — not wired to a live model yet. See the TODO at the top of novel-scenario-stub.js for the exact request/response shape the real Netlify function should implement."
  };
}
