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
	try {
		if (!args)
			args = [];
		if (!Array.isArray(args))
			args = [args];
		const funcArgs = [window].concat(args);
		
		for (const mod of Object.values(window._mods))
			if (typeof mod[func] === "function")
				mod[func](...funcArgs);
	} catch (err) {
		console.error(err);
	}
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


//-------------------------------------------------------------------------
// Non-Exec Typed Connections 

window.data.typedConnectionTypes = {};
function registerTypedConnectionType(type, data) {
    if (!type || !data)
        return;

    window.data.typedConnectionTypes[type] = Object.assign({}, window.data.typedConnectionTypes[type] || {}, data);
	registerTypedConnectionStyles(type, window.data.typedConnectionTypes[type]);
};

function registerTypedConnectionStyles(type, data) {
	if (!type || !data || !data.svg)
		return;
	
	$.Drag.VisualEvent.addCSSStylesheet(document, $.Drag.VisualEvent.createCSSStylesheet(`[data-typedConnection=${type}]::after { content: url(${$.Drag.VisualEvent.SVGtoURI(data.svg)}) !important; }"`));
};

function getTypedConnectionType(type) {
    if (!type)
        return null;
	
    return window.data.typedConnectionTypes[type] || null;
};

function setConnectionAsTyped(connection, type) {
    if (!connection || !type)
        return;

    const typedData = getTypedConnectionType(type);
    if (!typedData)
        return;

    connection.setAttribute('data-typedConnection', type);
    connection.setAttribute('data-exclusive', type);

    if (typedData.curveColor)
        connection.setAttribute('data-curveColor', typedData.curveColor);

    connection.classList.add('exec');
    connection.classList.add('noDefaultSymbol');
    connection.classList.add('mono');

    if (typedData.className)
        connection.classList.add(typedData.className);
};

function hasTypedConnectionType(type) {
	if (!type)
		return false;

	return !!getTypedConnectionType(type);
};

function getConnectionTypedType(connection) {
	if (!connection)
		return null;

	return connection.getAttribute('data-typedConnection') || connection.getAttribute('data-exclusive') || null;
};

function initializeNodeTypedConnections(node) {
	if (!node)
		return;
	
	const connections = getNodeConnections(node).inputs;
	for (const connection of connections) {
		const type = getConnectionExpectedTypedType(node, connection);
		if (!type)
			continue;
		
		if (!getTypedConnectionType(type))
			continue;
		
		setConnectionAsTyped(connection, type);
		
		const inputWrapper = connection.parentElement ? connection.parentElement.querySelector('#input-wrapper') : null;
		if (inputWrapper && isConnectionConnected(connection))
			inputWrapper.classList.add('hidden');
	}
};

function getConnectionExpectedTypedType(node, connection) {
	const type = getConnectionTypedType(connection);
	if (type && type !== "exec")
		return type;

	const connectionId = getConnectionId(connection);
	const commandCode = getNodeCommandCode(node);
	
	if (node.classList.contains("nodeEvent")) {
		const types = NODE_EVENT_TYPED_CONNECTIONS[window.data.targetType];
		return types ? types[connectionId] || null : null;
	}
	
	if (commandCode === 357)
		return getPluginCommandConnectionTypedType(node, connection);

	const types = $.Drag.VisualEvent.commandsParameterTypes[commandCode];
	return types ? types[connectionId] || null : null;
};

function getPluginCommandConnectionTypedType(node, connection) {
	if (!node || !connection)
		return null;
	
	const connectionId = getConnectionId(connection);
	const pluginName = node.getAttribute('data-pluginName');
	const plugin = $.Drag.VisualEvent.pluginJSDocData[pluginName];
	if (!plugin)
		return null;
	
	const commandName = node.getAttribute('data-pluginCommandName');
	const params = $.Drag.VisualEvent.getPluginCommandParameters(pluginName, commandName);
	if (!Array.isArray(params) || !params.length)
		return null;
	
	const parameterName = connection.getAttribute('data-pluginParameterName');
	if (!parameterName)
		return null;
	
	const param = params.find(param => param.name === parameterName);
	if (!param || !param.type)
		return null;
	
	const pluginParameterType = String(param.type).toLowerCase();
	const typedConnectionTypes = window.data.typedConnectionTypes;
	
	for (const type in typedConnectionTypes) {
		const typedData = typedConnectionTypes[type];
		if (!typedData || !Array.isArray(typedData.pluginParameterTypes))
			continue;
		
		if (typedData.pluginParameterTypes.indexOf(pluginParameterType) >= 0)
			return type;
	}
	
	return null;
};

