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
			behaviors.push({code: '_wait_variable', indent: command.indent, parameters: command.parameters});
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
			behaviors.push({code: '_wait_script', indent: command.indent, parameters: command.parameters});
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
		inputs: ['selectPictureId', 'picture'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: '_replace_picture', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Rotate Picture (Angle)", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_rotate_picture_angle", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectPictureId', 'anglePicture', 'durationFrame', 'waitForCompletion'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: '_rotate_picture_angle', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Move Picture (Position)", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_move_picture_position", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectPictureId', 'xPicturePosition', 'yPicturePosition', 'durationFrame', 'waitForCompletion', 'selectEasingType'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			if (command.parameters[2] === 0)
				command.parameters.splice(3, 0, 0);
			if (command.parameters[4] === 0)
				command.parameters.splice(5, 0, 0);
			behaviors.push({code: '_move_picture_position', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Get Picture Data", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_get_picture_data", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectPictureId', 'selectPictureData', 'variable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: '_get_picture_data', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Resize Picture", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_resize_picture", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectPictureId', 'widthPicture', 'heightPicture', 'durationFrame', 'waitForCompletion', 'selectEasingType'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			if (command.parameters[2] === 0)
				command.parameters.splice(3, 0, 0, 0);
			if (command.parameters[5] === 0)
				command.parameters.splice(6, 0, 0, 0);
			behaviors.push({code: '_resize_picture', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Change Picture Opacity", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_change_opacity_picture", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectPictureId', 'opacityPicture', 'durationFrame', 'waitForCompletion', 'selectEasingType'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: '_change_opacity_picture', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Change Picture Blend Mode", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_change_picture_blend_mode", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectPictureId', 'selectBlendMode'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: '_change_picture_blend_mode', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control", //string, category in node list 
		name: "Is Picture Shown", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_is_picture_shown", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectPictureId'], //array of string, list of inputs of the node
		outputs: ['ifOutput', 'elseOutput'], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			const ifConnection = editor.getNodeConnectionsById(node, 0).output; 
			if (editor.isConnectionConnected(ifConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(ifConnection)[0];
				behaviors.push({code: "_picture_shown", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
			}
				
			const elseConnection = editor.getNodeConnectionsById(node, 1).output; 
			if (editor.isConnectionConnected(elseConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(elseConnection)[0];
				behaviors.push({code: "_picture_not_shown", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
			}
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Center Picture", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_center_picture", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectPictureId', 'durationFrame', 'waitForCompletion', 'selectEasingType'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_center_picture', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture", //string, category in node list 
		name: "Erase Pictures In Range", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_erase_picture_range", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['startPictureId', 'endPictureId'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_erase_picture_range', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Scene Control", //string, category in node list 
		name: "Open Item Screen", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_open_item_screen", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: [], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_open_item_screen', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Scene Control", //string, category in node list 
		name: "Open Options Screen", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_open_options_scren", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: [], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_open_options_screen', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Scene Control", //string, category in node list 
		name: "Open Load Screen", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_open_load_screen", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: [], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_open_load_screen', indent: command.indent, parameters: command.parameters});
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
			behaviors.push({code: '_common_event_variable', indent: command.indent, parameters: command.parameters});
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
			// const parameters = [command.parameters[0], list];
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
		category: "Flow Control", //string, category in node list 
		name: "For Loop", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_for_loop", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['firstIndexVariable', 'selectForLoopCondition', 'lastIndexVariable', 'increment'], //array of string, list of inputs of the node
		outputs: ['loopOutput'], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: "_for_loop", indent: command.indent, parameters: command.parameters});
			
			//repeat branch
			const loopConnection = editor.getNodeConnectionsById(node, 0).output; 
			if (editor.isConnectionConnected(loopConnection)) {			
				const connectionConnectedNode = editor.getConnectionConnectedNodes(loopConnection)[0];
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
			} else
				behaviors.push({code: 0, indent: command.indent + 1, parameters: Array(0)});
			
			//end of loop
			behaviors.push({ 
				code: '_end_for_loop',
				indent: command.indent,
				parameters: command.parameters
			});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Control Variable (Text)", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_control_variable_text", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['variable', 'text'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: "_control_variable_text", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression", //string, category in node list 
		name: "Control Event Self Switch", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_control_event_self_switch", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['mapId', 'eventId', 'selectSelfSwitch', 'radioOnOff'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: "_control_event_self_switch", indent: command.indent, parameters: command.parameters});
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
			behaviors.push({code: "_set_variable_random_with_weight", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Party", //string, category in node list 
		name: "Set Gold", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_set_gold", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['selectOperand'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
			behaviors.push({code: "_set_gold", indent: command.indent, parameters: command.parameters});
		}
	},
	{
		category: "Variable Array", //string, category in node list 
		name: "Create Variable Array", //string, name of the node
		color: "dodgerblue",
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
		category: "Variable Array", //string, category in node list 
		name: "Set Item In Variable Array", //string, name of the node
		color: "dodgerblue",
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
		category: "Variable Array", //string, category in node list 
		name: "Add Item In Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_add_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayIndex', 'selectArrayItem', 'noDuplicateArrayItems'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_add_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Get Item In Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_get_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayIndex', 'variable', 'removeArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_get_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Get Random Item In Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_get_random_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'variable', 'removeArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_get_random_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Shuffle Items Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_shuffle_items_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_shuffle_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Sort Items Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_sort_items_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_sort_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Merge Variables Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_merge_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayVariable', 'noDuplicateArrayItems'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_merge_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Reverse Items Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_reverse_items_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_reverse_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Variable Array Includes Item", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_variable_array_includes_item", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'selectArrayItem', 'switch'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_variable_array_includes_item", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control", //string, category in node list 
		name: "Variable Array Includes Item (Exec)", //string, name of the node
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_variable_array_includes_item_exec", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'selectArrayItem'], //array of string, list of inputs of the node
		outputs: ['ifOutput', 'elseOutput'], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			const ifConnection = editor.getNodeConnectionsById(node, 0).output; 
			if (editor.isConnectionConnected(ifConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(ifConnection)[0];
				behaviors.push({code: "_variable_array_includes_item_exec", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
			}
				
			const elseConnection = editor.getNodeConnectionsById(node, 1).output; 
			if (editor.isConnectionConnected(elseConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(elseConnection)[0];
				behaviors.push({code: "_variable_array_not_includes_item_exec", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
			}
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Replace Item In Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_replace_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'selectArrayItem', 'selectArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_replace_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Set Variable Array Length", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_set_variable_array_length", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayLength', 'fillArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_set_variable_array_length", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Remove Item From Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_remove_item_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'selectArrayItem'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_remove_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Remove Index From Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_remove_index_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'arrayIndex'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_remove_index_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array", //string, category in node list 
		name: "Join Items From Variable Array", //string, name of the node
		color: "dodgerblue",
		engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
		event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
		id: "custom_node_join_items_variable_array", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
		exec_input: true, //boolean, default true, define if node have input execution connection
		exec_output: true, //boolean, default true, define if node have output execution connection
		inputs: ['arrayVariable', 'separator', 'variable'], //array of string, list of inputs of the node
		outputs: [], //array of string, list of outputs of the node
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_join_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}
];