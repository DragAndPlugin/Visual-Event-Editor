function setupAutoSave() {
	hideAutoSaveWarning();
	if (window._autoSaveWarnTimeout)
			clearTimeout(window._autoSaveWarnTimeout);
		
		if (window._autoSaveInterval)
			clearInterval(window._autoSaveInterval);
		
	if (!(window._cache.editor.options.autosave))
		return;
	
	const interval = window._cache.editor.options.autosaveInterval || 5;
	const delay = interval > 0 ? interval * 60 * 1000 : 300000 || 300000;
	
	window._autoSaveWarnTimeout = setTimeout(() => {
		showAutoSaveWarning();
	}, delay - 10000);
	
	window._autoSaveInterval = setInterval(() =>  {
		autoSave();
	}, delay);
};

function autoSave() {
	saveAll();
	setupAutoSave();
	console.log(`Autosaved at ${new Date().toLocaleTimeString()}`);
};

function showAutoSaveWarning() {
	document.querySelector('#autosave-notification').style.display = "initial";
	
	clearTimeout(window._autoSaveWarnTimeout);
	window._autoSaveWarnTimeout = null;
	
	let counter = 9;
	updateAutosaveWarningCounter(10);
	
	if (window._autosaveWarnCounterInterval)
		clearInterval(window._autosaveWarnCounterInterval);
	window._autosaveWarnCounterInterval = setInterval(() => {
		if (counter < 0) {
			clearInterval(window._autosaveWarnCounterInterval);
			window._autosaveWarnCounterInterval = null;
		} else {
			updateAutosaveWarningCounter(counter);
			counter--;
		}
	}, 1000);
};

function hideAutoSaveWarning() {
	document.querySelector('#autosave-notification').style.display = "none";
};

function updateAutosaveWarningCounter(counter) {
	document.querySelector('#autosave-notification-counter').innerHTML = counter;
};

function cancelAutosave() {
	setupAutoSave();
};

function autosaveNow() {
	autoSave();
};