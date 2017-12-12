/// <reference path="../../lib/drunk.d.ts" />


/**
 * @example
 *      <div drunk-scroll-position></div>
 */

namespace drunk {

    import Promise = drunk.Promise;

    var recordMap: { [key: string]: number } = {};

    @binding('scroll-position')
    class ScrollPosition extends Binding {

        private job: Promise<any>;

        init() {
            this.resumePosition();
        }

        resumePosition() {
            var element = this.element as HTMLElement;
            var scrollPosition = recordMap[this.attribute] || 0;

            this.job = Promise.timeout(100);
            this.job.done(() => {
                this.job = null;
                element.scrollTop = scrollPosition;
                if (element.scrollTop != scrollPosition) {
                    this.resumePosition();
                }
            });
        }

        release() {
            recordMap[this.attribute] = this.element.scrollTop;
            this.job && this.job.cancel();
            this.job = null;
        }
    }
}