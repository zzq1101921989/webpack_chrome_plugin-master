/**
 * 将 dataUrl 转换为图片对象
 * @param dataUrl
 * @returns
 */
function dataUrlToImage(
  dataUrl: string
): Promise<{ image: HTMLImageElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      resolve({
        image: img,
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = (error) => reject(error);
  });
}

function imageToCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx!.drawImage(image, 0, 0);
  return canvas;
}

function createCanvasItemDOM() {
  const div = document.createElement("div");
  div.className = "canvas-item";
  return div;
}

/**
 * 通过每一张截图的 url，分别生成 canvas 然后拼接在一起
 * @param dataUrls
 * @returns
 */
function renderCanvasAndTextArea(dataUrls: string[]) {
  return new Promise((resolve, reject) => {
    const images = []; // 存储加载的图片对象
    let totalHeight = 0; // 总高度
    let maxWidth = 0; // 最大宽度

    // 加载所有图片
    const loadPromises = dataUrls.map(async (dataUrl: string) => {
      const { image, width, height } = await dataUrlToImage(dataUrl);
      images.push(image);
      totalHeight += height;
      maxWidth = Math.max(maxWidth, width);
      return { image, width, height };
    });

    Promise.all(loadPromises)
      .then((data) => {
        data.forEach((item, idx) => {
          const div = createCanvasItemDOM();
          const canvas = imageToCanvas(item.image);
          const textArea = document.createElement("textarea");
          textArea.className = "step-description";
          textArea.placeholder = `请输入第${idx + 1}张图片的描述`;
          div.appendChild(canvas);
          div.appendChild(textArea);
          document.body.querySelector(".canvas-container")?.appendChild(div);
        });
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });

    // 等待所有图片加载完成
    // Promise.all(loadPromises)
    //     .then(() => {
    //         // 创建 canvas
    //         const canvas = document.createElement('canvas');
    //         canvas.width = maxWidth;
    //         canvas.height = totalHeight;
    //         const ctx = canvas.getContext('2d');

    //         // 绘制图片到 canvas
    //         let currentHeight = 0;
    //         images.forEach((img) => {
    //             ctx.drawImage(img, 0, currentHeight);
    //             currentHeight += img.height;
    //         });

    //         // 导出拼接后的 canvas
    //         resolve(canvas);
    //     })
    //     .catch((error) => {
    //         reject(error);
    //     });
  });
}

function render() {
  if (isRenderCanvas()) {
    chrome.runtime.sendMessage(
      { action: "getCaptureScreenshotList" },
      async (dataUrlList) => {
        if ((document.body.querySelector(".canvas-container"))) {
          document.body.querySelector(".canvas-container")!.innerHTML = "";
        }

        await renderCanvasAndTextArea(dataUrlList);
      }
    );
  }
}

function isRenderCanvas() {
  return document.visibilityState === "visible";
}

function handler() {
  if (isRenderCanvas()) {
    console.log("页面可见");

    render();
  }
}

function init() {
  window.onload = function () {
    render();
  };

  document.removeEventListener("visibilitychange", handler);

  document.addEventListener("visibilitychange", handler);
}

init();
