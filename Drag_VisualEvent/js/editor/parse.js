//full execution sequence with sub sequences, complete loop detection with label jump
function getExecutionSequence(node = getFirstNode(), onlySelected = false, _sequence = [], _nodesIds = [], _flatSequence = []) {
	const register = onlySelected === false || (onlySelected === true && isNodeSelected(node));
	
	const data = {};
	if (register) {
		const nodeId = getNodeId(node);
		
		//jump to
		if (_nodesIds.includes(nodeId)) {
			_sequence.push({jumpLabel: nodeId});
			_flatSequence.find(seq => seq.nodeId === nodeId).hasLabel = true;
			return _sequence;
		}
			
		_nodesIds.push(nodeId);
		
		data.node = node;
		data.nodeId = nodeId;
		_sequence.push(data);
		_flatSequence.push(data);
	}
	
	const outputs = [...getNodeConnections(node).outputs];
	const mainOutput = outputs.pop();
	
	if (outputs.length > 0) {
		if (register)
			data.subSequence = [];
		
		for (const [i, output] of outputs.entries()) {
			if (register)
				data.subSequence[i] = new Array(0);
			
			if (isConnectionConnected(output)) {
				const outputNode = getConnectionConnectedNodes(output)[0];
				if (outputNode)
					if (register)
						getExecutionSequence(outputNode, onlySelected, data.subSequence[i], _nodesIds, _flatSequence);
					else 
						getExecutionSequence(outputNode, onlySelected, _sequence, _nodesIds, _flatSequence);
			}
		}
	} else
		if (register)
			data.subSequence = null;
	
	if (mainOutput && isConnectionConnected(mainOutput)) {
		const mainOutputNode = getConnectionConnectedNodes(mainOutput)[0];
		if (mainOutputNode)
			getExecutionSequence(mainOutputNode, onlySelected, _sequence, _nodesIds, _flatSequence);
	}
	
	return [_sequence, _flatSequence];
};

//doesn't include sub sequences in multi output nodes, limited loop detection
function getMainExecutionSequence(node = getFirstNode(), _nodes = [], _nodesIds = [], _loop = false) {				
	const nodeId = getNodeId(node);
	if (!_nodesIds.includes(nodeId))
		_nodesIds.push(nodeId);
	else if (!_loop)
		return [_nodes, {start: nodeId, end: _nodesIds[_nodesIds.length - 1]}];
	
	_nodes.push(node);
	
	const nextNode = getOutputConnectedNodes(node).mainOutputNode;
	if (nextNode)
		_loop = getMainExecutionSequence(nextNode, _nodes, _nodesIds, _loop)[1];
	
	return [_nodes, _loop];
};

