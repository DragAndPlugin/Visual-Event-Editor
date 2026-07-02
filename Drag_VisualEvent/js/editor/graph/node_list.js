//--------------------------------------------------------------------------------------------------------
// NODE LIST MENU

function setupNodeList() {
	const RMName = $.Utils.RPGMAKER_NAME;
	const nodeList = document.querySelector('#nodeList');
	const compactedContainer = nodeList.querySelector('#node-list-compacted');
	const expandedContainer = nodeList.querySelector('#node-list-expanded');
	
	let html = `<p id="node-list-title">COMMANDS</p><div id="node-list-commands-container">`;
	
	//native commands
	for (const commandCategory in $.Drag.VisualEvent.commandsCategories) {
		const commands = $.Drag.VisualEvent.commandsCategories[commandCategory];
		if (commands.length > 0) {
			html += `
				<div class="node-list-category collapsed" onclick="toggleNodeListCategory(this, event);">
					<p class="node-list-category-header" data-commandCategory="${commandCategory}"><span>❱</span>${commandCategory.toUpperCase()}</p>`;
					
			for (const command of commands) {
				if (command === "command357")
					continue;
				
				if ($.Drag.VisualEvent.commandsEngine[command] !== undefined && $.Drag.VisualEvent.commandsEngine[command] !== RMName)
					continue;
				
				const commandName = $.Drag.VisualEvent.getCommandName(command);
				html += `
					<div class="node-list-command" onclick="addNodeFromNodeList(this);" data-exclusivity="exec" data-commandCategory="${commandCategory}" data-command="${command}" data-commandName="${commandName}">
						${commandName}
					</div>`;
				
			}
			html += `</div>`;
		}
	}
	html += `</div>`;
	compactedContainer.innerHTML += html;
	expandedContainer.innerHTML += html;
	
	//import custom Nodes
	console.log(`Importing custom nodes...`);
	window._customNodes = {};
	const filenames = $.Drag.VisualEvent.getFileList('./Drag_VisualEvent/js/custom_nodes').filter(file => file.startsWith("node_") && file.endsWith(".js"));
	if (filenames.length > 0) {
		compactedContainer.innerHTML += `<div id="node-list-commands-container"></div>`;
		// expandedContainer.innerHTML += `<div id="node-list-commands-container"></div>`;
		// const container = nodeList.querySelector('#node-list-commands-container:last-of-type');
		
		for (filename of filenames) {
			const path = `./Drag_VisualEvent/js/custom_nodes/${filename.replace('.js', '')}`;
			const customNodes = typeof require(path) === 'function' ? require(path)(window) : require(path);
			for (const customNode of Array.isArray(customNodes) ? customNodes : [customNodes]) {
				if (!customNode.id || !customNode.engine)
					continue;
				
				if (!Array.isArray(customNode.engine))
					customNode.engine = [customNode.engine];
				
				if (!customNode.engine.map(item => item.toUpperCase().trim()).includes(RMName))
					continue;
				
				window._customNodes[customNode.id] = customNode;
				addCustomNodeToNodeList(customNode, compactedContainer, expandedContainer.lastElementChild);
				
				if (customNode.exec_input_params && customNode.exec_input_params.symbol)
					$.Drag.VisualEvent.addCSSStylesheet(document, $.Drag.VisualEvent.createCSSStylesheet(`.${customNode.id}_input::after { content: url(${$.Drag.VisualEvent.SVGtoURI(customNode.exec_input_params.symbol)}) !important; }`));
				if (customNode.exec_output_params && customNode.exec_output_params.symbol)
					$.Drag.VisualEvent.addCSSStylesheet(document, $.Drag.VisualEvent.createCSSStylesheet(`.${customNode.id}_output::after { content: url(${$.Drag.VisualEvent.SVGtoURI(customNode.exec_output_params.symbol)}) !important; }`));
				
				if (customNode.onimport && typeof customNode.onimport === "function")
					customNode.onimport(window);
				
				if (customNode.stylesheet && typeof customNode.stylesheet === "string") 
					$.Drag.VisualEvent.addCSSStylesheet(document, $.Drag.VisualEvent.createCSSStylesheet(customNode.stylesheet));
			}
			console.log(`Imported ${filename} successfully !`);
		}
	}
	
	//import plugin commands
	let pluginReady = 0;
	if (RMName === "MZ") {
		const parser = new DOMParser();
		const pluginList = $.Drag.VisualEvent.getPluginList($.document);
		if (pluginList.length === 0)
			window._pluginsImported = true;
		
		compactedContainer.innerHTML += `<p id="node-list-title">PLUGIN COMMANDS</p><div id="node-list-commands-container"></div>`;
		expandedContainer.innerHTML += `<p id="node-list-title">PLUGIN COMMANDS</p><div id="node-list-commands-container"></div>`;
		
		// const container = nodeList.querySelector('#node-list-commands-container:last-of-type');
		for (const plugin of pluginList) {
			console.log(`Importing commands from ${plugin}...`);
			
			function makePluginCommandHTML() {
				const pluginData = $.Drag.VisualEvent.getLocalizedPluginData(plugin);
				html = ``;
				
				if (pluginData.commands && Object.keys(pluginData.commands).length > 0) {
					html += `
						<div class="node-list-category collapsed" onclick="toggleNodeListCategory(this, event);">
							<p class="node-list-category-header" data-commandCategory="${plugin}"><span>❱</span>${plugin.toUpperCase()}</p>`;
					
					for (const command in pluginData.commands) {
						const commandText = pluginData.commands[command].text;
						const commandName = pluginData.commands[command].name;
						html += `
							<div class="node-list-command" onclick="addNodeFromNodeList(this);" data-isPluginCommand="true" data-exclusivity="exec" data-commandCategory="${plugin}" data-command="${command}" data-commandText="${commandText}" data-commandName="${commandName}">
								${commandText || commandName || ""}
							</div>`;
					}
					html += `</div>`;
					
					console.log(`Successfully imported ${Object.keys(pluginData.commands).length} commands from ${plugin} !`); 
				}
				
				if (html) {
					// const parsed = parser.parseFromString(html, 'text/html').body.firstChild;
					compactedContainer.querySelector('#node-list-commands-container:last-of-type').insertAdjacentHTML('beforeend', html);
					expandedContainer.querySelector('#node-list-commands-container:last-of-type').insertAdjacentHTML('beforeend', html);
				}
				
				pluginReady++;
				if (pluginReady >= pluginList.length)
					window._pluginsImported = true;
			};
			
			try {
				if (!$.Drag.VisualEvent.validatePluginCache(plugin)) {
					console.log(`${plugin} cache invalidated, fetch and parse...`); 
					window._invalidatedPluginCache = true;
					$.Drag.VisualEvent.fetchPluginCommands(plugin, makePluginCommandHTML);
				} else {
					console.log(`${plugin} cache validated !`); 
					makePluginCommandHTML($.Drag.VisualEvent.getLocalizedPluginData(plugin));
				}
			} catch(error) {
				console.error(`Couldn't import commands from ${plugin}. Error : ${error}`);
				
				pluginReady++;
				if (pluginReady >= pluginList.length)
					window._pluginsImported = true;
			}
		}
	} else {
		const pluginList = $.Drag.VisualEvent.getPluginList($.document);
		if (pluginList.length === 0)
			window._pluginsImported = true;
		
		for (const plugin of pluginList) {
			console.log(`Parsing ${plugin}...`);
			
			try {
				if (!$.Drag.VisualEvent.validatePluginCache(plugin)) {
					console.log(`${plugin} cache invalidated, fetch and parse...`); 
					window._invalidatedPluginCache = true;
					$.Drag.VisualEvent.fetchPluginCommands(plugin, (() => {
						console.log(`Successfully parsed ${plugin} !`); 
						
						pluginReady++;
						if (pluginReady >= pluginList.length)
							window._pluginsImported = true;
					}));
				} else {
					console.log(`${plugin} cache validated !`); 
					pluginReady++;
						if (pluginReady >= pluginList.length)
							window._pluginsImported = true;
				}
			} catch(error) {
				console.error(`Couldn't import commands from ${plugin}. Error : ${error}`);
				
				pluginReady++;
				if (pluginReady >= pluginList.length)
					window._pluginsImported = true;
			}
		}
	}
};

