// 内容脚本的作用是与当前页面的 DOM 交互
import { SimpleModal } from "./createDataElementModal";
import { captureElement } from "./tools";

let currentDataUrl: string | undefined = undefined;

let myModal: SimpleModal | null = null

function debounce(fn: (e: MouseEvent) => void, delay: number) {
	let timer: NodeJS.Timeout | null = null; // 用于存储定时器

	return function (...args: [e: MouseEvent]) {
		if (timer) {
			clearTimeout(timer); // 如果已经有定时器，清除它
		}

		// 设置新的定时器
		timer = setTimeout(() => {
			// @ts-ignore
			fn.apply(this, args); // 执行函数
			timer = null; // 清空定时器
		}, delay);
	};
}

/**
 * 创建外框元素
 * @param x 坐标x
 * @param y 坐标y
 * @param w 宽度
 * @param h 高度
 */
function createBorderDom(
	x: number,
	y: number,
	w: number,
	h: number
): HTMLDivElement {
	const div = document.createElement("div");
	div.className = "border-div";
	Object.assign(div.style, {
		position: "fixed",
		left: `${x - 10}px`,
		top: `${y}px`,
		width: `${w + 10}px`,
		height: `${h}px`,
		border: "4px solid rgb(222, 78, 38)",
		"z-index": 999999999,
		"pointer-events": "none",
		"clip-path": `polygon(
            0% 0%, 
            0% 100%, 
            25% 100%, 
            25% 25%, 
            75% 25%, 
            75% 75%, 
            25% 75%, 
            25% 100%, 
            100% 100%, 
            100% 0%
          )`,
	});

	return div;
}

/**
 * 创建提示弹窗
 * @param text
 * @returns
 */
function createTootipDom(text: string) {
	return `<style>
      /* 弹窗容器（居中+遮罩） */
      .my-extension-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      /* 弹窗内容区 */
      .modal-box {
        background: white;
        border-radius: 12px;
        width: 300px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        animation: fadeIn 0.3s ease;
      }
      /* 弹窗标题 */
      .modal-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #333;
      }
      /* 弹窗正文 */
      .modal-body {
        margin-bottom: 20px;
        color: #666;
        line-height: 1.5;
      }
      /* 按钮容器 */
      .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      /* 基础按钮样式 */
      .modal-btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }
      /* 主按钮（确认/提交） */
      .btn-primary {
        background: #4285f4;
        color: white;
      }
      .btn-primary:hover {
        background: #3367d6;
      }
      /* 次要按钮（取消/关闭） */
      .btn-secondary {
        background: #f1f1f1;
        color: #333;
      }
      .btn-secondary:hover {
        background: #e0e0e0;
      }
      /* 淡入动画 */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  
    <!-- 弹窗结构 -->
    <div class="my-extension-modal">
      <div class="modal-box">
        <div class="modal-title">操作提示</div>
        <div class="modal-body">
          ${text}
        </div>
      </div>
    </div>`;
}

/**
 * 把提示弹窗渲染到dom中
 * @param flag
 * @returns
 */
function renderTootip(flag: boolean) {
	// 将弹窗添加到页面
	document.body.insertAdjacentHTML(
		"beforeend",
		createTootipDom(flag ? "请随机选择一个将要爬取的结构" : "关闭数据爬取")
	);
	return document.querySelector(".my-extension-modal");
}

/**
 * 当前需要操作的元素进行点击
 * @param e
 */
async function clickElement(e: MouseEvent) {
	e.preventDefault();

	const currentUserClickEleCanvas = await captureElement(
		e.target as HTMLElement
	);

	currentDataUrl = currentUserClickEleCanvas?.toDataURL();

	myModal?.open();

    myModal?.updateContent(`<img src=${currentDataUrl} >`)

    // 关闭自动识别
    stop()
}

function removeDiv(div: HTMLElement) {
	div.remove();
}

// 在当前停留的元素上增加监听方法，用于创建外框提示元素，和移出元素之后，清空外框的方法
let borderArray: HTMLDivElement[] = [];
const handlerMouseMove = debounce((e: MouseEvent) => {
	const target = e.target as HTMLElement;
	const { width, height, left, top } = target.getBoundingClientRect();

	// 创建边框元素
	const borderDiv = createBorderDom(left, top, width, height);

	// 添加边框元素
	document.body.appendChild(borderDiv);

	// 收集边框元素
	borderArray.push(borderDiv);

	// 按住 ctrl 键，允许多个元素同时存在
	if (!e.ctrlKey) {
		borderArray
			.filter((item) => item !== borderDiv)
			.forEach((item) => {
				removeDiv(item);
			});
		borderArray = [borderDiv];
	}
}, 200);

/**
 * 开始录制
 */
function start() {
	chrome.runtime.sendMessage({ action: "closePlugin" });
	document.addEventListener("mouseenter", handlerMouseMove, true);
	document.addEventListener("click", clickElement, true); // 使用捕获阶段监听
}

/**
 * 停止录制
 */
function stop() {
	document.removeEventListener("mouseenter", handlerMouseMove, true);
	document.removeEventListener("click", clickElement, true); // 移除事件监听器
	document.querySelectorAll(".border-div").forEach((node) => {
		node.remove();
	});
}

// 全局变量用于 开始/关闭 录制功能
let global_flag = false;

/**
 * 改变全局变量，不能够直接利用变量进行操作
 * @param flag
 * @returns
 */
function changeGlobalFlag(flag: boolean) {
	global_flag = flag;
	return global_flag;
}
/**
 * 获取全局变量
 * @returns
 */
function getGlobalFlag() {
	return global_flag;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "start") {
		// 将弹窗添加到页面
		const modalDom = renderTootip(changeGlobalFlag(true));

		setTimeout(() => {
			if (modalDom) removeDiv(modalDom as HTMLElement);
			start();
			sendResponse({ message: "已经开始录制" });
		}, 1000);
	}

	if (message.action === "stop") {
		const modalDom = renderTootip(changeGlobalFlag(false));

		setTimeout(() => {
			if (modalDom) removeDiv(modalDom as HTMLElement);
			stop();
			sendResponse({ message: "已经停止录制" });
		}, 1000);
	}

	if (message.action === "getCurrentUserClickEle") {
		sendResponse({ message: currentDataUrl });
	}
});

document.addEventListener("keydown", (event) => {
	// 用户组合键 ctrl + b 切换开启录制和关闭录制
	if (event.ctrlKey && event.key === "b") {
		changeGlobalFlag(!getGlobalFlag());

		// 将弹窗添加到页面
		const modalDom = renderTootip(getGlobalFlag());

		setTimeout(() => {
			if (modalDom) removeDiv(modalDom as HTMLElement);
			if (getGlobalFlag()) {
				start();
			} else {
				stop();
			}
		}, 1000);
	}
});

// 想要初始化的时候获取页面上的元素，必须是在onload完成之后才能获取成功
window.onload = () => {
	// 初始化弹窗
	myModal = new SimpleModal({
		title: "已识别到的区域",
		content: "",
		width: "800px",
	});
    document.body.appendChild(myModal.overlay!)
};
