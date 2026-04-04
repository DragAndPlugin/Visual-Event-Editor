module.exports = function(VisualEvent, RPGMAKER_NAME) {
	VisualEvent.getPluginList = function(document) {
		if (!document)
			return [];
		
		return Array.from(document.querySelectorAll('script')).filter(script => script.src.includes('js/plugins/')).map(script => script.src.split('/js/plugins/').pop().replace('.js', ''));
	};
	
	VisualEvent.fetchPluginCommands = function(name, callback, parseParams = true, parseCommands = true) {
		VisualEvent.fetchPluginText(name, {parseParams: parseParams, parseCommands: parseCommands}, callback);
	};
	
	VisualEvent.fetchPluginText = function(name, options, callback) {
		name = name.replace('.js', '').trim();
		fetch(`js/plugins/${name}.js`).then(res => {
			return res.text();
		}).then(text => {
			const parsed = VisualEvent.parsePluginJSDoc(text, name, options);
			callback(parsed);
		});
	};
	
	VisualEvent.parsePluginJSDoc = function(text, name, options = {parseParams: true, parseCommands: true}) {
		if (RPGMAKER_NAME !== "MZ") {
			VisualEvent.pluginJSDocData[name] = {};
			return {}
		}
		
		const jsdocRegex = /@[^@\n]+|~struct~\w+:/g;
		const structRegex = /~struct~\w+:/g;
		const matches = [...text.matchAll(jsdocRegex)];
		
		const pluginData = {};
		if (options.parseParams)
			pluginData.params = {};
		if (options.parseCommands)
			pluginData.commands = {};
		if (options.parseParams || options.parseCommands)
			pluginData.structs = {};
		
		for (const [i, match] of matches.entries()) {
			if (match.parsed)
				continue;
			
			const [tag, val] = VisualEvent.parseJSDocTag(match[0]);
			
			const isStruct = tag.match(structRegex);
			if (tag === "command" || tag === "param" || isStruct) {
				const data = {name: !isStruct ? val : VisualEvent.getStructName(tag)};
				
				for (let j = i + 1; j < matches.length; j++) {
					const [subTag, subVal] = VisualEvent.parseJSDocTag(matches[j][0]);
					
					if (subTag === "command" || (subTag === "param" && !isStruct) || subTag.match(structRegex)) 
						break;
					else {
						if (tag === "command" && options.parseCommands) {
							if (subTag === "arg") {
								data.args = data.args || [];
								data.args.push({name: subVal});
							} else {
								if (!data.args)
									data[subTag] = subVal;
								else
									VisualEvent.parseJSDocTagAndVal(subTag, subVal, data.args[data.args.length - 1]);
							}
						} else if (tag === "param" && options.parseParams) {
							VisualEvent.parseJSDocTagAndVal(subTag, subVal, data);
						} else if (isStruct && (options.parseCommands || options.parseParams)) {
							if (subTag === "param") {
								data.params = data.params || [];
								data.params.push({name: subVal});
							} else
								VisualEvent.parseJSDocTagAndVal(subTag, subVal, data.params[data.params.length - 1]);
						}
						
						matches[j].parsed = true;
					}
				}
				
				if (tag === "command" && options.parseCommands)
					pluginData.commands[val] = data;
				else if (tag === "param" && options.parseParams && !isStruct)
					pluginData.params[val] = data;
				else if (isStruct && (options.parseCommands || options.parseParams))
					pluginData.structs[data.name] = data;
				
			} else
				pluginData[tag] = val;
		}
		
		VisualEvent.pluginJSDocData[name] = pluginData;
		return pluginData;
	};
	
	VisualEvent.parseJSDocTag = function(text) {
		const tag = text.replace(/ .*/, '').replace("@", '').trim();
		const val = text.substring(tag.length + 1).trim();
		
		return [tag, val];
	};
	
	VisualEvent.parseJSDocTagAndVal = function(tag, val, obj) {
		const structTypeRegex = /struct<\w+>/g;
		
		if (tag === "type" && val.slice(-2) === "[]") {
			val = val.slice(0, -2);
			obj[tag] = val
			obj["isList"] = true;
		} else if (tag !== "option" && tag !== "value")
			obj[tag] = val;
		
		if (tag === "type" && (val === "combo" || val === "select")) {
			obj["options"] = [];
			obj["values"] = [];
		} else if (obj["options"] && tag === "option") {
			obj["options"].push(val);
			obj["values"].push(val);
		} else if (obj["values"] && tag === "value") 
			obj["values"][obj["values"].length - 1] = val;
		
		if (tag === "type" && val.match(structTypeRegex)) {
			obj["structName"] = VisualEvent.getStructName(val);
			obj["type"] = "struct";
		}
	};
	
	VisualEvent.getStructName = function(structString) {
		return structString.replace("struct<", "").replace("~struct~", "").replace(">", "").replace(":", "").replace("[]", "").trim();
	};
	
	VisualEvent.getPluginCommandParameters = function(pluginName, commandName) {
		const pluginData = VisualEvent.pluginJSDocData[pluginName];
		const commandData = pluginData ? pluginData.commands[commandName] : null;
		const commandArgs = commandData ? commandData.args : null;
		return commandArgs ? commandArgs.map(item => {return {...item}}) : []; //two level deep copy
	};
};