function parseEventDataFromEditor(onlySelected = false, sequence = null) {
	// disableCullingGraphNodes();
	
	const eventId = window.data.targetId;
	const pageId = window.data.pageId || 0;
	const eventNode = getFirstNode();
	
	const topPanel = document.querySelector('#topPanel');
	if (!topPanel)
		return null;
	
	switch (window.data.targetType) {
		case "Common Event":
			return {
				id: eventId,
				name: document.querySelector('#topPanel #common-event-name').value,
				switchId: parseInt(document.querySelector('#topPanel #common-event-switch').value),
				trigger: parseInt(document.querySelector('#topPanel #common-event-trigger').value),
				list: parseNodesBehavior(eventNode, 0, sequence, onlySelected, true)
			};
		case "Map Event":
			const mapEvent = $.Drag.VisualEvent.deepCopyJSON(getEventCacheItem("data", "Map Event", window.data.mapTargetId, eventId) || window.data.loadedMap.events[eventId] || $.Drag.VisualEvent.getDefaultMapEvent());
			if (!mapEvent)
				return null;
			
			const mapEventPages = mapEvent.pages;
			if (!mapEventPages[pageId])
				mapEventPages[pageId] = $.Drag.VisualEvent.getDefaultEventPage(window.data.targetType);
			
			const mapEventParameters = parseNodeInputs(eventNode, getNodeInputs(eventNode, false));
			mapEventPages[pageId].list = parseNodesBehavior(eventNode, 0, sequence, onlySelected, true);
			
			const tilesets = window.data.$dataTilesets[window.data.loadedMap.tilesetId];
			const tilesetNames = tilesets ? tilesets.tilesetNames : [];
			const isTile = tilesetNames.includes(mapEventParameters[1]);
			mapEventPages[pageId].image = {
				characterIndex: !isTile ? (Math.floor(mapEventParameters[2] / 48) * 4) + Math.floor((mapEventParameters[2] % 12) / 3) : 0,
				characterName: isTile ? "" : mapEventParameters[1],
				direction: !isTile ? Math.max(Math.ceil((mapEventParameters[2] - (Math.floor(mapEventParameters[2] / 48) * 48)) / 12), 1) * 2 : 2,
				pattern: !isTile ? Math.floor((mapEventParameters[2] % 12) % 3) : 0,
				tileId: isTile ? parseInt(mapEventParameters[2]) : 0
			};
			
			mapEventPages[pageId].priorityType = mapEventParameters[3];
			mapEventPages[pageId].trigger = mapEventParameters[4];
			mapEventPages[pageId].moveType = mapEventParameters[5];
			mapEventPages[pageId].moveRoute = mapEventParameters[7];
			mapEventPages[pageId].moveSpeed = mapEventParameters[8];
			mapEventPages[pageId].moveFrequency = mapEventParameters[9];
			mapEventPages[pageId].walkAnime = mapEventParameters[10];
			mapEventPages[pageId].stepAnime = mapEventParameters[11];
			mapEventPages[pageId].directionFix = mapEventParameters[12];
			mapEventPages[pageId].through = mapEventParameters[13];
			
			// const [x, y] = $.Drag.VisualEvent.getInputValue(document.querySelector('#topPanel #map-event-location'));
			
			return {
				id: eventId,
				name: document.querySelector('#topPanel #map-event-name').value,
				note: document.querySelector('#topPanel #map-event-notes').value,
				pages: mapEventPages,
				x: mapEvent.x,
				y: mapEvent.y
			}
		case "Troop Event":
			const troopEvent = $.Drag.VisualEvent.deepCopyJSON(getEventCacheItem("data", "Troop Event", 0, eventId) || window.data.$dataTroops[eventId] ||$.Drag.VisualEvent.getDefaultTroopEvent());
			if (!troopEvent)
				return null;
			
			const troopEventPages = troopEvent.pages;
			if (!troopEventPages[pageId])
				troopEventPages[pageId] = $.Drag.VisualEvent.getDefaultEventPage(window.data.targetType);
			
			troopEventPages[pageId].span = parseNodeInputs(eventNode)[1];
			troopEventPages[pageId].list = parseNodesBehavior(eventNode, 0, sequence, onlySelected, true);
			
			return {
				id: eventId,
				members: troopEvent.members,
				name: document.querySelector('#topPanel #troop-event-name').value,
				pages: troopEventPages
			};
		default: 
			console.warn(`Unrecognized event type: ${window.data.targetType}. Couldn't parse event data from editor.`);
	}
	
	// enableCullingGraphNodes();
};

