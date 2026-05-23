

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.B_bBYktD.js","_app/immutable/chunks/X5GkPCmY.js","_app/immutable/chunks/8qp_HR0F.js","_app/immutable/chunks/4aHPeV3r.js"];
export const stylesheets = [];
export const fonts = [];