function addCustomNodeToNodeList(customNode, compactedContainer, expandedContainer) {
	const exclusivity = `${customNode.exec_input && customNode.exec_input_params && customNode.exec_input_params.exclusive ? customNode.exec_input_params.exclusive : customNode.exec_input ? 'exec' : ''} ${customNode.exec_output && customNode.exec_output_params && customNode.exec_output_params.exclusive ? customNode.exec_output_params.exclusive : customNode.exec_input ? 'exec' : ''}`.trim().toLowerCase();
	const categoryPath = getCustomNodeCategoryPath(customNode);
	if (compactedContainer) {
		const category = getOrCreateNodeCompactedListCategory(categoryPath, compactedContainer);
		category.innerHTML += `
			<div class="node-list-command" onclick="addNodeFromNodeList(this);"
				data-isCustom="true" data-exclusivity="${exclusivity}" data-commandCategory="${categoryPath[categoryPath.length - 1]}" data-commandCategoryPath="${categoryPath.join("/")}" data-command="${customNode.id}" data-commandName="${customNode.name}">
				${customNode.name || ""}
			</div>
		`;
	}
	if (expandedContainer) {
		const category = getOrCreateNodeExpandedListCategory(categoryPath, expandedContainer);
		category.innerHTML += `
			<div class="node-list-command" onclick="addNodeFromNodeList(this);"
				data-isCustom="true" data-exclusivity="${exclusivity}" data-commandCategory="${categoryPath[categoryPath.length - 1]}" data-commandCategoryPath="${categoryPath.join("/")}" data-command="${customNode.id}" data-commandName="${customNode.name}">
				${customNode.name || ""}
			</div>
		`;
	}
};

