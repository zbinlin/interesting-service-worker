async function bootstrap() {
	if (!('serviceWorker' in navigator)) {
		return;
	}

	const reg = navigator.serviceWorker.register('/proxy.js', {
		scope: '/',
	});
}
