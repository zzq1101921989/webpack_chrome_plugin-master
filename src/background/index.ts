// 控制浏览器的后台脚本
console.log("浏览器后台服务正常启动");

const captureScreenshotList: string[] = []

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

	// 执行一次截图任务
	if (message.action === 'captureScreenshot') {
		// 捕获当前窗口的可见标签页的截图
		chrome.tabs.captureVisibleTab(0, { format: 'png' }, (dataUrl) => {
			if (chrome.runtime.lastError) {
				console.error('截图失败:', chrome.runtime.lastError.message);
				return;
			}
			captureScreenshotList.push(dataUrl)
			sendResponse(dataUrl); // 返回截图数据
		});
	}
	// 获取截图列表
	if (message.action === 'getCaptureScreenshotList') {
		sendResponse(captureScreenshotList)
	}

	// 关闭当前插件的页面
	if (message.action === 'closePlugin') {
		chrome.tabs.getCurrent((tab) => {
			console.log(tab, 'tab');
		})
	}

	// 保持消息通道打开
	return true
});