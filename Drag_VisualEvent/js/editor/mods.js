window.ADDONS_URL = "https://raw.githubusercontent.com/DragAndPlugin/Visual-Event-Editor/refs/heads/main/Add%20Ons/addons.json";
window.addons = {};

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
	
	triggerModsFunction('onImport');
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


function registerAddon(data) {
	if (!data || !data.id)
		return;
	
	const current = window.addons[data.id] || {};
	window.addons[data.id] = {
		...current,
		...data,
		installed: true,
		installedVersion: data.version || current.installedVersion || null,
		latestVersion: current.latestVersion || null
	};
	
	refreshAddonsMenu();
};

function refreshAddonsMenu() {
	const menu = document.querySelector("#editor-addons-menu");
	if (!menu)
		return;
	menu.innerHTML = "";
	
	let updateCount = 0;
	const addons = Object.values(window.addons);
	for (const addon of addons) {
		const item = document.createElement("div");
		item.className = "editor-addon-item";
		
		const header = document.createElement("div");
		header.className = "editor-addon-header";
		
		const name = document.createElement("span");
		name.className = "editor-addon-name";
		name.textContent = addon.name || addon.id;
		
		if (addon.url) {
			name.classList.add("clickable");
			name.addEventListener("click", () => $.Drag.VisualEvent.openUrl(addon.url));
		}
		
		const status = document.createElement("span");
		status.className = "editor-addon-status";
		
		if (addon.installed) {
			status.textContent = "Installed";
			status.classList.add("installed");
		} else {
			status.textContent = "Not Installed";
			status.classList.add("not-installed");
		}
		
		header.appendChild(name);
		header.appendChild(status);
		item.appendChild(header);
		
		if (addon.description) {
			const description = document.createElement("div");
			description.className = "editor-addon-description";
			description.textContent = addon.description;
			item.appendChild(description);
		}
		
		const updateAvailable = addon.installed && addon.installedVersion && addon.latestVersion && addon.latestVersion !== addon.installedVersion;
		if (addon.installedVersion && !updateAvailable) {
			const version = document.createElement("div");
			version.className = "editor-addon-version";
			version.textContent = `Version ${addon.installedVersion}`;
			item.appendChild(version);
		}
		if (updateAvailable) {
			const update = document.createElement("div");
			update.className = "editor-addon-update";
			update.textContent = `Update available: version ${addon.latestVersion} (current ${addon.installedVersion})`;
			item.appendChild(update);
			updateCount++;
		}
		
		menu.appendChild(item);
	}
	
	const badge = document.querySelector("#editor-addons-update-badge");
	if (badge) {
		if (updateCount > 0) {
			badge.textContent = updateCount > 9 ? "9+" : updateCount;
			badge.classList.remove("hidden");
		} else {
			badge.textContent = "";
			badge.classList.add("hidden");
		}
	}
};

function mergeRemoteAddons(remoteAddons) {
	for (const [id, remote] of Object.entries(remoteAddons)) {
		const local = window.addons[id];
		if (local) {
			window.addons[id] = {
				...remote,
				...local,
				latestVersion: remote.version,
				installed: true
			};
		} else {
			window.addons[id] = {
				...remote,
				id: id,
				installed: false,
				installedVersion: null,
				latestVersion: remote.version
			};
		}
	}
	
	refreshAddonsMenu();
};

async function checkAddonUpdates() {
	try {
		const response = await fetch(`${ADDONS_URL}?t=${Date.now()}`, {cache: "no-store"});
		if (!response.ok)
			throw new Error(`HTTP ${response.status}`);
		
		const remoteAddons = await response.json();
		mergeRemoteAddons(remoteAddons);
	} catch (error) {
		console.warn("Couldn't check online add-on catalogue.", error);
	}
};