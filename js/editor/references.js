function registerNodeReferences(node) {
	if (!node)
		return;
	
	const inputs = getNodeInputs(node).filter(input => !input.disabled);
	const nodeId = getNodeId(node);
	
	const inputsTypes = [];
	const inputsValues = [];
	for (const input of inputs) {
		const inputType = input.getAttribute('data-inputType');
		if (['select', 'radio', 'checkbox', 'empty'].includes(inputType))
			continue;
		
		const inputValue = parseNodeInputs(node, [input], true, true, false);
		inputsTypes.push(inputType);
		inputsValues.push(inputValue[0]);
	}

	const references = getEventCacheItem('references', window.data.targetType, window.data.mapTargetId, window.data.targetId, window.data.pageId) || [];
	references[nodeId] = { 
		nodeId: nodeId,
		commandCode: getNodeCommandCode(node),
		commandName: getNodeCommandName(node),
		types: inputsTypes,
		values: inputsValues
	};
	
	saveItemInEventCache('references', references, window.data.targetType, window.data.mapTargetId, window.data.targetId, window.data.pageId);				
};

function searchReferences(searchIn = {}, searchFor = {}) {
	const refs = {count: 0};
	for (const eventType in searchIn) {
		switch (eventType) {
			case 'Common Event':
				const commonEvents = searchIn[eventType].ids === '*' ? getCommonEventsInRange(1, getCommonEventCount()) : getCommonEventsInRange(searchIn[eventType].ids[0], searchIn[eventType].ids[1]);
				for (const commonEvent of commonEvents) {
					if (hasEventInCache(eventType, commonEvent.id)) {
						const eventCache = getEventCache(eventType, getEventKey(eventType, null, commonEvent.id));
						const correspondingRefs = searchForRefsFromEventCache(eventCache, searchFor);
						if (correspondingRefs.length > 0) {
							if (!refs[eventType])
								refs[eventType] = [];
							
							refs[eventType].push({event: commonEvent, refs: correspondingRefs});
							refs.count += correspondingRefs.length;
						}
					} else {
						const commandIds = searchForRefsInEventList(commonEvent.list, searchFor);
						if (commandIds.length > 0) {
							if (!refs[eventType])
								refs[eventType] = [];
							
							refs[eventType].push({event: commonEvent, commandIds: commandIds});
							refs.count += commandIds.length;
						}
					}
				}
				
				break;
			case 'Map Event':
				const mapList = $.Drag.VisualEvent.getMapList();
				for (const mapFilename of mapList) {
					const mapId = $.Drag.VisualEvent.extractMapId(mapFilename);
					if (searchIn[eventType].mapIds !== '*' && (mapId < searchIn[eventType].mapIds[0] || mapId > searchIn[eventType].mapIds[1]))
						continue;
					
					const map = hasMapInCache(mapId) ? getMapFromCache(mapId) : require(`./data/${mapFilename}`);								
					const mapEvents = searchIn[eventType].ids === '*' ? getMapEventsInRange(mapId, 1, getMapEventCount(map)) : getMapEventsInRange(mapId, searchIn[eventType].ids[0], searchIn[eventType].ids[1]);
					for (const mapEvent of mapEvents)
						for (const [pageId, page] of mapEvent.pages.entries()) {
							if (searchIn[eventType].pageIds !== '*' && (pageId < searchIn[eventType].pageIds[0] || pageId > searchIn[eventType].pageIds[1]))
								continue;
							
							const pageCache = getEventCache(eventType, getEventKey(eventType, mapId, mapEvent.id, pageId));
							if (pageCache) {
								const correspondingRefs = searchForRefsFromEventCache(pageCache, searchFor);
								if (correspondingRefs.length > 0) {
									if (!refs[mapFilename])
										refs[mapFilename] = [];
									
									refs[mapFilename].push({event: mapEvent, pageId: pageId, mapId: mapId, refs: correspondingRefs});
									refs.count += correspondingRefs.length;
								}
							} else {
								const commandIds = searchForRefsInEventList(page.list, searchFor);
								if (commandIds.length > 0) {
									if (!refs[mapFilename])
										refs[mapFilename] = [];
									
									refs[mapFilename].push({event: mapEvent, pageId: pageId, mapId: mapId, commandIds: commandIds});
									refs.count += commandIds.length;
								}
							}
						}
				}
				break;
			case 'Troop Event':
				const troopEvents = searchIn[eventType].ids === '*' ? getTroopEventsInRange(1, getTroopEventCount()) : getTroopEventsInRange(searchIn[eventType].ids[0], searchIn[eventType].ids[1]);
				if (searchIn[eventType].pageIds !== '*')
					searchIn[eventType].pageIds.sort();
				
				for (const troopEvent of troopEvents) {
					for (const [pageId, page] of troopEvent.pages.entries()) {
						if (searchIn[eventType].pageIds !== '*' && (pageId < searchIn[eventType].pageIds[0] || pageId > searchIn[eventType].pageIds[1]))
							continue;
						
						const pageCache = getEventCache(eventType, getEventKey(eventType, null, troopEvent.id, pageId));
						if (pageCache) {
							const correspondingRefs = searchForRefsFromEventCache(pageCache, searchFor);
							if (correspondingRefs.length > 0) {
								if (!refs[eventType])
									refs[eventType] = [];
								
								refs[eventType].push({event: troopEvent, pageId: pageId, refs: correspondingRefs});
								refs.count += correspondingRefs.length;
							}
						} else {
							const commandIds = searchForRefsInEventList(page.list, searchFor);
							if (commandIds.length > 0) {
								if (!refs[eventType])
									refs[eventType] = [];
								
								refs[eventType].push({event: troopEvent, pageId: pageId, commandIds: commandIds});
								refs.count += commandIds.length;
							}
						}
					}
				}
				break;
		}
	}
	return refs;
};

