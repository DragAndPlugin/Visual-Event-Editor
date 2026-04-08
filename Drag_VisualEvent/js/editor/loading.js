function getLoading() {
	return document.querySelector('#loading');
};
function showLoading() {
	getLoading().style.left = 0;
};

function hideLoading() {
	getLoading().style.left = "2000%";
};

function getLoadingSpan() {
	return document.querySelector('#loading > span');
};

function setLoadingText(text) {
	getLoadingSpan().innerHTML = text;
};

function getLoadingText() {
	return getLoadingSpan().innerHTML;
};