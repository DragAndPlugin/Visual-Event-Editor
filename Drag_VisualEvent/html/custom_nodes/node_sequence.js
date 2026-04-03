module.exports = [{
	category: "Flow Control", //string, category in node list 
	name: "Sequence", //string, name of the node
	engine: ["MV", "MZ"], //string/array of strings, default ["MV", "MZ"], node will not be available in engine not listed here here
	event_type: ["common", "map", "troop"], //string, array of strings, default ["common", "map", "troop"], node will not be available in event type not listed here // TO DO
	id: "custom_node_sequence", //string, unique id for this node, will overwrite/be overwritten by other custom nodes with the same id
	exec_input: true, //boolean, default true, define if node have input execution connection
	exec_input_params: {
		is_list: false, //boolean, default false, define if list buttons are added to let user add/remove inputs
		min_list: 1, //int, default 1, the minimum input list length, doesn't do anything if is_list is set to false
		mono: false, //boolean, default false, define if input can only accept one connection/curve 
		exclusive: "exec", //string, default "exec", define what kind of connections the input accept
	},
	exec_output: true, //boolean, default true, define if node have output execution connection
	exec_output_params: {
		is_list: true,
		min_list: 1,
		exclusive: "exec",
	},
	inputs: [], //array of string, list of inputs of the node
	outputs: [], //array of string, list of outputs of the node
	parse: (editor, command, node, behaviors, inputs, sequence) => { //function, define what the node do when parsed within an event
		const outputConnections = editor.getNodeConnections(node).outputs;
		outputConnections.pop(); //last exec connection is processed naturally by native editor parsing function, so we don't process it here 
		for (const [index, outputConnection] of outputConnections.entries())
			if (editor.isConnectionConnected(outputConnection)) {
				const connectionConnectedNode = editor.getConnectionConnectedNodes(outputConnection)[0];
				behaviors.push(...editor.parseNodesBehavior(connectionConnectedNode, command.indent, sequence ? sequence[index] : null, false, false));
			}
	}
}];