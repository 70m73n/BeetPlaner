export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["assets/data/bed_templates.json","assets/data/planting_templates.json","assets/data/plants.json","assets/data/season_hints.json","assets/icons/icon.svg","manifest.webmanifest","service-worker.js"]),
	mimeTypes: {".json":"application/json",".svg":"image/svg+xml",".webmanifest":"application/manifest+json"},
	_: {
		client: {start:"_app/immutable/entry/start.DIniCgVd.js",app:"_app/immutable/entry/app.DHmyXRPG.js",imports:["_app/immutable/entry/start.DIniCgVd.js","_app/immutable/chunks/Cewyb1yu.js","_app/immutable/chunks/8qp_HR0F.js","_app/immutable/chunks/C2wlGjLt.js","_app/immutable/entry/app.DHmyXRPG.js","_app/immutable/chunks/8qp_HR0F.js","_app/immutable/chunks/DAba1rTh.js","_app/immutable/chunks/X5GkPCmY.js","_app/immutable/chunks/C2wlGjLt.js","_app/immutable/chunks/B-w9jADg.js","_app/immutable/chunks/4aHPeV3r.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