function parseNodesBehavior(startingNode = getFirstNode(), indent = 0, sequence = null, onlySelected = false, addEndBehavior = true) {
	if (!sequence)
		sequence = getExecutionSequence(startingNode, onlySelected)[0];
	
	const nodesBehavior = [];
	for (const data of sequence) {
		
		if (data.jumpLabel) {
			const labelId = `LABEL_VISUAL_EVENT_EDITOR_${data.jumpLabel}`;
			nodesBehavior.push({code: 119, indent: indent, parameters: [labelId], _generated: true});
			return nodesBehavior;
		}
		
		if (data.hasLabel) {
			const labelId = `LABEL_VISUAL_EVENT_EDITOR_${data.nodeId}`;
			nodesBehavior.push({code: 118, indent: indent, parameters: [labelId], _generated: true});
		}
		
		const node = data.node;
		
		const commandCode = getNodeCommandCode(node);
		if (!commandCode)
			continue;
		
		const isCustom = node.data.isCustom;
		const nodeId = getNodeId(node);
		
		if (window._generateHighlightMarkersOnParse) //used for highlight nodes & curves, trick to avoid monkey patching game_interpreter and potential compatibility issues
			nodesBehavior.push(
				{
					code: 355,
					indent: indent,
					parameters: [
						`const editor = Drag.VisualEvent.getEditor();
						if (editor) {
							editor._playtestHighlightQueue = editor._playtestHighlightQueue || [];
							editor._playtestHighlightQueue.push(${nodeId});
						}`
					]
				}
			);
		
		const nodeInputs = getNodeInputs(node);
		const command = {
			code: commandCode,
			indent: indent,
			parameters: cacheNodeHasProperty(node, "parsedParameters") ? $.Drag.VisualEvent.deepCopyJSON(getCacheNodeProperty(node, "parsedParameters")) : parseNodeInputs(node, nodeInputs)
		};
		
		if (!isCustom) {
			nodesBehavior.push(command);
			try {
				if (typeof window[`parseNode${commandCode}`] === "function")
					window[`parseNode${commandCode}`](command, node, nodesBehavior, nodeInputs, data.subSequence);
			} catch (error) {
				console.error(`Couldn't parse correctly command ${commandCode}, please retry. Error : `, error);
			}				
		} else {
			nodesBehavior.push(command);
			try {
				if (typeof window._customNodes[commandCode].parse === "function")
					window._customNodes[commandCode].parse(window, command, node, nodesBehavior, nodeInputs, data.subSequence);
			} catch (error) {
				console.error(`Couldn't parse properly custom node ${commandCode}, please retry or contact author of the custom code. Error : `, error);
			}
		}
	}
	
	if (addEndBehavior)
		nodesBehavior.push({code: 0, indent: indent, parameters: Array(0)});
	
	return nodesBehavior;
};

function getRawNodeInputsValues(node, nodeInputs, filterHidden = true) {
	if (!node)
		return [];
	
	if (!nodeInputs)
		nodeInputs = getNodeInputs(node, filterHidden);
	
	return nodeInputs.map(input => input.getAttribute('data-value') !== null ? input.getAttribute('data-value') : input.value);
};

function parseNodeInputs(node, nodeInputs, filterHidden = true, filterRadios = true, flatten = true, filterNonParameters = true) {
	if (!node)
		return [];
	
	if (!nodeInputs)
		nodeInputs = getNodeInputs(node, filterHidden, filterRadios, filterNonParameters);
	
	const commandCode = getNodeCommandCode(node);
	
	if (commandCode === 357) { //plugin commands need specific formating
		const pluginName = node.getAttribute('data-pluginName');
		const pluginCommandName = node.getAttribute('data-pluginCommandName');
		const pluginCommandText = node.getAttribute('data-pluginCommandText');
		return [pluginName, pluginCommandName, pluginCommandText, $.Drag.VisualEvent.getPluginCommandInputsValues(nodeInputs)];
	} else {
		if (flatten)
			return $.Drag.VisualEvent.flattenArray(nodeInputs.map(input => $.Drag.VisualEvent.getInputValue(input)));
		else
			return nodeInputs.map(input => $.Drag.VisualEvent.getInputValue(input));
	}
};

