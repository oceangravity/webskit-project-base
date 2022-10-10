import Utils from "./Utils";
import EventAPI from "./EventAPI";
import DOM from "./DOM";
import UndoManager from "./UndoManager";
import NodeUtils from "./NodeUtils";
import { useStore } from "./store";

export default class Core {
  UndoManager: typeof UndoManager;
  MOUSEDOWN_ACTIVE: boolean | undefined;
  mode: string | undefined;
  TransferDropAction: Record<string, unknown>;
  activatePlaceHolder: boolean = false;
  rafuiid: number | undefined = 0;
  workspaceBodyElement: WKElement;
  workspaceHTMLElement: HTMLHtmlElement | WKElement;
  webskitShadowRoot: ShadowRoot | undefined;
  elementPointerSelector: HTMLElement | undefined;
  parentPointerSelector: HTMLElement | undefined;
  stripePointerSelector: HTMLElement | undefined;
  stripePointerSelectorInfo: HTMLElement | undefined;
  stripePointerBackgroundSelector: HTMLElement | undefined;
  edgeSize = 0;
  rawChildren: WKComponentTemplateNode[];
  x = 0;
  y = 0;
  overScrollEdge: boolean | undefined;
  AppState: APPState;
  final: WKElement | null | undefined;
  DELETING: boolean | undefined;
  element: WKElement[] = [];
  observer: IntersectionObserver | undefined;
  mouseDownFromTree: boolean | undefined;
  dragElement: WKElement | null | undefined;
  forcedParent: any;
  forcedParentBlock: boolean | undefined;
  lastX: number | undefined;
  lastY: number | undefined;
  eventPool: { [k: string]: { [p: string]: (p?: never) => void } } | undefined;
  dropActionJSON: { side: string; el: string | number } = { side: "", el: "" };
  EventAPI: EventAPI;
  mouseDownFromWorkspace: boolean | undefined;
  minPixels: number | undefined;
  startX: any;
  startY: any;
  pause: boolean | undefined;
  placeholder: HTMLElement | undefined;

  constructor() {
    this.UndoManager = UndoManager;
    const webskitShadowRoot = document.querySelector("wk-instance");
    this.minPixels = 10;
    this.workspaceBodyElement = document.body as WKElement;
    this.workspaceHTMLElement = document.querySelector("html") as HTMLHtmlElement;
    this.AppState = useStore();
    this.EventAPI = new EventAPI();
    this.eventPool = {};
    this.eventPool.TAB = {};
    this.edgeSize = 50;
    this.rawChildren = [];

    this.TransferDropAction = {};

    if (webskitShadowRoot && webskitShadowRoot.shadowRoot) {
      this.webskitShadowRoot = <ShadowRoot>webskitShadowRoot.shadowRoot;
      if (this.webskitShadowRoot) {
        this.elementPointerSelector = <HTMLElement>this.webskitShadowRoot.querySelector("[element-pointer-selector]");
        this.parentPointerSelector = <HTMLElement>this.webskitShadowRoot.querySelector("[parent-pointer-selector]");
        this.stripePointerSelector = <HTMLElement>this.webskitShadowRoot.querySelector("[rect-pointer-selector]");
        this.stripePointerSelectorInfo = <HTMLElement>this.webskitShadowRoot.querySelector("[rect-pointer-selector-info]");
        this.stripePointerBackgroundSelector = <HTMLElement>this.webskitShadowRoot.querySelector("[rect-pointer-selector-background]");
        this.placeholder = <HTMLElement>webskitShadowRoot.shadowRoot.querySelector("[main-placeholder]");
      }
    }
  }

  init(): void {
    this.rafuiid = window.requestAnimationFrame(this.step.bind(this));
    this.initEvents();
    this.hidePlaceholder();
    this.observer = new IntersectionObserver(this.handler.bind(this), {
      rootMargin: "0px",
    });
  }

  handler(entries: IntersectionObserverEntry[]): void {
    const intersecting: WKElement[] = [];

    for (const entry of entries) {
      if (entry.isIntersecting) {
        intersecting.push(<WKElement>entry.target);
      }
    }

    const needTransformation = (element: WKElement) => {
      const parentNode = <WKElement>element.parentNode;
      if (parentNode && parentNode.nodeType === 1 && parentNode.tagName.toLowerCase() === "picture") {
        return parentNode;
      }
      return element;
    };

    const check = (element: HTMLElement) => {
      return !element.classList.toString().includes("»--wk--UID") && element.getAttribute("wk-disabled") !== "true";
    };

    let elementsFromPoint = [...intersecting, ...this.element];

    if (!this.element[0]) return undefined;

    if (!check(elementsFromPoint[0])) {
      // return undefine
    }

    elementsFromPoint = elementsFromPoint.filter((node) => {
      return node.getAttribute("wk-disabled") !== "true";
    });

    // console.log(elementsFromPoint)

    const elementFromPoints = <WKElement>this.elementFromPoint(elementsFromPoint);
    let intersectingUnit: WKElement | undefined = undefined;

    if (elementFromPoints) {
      if (check(elementFromPoints)) {
        intersectingUnit = needTransformation(elementFromPoints);
      }
    } else {
      intersectingUnit = this.element[0];
    }

    window.widgetFromPoint = intersectingUnit;
    this.final = intersectingUnit;
  }

  hidePlaceholder(): void {
    // Placeholder
    if (this.placeholder) {
      this.placeholder.style.left = `-3000px`;
      this.placeholder.style.top = `-3000px`;
      this.placeholder.style.width = `0px`;
      this.placeholder.style.height = `0px`;
    }

    if (this.stripePointerBackgroundSelector) {
      this.stripePointerBackgroundSelector.style.left = `-3000px`;
      this.stripePointerBackgroundSelector.style.top = `-3000px`;
      this.stripePointerBackgroundSelector.style.width = `0px`;
      this.stripePointerBackgroundSelector.style.height = `0px`;
    }

    if (this.elementPointerSelector) {
      this.elementPointerSelector.style.width = `0px`;
      this.elementPointerSelector.style.height = `0px`;
    }
  }

  isOverScrollEdge(): boolean {
    const viewportX = this.x || 0;
    const viewportY = this.y || 0;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const edgeTop = this.edgeSize;
    const edgeLeft = this.edgeSize;
    const edgeBottom = viewportHeight - this.edgeSize;
    const edgeRight = viewportWidth - this.edgeSize;
    const isInLeftEdge = viewportX < edgeLeft;
    const isInRightEdge = viewportX > edgeRight;
    const isInTopEdge = viewportY < edgeTop;
    const isInBottomEdge = viewportY > edgeBottom;

    return isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge;
  }

  mousedown(e: MouseEvent): void {
    this.x = e.clientX;
    this.y = e.clientY;

    /**
     * Check Selection Mode
     */
    if (window.widgetFromPoint && !window.widgetFromPoint?.$WebsKit && this.AppState.Elements.selection_mode === "WK-COMPONENTS" && !window.widgetFromPoint?.tagName.startsWith("WK-")) {
      window.widgetFromPoint = this.getClosestParent(<WKElement>window.widgetFromPoint);
    }

    const target: HTMLElement = <HTMLElement>e.target;

    this.dragElement = window.widgetFromPoint;

    const component = this.getClosestComponent(<WKElement>window.widgetFromPoint);
    if (window.widgetFromPoint?.isSlot && component && component.tagName !== "BODY") {
      this.dragElement = component;
    }

    this.mouseDownFromTree = target?.classList && document.querySelector(".tree-wrapper")?.contains(target) && target.classList.contains("wk-node-text");
    this.mouseDownFromWorkspace = true;

    // this.AppState.Tools.componentHash = Utils.CreateGUID()
    this.AppState.Elements.dragAction = "PRE-MOVE";
    this.overScrollEdge = this.isOverScrollEdge();
    this.setSelected(window.widgetFromPoint).then((r) => void r);
    this.AppState.Elements.lastSelected = this.AppState.Elements.selected;
    this.AppState.Elements.originalSelected = window.widgetFromPoint?.guid;
    this.AppState.Elements.originalElementSelected = window.widgetFromPoint;
    this.AppState.Elements.elementSelected = window.widgetFromPoint;
    this.AppState.Elements.selected = window.widgetFromPoint?.guid;
  }

  async setSelected(element: WKElement | null | undefined): Promise<void> {
    if (!element) return;

    this.AppState.Elements.lastSelected = this.AppState.Elements.selected;
    this.AppState.Elements.elementSelected = element;
    this.AppState.Elements.selected = element.guid;
    this.sendMessage({ event: "setCurrentElement", data: element.guid });
  }

  async Undo() {
    await this.UndoManager.undo();
  }

  async Redo() {
    await this.UndoManager.redo();
  }

  keyDown_ALT(): void {
    this.activatePlaceHolder = true;
    this.AppState.APP.ALTKEY_PRESSED = true;
    this.workspacePointer();
    this.sendMessage({
      event: "PAINT_TREE_NODE",
      data: this.TransferDropAction,
    });
  }

  keyUp_ALT(): void {
    this.AppState.APP.ALTKEY_PRESSED = false;
    this.hidePlaceholder();
    this.activatePlaceHolder = false;
    this.sendMessage({ event: "CLEAR_TREE", data: {} });

    if (!this.AppState.APP.WORKSPACE_LEAVE) {
      this.workspacePointer();
      this.sendMessage({
        event: "PAINT_TREE_NODE",
        data: this.TransferDropAction,
      });
    }
  }

