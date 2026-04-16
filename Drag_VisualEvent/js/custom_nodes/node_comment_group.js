const NODE_COMMENT_GROUP = {};

module.exports = [{
	category: "Utility",
	color: "black",
	name: "Comment (Graph)",
	header: `
		<div style="display: flex;">
			<textarea id="comment-group-note" class="textOutline unfitTextArea" placeholder="Note..." onchange=" $.Drag.VisualEvent.onInputChange(this); $.Drag.VisualEvent.autoFitTextArea(this); cacheCommentHeaderContent(this);" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"></textarea>
		</div>
		<div class="relative columnGap05em flex" style="align-self: flex-start; justify-self: flex-end;">
			<input type="color" onclick="" onchange="onChangeNodeHeaderColor(this.parentElement.parentElement.parentElement, this.value);" oninput="this.onchange();" onfocus="this.blur()" value="#000000" />
		</div>
		<div id="comment-group-chain" data-chained="false">
			<svg id="comment-group-chained-svg" onmousedown="onClickChainCommentGroup(event, this);" viewBox="-7.5 0 24 24" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" version="1.1" id="comment-group-lock">
				<path d="M3 3c-1.108 0-2 .892-2 2v4c0 1.108.892 2 2 2h3c1.108 0 2-.892 2-2V5c0-1.108-.892-2-2-2zm0 1h3c.554 0 1 .446 1 1v4c0 .554-.446 1-1 1H3c-.554 0-1-.446-1-1V5c0-.554.446-1 1-1z"></path>
				<path d="M3 13c-1.108 0-2 .892-2 2v4c0 1.108.892 2 2 2h3c1.108 0 2-.892 2-2v-4c0-1.108-.892-2-2-2zm0 1h3c.554 0 1 .446 1 1v4c0 .554-.446 1-1 1H3c-.554 0-1-.446-1-1v-4c0-.554.446-1 1-1z"></path>
				<path d="M4.5 8c-.554 0-1 .446-1 1v3h2V9c0-.554-.446-1-1-1z"></path><path id="rect839-6" d="M3.5 12v3c0 .554.446 1 1 1s1-.446 1-1v-3z"></path>
			</svg>
			<svg id="comment-group-unchained-svg" onmousedown="onClickChainCommentGroup(event, this);" viewBox="-7.5 0 24 24" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" version="1.1">
				<path d="M3 0C1.892 0 1 .892 1 2v4c0 1.108.892 2 2 2h3c1.108 0 2-.892 2-2V2c0-1.108-.892-2-2-2zm0 1h3c.554 0 1 .446 1 1v4c0 .554-.446 1-1 1H3c-.554 0-1-.446-1-1V2c0-.554.446-1 1-1z"></path>
				<path d="M3 16c-1.108 0-2 .892-2 2v4c0 1.108.892 2 2 2h3c1.108 0 2-.892 2-2v-4c0-1.108-.892-2-2-2zm0 1h3c.554 0 1 .446 1 1v4c0 .554-.446 1-1 1H3c-.554 0-1-.446-1-1v-4c0-.554.446-1 1-1z"></path>
				<path d="M4.5 5c-.554 0-1 .446-1 1v3h2V6c0-.554-.446-1-1-1z"></path>
				<path id="rect839-6" d="M3.5 15v3c0 .554.446 1 1 1s1-.446 1-1v-3z"></path>
			</svg>
		</div>
	`,
	engine: ["MV", "MZ"],
	event_type: ["common", "map", "troop"],
	id: "custom_node_comment_graph",
	exec_input: false,
	exec_output: false,
	inputs: [],
	outputs: [],
	body: `
		<svg id="node-resize" onmousedown="startNodeResize(event, this.parentElement);" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M22.354 9.354l-.707-.707-13 13 .707.707zm0 7l-.707-.707-6 6 .707.707z" style="stroke: white;"></path>
		</svg>
	`,
	onimport: (editor) => {		
		//utils 
		NODE_COMMENT_GROUP.isNodeInsideCommentGroup = function(node, groupRect) { 
			if (!node || !groupRect) 
				return false; 
			
			const nodeRect = node.getBoundingClientRect(); 
			const centerX = nodeRect.left + nodeRect.width / 2; 
			const centerY = nodeRect.top + nodeRect.height / 2; 
			return (centerX >= groupRect.left && centerX <= groupRect.right && centerY >= groupRect.top && centerY <= groupRect.bottom); 
		};
		
		//size		
		editor.startNodeResize = function(event, node) {
			event.stopPropagation();
			event.stopImmediatePropagation();
			event.preventDefault();
			
			const content = node.children[1];
			NODE_COMMENT_GROUP._resizeNode = node;
			NODE_COMMENT_GROUP._resizeStartMouseX = event.clientX;
			NODE_COMMENT_GROUP._resizeStartMouseY = event.clientY;
			NODE_COMMENT_GROUP._resizeStartWidth = content.offsetWidth;
			NODE_COMMENT_GROUP._resizeStartHeight = content.offsetHeight;

			editor.addEventListener('mouseup', NODE_COMMENT_GROUP.stopNodeResize);
			editor.addEventListener('mousemove', NODE_COMMENT_GROUP.resizeNode);
		};

		NODE_COMMENT_GROUP.stopNodeResize = function() {
			editor.addToUndoHistory({
				type: "resize_comment_group", 
				nodeId: editor.getNodeId(NODE_COMMENT_GROUP._resizeNode), 
				startSize: [NODE_COMMENT_GROUP._resizeStartWidth, NODE_COMMENT_GROUP._resizeStartHeight],
				endSize: [NODE_COMMENT_GROUP._resizeEndWidth, NODE_COMMENT_GROUP._resizeEndHeight]
			});
			
			delete NODE_COMMENT_GROUP._resizeNode;
			delete NODE_COMMENT_GROUP._resizeStartMouseX;
			delete NODE_COMMENT_GROUP._resizeStartMouseY;
			delete NODE_COMMENT_GROUP._resizeStartWidth;
			delete NODE_COMMENT_GROUP._resizeStartHeight;
			delete NODE_COMMENT_GROUP._resizeEndWidth;
			delete NODE_COMMENT_GROUP._resizeEndHeight;
			
			editor.removeEventListener('mouseup', NODE_COMMENT_GROUP.stopNodeResize);
			editor.removeEventListener('mousemove', NODE_COMMENT_GROUP.resizeNode);
		};

		NODE_COMMENT_GROUP.resizeNode = function(event) {
			try {
				if (!NODE_COMMENT_GROUP._resizeNode)
					return;

				const content = NODE_COMMENT_GROUP._resizeNode.children[1];
				const scale = editor.getGraphEditorScale();

				const dx = (event.clientX - NODE_COMMENT_GROUP._resizeStartMouseX) / scale;
				const dy = (event.clientY - NODE_COMMENT_GROUP._resizeStartMouseY) / scale;

				let width = Math.max(100, NODE_COMMENT_GROUP._resizeStartWidth + dx);
				const height = Math.max(60, NODE_COMMENT_GROUP._resizeStartHeight + dy);

				NODE_COMMENT_GROUP.setNodeContentSize(NODE_COMMENT_GROUP._resizeNode, width, height);
				
				const header = NODE_COMMENT_GROUP._resizeNode.children[0];
				if (header.offsetWidth > width) {
					width = header.offsetWidth;
					NODE_COMMENT_GROUP.setNodeContentSize(NODE_COMMENT_GROUP._resizeNode, width, height);
				}
				
				NODE_COMMENT_GROUP._resizeEndWidth = width;
				NODE_COMMENT_GROUP._resizeEndHeight = height;
				NODE_COMMENT_GROUP.cacheNodeContentSize(NODE_COMMENT_GROUP._resizeNode, width, height);
			} catch(error) {
				editor.console.log(error);
			}
		};

		NODE_COMMENT_GROUP.setNodeContentSize = function(node, width, height) {
			const content = node.children[1];
			content.style.width = `${width}px`;
			content.style.height = `${height}px`;
		};
		
		NODE_COMMENT_GROUP.cacheNodeContentSize = function(node, width = null, height = null) {
			if (!node)
				return;
			
			const eventCache = editor.getEventCache();
			const nodeId = editor.getNodeId(node);
			
			if (width !== null)
				eventCache.nodes[nodeId].widthContent = width;
			
			if (height !== null)
				eventCache.nodes[nodeId].heightContent = height;
		};
		
		NODE_COMMENT_GROUP.onUndoResizeCommentGroup = function(action) {
			NODE_COMMENT_GROUP.setNodeContentSize(editor.getNodeById(action.nodeId), action.startSize[0], action.startSize[1]);
			NODE_COMMENT_GROUP.cacheNodeContentSize(editor.getNodeById(action.nodeId), action.startSize[0], action.startSize[1]);
		};
		
		NODE_COMMENT_GROUP.onRedoResizeCommentGroup = function(action) {
			NODE_COMMENT_GROUP.setNodeContentSize(editor.getNodeById(action.nodeId), action.endSize[0], action.endSize[1]);
			NODE_COMMENT_GROUP.cacheNodeContentSize(editor.getNodeById(action.nodeId), action.endSize[0], action.endSize[1]);
		};
		
		editor.addHistoryHandler("resize_comment_group", "Resize Comment Group", NODE_COMMENT_GROUP.onUndoResizeCommentGroup, NODE_COMMENT_GROUP.onRedoResizeCommentGroup);
		
		//color
		editor.onChangeNodeHeaderColor = function(node, color) {
			if (!NODE_COMMENT_GROUP._startColor)
				NODE_COMMENT_GROUP._startColor = color;
			
			NODE_COMMENT_GROUP.setNodeHeaderColor(node, color);
			
			if (color === NODE_COMMENT_GROUP._prevColor)
				NODE_COMMENT_GROUP.onEndSetNodeHeaderColor(node, color);
			else
				NODE_COMMENT_GROUP._prevColor = color;
		};
		
		NODE_COMMENT_GROUP.setNodeHeaderColor = function(node, color) {
			if (!node)
				return;
			
			node.children[0].style.backgroundColor = color || 'black';
			node.style.background = color + '66';
			
			NODE_COMMENT_GROUP.cacheNodeHeaderColor(node, color);
		};
		
		NODE_COMMENT_GROUP.cacheNodeHeaderColor = function(node, color = null) {
			if (!node || !color)
				return;
			
			const eventCache = editor.getEventCache();
			const nodeId = editor.getNodeId(node);
			
			if (color)
				eventCache.nodes[nodeId].headerColor = color;
		};
		
		NODE_COMMENT_GROUP.onEndSetNodeHeaderColor = function(node, color) {
			editor.addToUndoHistory({
				type: "recolor_comment_group", 
				nodeId: editor.getNodeId(node), 
				startColor: NODE_COMMENT_GROUP._startColor,
				endColor: color
			});
			
			delete NODE_COMMENT_GROUP._prevColor;
			delete NODE_COMMENT_GROUP._startColor;
		};
		
		NODE_COMMENT_GROUP.onUndoRecolorCommentGroup = function(action) {
			NODE_COMMENT_GROUP.setNodeHeaderColor(editor.getNodeById(action.nodeId), action.startColor);
		};
		
		NODE_COMMENT_GROUP.onRedoRecolorCommentGroup = function(action) {
			NODE_COMMENT_GROUP.setNodeHeaderColor(editor.getNodeById(action.nodeId), action.endColor);
		};
		
		editor.addHistoryHandler("recolor_comment_group", "Recolor Comment Group", NODE_COMMENT_GROUP.onUndoRecolorCommentGroup, NODE_COMMENT_GROUP.onRedoRecolorCommentGroup);

		//textarea title
		NODE_COMMENT_GROUP.setCommentNodeHeaderContent = function(node, content) {
			if (!node)
				return;
			
			const textarea = node.children[0].querySelector('textarea');
			if (!textarea)
				return;
			
			textarea.value = content;
			if (textarea.onchange)
				textarea.onchange();
		};
		
		editor.cacheCommentHeaderContent = function(textarea) {
			if (!textarea)
				return;
			
			const node = editor.$.Drag.VisualEvent.getAncestorById(textarea, 'graphNode');
			if (!node)
				return;
			
			const value = textarea.value;
			const eventCache = editor.getEventCache();
			const nodeId = editor.getNodeId(node);
			
			eventCache.nodes[nodeId].commentHeaderContent = value;
		};
		
		// group chain
		editor.onClickChainCommentGroup = function(event, element) {			
			event.stopPropagation();
			event.stopImmediatePropagation();
			event.preventDefault();
			
			const container = event.path.find(elem => elem.id === "comment-group-chain");
			const node = event.path.find(elem => elem.id === "graphNode");
			if (container && node) {
				const chained = !(container.getAttribute('data-chained') === "true");
				NODE_COMMENT_GROUP.setNodeCommentGroupChained(node, chained);
				editor.addToUndoHistory({
					type: "chain_comment_group", 
					nodeId: editor.getNodeId(node), 
					chained: chained
				});
			}
			
			return false;
		};
		
		NODE_COMMENT_GROUP.setNodeCommentGroupChained = function(node, chained = true) {
			if (!node)
				return;
			
			node.querySelector('#comment-group-chain').setAttribute('data-chained', chained);
			NODE_COMMENT_GROUP.cacheNodeCommentGroupChained(node, chained);
		};
		
		NODE_COMMENT_GROUP.cacheNodeCommentGroupChained = function(node, chained = true) {
			if (!node)
				return;
			
			const eventCache = editor.getEventCache();
			const nodeId = editor.getNodeId(node);
			
			if (eventCache && nodeId)
				eventCache.nodes[nodeId].chained = chained;
		};
		
		NODE_COMMENT_GROUP.onUndoChainCommentGroup = function(action) {
			NODE_COMMENT_GROUP.setNodeCommentGroupChained(editor.getNodeById(action.nodeId), !action.chained);
		};
		
		NODE_COMMENT_GROUP.onRedoChainCommentGroup = function(action) {
			NODE_COMMENT_GROUP.setNodeCommentGroupChained(editor.getNodeById(action.nodeId), action.chained);
		};
		
		editor.addHistoryHandler("chain_comment_group", "Chain Comment Group", NODE_COMMENT_GROUP.onUndoChainCommentGroup, NODE_COMMENT_GROUP.onRedoChainCommentGroup);
	},
	onadd: (editor, node) => {
		if (!node)
			return;
		
		const nodeCache = editor.getGraphNodeFromCache(node);
		if (!nodeCache)
			return;
		
		if (nodeCache.chained !== undefined)
			NODE_COMMENT_GROUP.setNodeCommentGroupChained(node, nodeCache.chained);
		
		if (nodeCache.widthContent !== undefined || nodeCache.heightContent !== undefined)
			NODE_COMMENT_GROUP.setNodeContentSize(node, nodeCache.widthContent, nodeCache.heightContent);
		
		if (nodeCache.headerColor !== undefined)
			NODE_COMMENT_GROUP.setNodeHeaderColor(node, nodeCache.headerColor);
		
		if (nodeCache.commentHeaderContent !== undefined)
			NODE_COMMENT_GROUP.setCommentNodeHeaderContent(node, nodeCache.commentHeaderContent);
		
		node.querySelector('#node-header textarea').onchange();
	},
	parse: (editor, command, node, behaviors, inputs, sequence) => {},
	onselect: (editor, groupNode) => {
		if (groupNode.querySelector('#comment-group-chain').getAttribute('data-chained') !== "true")
			return;
		
		const nodes = editor.nodes;
		const groupRect = groupNode.getBoundingClientRect();
		for (const node of nodes) {
			if (node && node !== groupNode && NODE_COMMENT_GROUP.isNodeInsideCommentGroup(node, groupRect))
				editor.selectNode(node);
		}
	},
	stylesheet: `
		#graphNode[data-commandCode="custom_node_comment_graph"] {
			z-index: -1 !important;
			pointer-events: none;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header {
			background-color: black;
			display: flex;
			justify-content: space-between;
			align-items: center;
			position: relative;
			pointer-events: all;
		}

		#comment-group-note {
			margin: 0px;
			background-color: transparent;
			border: 0.0625em solid transparent;
			pointer-events: all;
			font-size: 1.4em;
			font-weight: bold;
			color: white;
			--outlineColor: black;
			resize: none;
			min-width: 4em;
			margin-right: 2em;
		}
		
		#comment-group-note:hover {
			border: 0.0625em solid white;
		}
		
		#comment-group-note::placeholder, .comment-group-note::-webkit-input-placeholder {
			font-size: 0.6em !important;
			color: lightgrey !important;
			font-weight: initial !important;
			-webkit-text-stroke: 0px !important;
			--outlineColor: transparent !important;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header #comment-group-chain {
			position: absolute;
			bottom: 0px;
			right: 0px;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header #comment-group-chain:not([data-chained="true"]) #comment-group-chained-svg {
			display: none;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header #comment-group-chain[data-chained="true"] #comment-group-unchained-svg {
			display: none;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header #comment-group-chain svg {
			width: 36px;
			height: 36px;
			position: absolute;
			bottom: -18px;
			right: 0px;
			pointer-events: all;
			cursor: pointer;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header #comment-group-chain svg > path {
			opacity: 1;
			vector-effect: none;
			fill: white;
			fill-opacity: 1;
			stroke: none;
			stroke-width: 4;
			stroke-linecap: square;
			stroke-linejoin: round;
			stroke-miterlimit: 4;
			stroke-dasharray: none;
			stroke-dashoffset: 3.20000005;
			stroke-opacity: .55063291;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header input[type="color"] {
			pointer-events: all;
			box-shadow: 0 0 0 2px black;
		}
		
		#node-resize {
			position: absolute;
			bottom: 0.3125em;
			right: 0.3125em;
			cursor: nw-resize;
		}
		
		#graphNode[data-commandCode="custom_node_comment_graph"] > div:nth-child(2){
			min-height: 60px;
			min-width: 100px;
		}
	`,
}];