const NODE_EVENT_TYPED_CONNECTIONS = {
	"Common Event": [null, "boolean"],
	"Map Event": ["boolean", null, null, null, null, null, null, "boolean", "boolean", "boolean", "boolean"],
	"Troop Event": ["boolean", null],
};

function getNodeTypedConnections(node, type) {
	if (!node || !type)
		return [];
	
	const isNodeEvent = node.classList.contains('nodeEvent');
	const connections = getNodeConnections(node).inputs;
	const commandCode = getNodeCommandCode(node);
	const isPluginCommand = commandCode === 357;
	
	if (isNodeEvent) {
		const connectionTypes = NODE_EVENT_TYPED_CONNECTIONS[window.data.targetType];
		if (!connectionTypes)
			return [];
		
		return NODE_EVENT_TYPED_CONNECTIONS[window.data.targetType].map((connectionType, index) => connectionType === type ? connections[index] : null).filter(item => item !== null); 
	} else if (isPluginCommand)
		return getPluginCommandTypedConnections(node, type, connections);
	else
		return connections.filter(connection => connection.getAttribute('data-typedConnection') === type);
	
	return [];
};

function getPluginCommandTypedConnections(node, type, connections) {
	if (!node || !type)
		return [];
	
	if (!connections)
		connections = getNodeConnections(node).inputs;
	
	const pluginName = node.getAttribute('data-pluginName');
	const plugin = $.Drag.VisualEvent.pluginJSDocData[pluginName];
	if (!plugin)
		return [];
	
	const commandName = node.getAttribute('data-pluginCommandName');
	const params = $.Drag.VisualEvent.getPluginCommandParameters(pluginName, commandName);
	if (!Array.isArray(params) || !params.length)
		return [];
	
	return params.map((param, index) => {
		if (param.type !== type || typeof param.name !== "string" || !param.name)
			return null;
		
		const connection = connections.find(connection => connection.getAttribute('data-pluginParameterName') === param.name);
		if (!connection)
			return null;
		
		return {
			id: getConnectionId(connection),
			connection: connection,
			argumentName: param.name,
		};
	}).filter(item => item);
};

function createTypedParseContext() {
	return {
		active: new Set(),
		parsed: new Map(),
		path: []
	};
};

// function parseNodeTypedInputs(node, context) {
	// if (!node)
		// return [];
	
	// let listInputs = null;
	// const typedInputs = [];
	
	// const connections = getNodeConnections(node).inputs;
	// for (const connection of connections) {
		// const type = getConnectionTypedType(connection);
		// if (!type || type === "exec")
			// continue;
		
		// const connectionId = getConnectionId(connection);
		// if (connectionId === null || connectionId === undefined)
			// continue;
		
		// let parsedInput = null;
		// if (isConnectionConnected(connection))
			// parsedInput = parseTypedConnection(node, connectionId, context);
		
		// const isList = connection.getAttribute("data-isList") === "true";
		// if (isList) {
			// if (!listInputs) {
				// listInputs = [];
				// typedInputs.push(listInputs);
			// }
			
			// listInputs.push(parsedInput);
		// } else {
			// listInputs = null;
			// typedInputs.push(parsedInput);
		// }
	// }
	
	// return typedInputs;
// };

function parseTypedConnection(node, connectionId, context) {
	if (!node)
		return null;
	
	const connection = getNodeConnectionsById(node, connectionId).input;
	if (!connection || !isConnectionConnected(connection))
		return null;
	
	const connectedNode = getConnectionConnectedNodes(connection)[0];
	if (!connectedNode)
		throw new Error("A typed input is connected but does not resolve to a node.");
	
	const outputConnection = getConnectionConnectedConnections(connection)[0];
	const expectedType = getConnectionTypedType(connection);
	const receivedType = getConnectionTypedType(outputConnection);
	if (expectedType && receivedType && expectedType !== receivedType)
		throw new Error(`Typed connection mismatch: expected ${expectedType}, received ${receivedType}.`);
	
	if (!context)
		context = createTypedParseContext();
	
	return parseTypedNode(connectedNode, context);
};