function getNodeInputs(node, filter = true, filterRadios = true, filterNonParameters = true) {
	const commandCode = getNodeCommandCode(node);
	const selector = filterNonParameters ? '*[data-isCommandParameter="true"]' : '*[data-inputType]:not([data-inputType="interactive"])';
	
	const nodeInputs = Array.from(node.querySelectorAll(selector)).filter( //remove hidden && disabled dependances (except ones with noIgnore)
		input => !filter || input.getAttribute('data-noIgnore') === "true" || !(input.getAttribute('data-dependance') === "true" && (!isVisible(input) || input.disabled))
	).filter(
		input => !filterRadios || !(input.type === "radio" && !input.checked) // remove unchecked radios
	); 
	
	if ($.Drag.VisualEvent.commandsParametersIndex[`command${commandCode}`]) //order parameters by specific index if existing
		nodeInputs.sort((a, b) => parseInt(a.getAttribute('data-parameterIndex')) - parseInt(b.getAttribute('data-parameterIndex')));
		
	return nodeInputs;
};

function parseNode101(command, node, nodesBehavior) { //show text have each line of their text as event command with code 401
	const texts = $.Utils.RPGMAKER_NAME === "MZ" ? command.parameters.splice(5, 1)[0].split("\n") : command.parameters.splice(4, 1)[0].split("\n");
	for (const text of texts)
		nodesBehavior.push({
			code: 401,
			indent: command.indent,
			parameters: [text]
		});
};

function parseNode102(command, node, nodesBehavior, nodesInputs, sequence) { //show choices
	//put choices strings in subarray and remove empty
	const params = command.parameters.splice(-4, Infinity);
	const connectionsIds = getNodeConnectedConnectionsIds(node); 
	command.parameters = [command.parameters.filter((choice, choiceId) => choice || connectionsIds[choiceId])].concat(params);
	
	//make data for each choice and their in branch commands 
	for (const [choiceId, choice] of command.parameters[0].entries()) { 
		nodesBehavior.push({
			code: 402,
			indent: command.indent,
			parameters: [choiceId, choice]
		});
		
		const outputConnection = getNodeConnectionsById(node, choiceId).output;
		if (isConnectionConnected(outputConnection) && sequence[choiceId]) {
			const connectionConnectedNode = getConnectionConnectedNodes(outputConnection)[0];
			nodesBehavior.push(...parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[choiceId]));
		} else
			nodesBehavior.push({code: 0, indent: command.indent + 1, parameters: Array(0)});
	}
		
	//make data for the cancel branch and its branch commands
	if (command.parameters[1] === -2) {
		nodesBehavior.push({
			code: 403,
			indent: command.indent,
			parameters: [6, null]
		});
		
		const outputConnection = getNodeConnectionsById(node, 6).output;
		if (isConnectionConnected(outputConnection)) {
			const connectionConnectedNode = getConnectionConnectedNodes(outputConnection)[0];
			nodesBehavior.push(...parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[6]));
		} else
			nodesBehavior.push({code: 0, indent: command.indent + 1, parameters: Array(0)});
	}
	
	//end of show choice
	nodesBehavior.push({
		code: 404,
		indent: command.indent,
		parameters: []
	});
};

function parseNode105(command, node, nodesBehavior) { //show scrolling text have each line of their text as event command with code 405
	const texts = command.parameters.splice(2, 1)[0].split("\n");
	for (const text of texts)
		nodesBehavior.push({
			code: 405,
			indent: command.indent,
			parameters: [text]
		});
};

function parseNode108(command, node, nodesBehavior) { //comments have each line of their text (except first one) as event command with code 408
	const texts = command.parameters[0].split("\n");
	for (const [i, text] of texts.entries()) {
		if (i === 0)
			continue;
		nodesBehavior.push({
			code: 408,
			indent: command.indent,
			parameters: [text]
		});
	}
	command.parameters = [texts[0]];
};

