function importEditorMods() {
	console.log(`Importing editor mods...`);
	window._mods = {};
	const RMName = $.Utils.RPGMAKER_NAME;
	const filenames = $.Drag.VisualEvent.getFileList('./Drag_VisualEvent/js/mods').filter(file => file.endsWith(".js"));
	for (const filename of filenames) {
		const filenameWithoutExt = filename.replace('.js', '');
		const mod = require(`./Drag_VisualEvent/js/mods/${filename}`);
		
		if (!mod.engine)
			mod.engine = ["MZ", "MV"];
		if (!Array.isArray(mod.engine))
			mod.engine = [mod.engine];
		if (!mod.engine.map(item => item.toUpperCase().trim()).includes(RMName))
			continue;
		
		window._mods[filenameWithoutExt] = mod;
		console.log(`Imported ${filename} successfully !`);
	}
};

function triggerModsFunction(func, args = []) {
	if (!args)
		args = [];
	if (!Array.isArray(args))
		args = [args];
	const funcArgs = [window].concat(args);
	
	for (const mod of Object.values(window._mods))
		if (typeof mod[func] === "function")
			mod[func](...funcArgs);
};