// function parseTypedNode(node, context) {
	// if (!node)
		// throw new Error("A required typed input is disconnected.");
	
	// if (!context)
		// context = createTypedParseContext();
	
	// if (context.active.has(node))
		// throw new Error("The typed expression graph contains a cycle.");
	
	// if (context.parsed.has(node))
		// return context.parsed.get(node);
	
	// const code = getNodeCommandCode(node);
	// const customNodeData = getCustomNodeData(code);
	// if (!customNodeData || typeof customNodeData.parseTyped !== "function")
		// throw new Error(`A connected node does not provide a typed parser: ${code}`);
	
	// context.active.add(node);
	// context.path.push(node);
	
	// try {
		// const params = parseNodeInputs(node);
		// const typedInputs = parseNodeTypedInputs(node, context);
		// const inputs = mergeParamsTypedInputs(params, typedInputs);
		// const result = customNodeData.parseTyped(
			// window, 
			// node,
			// inputs,
			// context
		// );
		
		// if (!result || typeof result !== "object")
			// throw new Error(`A typed node returned an invalid parsed result: ${code}`);
		
		// context.parsed.set(node, result);
		// return result;
	// } finally {
		// context.path.pop();
		// context.active.delete(node);
	// }
// };


// function mergeParamsTypedInputs(params, typedInputs) {
	// const inputs = params.slice();
	// for (let i = 0; i < typedInputs.length; i++) {
		// if (typedInputs[i] !== undefined)
			// inputs[i] = typedInputs[i];
	// }
	
	// return inputs;
// };

function parseTypedNode(node, context) {
	if (!node)
		throw new Error("A required typed input is disconnected.");
	
	if (!context)
		context = createTypedParseContext();
	
	if (context.active.has(node))
		throw new Error("The typed expression graph contains a cycle.");
	
	if (context.parsed.has(node))
		return context.parsed.get(node);
	
	const code = getNodeCommandCode(node);
	const customNodeData = getCustomNodeData(code);
	if (!customNodeData || typeof customNodeData.parseTyped !== "function")
		throw new Error(`A connected node does not provide a typed parser: ${code}`);
	
	context.active.add(node);
	context.path.push(node);
	
	try {
		const inputs = parseNodeResolvedInputs(node, context);
		const result = customNodeData.parseTyped(window, node, inputs, context);
		if (!result || typeof result !== "object")
			throw new Error(`A typed node returned an invalid parsed result: ${code}`);
		
		context.parsed.set(node, result);
		return result;
	} finally {
		context.path.pop();
		context.active.delete(node);
	}
};

function parseNodeResolvedInputs(node, context) {
	if (!node)
		return [];
	
	const resolvedInputs = [];
	const nodeInputs = getNodeInputs(node);
	let listInputs = null;
	const inputContainers = Array.from(node.querySelectorAll('#input-container > #node-input'));
	
	for (const container of inputContainers) {
		const connection = container.querySelector('.inputConnection');
		const type = getConnectionTypedType(connection);
		const isTyped = type && type !== "exec";
		const isList = isTyped && connection.getAttribute('data-isList') === "true";
		
		if (isList) {
			if (!listInputs) {
				listInputs = [];
				resolvedInputs.push(listInputs);
			}
			
			if (isConnectionConnected(connection))
				listInputs.push(parseTypedConnection(node, getConnectionId(connection), context));
			else
				listInputs.push(null);
			
			continue;
		}
		
		listInputs = null;
		if (isTyped && isConnectionConnected(connection)) {
			resolvedInputs.push(parseTypedConnection(node, getConnectionId(connection), context));
			continue;
		}
		
		const containerInputs = nodeInputs.filter(input => input.closest('#node-input') === container);
		if (!containerInputs.length) {
			if (isTyped)
				resolvedInputs.push(null);
			
			continue;
		}
		
		const values = parseNodeInputs(node, containerInputs);
		for (const value of values)
			resolvedInputs.push(value);
	}
	
	return resolvedInputs;
};

function onTypedNodeConnection(connection, connected) {
	if (!connection)
		return;

	const type = getConnectionTypedType(connection);
	if (!type || !getTypedConnectionType(type))
		return;
	
	const inputWrapper = connection.parentElement ? connection.parentElement.querySelector('#input-wrapper') : null;
	if (!inputWrapper)
		return;
	
	if (connected)
		inputWrapper.classList.add('hidden');
	else
		inputWrapper.classList.remove('hidden');
};