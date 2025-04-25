// SimpleModal.ts
interface ModalOptions {
    title?: string;
    content?: string;
    width?: string;
    height?: string;
    closeButton?: boolean;
    confirmButton?: boolean;
    confirmText?: string;
    onConfirm?: () => void;
}

export class SimpleModal {
    private options: Required<ModalOptions>;
    private modal?: HTMLDivElement;
    private header?: HTMLDivElement;
    private content?: HTMLDivElement;
    private footer?: HTMLDivElement;
    public overlay?: HTMLDivElement;
    private closeBtn: HTMLSpanElement | null = null;
    private confirmBtn: HTMLButtonElement | null = null;

    constructor(options: ModalOptions = {}) {
        // 设置默认配置
        this.options = {
            title: '弹窗标题',
            content: '弹窗内容',
            width: '800px',
            height: 'auto',
            closeButton: true,
            confirmButton: true,
            confirmText: '确定',
            onConfirm: () => {},
            ...options
        };

        // 创建弹窗元素
        this.createElements();
        
        // 绑定事件
        this.bindEvents();
    }

    private createElements(): void {
        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 999;
        `;
        document.body.appendChild(this.overlay);

        // 创建弹窗容器
        this.modal = document.createElement('div');
        this.modal.className = 'modal-container';
        this.modal.style.cssText = `
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            width: ${this.options.width};
            height: ${this.options.height};
            display: flex;
            flex-direction: column;
            z-index: 1000;
            position: relative;
            overflow: hidden;
        `;

        // 创建标题栏
        this.header = document.createElement('div');
        this.header.className = 'modal-header';
        this.header.style.cssText = `
            padding: 16px;
            background-color: #3498db;
            color: white;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        this.header.innerHTML = `<span>${this.options.title}</span>`;

        // 添加关闭按钮
        if (this.options.closeButton) {
            this.closeBtn = document.createElement('span');
            this.closeBtn.innerHTML = '&times;';
            this.closeBtn.style.cssText = `
                font-size: 24px;
                cursor: pointer;
            `;
            this.header.appendChild(this.closeBtn);
        }

        // 创建内容区域
        this.content = document.createElement('div');
        this.content.className = 'modal-content';
        this.content.style.cssText = `
            padding: 20px;
            flex: 1;
            overflow-y: auto;
            text-align: center;
        `;
        this.content.innerHTML = this.options.content;

        // 创建底部按钮区域
        this.footer = document.createElement('div');
        this.footer.className = 'modal-footer';
        this.footer.style.cssText = `
            padding: 16px;
            display: flex;
            justify-content: end;
            gap: 16px;
            border-top: 1px solid #eee;
        `;

        // 添加确定按钮
        if (this.options.confirmButton) {
            this.confirmBtn = document.createElement('button');
            this.confirmBtn.className = 'modal-confirm-btn';
            this.confirmBtn.textContent = this.options.confirmText;
            this.confirmBtn.style.cssText = `
                padding: 8px 16px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            `;
            this.footer.appendChild(this.confirmBtn);
        }

        // 组装弹窗
        this.modal.appendChild(this.header);
        this.modal.appendChild(this.content);
        this.modal.appendChild(this.footer);

        // 添加到遮罩层
        this.overlay.appendChild(this.modal);
    }

    private bindEvents(): void {
        // 关闭按钮事件
        if (this.options.closeButton && this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // 确定按钮事件
        if (this.options.confirmButton && this.confirmBtn) {
            this.confirmBtn.addEventListener('click', () => {
                this.options.onConfirm?.();
                this.close();
            });
        }

        // 点击遮罩层关闭
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }

    public open(): void {
        this.overlay!.style.display = 'flex';
        this.modal!.style.display = 'flex';
    }

    public close(): void {
        this.overlay!.style.display = 'none';
        this.modal!.style.display = 'none';
    }

    public destroy(): void {
        document.body.removeChild(this.overlay!);
    }

    // 更新内容的方法
    public updateContent(newContent: string): void {
        this.content!.innerHTML = newContent;
    }

    // 更新标题的方法
    public updateTitle(newTitle: string): void {
        const titleSpan = this.header?.querySelector('span');
        if (titleSpan) {
            titleSpan.textContent = newTitle;
        }
    }

    // 设置确认回调
    public setOnConfirm(callback: () => void): void {
        this.options.onConfirm = callback;
    }
}