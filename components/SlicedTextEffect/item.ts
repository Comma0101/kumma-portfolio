import styles from './SlicedText.module.css';

export class Item {
    DOM: {
        el: HTMLElement;
        inner: HTMLElement[];
        innerWrap: HTMLElement[];
    };
    totalCells: number;

    constructor(el: HTMLElement, totalCells: number) {
        this.DOM = {
            el: el,
            inner: [],
            innerWrap: [],
        };
        this.totalCells = totalCells;
        this.layout();
    }

    layout() {
        const text = this.DOM.el.dataset.text;
        let content = '';
        for (let i = 0; i < this.totalCells; ++i) {
            content += `<div class="${styles.gtextBox}"><div class="${styles.gtextBoxInner}" style="transform: translateX(-${(100 / this.totalCells) * i}%)">${text}</div></div>`;
        }
        this.DOM.el.innerHTML = content;
        this.DOM.el.style.setProperty('--gsplits', String(this.totalCells));
        
        const boxes = Array.from(this.DOM.el.querySelectorAll(`.${styles.gtextBox}`));
        boxes.forEach(box => {
            this.DOM.inner.push(box.querySelector(`.${styles.gtextBoxInner}`) as HTMLElement);
            this.DOM.innerWrap.push(box as HTMLElement);
        });
    }
}
