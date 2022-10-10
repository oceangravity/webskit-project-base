export default class EventAPI {
  functionMap: { [k: string]: EventListenerOrEventListenerObject };
  workspace: Window & typeof globalThis;

  constructor() {
    this.functionMap = {};
    this.workspace = window;
  }

  addEventListener(event: string, func: EventListenerOrEventListenerObject): void {
    this.functionMap[event] = func;
    this.workspace.document.addEventListener(event.split(".")[0], this.functionMap[event]);
  }

  removeEventListener(event: string): void {
    this.workspace.document.removeEventListener(event.split(".")[0], this.functionMap[event]);
    delete this.functionMap[event];
  }
}