  initEvents(): void {
    this.EventAPI.addEventListener("mousedown.wk-workspace", (event: Event) => {
      const e = <MouseEvent>event;
      e.preventDefault();
      this.startX = e.clientX;
      this.startY = e.clientY;
      const originalElement = document.elementsFromPoint(e.clientX, e.clientY);

      const result = Array.prototype.filter.call(originalElement, function (node) {
        return node.tagName !== "WK-INSTANCE" && node.getAttribute("wk-disabled") !== "true";
      });

      if (this.AppState.APP.mode === "MOVE") {
        this.mousedown(e);
      } else if (this.AppState.APP.mode === "EDIT") {
        if (result[0] === null) return;
        if (result[0].tagName === "WK-INSTANCE") {
          this.mousedown(e);
        } else if (result[0].tagName === "WK-TOOL") {
          this.AppState.APP.mode = "EDITING";
          this.hideSpecificTool("main-placeholder");
        } else {
          this.mousedown(e);
        }
      }
    });

    this.EventAPI.addEventListener("scroll.wk-workspace", () => {
      this.workspacePointer();

      this.sendMessage({
        event: "PAINT_TREE_NODE",
        data: this.TransferDropAction,
      });
    });

    this.EventAPI.addEventListener("mouseleave.wk-workspace", () => {
      this.sendMessage({ event: "WORKSPACE_LEAVE", data: {} });

      this.AppState.APP.WORKSPACE_LEAVE = true;
      window.widgetFromPoint = undefined;
      this.pause = true;
      this.hidePlaceholder();
    });

    this.EventAPI.addEventListener("keydown.wk-workspace", async (event: Event) => {
      const e = <KeyboardEvent>event;
      if (this.AppState.APP.mode === "MOVE") {
        // SHIFT
        if (e.key === "Shift") {
          this.AppState.APP.SHIFTKEY_PRESSED = true;
        } else if (e.key === "Delete") {
          // DELETE
          e.preventDefault();
          this.DELETING = true;
          // me.deleteElement();
        } else if (e.key === "Tab") {
          // TAB
          if (!this.lastX && !this.lastY) {
            this.lastX = this.x;
            this.lastY = this.y;
          }
          e.preventDefault();
          if (this.eventPool) {
            Object.keys(this.eventPool.TAB).forEach((key) => {
              this.eventPool?.TAB && this.eventPool.TAB[key].call(null);
            });
          }
        } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
          // CTRL + SHIFT + Z
          e.preventDefault();
          await this.UndoManager.redo();
        } else if (e.key.toLowerCase() === "z" && e.ctrlKey) {
          // CTRL + Z
          e.preventDefault();
          await this.UndoManager.undo();
        } else if (e.key === "Alt") {
          e.preventDefault();
          this.keyDown_ALT();
        } else if (e.key === "Escape") {
          // store.dispatch("main/SET_GALLERY_ACTIVE", false);
        }
      } else if (this.AppState.APP.mode === "EDIT") {
        if (e.key === "Shift") {
          this.AppState.APP.SHIFTKEY_PRESSED = true;
        } else if (e.key === "Control") {
          this.AppState.APP.CTRLKEY_PRESSED = true;
        } else if (e.key.toLowerCase() === "z" && e.ctrlKey && e.shiftKey) {
          // CTRL + SHIFT + Z
          e.preventDefault();
          //await this.UndoManager.redo()
        } else if (e.key.toLowerCase() === "z" && e.ctrlKey) {
          // CTRL + Z
          e.preventDefault();
          //await this.UndoManager.undo()
        } else if (e.key === "Tab") {
          // eslint-disable-next-line no-empty
        } else if (e.key === "Escape") {
        }
      } else if (this.AppState.APP.mode === "EDITING") {
        if (e.key === "Shift") {
          this.AppState.APP.SHIFTKEY_PRESSED = true;
        } else if (e.key === "Control") {
          this.AppState.APP.CTRLKEY_PRESSED = true;
        } else if (e.key === "Escape") {
          // Volver a MOVE?
        }
      } else if (this.AppState.APP.mode === "GALLERY") {
        if (e.key === "Escape") {
          // store.dispatch("main/SET_GALLERY_ACTIVE", false);
          this.AppState.APP.mode = "MOVE";
        }
      }
    });

    this.EventAPI.addEventListener("keyup.wk-workspace", async (event: Event) => {
      const e = <KeyboardEvent>event;
      if (this.AppState.APP.mode === "MOVE") {
        // SHIFT
        if (e.key === "Shift") {
          this.AppState.APP.SHIFTKEY_PRESSED = false;
        } else if (e.key === "Alt") {
          e.preventDefault();
          this.keyUp_ALT();
        }
      }
    });

    this.EventAPI.addEventListener("mouseenter.wk-workspace", () => {
      this.sendMessage({ event: "WORKSPACE_ENTER", data: {} });
      this.AppState.APP.WORKSPACE_LEAVE = false;
      this.pause = false;
    });

    this.EventAPI.addEventListener("mouseup.wk-workspace", async () => {
      await this.mouseupWorkspace();
    });

    this.EventAPI.addEventListener("contextmenu.wk-workspace", (event: Event) => {
      event.preventDefault();
    });

    this.EventAPI.addEventListener("mousemove.wk-workspace", (event: Event) => {
      const e = <MouseEvent>event;
      this.x = e.clientX;
      this.y = e.clientY;
      if (this.AppState.APP.mode === "MOVE") {
        let minPixels: number | undefined = 3;
        if (this.mouseDownFromWorkspace) {
          minPixels = this.minPixels || 0;
        }

        // if (AppState.Elements.dragAction === 'PRE-MOVE') debugger
        if ((this.mouseDownFromWorkspace || this.mouseDownFromTree) && (this.AppState.Elements.dragAction === "PRE-MOVE" || this.AppState.Elements.dragAction === "MOVE") && (e.clientX > this.startX + minPixels || e.clientY > this.startY + minPixels || e.clientX < this.startX - minPixels || e.clientY < this.startY - minPixels)) {
          this.activatePlaceHolder = Boolean(window.widgetFromPoint && window.widgetFromPoint?.tagName !== "BODY" && window.widgetFromPoint?.tagName !== "HTML");
          this.AppState.Elements.dragAction = "MOVING";
        }
        this.pause = false;
      }

      this.sendMessage({
        event: "PAINT_TREE_NODE",
        data: this.TransferDropAction,
      });

      this.workspacePointer();
    });

    this.EventAPI.addEventListener("mouseout.wk-workspace", () => {
      // this.activatePlaceHolder = false
      // this.AppState.APP.ALTKEY_PRESSED = false

      this.AppState.APP.WORKSPACE_LEAVE = true;

      window.widgetFromPoint = undefined;
      this.pause = true;
      this.hidePlaceholder();
    });

