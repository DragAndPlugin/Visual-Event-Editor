function playtestNodes() {
	const startingNodes = getAllNodesWithoutInputConnectionConnected();
	let playtestSequence = [];
	
	for (const startingNode of startingNodes)
		playtestSequence = playtestSequence.concat(getExecutionSequence(startingNode, true)[0]);
	
	window._generateHighlightMarkersOnParse = true;
	const eventData = parseEventDataFromEditor(true, playtestSequence);
	window._generateHighlightMarkersOnParse = false;
	
	playtest(eventData);
	closeNodeContextMenu();
};

function playtest(eventData = null) {
	if (!window.data.targetType || !window.data.targetId)
		return;
	
	if (!eventData) {
		window._generateHighlightMarkersOnParse = true;
		eventData = parseEventDataFromEditor(false, null);
		window._generateHighlightMarkersOnParse = false;
	}
	
	if (window._playtestGraphAnimationsInterval)
		clearInterval(window._playtestGraphAnimationsInterval);
	
	switch (window.data.targetType) {
		case "Common Event":
			if ($.$gameMap) {
				if ($.SceneManager._scene.constructor.name !== "Scene_Map" && $.SceneManager._scene.constructor.name !== "Scene_Battle")
					$.SceneManager.push($.Scene_Map);
				
				$.$gameMap._interpreter.setup(eventData.list);
				window._playtestType = window.data.targetType;
				window._playtestList = eventData.list;
				
				startGraphHightlight($.$gameMap._interpreter);
				showCancelPlaytest();
			} else
				return;
			break;
		case "Map Event":
			if (!$.$gameMap)
				return console.error("No Game_Map setup. Please try again later.");
			
			if ($.SceneManager._scene.constructor.name !== "Scene_Map") {
				$.$dataMap = window.data.loadedMap;
				$.$gamePlayer._newMapId = window.data.mapTargetId;
				$.SceneManager.goto($.Scene_Map);
			}

			$.$gameMap._interpreter.setup(eventData.pages[window.data.pageId].list, eventData.id);
			window._playtestType = window.data.targetType;
			window._playtestList = eventData.pages[window.data.pageId].list;
			
			startGraphHightlight($.$gameMap._interpreter);
			showCancelPlaytest();
			
			break;
		case "Troop Event":
			$.$dataTroops[10000] = eventData;
			$.BattleManager.setup(10000, true, true);
			$.SceneManager.push($.Scene_Battle);
			
			window._playtestType = window.data.targetType;
			window._playtestBattleStarted = false;
			
			startGraphHightlight($.$gameTroop._interpreter);
			showCancelPlaytest();
			break;
	}

	focusPlayTestWindow();
};

function getCurrentInterpreterCommand(interpreter) {
	let index = interpreter._index;

	if (interpreter._waitMode || interpreter._waitCount > 0)
		index--;

	let command = interpreter._list[index];

	while (command && ($.Drag.VisualEvent.flatAssociatedCommandsCode.includes(command.code) || !command.code) && index > 0) {
		index--;
		command = interpreter._list[index];
	}

	return command;
};

function startGraphHightlight(interpreter) {
	stopGraphHighlight();
	
	if (window._highlightRetryInterval)
		clearInterval(window._highlightRetryInterval);
	
	const list = interpreter._list;
	if (!list) {
		window._highlightRetryInterval = setInterval(() => {
			if (!interpreter._list)
				return;
			
			clearInterval(window._highlightRetryInterval);
			startGraphHightlight(interpreter);
		}, 100);
		return;
	}
	
	window._playtestGraphAnimationsInterval = setInterval(() => {
		//check if event is still running (avoid harmless errors due to this interval sometimes running once just after event stop running)
		if (!interpreter._list || interpreter._list.length < interpreter._index) {
			if (window._playtestType !== "Troop Event")
				stopGraphHighlight();
			else
				startGraphHightlight(interpreter);
			
			return;
		}
		
		if (!window._playtestHighlightQueue || !window._playtestHighlightQueue.length)
			return;
		
		const nodeId = window._playtestHighlightQueue.shift();
		if (!nodeId) 
			return;
	
		const prevNode = getNodeById(window._playtestNodeId || 0);
		const node = getNodeById(nodeId);

		removeNodeHighlight();
		addHighlight(node);

		const curves = getCurvesBetweenNodes(prevNode, node);
		for (const curve of curves)
			if (curve)
				addHighlight(curve);

		window._playtestNodeId = nodeId;
	}, 1);
};

function stopGraphHighlight() {
	clearInterval(window._playtestGraphAnimationsInterval);
	window._playtestIndex = -1;
	for (const elem of document.querySelectorAll('.highlighted'))
		elem.classList.remove('highlighted');
};

function addHighlight(elem) {
	if (!elem)
		return;
	
	elem.classList.add('highlighted');
};

function removeHighlight(elem) {
	if (!elem)
		return;
	
	elem.classList.remove('highlighted');
};

function removeNodeHighlight() {
	for (const node of document.querySelectorAll('#graphNode.highlighted'))
		node.classList.remove('highlighted');
};

function showCancelPlaytest() {
	const playtestButton = document.querySelector('#playtest-button');				
	playtestButton.classList.add('hidden');
	
	if (window._cancelPlaytestInterval)
		clearInterval(window._cancelPlaytestInterval);
	
	const cancelPlaytestButton = document.querySelector('#cancel-playtest-button');
	cancelPlaytestButton.classList.remove('hidden');		
	
	window._cancelPlaytestInterval = setInterval(() => {
		if (window._playtestType === "Troop Event" && $.$gameTroop._inBattle)
			window._playtestBattleStarted = true;
		
		if (window._playtestType === "Troop Event" && window._playtestBattleStarted && !$.$gameTroop._inBattle)
			hideCancelPlaytest();
		else if (window._playtestType === "Common Event" || window._playtestType === "Map Event")
			if (!$.$gameMap || $.$gameMap._interpreter._list !== window._playtestList)
				hideCancelPlaytest();
	}, 10);
};

function hideCancelPlaytest() {
	stopGraphHighlight();
	clearInterval(window._cancelPlaytestInterval);
	
	const playtestButton = document.querySelector('#playtest-button');
	const cancelPlaytestButton = document.querySelector('#cancel-playtest-button');
	
	cancelPlaytestButton.classList.add('hidden');
	playtestButton.classList.remove('hidden');
	
	window._playtestType = null;
	window._playtestList = null;
	window._playtestBattleStarted = null;
};

function cancelPlaytest() {			
	stopGraphHighlight();
	
	if (window._playtestType === "Troop Event" && $.SceneManager._scene.constructor.name === "Scene_Battle")
		$.SceneManager.pop();
	else if (window._playtestType === "Common Event" || window._playtestType === "Map Event")
		$.$gameMap._interpreter.clear();
	
	hideCancelPlaytest();
	focusPlayTestWindow();
};