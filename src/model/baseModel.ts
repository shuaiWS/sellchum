namespace RoommateApp {

    export class BaseModel<T> {

        protected _listeners: Array<(store: T) => any>;
        
        public store: T;

        constructor() {
            this._listeners = [];
        }

        public subscribe(listener: (store: T) => any): void {
            var index = this._listeners.indexOf(listener);
            if (index === -1) {
                this._listeners.push(listener);
                listener.call(undefined, this.store);
            }
        }

        public unsubscribe(listener: (store: T) => any): void {
            var index = this._listeners.indexOf(listener);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        }

        public publish(): void {
            this._listeners.slice().forEach(listener => {
                listener.call(undefined, this.store);
            });
        }

        public release() {
            this._listeners = null;
            this.store = null;
        }
    }
}