module.exports = [

	// -------------------------------- TIMING --------------------------------

	{
		category: "Timing",
		name: "Wait (Variable)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_wait_variable",
		description: "Pauses the event execution for a number of frames stored inside a variable.",
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
		description: "Pauses the event execution for a number of frames returned by a JavaScript expression or script.",
		exec_input: true,
		exec_output: true,
		inputs: ['text'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_wait_script', indent: command.indent, parameters: command.parameters});
		}
	},

	// -------------------------------- PICTURES --------------------------------
	
	{
		category: "Picture",
		name: "Replace Picture",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_replace_picture",
		description: "Replaces the image file used by an existing picture while keeping its current position, scale, opacity, and other properties intact.",
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
		description: "Rotates a picture toward a specific angle over a chosen duration.",
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
		description: "Moves a picture to a new screen position with optional easing and wait completion while preserving other properties.",
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
		description: "Retrieves information from a picture and stores it inside a variable.",
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
		description: "Changes the size of a picture with optional easing and wait completion while preserving other properties.",
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
		description: "Changes a picture’s opacity with optional easing and wait completion while preserving other properties.",
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
		description: "Changes the blend mode of a picture while preserving other properties.",
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
		description: "Checks whether a specific picture is currently displayed.",
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
		description: "Moves a picture to the center of the screen with optional easing and wait completion.", 
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
		description: "Erases all pictures within a specified picture ID range.",
		exec_input: true,
		exec_output: true,
		inputs: ['startPictureId', 'endPictureId'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_erase_picture_range', indent: command.indent, parameters: command.parameters});
		}
	}, 
	
	// -------------------------------- SCENES --------------------------------
	
	{
		category: "Scene Control",
		name: "Open Item Screen",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_open_item_screen",
		description: "Opens the Item menu screen.",
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
		description: "Opens the Options menu screen.",
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
		description: "Opens the Load menu screen.",
		exec_input: true,
		exec_output: true,
		inputs: [],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: '_open_load_screen', indent: command.indent, parameters: command.parameters});
		}
	}, 
	
	// -------------------------------- FLOW CONTROL --------------------------------
	
	{
		category: "Flow Control",
		name: "Common Event (Variable)",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_common_event_variable",
		description: "Runs a common event using an ID stored inside a variable.",
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
		description: "Branches event execution based on the value of a variable.",
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
		description: "Runs a branch repeatedly using a variable-based loop counter.",
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
	
	// -------------------------------- VARIABLE TEXT --------------------------------
	
	{
		category: "Game Progression",
		name: "Set Variable Text",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_control_variable_text",
		description: "Stores text inside a game variable.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'text'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_control_variable_text", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control",
		name: "Is Variable Text",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_is_variable_text",
		description: "Checks whether a variable currently contains text/string data.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable'],
		outputs: ['ifOutput', 'elseOutput'],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			const ifConnection = editor.getNodeConnectionsById(node, 0).output; 
			if (editor.isConnectionConnected(ifConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(ifConnection)[0];
				behaviors.push({code: "_variable_is_text", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
			}
			
			const elseConnection = editor.getNodeConnectionsById(node, 1).output; 
			if (editor.isConnectionConnected(elseConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(elseConnection)[0];
				behaviors.push({code: "_variable_is_not_text", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
			}
		}
	}, 
	{
		category: "Game Progression",
		name: "Concat Variable Text",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_concat_variable_text",
		description: "Adds text to the existing text stored in a variable.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'selectVariableText'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_concat_variable_text", indent: command.indent, parameters: command.parameters});
		}
	},
	{
		category: "Game Progression",
		name: "Change Variable Text Casing",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_change_variable_text_casing",
		description: "Changes the capitalization of text stored inside a variable.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'selectTextCasing'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_change_variable_text_casing", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression",
		name: "Trim Variable Text",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_trim_variable_text",
		description: "Removes extra whitespace from the beginning and end of text stored inside a variable.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_trim_variable_text", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Game Progression",
		name: "Replace Variable Text",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_replace_variable_text",
		description: "Replaces part of the text stored inside a variable using a selected text pattern and replacement value.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'selectTextPattern', 'replacement'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_replace_variable_text", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control",
		name: "Variable Text Starts With",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_variable_text_starts_with",
		description: "Checks whether the text stored inside a variable starts with a specific value.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'text'],
		outputs: ['ifOutput', 'elseOutput'],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			const ifConnection = editor.getNodeConnectionsById(node, 0).output; 
			if (editor.isConnectionConnected(ifConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(ifConnection)[0];
				behaviors.push({code: "_variable_text_starts_with", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
			}
				
			const elseConnection = editor.getNodeConnectionsById(node, 1).output; 
			if (editor.isConnectionConnected(elseConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(elseConnection)[0];
				behaviors.push({code: "_variable_text_starts_not_with", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
			}
		}
	}, 
	{
		category: "Flow Control",
		name: "Variable Text Ends With",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_variable_text_ends_with",
		description: "Checks whether the text stored inside a variable ends with a specific value.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'text'],
		outputs: ['ifOutput', 'elseOutput'],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			const ifConnection = editor.getNodeConnectionsById(node, 0).output; 
			if (editor.isConnectionConnected(ifConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(ifConnection)[0];
				behaviors.push({code: "_variable_text_ends_with", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
			}
				
			const elseConnection = editor.getNodeConnectionsById(node, 1).output; 
			if (editor.isConnectionConnected(elseConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(elseConnection)[0];
				behaviors.push({code: "_variable_text_ends_not_with", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
			}
		}
	}, 
	{
		category: "Flow Control",
		name: "Variable Text Includes",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_variable_text_includes",
		description: "Checks whether the text stored inside a variable ends with a specific value.",
		exec_input: true,
		exec_output: true,
		inputs: ['variable', 'text'],
		outputs: ['ifOutput', 'elseOutput'],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			const ifConnection = editor.getNodeConnectionsById(node, 0).output; 
			if (editor.isConnectionConnected(ifConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(ifConnection)[0];
				behaviors.push({code: "_variable_text_includes", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
			}
				
			const elseConnection = editor.getNodeConnectionsById(node, 1).output; 
			if (editor.isConnectionConnected(elseConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(elseConnection)[0];
				behaviors.push({code: "_variable_text_includes_not", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
			}
		}
	}, 
	
	// -------------------------------- SELF SWITCH --------------------------------
	
	{
		category: "Game Progression",
		name: "Control Event Self Switch",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_control_event_self_switch",
		description: "Changes the state of a specific self switch on a specific event.",
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
		name: "Toggle Event Self Switch",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_toggle_event_self_switch",
		description: "Toggles a specific event self switch between ON and OFF.",
		exec_input: true,
		exec_output: true,
		inputs: ['mapId', 'eventId', 'selectSelfSwitch'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_toggle_event_self_switch", indent: command.indent, parameters: command.parameters});
		}
	}, 
	{
		category: "Flow Control",
		name: "Is Event Self Switch On",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_control_is_event_self_switch_on",
		description: "Checks whether a specific event self switch is currently ON.",
		exec_input: true,
		exec_output: true,
		inputs: ['mapId', 'eventId', 'selectSelfSwitch'],
		outputs: ['ifOutput', 'elseOutput'],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			const ifConnection = editor.getNodeConnectionsById(node, 0).output; 
			if (editor.isConnectionConnected(ifConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(ifConnection)[0];
				behaviors.push({code: "_event_self_switch_is_on", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[0]));
			}
				
			const elseConnection = editor.getNodeConnectionsById(node, 1).output; 
			if (editor.isConnectionConnected(elseConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(elseConnection)[0];
				behaviors.push({code: "_event_self_switch_is_off", indent: command.indent, parameters: command.parameters});
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent + 1, sequence[1]));
			}
		}
	}, 
	
	// -------------------------------- MISCS --------------------------------
	
	{
		category: "Game Progression",
		name: "Set Variable Random With Weight",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_set_variable_random_with_weight",
		description: "Sets a variable to a random value using weighted probabilities.",
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
		description: "Directly sets the party’s current gold amount.",
		exec_input: true,
		exec_output: true,
		inputs: ['selectOperand'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_set_gold", indent: command.indent, parameters: command.parameters});
		}
	},
	
	// -------------------------------- VARIABLE ARRAY --------------------------------
	
	{
		category: "Variable Array",
		name: "Create Variable Array",
		color: "dodgerblue",
		engine: ["MV", "MZ"],
		event_type: ["common", "map", "troop"],
		id: "custom_node_create_variable_array",
		description: "Creates an array inside a variable with optional starting items.",
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
		description: "Sets or replaces an item at a specific index inside a variable array.",
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
		description: "Adds an item to a variable array.",
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
		description: "Retrieves an item from a variable array and stores it inside a variable.",
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
		description: "Retrieves a random item from a variable array and stores it inside a variable.",
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
		description: "Randomly shuffles the order of items inside a variable array.",
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
		description: "Sorts the items inside a variable array.",
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
		description: "Merges second variable array into the first variable array.",
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
		description: "Reverses the order of items inside a variable array.",
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
		description: "Checks whether a variable array contains a specific item and stores the result inside a switch.",
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
		description: "Checks whether a variable array contains a specific item using execution branches.",
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
		description: "Replaces occurrences of one item inside a variable array with another item.",
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
		description: "Changes the size of a variable array.",
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
		description: "Removes a specific item from a variable array.",
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
		description: "Removes an item at a specific index from a variable array.",
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
		description: "Combines all items from a variable array into a single text string using a separator, then stores the result inside a variable.",
		exec_input: true,
		exec_output: true,
		inputs: ['arrayVariable', 'separator', 'variable'],
		outputs: [],
		parse: (editor, command, node, behaviors, inputs, sequence) => {
			behaviors.push({code: "_join_items_variable_array", indent: command.indent, parameters: command.parameters});
		}
	}
];