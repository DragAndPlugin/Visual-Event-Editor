//--------------------------------------------------------------------------------------------------------
// NODE LIST MENU

function setupNodeList() {
	const RMName = $.Utils.RPGMAKER_NAME;
	const nodeList = document.querySelector('#nodeList');
	let html =  ``;
	
	//native commands
	for (const commandCategory in $.Drag.VisualEvent.commandsCategories) {
		const commands = $.Drag.VisualEvent.commandsCategories[commandCategory];
		if (commands.length > 0) {
			html += `<div><p data-commandCategory="${commandCategory}">${commandCategory.toUpperCase()}</p>`;
			for (const command of commands) {
				if (command === "command357")
					continue;
				
				if ($.Drag.VisualEvent.commandsEngine[command] !== undefined && $.Drag.VisualEvent.commandsEngine[command] !== RMName)
					continue;
				
				const commandName = $.Drag.VisualEvent.getCommandName(command);
				html += `
					<div id="node-list-command" onclick="addNodeFromNodeList(this);" data-exclusivity="exec" data-commandCategory="${commandCategory}" data-command="${command}" data-commandName="${commandName}">
						${commandName}
					</div>`;
				
			}
			html += `</div>`;
		}
	}
	
	nodeList.innerHTML += html;
	
	//import plugin commands
	let pluginReady = 0;
	
	if (RMName === "MZ") {
		const pluginList = $.Drag.VisualEvent.getPluginList($.document);
		if (pluginList.length === 0)
			window._mzPluginCommandsLoaded = true;
		
		for (const plugin of pluginList) {
			console.log(`Importing commands from ${plugin}...`); 
			$.Drag.VisualEvent.fetchPluginCommands(plugin, function(pluginData) {
				html = ``;
				if (pluginData.commands && Object.keys(pluginData.commands).length > 0) {
					html += `<div><p data-commandCategory="${plugin}">${plugin.toUpperCase()}</p>`;
					for (const command in pluginData.commands) {
						const commandText = pluginData.commands[command].text;
						const commandName = pluginData.commands[command].name;
						html += `
							<div id="node-list-command" onclick="addNodeFromNodeList(this);" data-isPluginCommand="true" data-exclusivity="exec" data-commandCategory="${plugin}" data-command="${command}" data-commandText="${commandText}" data-commandName="${commandName}">
								${commandText || commandName || ""}
							</div>`;
					}
					html += `</div>`;
					
					console.log(`Successfully imported ${Object.keys(pluginData.commands).length} commands from ${plugin} !`); 
				}
				nodeList.innerHTML += html;
				
				pluginReady++;
				if (pluginReady >= pluginList.length)
					window._mzPluginCommandsLoaded = true;
				
			}, false, true);
		}
	} else
		window._mzPluginCommandsLoaded = true;
	
	//import custom Nodes
	console.log(`Importing custom nodes...`);
	window._customNodes = {};
	const filenames = $.Drag.VisualEvent.getFileList('./Drag_VisualEvent/js/custom_nodes').filter(file => file.startsWith("node_") && file.endsWith(".js"));
	for (filename of filenames) {
		const customNodes = require(`./Drag_VisualEvent/js/custom_nodes/${filename.replace('.js', '')}`);
		for (const customNode of Array.isArray(customNodes) ? customNodes : [customNodes]) {
			if (!customNode.id || !customNode.engine)
				continue;
			
			if (!Array.isArray(customNode.engine))
				customNode.engine = [customNode.engine];
			
			if (!customNode.engine.map(item => item.toUpperCase().trim()).includes(RMName))
				continue;
			
			window._customNodes[customNode.id] = customNode;
			const exclusivity = `${customNode.exec_input && customNode.exec_input_params && customNode.exec_input_params.exclusive ? customNode.exec_input_params.exclusive : customNode.exec_input ? 'exec' : ''} ${customNode.exec_output && customNode.exec_output_params && customNode.exec_output_params.exclusive ? customNode.exec_output_params.exclusive : customNode.exec_input ? 'exec' : ''}`.trim().toLowerCase();
			if (nodeList.querySelector(`p[data-commandCategory="${customNode.category}"]`))
				nodeList.querySelector(`p[data-commandCategory="${customNode.category}"]`).parentElement.innerHTML += `
					<div id="node-list-command" onclick="addNodeFromNodeList(this);" data-isCustom="true" data-exclusivity="${exclusivity}" data-commandCategory="${customNode.category}" data-command="${customNode.id}" data-commandName="${customNode.name}">
						${customNode.name || ""}
					</div>
				`;
			else
				nodeList.innerHTML += `
					<div>
						<p data-commandCategory="${customNode.category}">${customNode.category.toUpperCase()}</p>
						<div id="node-list-command" onclick="addNodeFromNodeList(this);" data-isCustom="true" data-exclusivity="${exclusivity}" data-commandCategory="${customNode.category}" data-command="${customNode.id}" data-commandName="${customNode.name}">
							${customNode.name || ""}
						</div>
					</div>
				`;
				
			if (customNode.exec_input_params && customNode.exec_input_params.symbol)
				$.Drag.VisualEvent.addCSSStylesheet(document, $.Drag.VisualEvent.createCSSStylesheet(`.${customNode.id}_input::after { content: url(${$.Drag.VisualEvent.SVGtoURI(customNode.exec_input_params.symbol)}) !important; }`));
			if (customNode.exec_output_params && customNode.exec_output_params.symbol)
				$.Drag.VisualEvent.addCSSStylesheet(document, $.Drag.VisualEvent.createCSSStylesheet(`.${customNode.id}_output::after { content: url(${$.Drag.VisualEvent.SVGtoURI(customNode.exec_output_params.symbol)}) !important; }`));
		}
		console.log(`Imported ${filename} successfully !`);
	}
};

