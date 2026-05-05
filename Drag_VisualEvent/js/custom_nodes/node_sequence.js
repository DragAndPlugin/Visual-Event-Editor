module.exports = [{
	category: "Flow Control", 
	name: "Sequence",
	engine: ["MV", "MZ"],
	event_type: ["common", "map", "troop"],
	id: "custom_node_sequence",
	description: "Executes each output in sequence from top to bottom. Does not perform any action by itself - used to organize execution flow.",
	exec_input: true,
	exec_input_params: {
		is_list: false,
		min_list: 1,
		mono: false,
		exclusive: "exec",
	},
	exec_output: true,
	exec_output_params: {
		is_list: true,
		min_list: 1,
		exclusive: "exec",
	},
	inputs: [],
	outputs: [],
	parse: (editor, command, node, behaviors, inputs, sequence) => {
		const outputConnections = editor.getNodeConnections(node).outputs;
		outputConnections.pop(); //last exec connection is processed naturally by native editor parsing function, so we don't process it here 
		for (const [index, outputConnection] of outputConnections.entries())
			if (editor.isConnectionConnected(outputConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(outputConnection)[0];
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent, sequence ? sequence[index] : null, false, false));
			}
	}
}];