function getCustomNodeCategoryPath(customNode) {
	const category = customNode.category || "Custom";
	return Array.isArray(category) ? category : [category];
};

function getOrCreateNodeCompactedListCategory(categoryPath, container) {
	let currentParent = container;
	for (let i = 0; i < categoryPath.length; i++) {
		const category = categoryPath[i];
		let categoryElement = currentParent.querySelector(`:scope > .node-list-category > .node-list-category-header[data-commandCategory="${category}"]`);
		if (!categoryElement) {
			categoryElement = document.createElement("div");
			categoryElement.className = "node-list-category collapsed";
			categoryElement.setAttribute('onclick', 'toggleNodeListCategory(this, event);');
			
			const parentCategory = categoryPath.slice(0, i).join(" / ");
			categoryElement.innerHTML = `
				<p class="node-list-category-header" title="${categoryPath.join(" / ")}" data-commandCategory="${category}" data-parentCategory="${parentCategory}">
					<span>❱</span>${category.toUpperCase()}
				</p>
			`;
			
			currentParent.appendChild(categoryElement);
			currentParent = categoryElement;
		} else
			currentParent = categoryElement.parentElement;
	}
	
	return currentParent;
};

function getOrCreateNodeExpandedListCategory(categoryPath, container) {
	const category = categoryPath.join(" / ");
	let categoryElement = container.querySelector(`.node-list-category > .node-list-category-header[data-commandCategory="${category}"]`);
	if (!categoryElement) {
		categoryElement = document.createElement("div");
		categoryElement.className = "node-list-category";
		categoryElement.innerHTML = `
			<p class="node-list-category-header" title="${category}" data-commandCategory="${category}">
				<span>❱</span>${categoryPath.join('<br>')}
			</p>
		`;
		container.appendChild(categoryElement);
		return categoryElement;
	} else
		return categoryElement.parentElement;
};

function toggleNodeListCategory(element, ev) {
	element.classList.toggle('collapsed');
	if (ev)
		ev.stopPropagation();
	
	return false;
}

