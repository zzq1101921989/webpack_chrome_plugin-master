import html2canvas from "html2canvas";

/**
 * 调用htmlToCanvas 把用户点击的图片转换为canvas显示出来
 * @param element 
 * @returns 
 */
export async function captureElement(element: HTMLElement) {
	try {
		const canvas = await html2canvas(element, {
			scale: 1, // 提高输出质量
			logging: true, // 开发时查看日志
			useCORS: true, // 处理跨域图像
			allowTaint: true, // 允许污染画布
			backgroundColor: "#ffffff", // 设置背景
		});
		return canvas
	} catch (error) {
		console.error("截图失败:", error);
	}
}

/**
 * 把类名数组格式化成字符串
 * @param text 
 */
export function parseClassName(classList: DOMTokenList) {
	return '.' + Array.from(classList).join('.')
}

/**
 * 根据类名获取元素
 * @param className 
 * @returns 
 */
export function getElementByClassName(className: string) {
	const elements = document.querySelectorAll(className);
	if (elements.length > 0) {
		return elements;
	}
	return null;
} 
