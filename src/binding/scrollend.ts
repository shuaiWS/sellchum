/// <reference path="../../lib/drunk.d.ts" />

namespace drunk {

    @binding('scroll-end')
    class ScrollEnd extends Binding {

        init() {
            this.element.addEventListener('scroll', this.onScroll);
        }

        release() {
            this.element.removeEventListener('scroll', this.onScroll);
            this.onScroll = null;
        }

        private onScroll = () => {
            var element = this.element as HTMLElement;
            var {clientHeight, scrollHeight, scrollTop} = element;

            if (clientHeight !== scrollHeight && scrollTop + clientHeight >= scrollHeight - 50) {
                this.viewModel.$eval(this.expression);
            }
        };
    }
}