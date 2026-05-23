

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.DwGsGquQ.js","_app/immutable/chunks/8kBbgSCG.js","_app/immutable/chunks/bUU1HKDh.js","_app/immutable/chunks/CiBveqg5.js"];
export const stylesheets = [];
export const fonts = [];