function searchNodeList(input) {
	const search = input.value.trim().toLowerCase();
	filterNodeList(search);
};

function filterNodeList(search = "") {
	const nodeList = document.querySelector('#nodeList');
	
	//disable collapse if search, enable if not
	if (search) {
		for (const collapsed of nodeList.querySelectorAll('.collapsed'))
			collapsed.classList.remove('collapsed');
	} else { 
		for (const category of nodeList.querySelectorAll('.node-list-category'))
			category.classList.add('collapsed');
	}
	
	const exclusivity = nodeList.getAttribute('data-exclusivity') || "";
	const list = nodeList.querySelectorAll('div[data-commandName]');
	for (const elem of list) {
		const meetSearch = elem.getAttribute('data-commandName').toLowerCase().includes(search) 
			|| elem.getAttribute('data-commandCategory').toLowerCase().includes(search) 
			|| (elem.hasAttribute('data-commandCategoryPath') && elem.getAttribute('data-commandCategoryPath').toLowerCase().includes(search))
			|| (elem.getAttribute('data-commandText') && elem.getAttribute('data-commandText').toLowerCase().includes(search));
		const elemExclusivity = elem.getAttribute('data-exclusivity') || "";
		const meetExclusivity = !exclusivity || $.Drag.VisualEvent.arrayIncludesAny(elemExclusivity.trim().toLowerCase().split(' '), exclusivity.split(' '));
		if (meetSearch && meetExclusivity)
			elem.classList.remove('hidden');
		else
			elem.classList.add('hidden');
	}
	
	//hide category header if empty
	const categories = nodeList.querySelectorAll('.node-list-category');
	for (const category of categories) 
		if (category.querySelectorAll(`.node-list-command:not(.hidden)`).length > 0)
			category.classList.remove('hidden');
		else
			category.classList.add('hidden');
};

function showNodeListMenu(e, exclusivity = "") {
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const bottomPanelRect = document.querySelector('#bottom-panel').getBoundingClientRect();
	const nodeList = document.querySelector("#nodeList");
	
	nodeList.style.display = "block";
	window._nodeListx = e.x;
	window._nodeListy = e.y;
	$.Drag.VisualEvent.ensureContextMenuFitViewport(window, nodeList, window._nodeListx, window._nodeListy);
	
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
	filterNodeList(search.value);
	
	window.addEventListener('keydown', handleNodeListKeyDown);
};

function getVisibleNodeListItems(container, nodeList = document.querySelector('#nodeList')) {
	const expanded = nodeList.hasAttribute('data-display-mode') && nodeList.getAttribute('data-display-mode') === 'expanded';
	return Array.from(container.querySelectorAll('.node-list-category, .node-list-command')).filter(element => {		
		if (element.classList.contains('hidden'))
			return false;
		
		if (expanded)
			return true;
		
		if (element.classList.contains('node-list-command')) {
			const parentCategory = element.closest('.node-list-category');
			if (parentCategory && parentCategory.classList.contains('collapsed'))
				return false;
		}
		
		let parent = element.parentElement.closest('.node-list-category');
		while (parent) {
			if (parent.classList.contains('collapsed') && parent !== element)
				return false;
			
			parent = parent.parentElement.closest('.node-list-category');
		}
		
		return true;
	});
}