function searchForRefsFromEventCache(eventCache, search) {
	if (!eventCache || !search || !eventCache.references)
		return [];
	
	const refs = [];
	const references = eventCache.references;
	for (const reference of references) {
		if (!reference)
			continue;
		
		if (eventCacheReferenceMeetSearch(reference, search))
			refs.push(reference);
	}
	
	return refs;
};

function eventCacheReferenceMeetSearch(reference, search) {
	const result = new Array(search.items.types.length).fill(false);
	for (const [typeId, type] of search.items.types.entries()) {
		if (type === 'command') {
			const commandCode = search.items.values[typeId];
			if (commandCode == reference.commandCode) {
				if (search.mode === 0)
					return true;
				else
					result[typeId] = true;
			}
		} else {
			const indexes = $.Drag.VisualEvent.findAllIndexes(reference.types, type);
			const values = reference.values;
			for (const index of indexes) {
				if (type === "text" && values[index].includes(search.items.values[typeId])) {
					if (search.mode === 0)
						return true;
					else
						result[typeId] = true;
				} else if (Array.isArray(values[index]) && Array.isArray(search.items.values[typeId]) && $.Drag.VisualEvent.arrayIncludesArray(values[index], search.items.values[typeId])) {
					if (search.mode === 0)
						return true;
					else
						result[typeId] = true;
				} else if (values[index] == search.items.values[typeId]) {
					if (search.mode === 0)
						return true;
					else
						result[typeId] = true;
				}
			}
		}
	}
	
	return result.every(item => item);
};

function searchForRefsInEventList(list, searchFor) {
	if (!list || !searchFor)
		return [];
	
	const commandIds = [];
	for (const [commandId, command] of list.entries())
		if (commandMeetSearch(command, searchFor))
			commandIds.push(commandId);
	
	return commandIds;
};

function commandMeetSearch(command, search) {
	if (!command || !command.code)
		return false;
	
	const isPluginCommand = command.code === 357;
	
	let commandParameters;
	if (isPluginCommand)
		commandParameters = $.Drag.VisualEvent.getPluginCommandParameters(command.parameters[0], command.parameters[1]);
		
	else
		commandParameters = $.Drag.VisualEvent.getCommandParameters(command.code);
	
	if (!commandParameters || !Array.isArray(commandParameters))
		return false;
	
	commandParameters = commandParameters.filter(commandParameter => !commandParameter.notParam);
	
	if (!isPluginCommand) {
		const commandParametersIndex = $.Drag.VisualEvent.commandsParametersIndex[`command${command.code}`];
		setCommandParametersIndexs(commandParameters, commandParametersIndex);
	}
	
	const parameters = isPluginCommand ? getPluginParametersFromParametersValues(commandParameters, command.parameters) : getParametersFromParametersValues(commandParameters, command.parameters);
	const parametersTypes = parameters.map(commandParameter => commandParameter.type);
	const parametersValues = parameters.map(commandParameter => commandParameter.value);
	
	const result = new Array(search.items.types.length).fill(false);
	for (const [typeId, type] of search.items.types.entries()) {
		if (type === 'command') {
			const commandCode = parseInt(search.items.values[typeId]);
			if (commandCode === command.code) {
				if (search.mode === 0)
					return true;
				else
					result[typeId] = true;
			}
		} else {
			const indexes = $.Drag.VisualEvent.findAllIndexes(parametersTypes, type);
			for (const index of indexes) {
				if (parametersValues[index] == search.items.values[typeId]) {
					if (search.mode === 0)
						return true;
					else
						result[typeId] = true;
				}
			}
		}
	}

	return result.every(item => item);
};