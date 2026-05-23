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
		client: {start:"_app/immutable/entry/start.B2BKE6NH.js",app:"_app/immutable/entry/app.BfIV04c7.js",imports:["_app/immutable/entry/start.B2BKE6NH.js","_app/immutable/chunks/D53GwgXg.js","_app/immutable/chunks/bUU1HKDh.js","_app/immutable/chunks/y8JJtdV4.js","_app/immutable/entry/app.BfIV04c7.js","_app/immutable/chunks/bUU1HKDh.js","_app/immutable/chunks/DcClgf04.js","_app/immutable/chunks/8kBbgSCG.js","_app/immutable/chunks/y8JJtdV4.js","_app/immutable/chunks/BKrfcbRw.js","_app/immutable/chunks/CiBveqg5.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
