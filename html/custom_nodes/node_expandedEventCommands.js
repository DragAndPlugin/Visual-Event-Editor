module.exports = [
	{
		category: "Timing", //string, category in node list 
		name: "Wait (Variable)", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_wait_variable", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['variable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: 1001, indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Timing", //string, category in node list 
		name: "Wait (Script)", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_wait_script", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['text'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: 1004, indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Replace Picture", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_replace_picture", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['pictureNumber', 'picture'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: 1002, indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control", //string, category in node list 
		name: "Common Event (Variable)", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_common_event_variable", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['variable', 'resetVariable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: 1003, indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control", //string, category in node list 
		name: "Switch", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_switch", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['variable', 'outputStringList'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			const list = command.parameters.splice(1, command.parameters.length);
			const parameters = [command.parameters[0], list];
			
			for (const [i, branch] of list.entries()) {
				const branchConnection = editor.getNodeConnectionsById(node, i).output; 
				if (editor.isConnectionConnected(branchConnection)) {
					const connectionConnectedNode = editor.getConnectionConnectedNodes(branchConnection)[0];
					behaviors.push({code: "_custom_node_switch", indent: command.indent, parameters: [command.parameters[0], list[i]]});
					behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[i]));
				} 
			}
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Set Variable Random With Weight", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_set_variable_random_with_weight", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['variable', 'stringIntList'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: "_custom_node_set_variable_random_with_weight", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Create Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_create_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['variable', 'itemList'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: "_create_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Set Item In Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_set_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayIndex', 'selectArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_set_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Add Item In Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_add_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayIndex', 'selectArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_add_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Get Item In Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_get_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'selectArrayGetMode', 'variable', 'removeArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_get_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Shuffle Items Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_shuffle_items_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_shuffle_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Sort Items Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_sort_items_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_sort_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Merge Variables Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_merge_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayVariable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_merge_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Reverse Items Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_reverse_items_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_reverse_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Variable Array Includes Item", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_variable_array_includes_item", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'selectArrayItem', 'switch'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_variable_array_includes_item", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Replace Item In Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_replace_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'selectArrayItem', 'selectArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_replace_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Set Variable Array Length", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_set_variable_array_length", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayLength', 'fillArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_set_variable_array_length", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Remove Item From Variable Array", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_remove_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'selectArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_custom_node_remove_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}
];