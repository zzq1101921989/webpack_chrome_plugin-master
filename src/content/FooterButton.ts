interface FooterButtonProps {
	confirmText: string;
	onConfirm?: (...arg: any[]) => void;
}

export default class FooterButton {
	private confirmText: string;
	private onConfirm?: () => void;
	private confirmBtn: HTMLButtonElement | null = null;

	constructor(props: FooterButtonProps) {
		this.confirmText = props.confirmText;
		this.onConfirm = props.onConfirm;
		this.init();
	}

	/**
	 * 创建元素
	 */
	private createElements(): void {
		this.confirmBtn = document.createElement("button");
		this.confirmBtn.className = "modal-confirm-btn";
		this.confirmBtn.textContent = this.confirmText;
		this.confirmBtn.style.cssText = `
                  padding: 8px 16px;
                  background-color: #3498db;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
              `;
	}

	/**
	 * 绑定事件
	 */
	private bindEvents(): void {
		// 确定按钮事件
		if (this.confirmBtn && this.confirmBtn) {
			this.confirmBtn.addEventListener("click", () => {
				this.onConfirm?.();
			});
		}
	}

	public init() {
		this.createElements();
		this.bindEvents();
	}

	public getButtonElement(): HTMLButtonElement | null {
		return this.confirmBtn;
	}

    
  // 设置确认回调
  public setOnConfirm(callback: () => void): void {
    this.onConfirm = callback;
  }
}