function searchNodeList(input) {
	const search = input.value.trim().toLowerCase();
	filterNodeList(search);
};

function filterNodeList(search = "") {
	const nodeList = document.querySelector('#nodeList');
	const exclusivity = nodeList.getAttribute('data-exclusivity') || "";
	const list = nodeList.querySelectorAll('div[data-commandName]');
	for (const elem of list) {
		const meetSearch = elem.getAttribute('data-commandName').toLowerCase().includes(search) || elem.getAttribute('data-commandCategory').toLowerCase().includes(search) || (elem.getAttribute('data-commandText') && elem.getAttribute('data-commandText').toLowerCase().includes(search));
		const elemExclusivity = elem.getAttribute('data-exclusivity') || "";
		const meetExclusivity = !exclusivity || $.Drag.VisualEvent.arrayIncludesAny(elemExclusivity.trim().toLowerCase().split(' '), exclusivity.split(' '));
		if (meetSearch && meetExclusivity)
			elem.classList.remove('hidden');
		else
			elem.classList.add('hidden');
	}
	
	//hide category header if empty
	const categories = nodeList.querySelectorAll('p[data-commandCategory]');
	for (const category of categories) 
		if (nodeList.querySelectorAll(`div[data-commandCategory="${category.getAttribute('data-commandCategory')}"]:not(.hidden)`).length > 0)
			category.classList.remove('hidden');
		else
			category.classList.add('hidden');
};

function showNodeListMenu(e, exclusivity = "") {
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const bottomPanelRect = document.querySelector('#bottom-panel').getBoundingClientRect();
	const nodeList = document.querySelector("#nodeList");
	nodeList.style.display = "block";
	
	const nodeListRect = nodeList.getBoundingClientRect();
	window._nodeListx = e.x + nodeListRect.width > graphEditorRect.right ? e.x - graphEditorRect.x - (e.x + nodeListRect.width - graphEditorRect.right) : e.x - graphEditorRect.x;
	window._nodeListy = e.y + nodeListRect.height > bottomPanelRect.top ? e.y - graphEditorRect.y - (e.y + nodeListRect.height - bottomPanelRect.top) : e.y - graphEditorRect.y;
	nodeList.style.left = `${window._nodeListx}px`;
	nodeList.style.top = `${window._nodeListy}px`;
	
	const nodeListPaste = nodeList.querySelector('#node-list-paste');
	if (window._nodeClipboard && window._nodeClipboard.nodes.length > 0)
		nodeListPaste.classList.remove('disabled');
	else
		nodeListPaste.classList.add('disabled');
	
	window._nodeListDisplayed = true;
	const search = nodeList.querySelector('#node-list-search');
	search.focus();
	search.select();

	nodeList.setAttribute('data-exclusivity', exclusivity || "");
	filterNodeList();
};

function closeNodeListMenu() {
	const nodeList = document.querySelector("#nodeList");
	nodeList.removeAttribute('data-exclusivity');
	nodeList.style.display = "none";
	window._nodeListDisplayed = false;
	
	const pendingCurves = document.querySelectorAll('#graphSVG > #curve[data-_pending="true"]');
	for (const curve of pendingCurves)
		removeCurve(curve);
};

function addNodeFromNodeList(elem) {			
	const isPluginCommand = elem.getAttribute('data-isPluginCommand') === "true";
	const isCustom = elem.getAttribute('data-isCustom') === "true";
	const commandCode = isPluginCommand ? 357 : isCustom ? elem.getAttribute('data-command') : parseInt(elem.getAttribute('data-command').replace('command', ''));
	const commandName = isPluginCommand || isCustom ? elem.getAttribute('data-commandName') : $.Drag.VisualEvent.getCommandName(commandCode);
	const commandText = elem.getAttribute('data-commandText');
	const commandCategory = elem.getAttribute('data-commandCategory');
	const [x, y] = getGraphCoordinatesFromAbsolute(window._nodeListx, window._nodeListy);
	
	const node = addNodeFromParams({
		x: x, y: y, isPluginCommand: isPluginCommand, isCustom: isCustom, commandCode: commandCode, commandName: commandName, commandText: commandText, commandCategory: commandCategory
	}, true, true);
	
	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
	connectPendingCurve(node);				
	closeNodeListMenu();
};