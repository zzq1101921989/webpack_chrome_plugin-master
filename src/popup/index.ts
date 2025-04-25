import './popup.css';

console.log('插件初始化');

/**
 * 插件脚本 插件初始化
 */
function initPopup() {
    document.querySelector('#start')?.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id || 0, { action: 'start' }, function (response) {
                window.open(); // 关闭插件页面
            });
        })
    })
    document.querySelector('#stop')?.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id || 0, { action: 'stop' }, function (response) {
                window.close(); // 关闭插件页面
            });
        })
    })
}

initPopup()
