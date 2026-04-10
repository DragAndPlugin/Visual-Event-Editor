window.addEventListener("error", (event) => {
	console.error(event.type, event.message);
});

let console_error = console.error;
console.error = function() {
	updateErrorLogs(arguments);
	console_error.apply(console, arguments);
}; 

let console_warn = console.warn;
console.warn = function() {
	updateLogs(arguments);
	console_warn.apply(console, arguments);
}; 

function updateErrorLogs(type, message) {
	if (typeof type === "object" && message === undefined) {
		message = type[1];
		type = type[0];
	}
	
	if (message === "ResizeObserver loop limit exceeded")
		return;
	
	if (!window._logErrors)
		window._logErrors = [];
	window._logErrors.push(`${type}: ${message}`);
	
	const logError = document.querySelector('#log-error');
	logError.style.display = "flex";
	const logErrorCounter = logError.querySelector('span');
	logErrorCounter.innerHTML = `${window._logErrors.length}`;
};

function updateLogs(args) {
	if (!window._logs)
		window._logs = [];
	window._logs.push(args);
	
	const log = document.querySelector('#log');
	log.style.display = "flex";
	const logCounter = log.querySelector('span');
	logCounter.innerHTML = `${window._logs.length}`;
};