function handleNodeListKeyDown(event) {
	const nodeList = document.querySelector("#nodeList");
	if (!window._nodeListDisplayed || !nodeList)
		return;
	
	if (![38, 40, 37, 39, 13].includes(event.keyCode))
		return;

	const items = getVisibleNodeListItems(getActiveNodeListContainer(), nodeList);
	if (items.length <= 0)
		return;
	
	event.preventDefault();
	event.stopPropagation();
	
	let selected = nodeList.querySelector('.selected');
	if (selected && selected.classList.contains('node-list-category-header'))
		selected = selected.parentElement;
	
	const search = nodeList.querySelector('#node-list-search');
	let index = selected ? items.indexOf(selected) : -1;
	switch (event.keyCode) {
		case 40: //arrow down
			search.blur();
			index = index < 0 ? 0 : (index + 1) % items.length;
			selectNodeListCategoryCommand(items[index], nodeList);
			break;
		case 38: // arrow up
			search.blur();
			index = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
			selectNodeListCategoryCommand(items[index], nodeList);
			break;
		case 37: // arrow left
			search.blur();
			moveNodeListCategory(-1);
			break;
		case 39: // arrow right
			search.blur();
			moveNodeListCategory(1);
			break;
		case 13: // enter
			if (document.activeElement === search) {
				search.blur();
				return;
			}
			
			if (!selected)
				return;
			
			if (selected.classList.contains('node-list-category'))
				toggleNodeListCategory(selected);
			else if (selected.classList.contains('node-list-command'))
				addNodeFromNodeList(selected);
			
			break;
	}
};

function selectNodeListCategoryCommand(element, nodeList) {
	if (!nodeList)
		nodeList = document.querySelector("#nodeList");
	
	if (!element)
		return;
	
	for (const selected of nodeList.querySelectorAll('.selected'))
		selected.classList.remove('selected');
	
	if (element.classList.contains('node-list-category'))
		element.firstElementChild.classList.add('selected');
	else
		element.classList.add('selected');
	
	element.scrollIntoView({ block: "nearest" });
}

function moveNodeListCategory(direction) {
	const container = getActiveNodeListContainer();
	
	let selected = container.querySelector(".selected");
	if (selected && selected.classList.contains("node-list-category-header"))
		selected = selected.parentElement;
	if (!selected)
		return;
	
	const categories = getVisibleCategories(container);
	const currentCategory = getSelectedCategory(selected);
	let index = categories.indexOf(currentCategory);
	if (index === -1)
		return;
	
	index += direction;
	if (index < 0)
		index = categories.length - 1;
	else if (index >= categories.length)
		index = 0;

	const targetCategory = categories[index];
	// if (selected.classList.contains("node-list-command")) {
		// const command = targetCategory.querySelector(".node-list-command:not(.hidden)");
		// if (command)
			// selectNodeListCategoryCommand(command);
		// else
			// selectNodeListCategoryCommand(targetCategory);
	// }
	// else
		selectNodeListCategoryCommand(targetCategory);
};

function getSelectedCategory(selected) {
	if (!selected)
		return null;
	
	if (selected.classList.contains("node-list-category"))
		return selected;
	
	if (selected.classList.contains("node-list-command"))
		return selected.closest(".node-list-category");
	
	return null;
};

function getVisibleCategories(container) {
	return Array.from(container.querySelectorAll(".node-list-category")).filter(c => !c.classList.contains("hidden"));
};

function closeNodeListMenu() {
	const nodeList = document.querySelector("#nodeList");
	nodeList.removeAttribute('data-exclusivity');
	nodeList.style.display = "none";
	window._nodeListDisplayed = false;
	
	if (window._pendingCurve)
		removeCurve(window._pendingCurve, !window._pendingCurve.isTemp, !window._pendingCurve.isTemp);
	
	window._pendingCurve = null;
	window.removeEventListener('keydown', handleNodeListKeyDown);
	for (const selected of nodeList.querySelectorAll('.selected'))
		selected.classList.remove('selected');
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

function setNodeListDisplayMode(mode = 'compacted') {
	const nodeList = document.querySelector("#nodeList");
	nodeList.setAttribute('data-display-mode', mode);
	
	for (const category of nodeList.querySelectorAll('.node-list-category'))
		category.classList.toggle('collapsed', mode === 'compacted');
	
	window._cache.editor.nodeListDisplayMode = mode;
	$.Drag.VisualEvent.ensureContextMenuFitViewport(window, nodeList, window._nodeListx, window._nodeListy);
};

function getActiveNodeListContainer() {
	const nodeList = document.querySelector("#nodeList");
	return nodeList.getAttribute("data-display-mode") === "expanded" ? nodeList.querySelector("#node-list-expanded") : nodeList.querySelector("#node-list-compacted");
}