function parseNode111(command, node, nodesBehavior, nodesInputs, sequence) { //conditionnal branch
	//variable constant check for string/number
	if (command.parameters[0] === 1 && command.parameters[2] === 1) {
		if (!isNaN(Number(command.parameters[3])))
			command.parameters[3] = Number(command.parameters[3]);
	}
	
	//timer
	if (command.parameters[0] === 3) {
		command.parameters[1] = command.parameters[1] * 60 + command.parameters[2];
		command.parameters[2] = command.parameters[3];
		command.parameters.length = 3;
	}

	//if branch
	const ifConnection = getNodeConnectionsById(node, 0).output; 
	if (isConnectionConnected(ifConnection)) {
		const connectionConnectedNode = getConnectionConnectedNodes(ifConnection)[0];
		nodesBehavior.push(...parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
	}
	
	//else branch
	const elseConnection = getNodeConnectionsById(node, 1).output; 
	if (isConnectionConnected(elseConnection)) {
		nodesBehavior.push({
			code: 411,
			indent: command.indent,
			parameters: []
		});
	
		const connectionConnectedNode = getConnectionConnectedNodes(elseConnection)[0];
		nodesBehavior.push(...parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
	} 
	
	if (!isConnectionConnected(ifConnection) && !isConnectionConnected(elseConnection))
		nodesBehavior.push({code: 0, indent: command.indent + 1, parameters: Array(0)});
	
	//end of conditionnal
	nodesBehavior.push({ 
		code: 412,
		indent: command.indent,
		parameters: []
	});
};

function parseNode112(command, node, nodesBehavior, nodesInputs, sequence) { //loop
	//repeat branch
	const outputConnection = getNodeConnectionsById(node, 0).output; 
	if (isConnectionConnected(outputConnection)) {			
		const connectionConnectedNode = getConnectionConnectedNodes(outputConnection)[0];
		nodesBehavior.push(...parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
	} else
		nodesBehavior.push({code: 0, indent: command.indent + 1, parameters: Array(0)});
	
	//end of loop
	nodesBehavior.push({ 
		code: 413,
		indent: command.indent,
		parameters: []
	});
};

function parseNode121(command, node, nodesBehavior) { //control switch
	if (command.parameters.length < 3)
		$.Drag.VisualEvent.insert(command.parameters, 1, command.parameters[0])
};

function parseNode122(command, node, nodesBehavior) { //control variable
	if (command.parameters[1] < command.parameters[0])
		command.parameters[1] = command.parameters[0];
};

function parseNode124(command, node, nodesBehavior) { //control timer have only one value for mins + secs
	command.parameters[1] = command.parameters[1] * 60 + command.parameters[2];
	command.parameters.length = 2;
};

function parseNode132(command, node, nodesBehavior) { //change battle bgm have its parameter as an object
	command.parameters = [{
		name: command.parameters[0],
		volume: command.parameters[1],
		pitch: command.parameters[2],
		pan: command.parameters[3]
	}];
};

function parseNode133(command, node, nodesBehavior) { //change victory me
	parseNode132(command, node, nodesBehavior);
};

function parseNode139(command, node, nodesBehavior) { //change defeat me
	parseNode132(command, node, nodesBehavior);
};	

function parseNode140(command, node, nodesBehavior) { //change vehicle bgm
	command.parameters = [command.parameters[0], {
		name: command.parameters[1],
		volume: command.parameters[2],
		pitch: command.parameters[3],
		pan: command.parameters[4]
	}];
};	

function parseNode205(command, node, nodesBehavior) { //move route have each of its command duplicated as event command with code 505
	for (const moveRoute of command.parameters[1].list)
		if (moveRoute.code)
			nodesBehavior.push({
				code: 505,
				indent: command.indent,
				parameters: [moveRoute.parameters !== undefined ? {code: moveRoute.code, indent: moveRoute.indent, parameters: moveRoute.parameters} : {code: moveRoute.code, indent: moveRoute.indent}]
			});
};

function parseNode223(command, node, nodesBehavior) { //tint screen
	command.parameters[0][3] = command.parameters[1];
	$.Drag.VisualEvent.removeIndex(command.parameters, 1);
};

function parseNode224(command, node, nodesBehavior) { //flash screen
	parseNode223(command, node, nodesBehavior);
};

function parseNode232(command, node, nodesBehavior) { //move picture have an extra parameter 0 at index 1 for no reason (?)
	$.Drag.VisualEvent.insert(command.parameters, 1, 0);
};

function parseNode234(command, node, nodesBehavior) { //tint picture
	command.parameters[1][3] = command.parameters[2];
	$.Drag.VisualEvent.removeIndex(command.parameters, 2);
};

function parseNode241(command, node, nodesBehavior) { //play bgm
	parseNode132(command, node, nodesBehavior);
};

function parseNode245(command, node, nodesBehavior) { //play bgs
	parseNode132(command, node, nodesBehavior);
};

function parseNode249(command, node, nodesBehavior) { //play me
	parseNode132(command, node, nodesBehavior);
};

function parseNode250(command, node, nodesBehavior) { //play se
	parseNode132(command, node, nodesBehavior);
};


function parseNode301(command, node, nodesBehavior, nodesInputs, sequence) { //battle processing
	//win branch
	if (command.parameters[2] || command.parameters[3]) {
		nodesBehavior.push({ 
			code: 601,
			indent: command.indent,
			parameters: []
		});
		
		const winOutputConnection = getNodeConnectionsById(node, 0).output; 
		if (isConnectionConnected(winOutputConnection)) {			
			const connectionConnectedNode = getConnectionConnectedNodes(winOutputConnection)[0];
			nodesBehavior.push(...parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
		} else
			nodesBehavior.push({code: 0, indent: command.indent + 1, parameters: Array(0)});
	}

	//escape branch
	if (command.parameters[2]) {		
		nodesBehavior.push({ 
			code: 602,
			indent: command.indent,
			parameters: []
		});
		
		const escapeOutputConnection = getNodeConnectionsById(node, 1).output;
		if (isConnectionConnected(escapeOutputConnection)) {
			const connectionConnectedNode = getConnectionConnectedNodes(escapeOutputConnection)[0];
			nodesBehavior.push(...parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
		} else
			nodesBehavior.push({code: 0, indent: command.indent + 1, parameters: Array(0)});
	}
	
	//lose branch
	if (command.parameters[3]) {
		nodesBehavior.push({ 
			code: 603,
			indent: command.indent,
			parameters: []
		});
		
		const loseOutputConnection = getNodeConnectionsById(node, 2).output;
		if (isConnectionConnected(loseOutputConnection)) {
			const connectionConnectedNode = getConnectionConnectedNodes(loseOutputConnection)[0];
			nodesBehavior.push(...parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[2]));
		} else
			nodesBehavior.push({code: 0, indent: command.indent + 1, parameters: Array(0)});
	}
	
	//end of loop
	if (command.parameters[2] || command.parameters[3]) {
		nodesBehavior.push({ 
			code: 604,
			indent: command.indent,
			parameters: []
		});
	}
};

function parseNode302(command, node, nodesBehavior) { //shop processing have each of their merchandises as event command with code 605
	const parameters = command.parameters.splice(4, command.parameters.length - 5);
	for (let i = 0; i < parameters.length; i += 4)
		nodesBehavior.push({
			code: 605,
			indent: command.indent,
			parameters: [parameters[i], parameters[i + 1],  parameters[i + 2], parameters[i + 3]]
		});
};

function parseNode357(command, node, nodesBehavior, nodeInputs) { //plugin commands have each of their arguments as event command with code 657 //HIDDEN INPUTS (SELECT WITH NO OPTIONS USED AS PARENTS) MIGHT CAUSE DESYNC ?
	for (const input of nodeInputs) {
		const parameterText = Array.isArray(input) ? input[0].getAttribute("data-parameterText") : input.getAttribute("data-parameterText");
		const parameterName = Array.isArray(input) ? input[0].getAttribute("data-parameterName") : input.getAttribute("data-parameterName");
		const parameterValue = Array.isArray(input) ? command.parameters[3][parameterName] : command.parameters[3][parameterName];
		nodesBehavior.push({
			code: 657,
			indent: command.indent,
			parameters: [`${parameterText ? parameterText : parameterName} = ${parameterValue}`]
		});
	}
};