module.exports = [{
	category: "Utility",
	color: "black",
	name: "Comment (Graph)",
	header: `
		<div style="display: flex;">
			<textarea class="textOutline unfitTextArea onReadyOnChange" placeholder="Write a comment..." onchange=" $.Drag.VisualEvent.onInputChange(this); $.Drag.VisualEvent.autoFitTextArea(this); cacheCommentHeaderContent(this);" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"></textarea>
		</div>
		<div class="relative columnGap05em flex" style="align-self: flex-start; justify-self: flex-end;">
			<input type="color" onclick="" onchange="setNodeHeaderColor(this.parentElement.parentElement.parentElement, this.value);" oninput="this.onchange();" onfocus="this.blur()" value="#000000" />
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
		editor.isNodeInsideCommentGroup = function(node, groupRect) {
			const nodeRect = node.getBoundingClientRect();
			const centerX = nodeRect.left + nodeRect.width / 2;
			const centerY = nodeRect.top + nodeRect.height / 2;

			return (
				centerX >= groupRect.left &&
				centerX <= groupRect.right &&
				centerY >= groupRect.top &&
				centerY <= groupRect.bottom
			);
		};
		
		//size		
		editor.startNodeResize = function(event, node) {
			const content = node.children[1];

			editor._resizeNode = node;
			editor._resizeStartMouseX = event.clientX;
			editor._resizeStartMouseY = event.clientY;
			editor._resizeStartWidth = content.offsetWidth;
			editor._resizeStartHeight = content.offsetHeight;

			editor.addEventListener('mouseup', editor.stopNodeResize);
			editor.addEventListener('mousemove', editor.resizeNode);
		};

		editor.stopNodeResize = function() {
			delete editor._resizeNode;
			delete editor._resizeStartMouseX;
			delete editor._resizeStartMouseY;
			delete editor._resizeStartWidth;
			delete editor._resizeStartHeight;
			
			editor.removeEventListener('mouseup', editor.stopNodeResize);
			editor.removeEventListener('mousemove', editor.resizeNode);
		};

		editor.resizeNode = function(event) {
			if (!editor._resizeNode)
				return;

			const content = editor._resizeNode.children[1];
			const scale = editor.getGraphEditorScale();

			const dx = (event.clientX - editor._resizeStartMouseX) / scale;
			const dy = (event.clientY - editor._resizeStartMouseY) / scale;

			const width = Math.max(100, editor._resizeStartWidth + dx);
			const height = Math.max(60, editor._resizeStartHeight + dy);

			content.style.width = `${width}px`;
			content.style.height = `${height}px`;
			
			editor.cacheNodeContentSize(editor._resizeNode, width, height);
		};

		editor.setNodeContentSize = function(node, width, height) {
			const content = node.children[1];
			content.style.width = `${width}px`;
			content.style.height = `${height}px`;
		};
		
		editor.cacheNodeContentSize = function(node, width = null, height = null) {
			if (!node)
				return;
			
			const eventCache = editor.getEventCache();
			const nodeId = editor.getNodeId(node);
			
			if (width !== null)
				eventCache.nodes[nodeId].widthContent = width;
			
			if (height !== null)
				eventCache.nodes[nodeId].heightContent = height;
		};
		
		//color
		editor.setNodeHeaderColor = function(node, color) {
			if (!node)
				return;
			
			node.children[0].style.backgroundColor = color || 'black';
			editor.cacheNodeHeaderColor(node, color);
			node.style.background = color + '66';
		};
		
		editor.cacheNodeHeaderColor = function(node, color = null) {
			if (!node || !color)
				return;
			
			const eventCache = editor.getEventCache();
			const nodeId = editor.getNodeId(node);
			
			if (color)
				eventCache.nodes[nodeId].headerColor = color;
		};

		//textarea title
		editor.setCommentNodeHeaderContent = function(node, content) {
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
			if (container && node)
				editor.setNodeCommentGroupChained(node, !(container.getAttribute('data-chained') === "true"));
			
			return false;
		};
		
		editor.setNodeCommentGroupChained = function(node, chained = true) {
			if (!node)
				return;
			
			node.querySelector('#comment-group-chain').setAttribute('data-chained', chained);
			editor.cacheNodeCommentGroupChained(node, chained);
		};
		
		editor.cacheNodeCommentGroupChained = function(node, chained = true) {
			if (!node)
				return;
			
			const eventCache = editor.getEventCache();
			const nodeId = editor.getNodeId(node);
			
			if (eventCache && nodeId)
				eventCache.nodes[nodeId].chained = chained;
		};
	},
	onadd: (editor, node) => {
		if (!node)
			return;
		
		const nodeCache = editor.getGraphNodeFromCache(node);
		if (!nodeCache)
			return;
		
		if (nodeCache.chained !== undefined)
			editor.setNodeCommentGroupChained(node, nodeCache.chained);
		
		if (nodeCache.widthContent !== undefined || nodeCache.heightContent !== undefined)
			editor.setNodeContentSize(node, nodeCache.widthContent, nodeCache.heightContent);
		
		if (nodeCache.headerColor !== undefined)
			editor.setNodeHeaderColor(node, nodeCache.headerColor);
		
		if (nodeCache.commentHeaderContent !== undefined)
			editor.setCommentNodeHeaderContent(node, nodeCache.commentHeaderContent);
	},
	parse: (editor, command, node, behaviors, inputs, sequence) => {}, //function, define what the node do when parsed within an event
	onselect: (editor, groupNode) => {
		if (groupNode.querySelector('#comment-group-chain').getAttribute('data-chained') !== "true")
			return;
		
		const nodes = editor.nodes;
		const groupRect = groupNode.getBoundingClientRect();
		for (const node of nodes) {
			if (node && node !== groupNode && editor.isNodeInsideCommentGroup(node, groupRect))
				editor.selectNode(node);
		}
	},
	stylesheet: `
		#graphNode[data-commandCode="custom_node_comment_graph"] {
			z-index: -1 !important;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header {
			background-color: black;
			display: flex;
			justify-content: space-between;
			align-items: center;
			position: relative;
		}

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header textarea {
			margin: 0px;
			background-color: transparent;
			border: 0px;
			pointer-events: all;
			font-size: 1.5em;
			font-weight: bold;
			color: white;
			--outlineColor: black;
			resize: none;
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

		#graphNode[data-commandCode="custom_node_comment_graph"] #node-header textarea::placeholder {
			font-weight: bold;
			color: white;
			--outlineColor: black;
			-webkit-text-stroke: 1px var(--outlineColor);
			text-shadow: -1px -1px 0 var(--outlineColor), 0px -1px 0 var(--outlineColor), 1px -1px 0 var(--outlineColor), -1px 0px 0 var(--outlineColor), 1px 0px 0 var(--outlineColor), -1px 1px 0 var(--outlineColor), 0px 1px 0 var(--outlineColor), 1px 1px 0 var(--outlineColor);
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
	`,
}];