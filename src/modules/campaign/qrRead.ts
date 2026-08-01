import { Html5Qrcode } from 'html5-qrcode';

class QrRead {
    private readonly html5QrCode = new Html5Qrcode('reader');
    private readonly startBtn = document.querySelector('.js-qr-start-btn') as HTMLButtonElement;
    private readonly resultLink = document.querySelector('.js-qr-result-link') as HTMLAnchorElement;
    private readonly modal = document.querySelector('.js-qr-modal') as HTMLElement;
    private readonly closeBtn = document.querySelector('.js-qr-close-btn') as HTMLButtonElement;
    private readonly readerWrap = document.querySelector('.js-qr-reader') as HTMLElement;

    init(): void {
        this.startBtn.addEventListener('click', () => this.onStartCamera());
        this.closeBtn.addEventListener('click', () => this.onStopCamera());
    }

    private disableResultLink(message: string): void {
        this.resultLink.innerText = message;
        this.resultLink.href = '#';
        this.resultLink.classList.add('is-disabled');
        this.resultLink.setAttribute('aria-disabled', 'true');
    }

    private enableResultLink(url: string): void {
        this.resultLink.innerText = `読み取り成功: ${url}`;
        this.resultLink.href = url;
        this.resultLink.classList.remove('is-disabled');
        this.resultLink.setAttribute('aria-disabled', 'false');
    }

    private static isValidUrl(value: string): boolean {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    private onScanSuccess(decodedText: string): void {
        console.log(`Scan result: ${decodedText}`);

        this.html5QrCode.stop().then(() => {
            this.startBtn.disabled = false;
            this.readerWrap.classList.add('is-hidden');

            if (QrRead.isValidUrl(decodedText)) {
                this.enableResultLink(decodedText);
            } else {
                this.disableResultLink(`読み取り成功: ${decodedText}（URLではありません）`);
            }
        }).catch((err: unknown) => {
            console.error('カメラの停止に失敗しました', err);
        });
    }

    private onStartCamera(): void {
        this.modal.classList.add('is-open');
        this.disableResultLink('スキャン中...');

        this.html5QrCode.start(
            { facingMode: 'environment' },
            {
                fps: 10,
                qrbox: (w: number, h: number) => {
                    const size = Math.min(w, h) * 0.8;
                    return { width: size, height: size };
                },
            },
            (decodedText) => this.onScanSuccess(decodedText),
            () => { /* スキャン中のエラー無視 */ }
        ).then(() => {
            this.startBtn.disabled = true;
        }).catch((err: unknown) => {
            this.modal.classList.remove('is-open');
            console.error('カメラの起動に失敗しました', err);
            alert('カメラの起動に失敗しました。');
        });
    }

    private onStopCamera(): void {
        this.html5QrCode.stop().then(() => {
            this.modal.classList.remove('is-open');
            this.readerWrap.classList.remove('is-hidden');
            this.startBtn.disabled = false;
            this.disableResultLink('ここに読み取り結果が表示されます');
        }).catch((err: unknown) => {
            console.error('カメラの停止に失敗しました', err);
        });
    }
}

export function qrRead(): void {
    new QrRead().init();
}