    this.EventAPI.addEventListener("mouseenter.wk-workspace", (evt) => {
      if (this.AppState.Elements.dragAction !== "MOVING" && (evt as MouseEvent).relatedTarget && ((evt as MouseEvent).relatedTarget as HTMLElement).tagName === "BODY") {
        this.activatePlaceHolder = false;
        this.AppState.APP.ALTKEY_PRESSED = false;
      }
    });
  }

  canDrop(target: WKElement | undefined): boolean | undefined {
    if (!target) return false;

    let result = false;
    const checkIfElementExist = (element: Children[], target: WKElement) => {
      for (const item of element) {
        if (item.guid === target.guid) {
          result = true;
          break;
        } else {
          item.children && checkIfElementExist(item.children, target);
        }
      }
    };

    this.AppState.Elements.dropAction.element?.$WebsKit?.children && checkIfElementExist(this.AppState.Elements.dropAction.element.$WebsKit.children, <WKElement>this.AppState.Elements.dropAction.target);

    let siblingEvaluation = false;

    if (this.AppState.Elements.dropAction.side === "PRE" || this.AppState.Elements.dropAction.side === "LEFT") {
      if (this.AppState.Elements.dropAction.element?.nextElementSibling !== this.AppState.Elements.dropAction.target) {
        siblingEvaluation = true;
      }
    } else if (this.AppState.Elements.dropAction.side === "POST" || this.AppState.Elements.dropAction.side === "RIGHT") {
      if (this.AppState.Elements.dropAction.element?.previousElementSibling !== this.AppState.Elements.dropAction.target) {
        siblingEvaluation = true;
      }
    } else {
      siblingEvaluation = true;
    }

    return ((this.workspaceBodyElement.contains(this.AppState.Elements.dropAction?.element as WKElement) && (this.mouseDownFromWorkspace || this.mouseDownFromTree)) || this.workspaceBodyElement.contains(target)) && !this.AppState.Elements.dropAction.element?.contains(this.AppState.Elements.dropAction.target as WKElement) && this.AppState.Elements.dropAction.element?.$WebsKit && this.AppState.Elements.dropAction.target?.$WebsKit && this.AppState.Elements.dropAction.element.$WebsKit.guid !== this.AppState.Elements.dropAction.target.$WebsKit.guid && !this.AppState.Elements.dropAction.element.contains(this.AppState.Elements.dropAction.target as WKElement) && !result && siblingEvaluation;
  }

  // async insertClass(element: WKElement, className: string): Promise<void> {
  //   const wkNode = window.wkNodes[String(element.$WebsKit?.guid || "root")];
  //
  //   // wkNode.props.class
  // }

  // getParent(root, id) {
  //   let node;
  //
  //   root.some((n) => {
  //     if (n.id === id) {
  //       return node = n;
  //     }
  //     if (n.children) {
  //       return node = this.getParent(n.children, id);
  //     }
  //   });
  //
  //   return node || null;
  // }

  async insertBefore(element: WKElement, target: WKElement): Promise<void> {
    let same: boolean = false;
    let targetIndex: number;
    let elementIndex: number;

    const targetParentNodeGUID = window.wkNodes[String(target.$WebsKit?.guid || "root")].parent?.guid || "root";
    const elementParentNodeGUID = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.guid || "root";

    if (elementParentNodeGUID === targetParentNodeGUID) {
      const targetParentChildren = window.wkNodes[String(target.$WebsKit?.guid || "root")].parent?.children as Children[];
      const elementParentChildren = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.children as Children[];
      targetIndex = this.getNodeIndex(targetParentChildren, target) as number;
      elementIndex = this.getNodeIndex(elementParentChildren, element) as number;
      same = true;

      if (elementIndex >= targetIndex) {
        (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
      } else {
        (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex - 1, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
      }
    } else {
      const targetParentChildren = window.wkNodes[String(target.$WebsKit?.guid || "root")].parent?.children as Children[];
      const elementParentChildren = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.children as Children[];
      targetIndex = this.getNodeIndex(targetParentChildren, target) as number;
      elementIndex = this.getNodeIndex(elementParentChildren, element) as number;

      (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 0, (window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
    }

    (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
    (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));

    await nextTick(() => {
      this.UndoManager.add({
        undo: async () => {
          if (same) {
            if (elementIndex >= targetIndex) {
              (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 1)[0]);
            } else {
              (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex - 1, 1)[0]);
            }
          } else {
            (window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 1)[0]);
          }

          (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
          (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));
        },
        redo: async () => {
          if (same) {
            if (elementIndex >= targetIndex) {
              (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
            } else {
              (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex - 1, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
            }
          } else {
            (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 0, (window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
          }

          (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
          (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));
        },
      });
    });
  }

  async insertIn(element: WKElement, target: WKElement): Promise<void> {
    const elementParentNodeGUID = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.guid || "root";
    const targetParentNodeGUID = target.$WebsKit?.guid || "root";
    const elementParentChildren = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.children as Children[];
    const elementIndex = this.getNodeIndex(elementParentChildren, element) as number;

    (window.wkNodes[targetParentNodeGUID].children as Children[]).push((window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);

    (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
    (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));

    await nextTick(() => {
      this.UndoManager.add({
        undo: async () => {
          (window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(0, 1)[0]);

          (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
          (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));
        },
        redo: async () => {
          (window.wkNodes[targetParentNodeGUID].children as Children[]).push((window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);

          (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
          (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));
        },
      });
    });
  }

  async insertAfter(element: WKElement, target: WKElement): Promise<void> {
    let same: boolean = false;
    let targetIndex: number;
    let elementIndex: number;

    const elementParentNodeGUID = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.guid || "root";
    const targetParentNodeGUID = window.wkNodes[String(target.$WebsKit?.guid || "root")].parent?.guid || "root";

    if (elementParentNodeGUID === targetParentNodeGUID) {
      const targetParentChildren = window.wkNodes[String(target.$WebsKit?.guid || "root")].parent?.children as Children[];
      const elementParentChildren = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.children as Children[];
      targetIndex = this.getNodeIndex(targetParentChildren, target) as number;
      elementIndex = this.getNodeIndex(elementParentChildren, element) as number;
      same = true;

      if (elementIndex >= targetIndex) {
        (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex + 1, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
      } else {
        (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
      }
    } else {
      const targetParentChildren = window.wkNodes[String(target.$WebsKit?.guid || "root")].parent?.children as Children[];
      const elementParentChildren = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.children as Children[];
      targetIndex = this.getNodeIndex(targetParentChildren, target) as number;
      elementIndex = this.getNodeIndex(elementParentChildren, element) as number;

      (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex + 1, 0, (window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
    }

    (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
    (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));

    await nextTick(() => {
      this.UndoManager.add({
        undo: async () => {
          if (same) {
            if (elementIndex >= targetIndex) {
              (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex + 1, 1)[0]);
            } else {
              (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 1)[0]);
            }
          } else {
            (window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex + 1, 1)[0]);
          }

          (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
          (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));
        },
        redo: async () => {
          if (same) {
            if (elementIndex >= targetIndex) {
              (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex + 1, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
            } else {
              (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
            }
          } else {
            (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(targetIndex + 1, 0, (window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);
          }

          (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
          (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));
        },
      });
    });
  }

  async slotInsert(element: WKElement, target: string): Promise<void> {
    const elementParentNodeGUID = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.guid || "root";
    const targetParentNodeGUID = target || "root";
    const elementParentChildren = window.wkNodes[String(element.$WebsKit?.guid || "root")].parent?.children as Children[];
    const elementIndex = this.getNodeIndex(elementParentChildren, element) as number;

    (window.wkNodes[targetParentNodeGUID].children as Children[]).push((window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);

    (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
    (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));

    await nextTick(() => {
      this.UndoManager.add({
        undo: async () => {
          (window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 0, (window.wkNodes[targetParentNodeGUID].children as Children[]).splice(0, 1)[0]);

          (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
          (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));
        },
        redo: async () => {
          (window.wkNodes[targetParentNodeGUID].children as Children[]).push((window.wkNodes[elementParentNodeGUID].children as Children[]).splice(elementIndex, 1)[0]);

          (window.wkNodes[targetParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[targetParentNodeGUID]));
          (window.wkNodes[elementParentNodeGUID].children as Children[]).map((node) => (node.parent = window.wkNodes[elementParentNodeGUID]));
        },
      });
    });
  }

  getNodeIndex(children: Children[], element: WKElement): number {
    return children.map((element: any) => element.guid).indexOf(element.guid);
  }

  async manageDrop(): Promise<void> {
    console.log("drop", this.AppState.Elements.dropAction);

    if (this.AppState.Elements.dropAction.element?.tagName === "V-SLOT") {
      const element = document.createElement("DIV") as WKElement;
      element.$WebsKit = window.wkNodes[String(this.AppState.Elements.dropAction.element.getAttribute("data-guid"))];
      element.guid = String(this.AppState.Elements.dropAction.element.getAttribute("data-guid"));
      this.AppState.Elements.dropAction.element = element;
    }

    if (this.AppState.Elements.dropAction.target?.tagName === "V-SLOT") {
      const element = document.createElement("DIV") as WKElement;
      element.$WebsKit = window.wkNodes[String(this.AppState.Elements.dropAction.target.getAttribute("data-guid"))];
      element.guid = String(this.AppState.Elements.dropAction.target.getAttribute("data-guid"));
      this.AppState.Elements.dropAction.target = element;
    }

    switch (this.AppState.Elements.dropAction.side) {
      case "LEFT":
      case "PRE":
        if (this.AppState.Elements.dropAction.element && this.AppState.Elements.dropAction.target) {
          await this.insertBefore(this.AppState.Elements.dropAction.element, this.AppState.Elements.dropAction.target);
        }
        break;
      case "IN":
        if (this.AppState.Elements.dropAction.element && this.AppState.Elements.dropAction.target) {
          await this.insertIn(this.AppState.Elements.dropAction.element, this.AppState.Elements.dropAction.target);
        }
        break;
      case "RIGHT":
      case "POST":
        if (this.AppState.Elements.dropAction.element && this.AppState.Elements.dropAction.target) {
          await this.insertAfter(this.AppState.Elements.dropAction.element, this.AppState.Elements.dropAction.target);
        }
        break;
      default:
    }

    function replacer(name: string, val: string) {
      if (name === "DOMElement" || name === "parent") {
        return undefined;
      } else {
        return val;
      }
    }

    await nextTick(async () => {
      this.sendMessage({
        event: "TREE_NODES",
        data: {
          $Nodes: JSON.parse(JSON.stringify(this.AppState.ComponentsDefinition[this.AppState.currentComponent].template, replacer)),
        },
      });
      setTimeout(() => {
        this.sendMessage({ event: "CLEAR_TREE", data: {} });
      }, 0);
    });
  }

  async mouseupWorkspace(dragAction: string | undefined = undefined): Promise<void> {
    this.AppState.Elements.lastDropAction = {};
    window.lastDropAction = JSON.parse(
      JSON.stringify({
        side: this.AppState.Elements.dropAction.side,
        target: this.AppState.Elements.dropAction.target?.$WebsKit?.guid,
        element: this.AppState.Elements.dropAction.element?.$WebsKit?.guid,
      })
    );
    if (this.AppState.Elements.dragAction === "MOVING" || dragAction === "MOVING") {
      this.AppState.Elements.lastDropAction = {
        side: this.AppState.Elements.dropAction.side,
        target: this.AppState.Elements.dropAction.target?.$WebsKit?.guid,
        element: this.AppState.Elements.dropAction.element?.$WebsKit?.guid,
      };

      if (this.AppState.Elements.dropAction.slotInsert) {
        await this.slotInsert(this.AppState.Elements.dropAction.element as WKElement, String(this.AppState.Elements.dropAction.targetGUID));
        await nextTick(async () => {
          this.sendMessage({
            event: "TREE_NODES",
            data: {
              $Nodes: JSON.parse(JSON.stringify(this.AppState.ComponentsDefinition[this.AppState.currentComponent].template, this.replacer)),
            },
          });
          setTimeout(() => {
            this.sendMessage({ event: "CLEAR_TREE", data: {} });
          }, 0);
        });
      } else {
        this.canDrop(this.AppState.Elements.dropAction.target as WKElement) && (await this.manageDrop());
      }
    }

    this.overScrollEdge = true;
    this.mouseDownFromWorkspace = false;
    this.mouseDownFromTree = false;
    this.AppState.Elements.dragAction = "STOPPED";
    this.activatePlaceHolder = false;
    this.hidePlaceholder();

    this.MOUSEDOWN_ACTIVE = false;
    document.querySelector("body")?.classList.remove("wk-mousedown-active");

    if (this.AppState.APP.mode === "MOVE-EDITING") {
      this.AppState.APP.mode = "MOVE";
      // me.paintSelector(me.currentElement, true)
    }

    if (this.AppState.APP.mode === "EDITING") {
      this.AppState.APP.mode = "EDIT";
      // me.paintSelector(me.currentElement, true)
    }

    if (this.mode === "EDIT") {
      //me.paintSelector(me.currentElement, true)
    }

    this.AppState.Elements.dropAction.element = undefined;
    this.dragElement = undefined;

    setTimeout(() => {
      this.keyUp_ALT();
    }, 1);
  }

  handleScroll(yBottom = 0, xRight = 0): void {
    const event = {
      clientX: this.x,
      clientY: this.y,
    };
    const et = this.edgeSize;
    const el = this.edgeSize;

    const eb = this.edgeSize;
    const er = this.edgeSize;
    const container = document.querySelector("HTML") as HTMLBodyElement;
    const viewportX = event.clientX;
    const viewportY = event.clientY;
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;
    const edgeTop = et;
    const edgeLeft = el;
    const edgeBottom = viewportHeight - eb;
    const edgeRight = viewportWidth - er;
    const isInLeftEdge = viewportX < el;
    const isInRightEdge = viewportX + xRight > edgeRight;
    const isInTopEdge = viewportY < et;
    const isInBottomEdge = viewportY + yBottom > edgeBottom;

    const documentWidth = container.scrollWidth;
    const documentHeight = container.scrollHeight;

    const maxScrollX = documentWidth - viewportWidth;
    const maxScrollY = documentHeight - viewportHeight;

    const adjustWindowScroll = () => {
      const currentScrollX = container.scrollLeft;
      const currentScrollY = container.scrollTop;

      const canScrollUp = currentScrollY > 0;
      const canScrollDown = currentScrollY < maxScrollY;
      const canScrollLeft = currentScrollX > 0;
      const canScrollRight = currentScrollX < maxScrollX;
      // eslint-disable-next-line no-unused-vars
      let nextScrollX = currentScrollX;
      let nextScrollY = currentScrollY;
      const maxStep = 8;
      let intensity;

      if (isInLeftEdge && canScrollLeft) {
        intensity = (edgeLeft - viewportX) / el;
        nextScrollX = nextScrollX - maxStep * intensity;
      } else if (isInRightEdge && canScrollRight) {
        intensity = (viewportX + xRight - edgeRight) / er;
        nextScrollX = nextScrollX + maxStep * intensity;
      }

      if (isInTopEdge && canScrollUp) {
        intensity = (edgeTop - viewportY) / et;
        nextScrollY = nextScrollY - maxStep * intensity;
      } else if (isInBottomEdge && canScrollDown) {
        intensity = (viewportY + yBottom - edgeBottom) / eb;
        nextScrollY = nextScrollY + maxStep * intensity;
      }

      Math.max(0, Math.min(maxScrollX, nextScrollX));
      nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

      if (nextScrollY !== currentScrollY) {
        container.scrollTo(0, nextScrollY);
        return true;
      } else {
        return false;
      }
    };

    adjustWindowScroll();
  }

  hideSpecificTool(tool: string): void {
    this.webskitShadowRoot?.querySelector(`[${tool}]`)?.classList.add("hidden");
  }

  // hideTools(): void {
  //   this.webskitShadowRoot?.querySelector("webskit")?.classList.add("hidden");
  // }

  // showSpecificTool(tool: string): void {
  //   this.webskitShadowRoot
  //     ?.querySelector(`[${tool}]`)
  //     ?.classList.remove("hidden");
  //   if (this.AppState.APP.mode.startsWith("EDIT")) {
  //     this.hideSpecificTool("main-placeholder");
  //   }
  // }

  step(): void {
    // if (AppState.APP.mode === 'EDITING') {
    //   this.rafuiid = window.requestAnimationFrame(this.step.bind(this))
    //   return
    // }

    if (this.pause) {
      this.rafuiid = window.requestAnimationFrame(this.step.bind(this));
      return;
    }

    if (this.AppState.Elements.dragAction === "MOVING") {
      const overScrollEdge = this.isOverScrollEdge();

      if (overScrollEdge !== this.overScrollEdge) {
        this.overScrollEdge = false;
      }

      if (!this.overScrollEdge && overScrollEdge) {
        this.handleScroll();
        this.workspacePointer();
      }
    }

    const wkInstance = document.querySelector("WK-INSTANCE") as WKElement;
    const body = document.querySelector("BODY") as WKElement;

    if (wkInstance) {
      wkInstance.style.height = `${body.offsetHeight}px`;
    }

    this.rafuiid = window.requestAnimationFrame(this.step.bind(this));
  }

  workspacePointer() {
    /**
     * Log Current Info
     */
    // this.logInfo && console.log(JSON.stringify(this.currentInfo()))

    /**
     * Check elements from point for Workspace
     */
    // debugger
    let originalElement = this.workspaceBodyElement;
    const filter = Array.prototype.filter;
    let filtered: Element[] | undefined = [];

    const result: Element[] | undefined = document.elementsFromPoint(this.x, this.y);

    if (this.AppState.APP.mode?.startsWith("EDIT") && result && result.length && result[0].tagName === "WK-TOOL") {
      this.rafuiid = window.requestAnimationFrame(this.step.bind(this));
      return;
    } else {
      filtered = result?.filter((node) => {
        return this.workspaceHTMLElement?.contains(node) && node.tagName.toLowerCase() !== "wk-instance" && node.tagName.toLowerCase() !== "html";
      });

      const childrenOfFirst = filtered?.length ? Array.from(filtered[0].querySelectorAll("*")) : [];

      if (filtered?.length) {
        filtered = filter.call([...childrenOfFirst, ...filtered], (node) => {
          return !this.AppState.skipTags.includes(node.tagName) && !node.tagName.startsWith("WK-") && node.getAttribute("wk-disabled") !== "true";
        });

        if (filtered?.length) {
          originalElement = this.elementFromPoint([...filtered]) as WKElement;
        }
      }
    }

    if (!originalElement || originalElement === this.workspaceHTMLElement) {
      originalElement = this.workspaceBodyElement;
      window.widgetFromPoint = this.workspaceBodyElement;
    }

    if (originalElement) {
      const children = filter.call(originalElement.children, (node) => {
        return !this.AppState.skipTags.includes(node.tagName) && !node.tagName.startsWith("WK-") && node.getAttribute("wk-disabled") !== "true";
      });

      if (originalElement.tagName.toLowerCase() === "body") {
        window.widgetFromPoint = originalElement;
      } else if (children.length === 0) {
        this.final = null;
        window.widgetFromPoint = originalElement;
      } else {
        this.dispatchObserver({
          clientX: this.x,
          clientY: this.y,
          target: originalElement,
        });

        this.final = this.final === null ? originalElement : this.final;
        window.widgetFromPoint = this.final;
      }
    }

    if (this.AppState.APP.mode === "EDITING") {
      const state = this.AppState.APP.mode;
      console.log("EDITING", state);
    } else if (window.widgetFromPoint && !window.widgetFromPoint.tagName.startsWith("WK-") && this.AppState.APP.mode === "MOVE") {
      if (window.widgetFromPoint.tagName !== "BODY" && !window.widgetFromPoint.$WebsKit && this.AppState.Elements.selection_mode === "WK-COMPONENTS") {
        window.widgetFromPoint = this.getClosestParent(window.widgetFromPoint);
      }

      // console.log(window.widgetFromPoint)

      if (this.AppState.APP.ALTKEY_PRESSED) {
        this.controlMode();
        // @ts-ignore
      } else if (this.AppState.Elements.dragAction === "MOVING") {
        const component = this.getClosestComponent(<WKElement>window.widgetFromPoint);
        if (window.widgetFromPoint?.isSlot && component && component.tagName !== "BODY") {
          window.widgetFromPoint = component;
        }

        this.passiveMode();
      }

      // this.slotPointer()

      this.sendMessage({
        event: "setWidgetFromPoint",
        data: window.widgetFromPoint?.guid || "root",
      });

      this.TransferDropAction = {
        target: this.AppState.Elements.dropAction.target ? this.AppState.Elements.dropAction.target.guid : "root",
        element: this.AppState.Elements.dropAction.element ? this.AppState.Elements.dropAction.element.guid : "root",
        side: this.AppState.Elements.dropAction.side,
        activatePlaceHolder: this.activatePlaceHolder,
        widgetFromPoint: window.widgetFromPoint?.guid,
      };

      if (this.activatePlaceHolder) {
        this.paintPlaceholder();
        this.setPointerSelector(this.AppState.Elements.dropAction.target);
      } else {
        this.setPointerSelector(window.widgetFromPoint);
        // console.log(window.widgetFromPoint)
      }

      // if (this.lastDropAction !== JSON.stringify(this.dropActionJSON)) {
      //   this.paintPlaceholder()
      //   this.lastDropAction = JSON.stringify(this.dropActionJSON)
      // }
    }

    if (window.widgetFromPoint === this.workspaceBodyElement || window.widgetFromPoint === this.workspaceHTMLElement) {
      //this.hideTools()
    } else {
      // this.showTools()
    }
  }

  haveSlotParent(guid: string) {
    const parent = window.wkNodes[guid].parent;
    if (parent?.tag === "slot") {
      return parent;
    }
    if (parent) {
      this.haveSlotParent(parent?.guid);
    }
  }

  setPointerSelectorFromTree(guid: number) {
    const node = window.wkNodes[guid];
    if (node && node.DOMElement) {
      window.widgetFromPoint = node.DOMElement;
      this.setPointerSelector(node.DOMElement);
    }
  }

  setPointerSelector(element: WKElement | null | undefined): void {
    if (element) {
      const marginLeft = element.nodeType === 3 ? 0 : parseFloat(getComputedStyle(element).marginLeft) < 0 ? 0 : parseFloat(getComputedStyle(element).marginLeft);
      const marginTop = element.nodeType === 3 ? 0 : parseFloat(getComputedStyle(element).marginTop) < 0 ? 0 : parseFloat(getComputedStyle(element).marginTop);

      if (this.parentPointerSelector && element.parentNode) {
        this.parentPointerSelector.style.left = `${this.getRects(element.parentNode as WKElement).originalLeft - this.workspaceBodyElement.getBoundingClientRect().left - marginLeft}px`;
        this.parentPointerSelector.style.top = `${this.getRects(element.parentNode as WKElement).originalTop - this.workspaceBodyElement.getBoundingClientRect().top - marginTop}px`;
        this.parentPointerSelector.style.width = `${this.getRects(element.parentNode as WKElement).width}px`;
        this.parentPointerSelector.style.height = `${this.getRects(element.parentNode as WKElement).height}px`;
      }

      if (this.elementPointerSelector) {
        const marginLeft = (window.widgetFromPoint as WKElement).nodeType === 3 ? 0 : parseFloat(getComputedStyle(window.widgetFromPoint as WKElement).marginLeft) < 0 ? 0 : parseFloat(getComputedStyle(window.widgetFromPoint as WKElement).marginLeft);
        const marginTop = (window.widgetFromPoint as WKElement).nodeType === 3 ? 0 : parseFloat(getComputedStyle(window.widgetFromPoint as WKElement).marginTop) < 0 ? 0 : parseFloat(getComputedStyle(window.widgetFromPoint as WKElement).marginTop);
        this.elementPointerSelector.style.left = `${this.getRects(window.widgetFromPoint as WKElement).originalLeft - this.workspaceBodyElement.getBoundingClientRect().left - marginLeft}px`;
        this.elementPointerSelector.style.top = `${this.getRects(window.widgetFromPoint as WKElement).originalTop - this.workspaceBodyElement.getBoundingClientRect().top - marginTop}px`;
        this.elementPointerSelector.style.width = `${this.getRects(window.widgetFromPoint as WKElement).width}px`;
        this.elementPointerSelector.style.height = `${this.getRects(window.widgetFromPoint as WKElement).height}px`;
      }

      // Rects
      if (this.stripePointerSelector && this.activatePlaceHolder) {
        this.stripePointerSelector.style.left = `${this.getRects(element).originalLeft - this.workspaceBodyElement.getBoundingClientRect().left - marginLeft}px`;
        this.stripePointerSelector.style.top = `${this.getRects(element).originalTop - this.workspaceBodyElement.getBoundingClientRect().top - marginTop}px`;
        this.stripePointerSelector.style.width = `${this.getRects(element).width}px`;
        this.stripePointerSelector.style.height = `${this.getRects(element).height}px`;
      }

      // Info
      if (this.stripePointerSelectorInfo && this.activatePlaceHolder) {
        this.stripePointerSelectorInfo.style.left = `${this.getRects(element).originalLeft - this.workspaceBodyElement.getBoundingClientRect().left - marginLeft}px`;
        this.stripePointerSelectorInfo.style.top = `${this.getRects(element).originalTop - this.workspaceBodyElement.getBoundingClientRect().top - marginTop}px`;
        this.stripePointerSelectorInfo.style.width = `${this.getRects(element).width}px`;
        this.stripePointerSelectorInfo.style.height = `${this.getRects(element).height}px`;
      }

      this.AppState.Elements.elementInfo = element.tagName === "BODY" ? "Body" : element.$WebsKit ? element.$WebsKit.tag : element.tagName;
      this.AppState.Elements.elementTag = element.tagName === "BODY" ? "Body" : element.$WebsKit ? element.$WebsKit.tag : element.tagName;
      this.AppState.Elements.element = element;

      // Background
      if (this.stripePointerBackgroundSelector && this.activatePlaceHolder) {
        this.stripePointerBackgroundSelector.style.left = `${this.getRects(element).originalLeft - this.workspaceBodyElement.getBoundingClientRect().left - marginLeft}px`;
        this.stripePointerBackgroundSelector.style.top = `${this.getRects(element).originalTop - this.workspaceBodyElement.getBoundingClientRect().top - marginTop}px`;
        this.stripePointerBackgroundSelector.style.width = `${this.getRects(element).width}px`;
        this.stripePointerBackgroundSelector.style.height = `${this.getRects(element).height}px`;
      }
    }
  }

  checkSlot(raw: WKElement) {
    const slot = this.haveSlotParent(raw.bguid);

    if (slot) {
      this.rawChildren = slot.children || [];

      if (slot.props?.name) {
        const renderedComponent = this.getClosestParent(raw) as WKElement;

        const slotTarget = (window.wkNodes[renderedComponent.guid].children as WKComponentTemplateNode[]).filter((item) => Object.entries(item.props as Record<string, any>).filter((prop) => prop[1] === (slot.props as Record<string, unknown>).name));

        const slotGUID = slotTarget.filter(
          // @ts-ignore
          (item) => item.props["#"] === slot.props.name
        )[0].guid;
        this.AppState.Elements.dropAction.element = this.dragElement;
        this.AppState.Elements.dropAction.targetGUID = slotGUID;
        this.AppState.Elements.dropAction.side = "IN";
        this.AppState.Elements.dropAction.slotInsert = true;
      }
    }
  }

  passiveMode(): void {
    let target = window.widgetFromPoint;
    const originalTarget = window.widgetFromPoint;
    let inside = Utils.calculatePosition({
      target: target,
      x: this.x,
      y: this.y,
    });

    this.AppState.Elements.dropAction = {
      target: target,
      element: this.mouseDownFromTree ? this.AppState.Elements.dropAction.element : this.dragElement,
    };

    const targetHeightEdge = (target: WKElement | null | undefined, side: string): number => {
      if (target && target.tagName !== "BODY") {
        const rects = Utils.getNaturalRects(target);
        const edgeByMargin = target?.nodeType === 3 ? 0 : side === "PRE" ? parseFloat(getComputedStyle(<Element>target).marginTop) : parseFloat(getComputedStyle(<Element>target).marginBottom);
        let edgeByPadding: number;
        if (target.children?.length > 0 || rects.height <= (target.nodeType === 3 ? 0 : parseFloat(getComputedStyle(target).paddingTop) + parseFloat(getComputedStyle(target).paddingBottom))) {
          edgeByPadding = target.nodeType === 3 ? 0 : side === "PRE" ? (parseFloat(getComputedStyle(target).paddingTop) / 100) * 50 : (parseFloat(getComputedStyle(target).paddingBottom) / 100) * 50;
        } else {
          edgeByPadding = target.nodeType === 3 ? 0 : side === "PRE" ? parseFloat(getComputedStyle(target).paddingTop) : parseFloat(getComputedStyle(target).paddingBottom);
        }
        const concatEdge = edgeByMargin + edgeByPadding;
        const edgeBySize = rects.width > rects.height ? (rects.height / 100) * 20 : (rects.width / 100) * 20;
        let result = concatEdge > 0 ? concatEdge : edgeBySize;
        result = result >= rects.height / 3 ? result / 3 : result;
        return result;
      } else {
        return 0;
      }
    };

    const targetWidthEdge = (target: WKElement | null | undefined, side: string) => {
      if (target && target.tagName !== "BODY") {
        const rects = Utils.getNaturalRects(target);
        const edgeByMargin = target?.nodeType === 3 ? 0 : side === "PRE" ? parseFloat(getComputedStyle(<Element>target).marginLeft) : parseFloat(getComputedStyle(<Element>target).marginRight);
        let edgeByPadding: number;
        if (target.children?.length > 0 || rects.width <= (target.nodeType === 3 ? 0 : parseFloat(getComputedStyle(target).paddingLeft) + parseFloat(getComputedStyle(target).paddingRight))) {
          edgeByPadding = target.nodeType === 3 ? 0 : side === "PRE" ? (parseFloat(getComputedStyle(target).paddingLeft) / 100) * 50 : (parseFloat(getComputedStyle(target).paddingRight) / 100) * 50;
        } else {
          edgeByPadding = target.nodeType === 3 ? 0 : side === "PRE" ? parseFloat(getComputedStyle(target).paddingLeft) : parseFloat(getComputedStyle(target).paddingRight);
        }
        const concatEdge = edgeByMargin + edgeByPadding;
        const edgeBySize = rects.width > rects.height ? (rects.height / 100) * 20 : (rects.width / 100) * 20;
        let result = concatEdge > 0 ? concatEdge : edgeBySize;
        result = result >= rects.width / 3 ? result / 3 : result;
        return result;
      } else {
        return 0;
      }
    };

    const nextParent = () => {
      if ((<WKElement>window.widgetFromPoint?.parentNode)?.tagName === "BODY") {
        this.forcedParent && this.forcedParent.removeAttribute("wk-disabled");
        this.forcedParentBlock = true;
        this.forcedParent = undefined;
        const DOMlist = this.workspaceBodyElement.querySelectorAll(`[wk-disabled]`);
        [].forEach.call(DOMlist, function (DOMel: WKElement) {
          DOMel.removeAttribute("wk-disabled");
        });
        setTimeout(() => {
          this.forcedParentBlock = false;
        }, 50);
      } else {
        if (!this.forcedParent) {
          this.forcedParent = window.widgetFromPoint;
        }
        window.widgetFromPoint?.setAttribute("wk-disabled", "true");
        if (window.widgetFromPoint?.parentNode && (<WKElement>window.widgetFromPoint.parentNode).isSlot) {
          (<WKElement>window.widgetFromPoint.parentNode).setAttribute("wk-disabled", "true");
        }

        [].forEach.call(window.document.elementsFromPoint(this.x, this.y), function (DOMel: WKElement) {
          if (DOMel.parentNode && (<WKElement>DOMel.parentNode).isGrid && !DOMel.isGridArea) {
            DOMel.setAttribute("wk-disabled", String(true));
          }
        });

        const DOMlist = window.document.querySelectorAll("wk-grid-area");
        [].forEach.call(DOMlist, function (DOMel: WKElement) {
          DOMel.setAttribute("wk-disabled", String(true));
        });
      }
    };

    if (this.lastX && this.lastY && (this.x > this.lastX + 10 || this.y > this.lastY + 10 || this.x < this.lastX - 10 || this.y < this.lastY - 10)) {
      // Clear nextParent event
      this.eventPool?.TAB && delete this.eventPool.TAB.nextParent;
      this.forcedParent = undefined;
      this.lastX = undefined;
      this.lastY = undefined;
      this.forcedParent = undefined;
      const DOMlist = this.workspaceBodyElement.querySelectorAll(`[wk-disabled]`);
      [].forEach.call(DOMlist, function (DOMel: WKElement) {
        DOMel.removeAttribute("wk-disabled");
      });
    }

    this.eventPool?.TAB && (this.eventPool.TAB.nextParent = nextParent.bind(this));

    // debugger
    if (target?.isComponent && !this.AppState.Elements.dropAction.element?.contains(target)) {
      if (inside.side.x === "LEFT") {
        if (inside.position.y <= targetHeightEdge(target, inside.side.y)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else if (inside.position.x <= targetWidthEdge(target, inside.side.x)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else {
          const slots = Array.from(target.querySelectorAll("*")).filter((node) => {
            const template = window.wkNodes[(node as WKElement).guid];
            if (template && template.parent) {
              return (node as WKElement).isComponent || (node as WKElement).isSlot || template.parent.tag === "template";
            } else {
              return (node as WKElement).isComponent || (node as WKElement).isSlot;
            }
          }) as WKElement[];
          if (slots.length > 0) {
            const closest = Utils.getClosestElementByChildren(slots, this.x, this.y);
            if (closest.el) {
              target = closest.el;
              if (target.bguid && !target.isComponent) {
                this.checkSlot(target);
              } else {
                inside = Utils.calculatePosition({
                  target: target,
                  x: this.x,
                  y: this.y,
                });

                if (Utils.getDisplayFlow(target) === "block") {
                  this.AppState.Elements.dropAction.side = inside.side.y;
                } else {
                  this.AppState.Elements.dropAction.side = inside.side.x;
                }
              }
            }
          }
        }
      } else {
        if (inside.position.y <= targetHeightEdge(target, inside.side.y)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else if (inside.position.x <= targetWidthEdge(target, inside.side.x)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else {
          const slots = Array.from(target.querySelectorAll("*")).filter((node) => {
            const template = window.wkNodes[(node as WKElement).guid];
            if (template && template.parent) {
              return (node as WKElement).isComponent || (node as WKElement).isSlot || template.parent.tag === "template";
            } else {
              return (node as WKElement).isComponent || (node as WKElement).isSlot;
            }
          }) as WKElement[];
          if (slots.length > 0) {
            const closest = Utils.getClosestElementByChildren(slots, this.x, this.y);
            if (closest.el) {
              target = closest.el;
              if (target.bguid && !target.isComponent) {
                this.checkSlot(target);
              } else {
                inside = Utils.calculatePosition({
                  target: target,
                  x: this.x,
                  y: this.y,
                });

                if (Utils.getDisplayFlow(target) === "block") {
                  this.AppState.Elements.dropAction.side = inside.side.y;
                } else {
                  this.AppState.Elements.dropAction.side = inside.side.x;
                }
              }
            }
          }
        }
      }
    } else if (target?.isSlot) {
      if (!this.forcedParent) {
        this.checkSlot(target);
      }
    } else if (target?.$WebsKit) {
      if (inside.side.x === "LEFT") {
        if (inside.position.y <= targetHeightEdge(target, inside.side.y)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else if (inside.position.x <= targetWidthEdge(target, inside.side.x)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else {
          if ((target?.tagName === "BODY" || (target?.isContainer && !this.forcedParent)) && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (target.querySelectorAll("*").length > 0) {
              const closest = Utils.getClosestElement(target, this.x, this.y);
              if (closest.el && closest.el.$WebsKit) {
                target = closest.el;
                inside = Utils.calculatePosition({
                  target: target,
                  x: this.x,
                  y: this.y,
                });

                if (Utils.getDisplayFlow(target) === "block") {
                  this.AppState.Elements.dropAction.side = inside.side.y;
                } else {
                  this.AppState.Elements.dropAction.side = inside.side.x;
                }
              }
            } else {
              this.AppState.Elements.dropAction.side = "IN";
            }
          } else if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        }
      } else {
        if (inside.position.y <= targetHeightEdge(target, inside.side.y)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else if (inside.position.x <= targetWidthEdge(target, inside.side.x)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else {
          if ((target?.tagName === "BODY" || (target?.isContainer && !this.forcedParent)) && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (target.querySelectorAll("*").length > 0) {
              const closest = Utils.getClosestElement(target, this.x, this.y);
              if (closest.el && closest.el.$WebsKit) {
                target = closest.el;
                inside = Utils.calculatePosition({
                  target: target,
                  x: this.x,
                  y: this.y,
                });

                if (Utils.getDisplayFlow(target) === "block") {
                  this.AppState.Elements.dropAction.side = inside.side.y;
                } else {
                  this.AppState.Elements.dropAction.side = inside.side.x;
                }
              }
            } else {
              this.AppState.Elements.dropAction.side = "IN";
            }
          } else if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        }
      }
    }

    if (target?.tagName === "BODY") {
      if (target.querySelectorAll("*").length > 0) {
        const closest = Utils.getClosestElement(target, this.x, this.y);
        if (closest.el && closest.el.$WebsKit) {
          target = closest.el;
          inside = Utils.calculatePosition({
            target: target,
            x: this.x,
            y: this.y,
          });

          if (Utils.getDisplayFlow(target) === "block") {
            this.AppState.Elements.dropAction.side = inside.side.y;
          } else {
            this.AppState.Elements.dropAction.side = inside.side.x;
          }
        }
      } else {
        this.AppState.Elements.dropAction.side = "IN";
      }
    }

    this.AppState.Elements.dropAction.target = target;

    this.dropActionJSON.side = JSON.stringify(this.AppState.Elements.dropAction.side);
    this.dropActionJSON.el = target?.guid || 0;

    const info = {
      onHoverElement: originalTarget,
      element: this.AppState.Elements.dropAction.target?.tagName,
      guid: this.AppState.Elements.dropAction.target?.guid,
      side: this.AppState.Elements.dropAction.side,
    };

    this.AppState.Elements.onHoverElement = originalTarget;
    this.AppState.ToolTip.component = "TooltipElementInfo";
    this.AppState.ToolTip.logInfo = info;
  }

  controlMode(): void {
    let target = window.widgetFromPoint;
    const originalTarget = window.widgetFromPoint;
    let inside = Utils.calculatePosition({
      target: target,
      x: this.x,
      y: this.y,
    });

    this.AppState.Elements.dropAction = {
      target: target,
      element: this.mouseDownFromTree ? this.AppState.Elements.dropAction.element : this.dragElement,
    };

    const targetHeightEdge = (target: WKElement | null | undefined, side: string): number => {
      if (target && target.tagName !== "BODY") {
        const rects = Utils.getNaturalRects(target);
        const edgeByMargin = target?.nodeType === 3 ? 0 : side === "PRE" ? parseFloat(getComputedStyle(<Element>target).marginTop) : parseFloat(getComputedStyle(<Element>target).marginBottom);
        let edgeByPadding: number;
        if (target.children?.length > 0 || rects.height <= (target.nodeType === 3 ? 0 : parseFloat(getComputedStyle(target).paddingTop) + parseFloat(getComputedStyle(target).paddingBottom))) {
          edgeByPadding = target.nodeType === 3 ? 0 : side === "PRE" ? (parseFloat(getComputedStyle(target).paddingTop) / 100) * 50 : (parseFloat(getComputedStyle(target).paddingBottom) / 100) * 50;
        } else {
          edgeByPadding = target.nodeType === 3 ? 0 : side === "PRE" ? parseFloat(getComputedStyle(target).paddingTop) : parseFloat(getComputedStyle(target).paddingBottom);
        }
        const concatEdge = edgeByMargin + edgeByPadding;
        const edgeBySize = rects.width > rects.height ? (rects.height / 100) * 20 : (rects.width / 100) * 20;
        let result = concatEdge > 0 ? concatEdge : edgeBySize;
        result = result >= rects.height / 3 ? result / 3 : result;
        return result;
      } else {
        return 0;
      }
    };

    const targetWidthEdge = (target: WKElement | null | undefined, side: string) => {
      if (target && target.tagName !== "BODY") {
        const rects = Utils.getNaturalRects(target);
        const edgeByMargin = target?.nodeType === 3 ? 0 : side === "PRE" ? parseFloat(getComputedStyle(<Element>target).marginLeft) : parseFloat(getComputedStyle(<Element>target).marginRight);
        let edgeByPadding: number;
        if (target.children?.length > 0 || rects.width <= (target.nodeType === 3 ? 0 : parseFloat(getComputedStyle(target).paddingLeft) + parseFloat(getComputedStyle(target).paddingRight))) {
          edgeByPadding = target.nodeType === 3 ? 0 : side === "PRE" ? (parseFloat(getComputedStyle(target).paddingLeft) / 100) * 50 : (parseFloat(getComputedStyle(target).paddingRight) / 100) * 50;
        } else {
          edgeByPadding = target.nodeType === 3 ? 0 : side === "PRE" ? parseFloat(getComputedStyle(target).paddingLeft) : parseFloat(getComputedStyle(target).paddingRight);
        }
        const concatEdge = edgeByMargin + edgeByPadding;
        const edgeBySize = rects.width > rects.height ? (rects.height / 100) * 20 : (rects.width / 100) * 20;
        let result = concatEdge > 0 ? concatEdge : edgeBySize;
        result = result >= rects.width / 3 ? result / 3 : result;
        return result;
      } else {
        return 0;
      }
    };

    const nextParent = () => {
      if ((<WKElement>window.widgetFromPoint?.parentNode)?.tagName === "BODY") {
        this.forcedParent && this.forcedParent.removeAttribute("wk-disabled");
        this.forcedParentBlock = true;
        this.forcedParent = undefined;
        const DOMlist = this.workspaceBodyElement.querySelectorAll(`[wk-disabled]`);
        [].forEach.call(DOMlist, function (DOMel: WKElement) {
          DOMel.removeAttribute("wk-disabled");
        });
        setTimeout(() => {
          this.forcedParentBlock = false;
        }, 50);
      } else {
        if (!this.forcedParent) {
          this.forcedParent = window.widgetFromPoint;
        }
        window.widgetFromPoint?.setAttribute("wk-disabled", "true");
        if (window.widgetFromPoint?.parentNode && (<WKElement>window.widgetFromPoint.parentNode).isSlot) {
          (<WKElement>window.widgetFromPoint.parentNode).setAttribute("wk-disabled", "true");
        }

        [].forEach.call(window.document.elementsFromPoint(this.x, this.y), function (DOMel: WKElement) {
          if (DOMel.parentNode && (<WKElement>DOMel.parentNode).isGrid && !DOMel.isGridArea) {
            DOMel.setAttribute("wk-disabled", String(true));
          }
        });

        const DOMlist = window.document.querySelectorAll("wk-grid-area");
        [].forEach.call(DOMlist, function (DOMel: WKElement) {
          DOMel.setAttribute("wk-disabled", String(true));
        });
      }
    };

    if (this.lastX && this.lastY && (this.x > this.lastX + 10 || this.y > this.lastY + 10 || this.x < this.lastX - 10 || this.y < this.lastY - 10)) {
      // Clear nextParent event
      this.eventPool?.TAB && delete this.eventPool.TAB.nextParent;
      this.forcedParent = undefined;
      this.lastX = undefined;
      this.lastY = undefined;
      this.forcedParent = undefined;
      const DOMlist = this.workspaceBodyElement.querySelectorAll(`[wk-disabled]`);
      [].forEach.call(DOMlist, function (DOMel: WKElement) {
        DOMel.removeAttribute("wk-disabled");
      });
    }

    this.eventPool?.TAB && (this.eventPool.TAB.nextParent = nextParent.bind(this));

    // debugger

    if (target?.isComponent && !this.AppState.Elements.dropAction.element?.contains(target)) {
      if (inside.side.x === "LEFT") {
        if (inside.position.y <= targetHeightEdge(target, inside.side.y)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else if (inside.position.x <= targetWidthEdge(target, inside.side.x)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else {
          const slots = Array.from(target.querySelectorAll("*")).filter((node) => {
            const template = window.wkNodes[(node as WKElement).guid];
            if (template && template.parent) {
              return (node as WKElement).isComponent || (node as WKElement).isSlot || template.parent.tag === "template";
            } else {
              return (node as WKElement).isComponent || (node as WKElement).isSlot;
            }
          }) as WKElement[];
          if (slots.length > 0) {
            const closest = Utils.getClosestElementByChildren(slots, this.x, this.y);
            if (closest.el) {
              target = closest.el;
              if (target.bguid && !target.isComponent) {
                this.checkSlot(target);
              } else {
                inside = Utils.calculatePosition({
                  target: target,
                  x: this.x,
                  y: this.y,
                });

                if (Utils.getDisplayFlow(target) === "block") {
                  this.AppState.Elements.dropAction.side = inside.side.y;
                } else {
                  this.AppState.Elements.dropAction.side = inside.side.x;
                }
              }
            }
          }
        }
      } else {
        if (inside.position.y <= targetHeightEdge(target, inside.side.y)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else if (inside.position.x <= targetWidthEdge(target, inside.side.x)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else {
          const slots = Array.from(target.querySelectorAll("*")).filter((node) => {
            const template = window.wkNodes[(node as WKElement).guid];
            if (template && template.parent) {
              return (node as WKElement).isComponent || (node as WKElement).isSlot || template.parent.tag === "template";
            } else {
              return (node as WKElement).isComponent || (node as WKElement).isSlot;
            }
          }) as WKElement[];
          if (slots.length > 0) {
            const closest = Utils.getClosestElementByChildren(slots, this.x, this.y);
            if (closest.el) {
              target = closest.el;
              if (target.bguid && !target.isComponent) {
                this.checkSlot(target);
              } else {
                inside = Utils.calculatePosition({
                  target: target,
                  x: this.x,
                  y: this.y,
                });

                if (Utils.getDisplayFlow(target) === "block") {
                  this.AppState.Elements.dropAction.side = inside.side.y;
                } else {
                  this.AppState.Elements.dropAction.side = inside.side.x;
                }
              }
            }
          }
        }
      }
    } else if (target?.isSlot) {
      if (!this.forcedParent) {
        this.checkSlot(target);
      }
    } else if (target?.$WebsKit) {
      if (inside.side.x === "LEFT") {
        if (inside.position.y <= targetHeightEdge(target, inside.side.y)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else if (inside.position.x <= targetWidthEdge(target, inside.side.x)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else {
          if ((target?.tagName === "BODY" || (target?.isContainer && !this.forcedParent)) && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (target.querySelectorAll("*").length > 0) {
              const closest = Utils.getClosestElement(target, this.x, this.y);
              if (closest.el && closest.el.$WebsKit) {
                target = closest.el;
                inside = Utils.calculatePosition({
                  target: target,
                  x: this.x,
                  y: this.y,
                });

                if (Utils.getDisplayFlow(target) === "block") {
                  this.AppState.Elements.dropAction.side = inside.side.y;
                } else {
                  this.AppState.Elements.dropAction.side = inside.side.x;
                }
              }
            } else {
              this.AppState.Elements.dropAction.side = "IN";
            }
          } else if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        }
      } else {
        if (inside.position.y <= targetHeightEdge(target, inside.side.y)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else if (inside.position.x <= targetWidthEdge(target, inside.side.x)) {
          if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        } else {
          if ((target?.tagName === "BODY" || (target?.isContainer && !this.forcedParent)) && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (target.querySelectorAll("*").length > 0) {
              const closest = Utils.getClosestElement(target, this.x, this.y);
              if (closest.el && closest.el.$WebsKit) {
                target = closest.el;
                inside = Utils.calculatePosition({
                  target: target,
                  x: this.x,
                  y: this.y,
                });

                if (Utils.getDisplayFlow(target) === "block") {
                  this.AppState.Elements.dropAction.side = inside.side.y;
                } else {
                  this.AppState.Elements.dropAction.side = inside.side.x;
                }
              }
            } else {
              this.AppState.Elements.dropAction.side = "IN";
            }
          } else if (target && target !== this.AppState.Elements.dropAction.element && !this.AppState.Elements.dropAction.element?.contains(target)) {
            if (Utils.getDisplayFlow(target) === "block") {
              this.AppState.Elements.dropAction.side = inside.side.y;
            } else {
              this.AppState.Elements.dropAction.side = inside.side.x;
            }
          }
        }
      }
    }

    this.AppState.Elements.dropAction.target = target;

    this.dropActionJSON.side = JSON.stringify(this.AppState.Elements.dropAction.side);
    this.dropActionJSON.el = target?.guid || 0;

    const info = {
      onHoverElement: originalTarget,
      element: this.AppState.Elements.dropAction.target?.tagName,
      guid: this.AppState.Elements.dropAction.target?.guid,
      side: this.AppState.Elements.dropAction.side,
    };

    this.AppState.Elements.onHoverElement = originalTarget;
    this.AppState.ToolTip.component = "TooltipElementInfo";
    this.AppState.ToolTip.logInfo = info;
  }

  sendMessage(msg: { event: string; data: any }): void {
    window.parent.postMessage(msg, "*");
  }

  getClosestParent(element: WKElement): WKElement | undefined {
    if (!element) return undefined;
    while (<WKElement>element.parentNode) {
      element = <WKElement>element.parentNode;
      if ((<WKElement>element).$WebsKit) return <WKElement>element;
    }
    return document.body as WKElement;
  }

  getClosestComponent(element: WKElement): WKElement | undefined {
    if (!element) return undefined;
    while (<WKElement>element.parentNode) {
      element = <WKElement>element.parentNode;
      if ((<WKElement>element).isComponent) return <WKElement>element;
    }
    return document.body as WKElement;
  }

  elementFromPoint(elements: WKElement[] | Element[]): Element | WKElement | undefined {
    elements = elements.filter((node) => {
      return this.workspaceHTMLElement.contains(node);
    });

    return elements.find((element) => {
      if (element.nodeType === 1 && element.tagName !== "HTML") {
        const area = (element: Element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return {
            top: parseFloat(rect.top.toString()) - parseFloat(style.marginTop),
            right: parseFloat(rect.right.toString()) + parseFloat(style.marginRight),
            bottom: parseFloat(rect.bottom.toString()) + parseFloat(style.marginBottom),
            left: parseFloat(rect.left.toString()) - parseFloat(style.marginLeft),
          };
        };

        const edges = area(element);

        return this.x >= edges.left && this.x <= edges.right && this.y >= edges.top && this.y <= edges.bottom;
      } else {
        return false;
      }
    });
  }

  /**
   * Dispatch Observer
   */
  dispatchObserver(e: { clientX: number; clientY: number; target: WKElement }): WKElement | null | undefined {
    if (e.target.tagName === "HTML") {
      if (this.workspaceBodyElement) {
        e.target = this.workspaceBodyElement;
      }
    }

    this.element = [e.target];

    // console.log(document.elementsFromPoint(e.x, e.y))
    if (e.target.getAttribute("wk-disable-pointer-events")) {
      // e.target = document.elementFromPoint(e.x, e.y)
    }

    if (e.target) {
      if (e.target.children.length === 0) {
        this.final = null;
        window.widgetFromPoint = e.target;
      } else {
        const filter = Array.prototype.filter;
        let filtered = filter.call(e.target.children, (node) => {
          if (this.AppState.APP.mode.startsWith("EDIT")) {
            return node.tagName !== "WK-INSTANCE";
          } else {
            return !node.tagName.startsWith("WK-") && node.getAttribute("wk-disabled") !== "true" && !(node.getAttribute("wk-disabled-on-edit") === "true" && this.AppState.APP.mode === "EDIT");
          }
        });
        if (filtered.length === 0) {
          filtered = [e.target];
        }
        this.observer && this.observer.disconnect();
        [].forEach.call(filtered, (element) => this.observer && this.observer.observe(element));
      }
    } else {
      this.final = null;
      window.widgetFromPoint = e.target;
    }

    return window.widgetFromPoint;
  }

  getRects(element: WKElement): Rects {
    if (element.nodeType === 3) {
      const range: Range = Utils.selectElementContents(<WKElement>element.parentNode);
      const rects = range.getBoundingClientRect();
      return {
        top: rects.top,
        bottom: rects.bottom,
        left: rects.left,
        right: rects.right,
        topPlusMarginTop: rects.top,
        leftPlusMarginLeft: rects.left,
        originalTop: rects.top,
        originalLeft: rects.left,
        marginLeft: 0,
        marginTop: 0,
        originalWidth: rects.width,
        originalHeight: rects.height,
        width: rects.width,
        height: rects.height,
      };
    }

    const rects = element.getBoundingClientRect();

    return {
      bottom: 0,
      marginLeft: 0,
      marginTop: 0,
      right: 0,
      topPlusMarginTop: rects.top + parseFloat(getComputedStyle(element).marginTop),
      leftPlusMarginLeft: rects.left - parseFloat(getComputedStyle(element).marginLeft),
      originalTop: rects.top,
      originalLeft: rects.left,
      top: element.offsetTop - parseFloat(getComputedStyle(element).marginTop),
      left: element.offsetLeft - parseFloat(getComputedStyle(element).marginLeft),
      originalWidth: rects.width,
      originalHeight: rects.height,
      width: rects.width + (parseFloat(getComputedStyle(element).marginLeft) < 0 ? 0 : parseFloat(getComputedStyle(element).marginLeft)) + (parseFloat(getComputedStyle(element).marginRight) < 0 ? 0 : parseFloat(getComputedStyle(element).marginRight)),
      height: rects.height + (parseFloat(getComputedStyle(element).marginTop) < 0 ? 0 : parseFloat(getComputedStyle(element).marginTop)) + (parseFloat(getComputedStyle(element).marginBottom) < 0 ? 0 : parseFloat(getComputedStyle(element).marginBottom)),
    };
  }

  removePlaceholder(): void {
    this.$(".placeholder").css("transform:translate3d(-3000px, -3000px, 0)");
    this.$("webskit > [placeholder]").css("left: -3000px; top: -3000px;");
    // if (this.stripeRect && this.stripePadding && this.stripeMargin) {
    //   this.stripeRect.style.width = '0px'
    //   this.stripeRect.style.height = '0px'
    //   this.stripePadding.style.width = '0px'
    //   this.stripePadding.style.height = '0px'
    //   this.stripeMargin.style.width = '0px'
    //   this.stripeMargin.style.height = '0px'
    // }
  }

  $(s: string): DOM {
    return new DOM(s, this.webskitShadowRoot);
  }

  paintPlaceholder(): void {
    let target = this.AppState.Elements.dropAction.target;
    const rects = Utils.getNaturalRects(target);

    if (!target || target.parentNode === null) {
      target = this.workspaceBodyElement;
    }

    if (target && target.$WebsKit) {
      const width = target.nodeType === 3 || target.$WebsKit.type === "text" ? rects.width : Math.ceil(target.offsetWidth + parseFloat(getComputedStyle(target).marginLeft) + parseFloat(getComputedStyle(target).marginRight));
      const height = target.nodeType === 3 || target.$WebsKit.type === "text" ? rects.height : Math.ceil(target.offsetHeight + parseFloat(getComputedStyle(target).marginTop) + parseFloat(getComputedStyle(target).marginBottom));
      const top = this.getRects(target).originalTop - this.workspaceBodyElement.getBoundingClientRect().top - parseFloat(getComputedStyle(target).marginTop);
      const left = this.getRects(target).originalLeft - this.workspaceBodyElement.getBoundingClientRect().left - parseFloat(getComputedStyle(target).marginLeft);

      if (isNaN(width) || isNaN(height) || isNaN(top) || isNaN(left)) {
        this.removePlaceholder();
        return;
      }

      if (target.tagName === "BODY" && (this.AppState.Elements.dropAction.side === "PRE" || this.AppState.Elements.dropAction.side === "POST")) {
        this.removePlaceholder();
        return;
      }

      if (Utils.getDisplayFlow(target) === "block") {
        if (this.AppState.Elements.dropAction.side === "LEFT") {
          this.AppState.Elements.dropAction.side = "PRE";
        }
        if (this.AppState.Elements.dropAction.side === "RIGHT") {
          this.AppState.Elements.dropAction.side = "POST";
        }
      } else {
        if (this.AppState.Elements.dropAction.side === "PRE") {
          this.AppState.Elements.dropAction.side = "LEFT";
        }
        if (this.AppState.Elements.dropAction.side === "POST") {
          this.AppState.Elements.dropAction.side = "RIGHT";
        }
      }

      this.$("[placeholder-wrapper]").css("display:none");

      switch (this.AppState.Elements.dropAction.side) {
        case "PRE":
          this.$('[placeholder-wrapper="top"]').css("display:flex");
          this.$(".placeholder").css(`transform:translate3d(${left - this.workspaceBodyElement.scrollLeft}px, ${top - this.workspaceBodyElement.scrollTop}px, 0)`);
          this.$(".placeholder").css("height:1px");
          this.$(".placeholder").css(`width:${width}px`);
          this.$(".placeholder wk-tool").css("display:block");
          this.$("#selector-svg-placeholder-width").attr("viewBox", "0 0 0 0");
          this.$(".path-placeholder-width").attr("d", `M0 0 H ${width}`);
          this.$(".path2-placeholder-width").attr("d", `M0 0 H ${width}`);
          this.$(".wk-arrow-container-x").css("display:block");
          this.$("[data-wk-placeholder-arrow=block]").css("opacity:1");
          this.$("[data-wk-placeholder-arrow=inline]").css("display:none");
          this.$("[data-wk-placeholder-arrow=block]").css("display:none");
          this.$(".wk-arrow.wk-up").css("display:none");
          this.$(".wk-arrow.wk-down").css("display:block");
          this.$(".wk-arrow.wk-right").css("display:none");
          this.$(".wk-arrow.wk-left").css("display:none");
          this.$(".dash-move-opposite").attr("x1", "0%");
          this.$(".dash-move-opposite").attr("y1", "0%");
          this.$(".dash-move-opposite").attr("x2", "100%");
          this.$(".dash-move-opposite").attr("y2", "0%");
          break;
        case "LEFT":
          this.$('[placeholder-wrapper="left"]').css("display:flex");
          this.$(".placeholder").css(`transform:translate3d(${left - this.workspaceBodyElement.scrollLeft}px, ${top - this.workspaceBodyElement.scrollTop}px, 0)`);
          this.$(".placeholder").css(`height:${height}px`);
          this.$(".placeholder").css("width:1px");
          this.$(".placeholder wk-tool").css("display:block");
          this.$("#selector-svg-placeholder-height").attr("viewBox", "0 0 0 0");
          this.$(".path-placeholder-height").attr("d", "M0 0 H 5 V 0 H 0 L 0 0");
          this.$(".path2-placeholder-height").attr("d", "M0 0 H 5 V 0 H 0 L 0 0");
          this.$(".wk-arrow-container-y").css("display:flex");
          this.$("[data-wk-placeholder-arrow=inline]").css("opacity:1");
          this.$("[data-wk-placeholder-arrow=inline]").css("display:none");
          this.$("[data-wk-placeholder-arrow=block]").css("display:none");
          this.$(".wk-arrow.wk-up").css("display:none");
          this.$(".wk-arrow.wk-down").css("display:none");
          this.$(".wk-arrow.wk-right").css("display:none");
          this.$(".wk-arrow.wk-left").css("display:block");
          this.$(".dash-move-opposite").attr("x1", "0%");
          this.$(".dash-move-opposite").attr("y1", "0%");
          this.$(".dash-move-opposite").attr("x2", "0%");
          this.$(".dash-move-opposite").attr("y2", "100%");
          break;
        case "IN":
          this.$('[placeholder-wrapper="center"]').css("display:flex");
          this.$("#selector-svg-placeholder").attr("viewBox", "0 0 " + 0 + " " + 0);
          this.$(".path-placeholder").attr("d", "M0 0 H " + 0 + " V " + 0 + " H 0 L 0 0");
          this.$(".path2-placeholder").attr("d", "M0 0 H " + 0 + " V " + 0 + " H 0 L 0 0");
          this.$("#selector-svg-placeholder-width").attr("viewBox", "0 0 " + 0 + " " + 0);
          this.$(".path-placeholder-width").attr("d", "M0 0 H " + 0);
          this.$(".path2-placeholder-width").attr("d", "M0 0 H " + 0);
          this.$("#selector-svg-placeholder-height").attr("viewBox", "0 0 " + 0 + " " + 0);
          this.$(".path-placeholder-height").attr("d", "M0 0 H 1 V " + 0 + " H 0 L 0 0");
          this.$(".path2-placeholder-height").attr("d", "M0 0 H 2 V " + 0 + " H 0 L 0 0");
          this.$(".wk-arrow-container-x, .wk-arrow-container-y").css("display:none");
          this.$("[data-wk-placeholder-arrow]").css("display:none");
          this.$(".placeholder").css(`transform:translate3d(${left - this.workspaceBodyElement.scrollLeft}px, ${top - this.workspaceBodyElement.scrollTop}px, 0)`);
          this.$(".placeholder").css(`height:${height}px`);
          this.$(".placeholder").css(`width:${width}px`);
          this.$("#selector-svg-placeholder").attr("viewBox", "0 0 " + this.getRects(target).width + " " + this.getRects(target).height);
          this.$(".path-placeholder").attr("d", "M0 0 H " + this.getRects(target).width + " V " + this.getRects(target).height + " H 0 L 0 0");
          this.$(".path2-placeholder").attr("d", "M0 0 H " + this.getRects(target).width + " V " + this.getRects(target).height + " H 0 L 0 0");
          this.$(".placeholder wk-tool").hide();
          this.$("[data-wk-placeholder-arrow=inline]").css("display:none");
          this.$("[data-wk-placeholder-arrow=block]").css("display:none");
          this.$(".wk-arrow.wk-up").hide();
          this.$(".wk-arrow.wk-down").hide();
          this.$(".wk-arrow.wk-right").hide();
          this.$(".wk-arrow.wk-left").hide();
          break;
        case "POST":
          this.$('[placeholder-wrapper="bottom"]').css("display:flex");
          this.$(".placeholder").css(`transform:translate3d(${left - this.workspaceBodyElement.scrollLeft}px, ${top - this.workspaceBodyElement.scrollTop + height}px, 0)`);
          this.$(".placeholder").css("height:1px");
          this.$(".placeholder").css(`width:${width}px`);
          this.$(".placeholder wk-tool").css("display:block");
          this.$("#selector-svg-placeholder-width").attr("viewBox", "0 0 0 0");
          this.$(".path-placeholder-width").attr("d", "M0 0 H 0");
          this.$(".path2-placeholder-width").attr("d", "M0 0 H 0");
          this.$(".wk-arrow-container-x").css("display:block");
          this.$("[data-wk-placeholder-arrow=block]").css("opacity:1");
          this.$("[data-wk-placeholder-arrow=inline]").css("display:none");
          this.$("[data-wk-placeholder-arrow=block]").css("display:none");
          this.$(".wk-arrow.wk-up").css("display:block");
          this.$(".wk-arrow.wk-down").css("display:none");
          this.$(".wk-arrow.wk-right").css("display:none");
          this.$(".wk-arrow.wk-left").css("display:none");
          this.$(".dash-move-opposite").attr("x1", "0%");
          this.$(".dash-move-opposite").attr("y1", "0%");
          this.$(".dash-move-opposite").attr("x2", "100%");
          this.$(".dash-move-opposite").attr("y2", "0%");
          break;
        case "RIGHT":
          this.$('[placeholder-wrapper="right"]').css("display:flex");
          this.$(".placeholder").css(`transform:translate3d(${left - this.workspaceBodyElement.scrollLeft + width}px, ${top - this.workspaceBodyElement.scrollTop}px, 0)`);
          this.$(".placeholder").css(`height:${height}px`);
          this.$(".placeholder").css("width:1px");
          this.$(".placeholder wk-tool").css("display:block");
          this.$("#selector-svg-placeholder-height").attr("viewBox", "0 0 0 0");
          this.$(".path-placeholder-height").attr("d", "M0 0 H 5 V 0 H 0 L 0 0");
          this.$(".path2-placeholder-height").attr("d", "M0 0 H 5 V 0 H 0 L 0 0");
          this.$(".wk-arrow-container-y").css("display:flex");
          this.$("[data-wk-placeholder-arrow=inline]").css("opacity:1");
          this.$("[data-wk-placeholder-arrow=inline]").css("display:none");
          this.$("[data-wk-placeholder-arrow=block]").css("display:none");
          this.$(".wk-arrow.wk-up").css("display:none");
          this.$(".wk-arrow.wk-down").css("display:none");
          this.$(".wk-arrow.wk-right").css("display:block");
          this.$(".wk-arrow.wk-left").css("display:none");
          this.$(".dash-move-opposite").attr("x1", "100%");
          this.$(".dash-move-opposite").attr("y1", "0%");
          this.$(".dash-move-opposite").attr("x2", "100%");
          this.$(".dash-move-opposite").attr("y2", "100%");
          break;
      }

      // me.$("#placeholder").hide();
      this.$("[placeholder] svg").attr("viewBox", `0 0 ${this.getRects(target).width} ${this.getRects(target).height}`);
      this.$("wk-tool[placeholder] svg").css(`height:${this.getRects(target).height}px`);
      this.$("wk-tool[placeholder] svg").css(`width:${this.getRects(target).width}px`);

      // Placeholder
      if (this.placeholder) {
        this.placeholder.style.left = `${left}px`;
        this.placeholder.style.top = `${top}px`;
        this.placeholder.style.width = `${width}px`;
        this.placeholder.style.height = `${height}px`;
      }

      this.$('[placeholder="top-arrow"]').css("display:flex");
      this.$('[placeholder="bottom-arrow"]').css("display:flex");
      this.$('[placeholder="left-arrow"]').css("display:flex");
      this.$('[placeholder="right-arrow"]').css("display:flex");

      if (this.getRects(target).height <= 30) {
        this.$('[placeholder="top-arrow"]').css("display:none");
        this.$('[placeholder="bottom-arrow"]').css("display:none");
      }

      if (this.getRects(target).width <= 30) {
        this.$('[placeholder="left-arrow"]').css("display:none");
        this.$('[placeholder="arrow-arrow"]').css("display:none");
      }

      // this.setStripe(target)
      // this.setPointerSelector(window.widgetFromPoint)
    }
  }

  replacer(name: string, val: unknown) {
    if (name === "DOMElement" || name === "parent") {
      return undefined;
    } else {
      return val;
    }
  }

  async loadComponent(name: string) {
    window.wkNodes = {};
    window.wkTemplates = {};
    window.vnodes = {};
    this.AppState.rootReady = false;
    this.AppState.currentComponent = name;
    // DefaultsRegistrator.registerAllDefaults()
    // await ComponentRegistrator.registerAll()
    this.UndoManager.clear();

    function replacer(name: string, val: unknown) {
      if (name === "DOMElement" || name === "parent") {
        return undefined;
      } else {
        return val;
      }
    }

    await nextTick(async () => {
      await NodeUtils.flatNodes();
      this.sendMessage({
        event: "TREE_NODES",
        data: {
          $Nodes: JSON.parse(JSON.stringify(this.AppState.ComponentsDefinition[this.AppState.currentComponent].template, replacer)),
        },
      });
      window.wkNodes[this.AppState.ComponentsDefinition[this.AppState.currentComponent].template.guid].DOMElement = document.body as WKElement;
    });
  }
}
