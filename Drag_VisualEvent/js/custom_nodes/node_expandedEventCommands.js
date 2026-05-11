module.exports = [
	{
		category: "Timing",
		name: "Wait (Variable)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_wait_variable",
		exec_input: true,
		exec_output: true,
		inputs: ['variable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_wait_variable', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Timing",
		name: "Wait (Script)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_wait_script",
		exec_input: true,
		exec_output: true,
		inputs: ['text'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_wait_script', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture",
		name: "Replace Picture",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_replace_picture",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId', 'picture'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_replace_picture', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture",
		name: "Rotate Picture (Angle)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_rotate_picture_angle",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId', 'anglePicture', 'durationFrame', 'waitForCompletion'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_rotate_picture_angle', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture",
		name: "Move Picture (Position)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_move_picture_position",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId', 'xPicturePosition', 'yPicturePosition', 'durationFrame', 'waitForCompletion', 'selectEasingType'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			if (command.parameters[2] === 0)
				command.parameters.splice(3, 0, 0);
			if (command.parameters[4] === 0)
				command.parameters.splice(5, 0, 0);
			behaviors.push({code: '_move_picture_position', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture",
		name: "Get Picture Data",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_get_picture_data",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId', 'selectPictureData', 'variable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_get_picture_data', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture",
		name: "Resize Picture",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_resize_picture",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId', 'widthPicture', 'heightPicture', 'durationFrame', 'waitForCompletion', 'selectEasingType'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			if (command.parameters[2] === 0)
				command.parameters.splice(3, 0, 0, 0);
			if (command.parameters[5] === 0)
				command.parameters.splice(6, 0, 0, 0);
			behaviors.push({code: '_resize_picture', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture",
		name: "Change Picture Opacity",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_change_opacity_picture",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId', 'opacityPicture', 'durationFrame', 'waitForCompletion', 'selectEasingType'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_change_opacity_picture', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture",
		name: "Change Picture Blend Mode",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_change_picture_blend_mode",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId', 'selectBlendMode'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_change_picture_blend_mode', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control",
		name: "Is Picture Shown",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_is_picture_shown",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId'],
		outputs: ['ifOutput', 'elseOutput'],
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
		category: "Picture",
		name: "Center Picture",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_center_picture",
		exec_input: true,
		exec_output: true,
		inputs: ['selectPictureId', 'durationFrame', 'waitForCompletion', 'selectEasingType'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_center_picture', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Picture",
		name: "Erase Pictures In Range",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_erase_picture_range",
		exec_input: true,
		exec_output: true,
		inputs: ['startPictureId', 'endPictureId'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_erase_picture_range', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Scene Control",
		name: "Open Item Screen",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_open_item_screen",
		exec_input: true,
		exec_output: true,
		inputs: [],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_open_item_screen', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Scene Control",
		name: "Open Options Screen",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_open_options_scren",
		exec_input: true,
		exec_output: true,
		inputs: [],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_open_options_screen', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Scene Control",
		name: "Open Load Screen",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_open_load_screen",
		exec_input: true,
		exec_output: true,
		inputs: [],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_open_load_screen', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control",
		name: "Common Event (Variable)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_common_event_variable",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'resetVariable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_common_event_variable', indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control",
		name: "Switch",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_switch",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'outputStringList'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			const list = command.parameters.splice(1, command.parameters.length);
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
		category: "Flow Control",
		name: "For Loop",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_for_loop",
		exec_input: true,
		exec_output: true,
		inputs: ['firstIndexVariable', 'selectForLoopCondition', 'lastIndexVariable', 'increment'],
		outputs: ['loopOutput'],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
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
		category: "Game Progression",
		name: "Control Variable (Text)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_control_variable_text",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'text'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_control_variable_text", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression",
		name: "Control Event Self Switch",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_control_event_self_switch",
		exec_input: true,
		exec_output: true,
		inputs: ['mapId', 'eventId', 'selectSelfSwitch', 'radioOnOff'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_control_event_self_switch", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression",
		name: "Set Variable Random With Weight",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_set_variable_random_with_weight",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'stringIntList'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_set_variable_random_with_weight", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Party",
		name: "Set Gold",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_set_gold",
		exec_input: true,
		exec_output: true,
		inputs: ['selectOperand'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_set_gold", indent: command.indent, parameters: command.parameters});
		}
	},
	{
		category: "Variable Array",
		name: "Create Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_create_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'itemList'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_create_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Set Item In Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_set_item_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'arrayIndex', 'selectArrayItem'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_set_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Add Item In Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_add_item_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'arrayIndex', 'selectArrayItem', 'noDuplicateArrayItems'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_add_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Get Item In Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_get_item_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'arrayIndex', 'variable', 'removeArrayItem'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_get_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Get Random Item In Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_get_random_item_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'variable', 'removeArrayItem'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_get_random_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Shuffle Items Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_shuffle_items_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_shuffle_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Sort Items Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_sort_items_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_sort_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Merge Variables Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_merge_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'arrayVariable', 'noDuplicateArrayItems'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_merge_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Reverse Items Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_reverse_items_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_reverse_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Variable Array Includes Item",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_variable_array_includes_item",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'selectArrayItem', 'switch'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_variable_array_includes_item", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control",
		name: "Variable Array Includes Item (Exec)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_variable_array_includes_item_exec",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'selectArrayItem'],
		outputs: ['ifOutput', 'elseOutput'],
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
		category: "Variable Array",
		name: "Replace Item In Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_replace_item_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'selectArrayItem', 'selectArrayItem'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_replace_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Set Variable Array Length",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_set_variable_array_length",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'arrayLength', 'fillArrayItem'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_set_variable_array_length", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Remove Item From Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_remove_item_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'selectArrayItem'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_remove_item_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Remove Index From Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_remove_index_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'arrayIndex'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_remove_index_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Variable Array",
		name: "Join Items From Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_join_items_variable_array",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'separator', 'variable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_join_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}
];