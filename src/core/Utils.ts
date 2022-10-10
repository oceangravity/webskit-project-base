import { nanoid } from "nanoid";
import { toRaw } from "vue";

const Utils: UtilsInterface = {
  x: 0,
  y: 0,
  elementFromPoint: null,
  props: {},
  webskitBody: undefined,
  webskitShadowRoot: undefined,
  workspaceElement: null,
  placeholder: undefined,
  workspaceBodyElement: undefined,
  EMPTY_TAGS: [],
  EMPTY_TAG_CONFIG: undefined,

  init() {
    this.x = 0;
    this.y = 0;
    this.elementFromPoint = null;
    this.props = {};
    this.webskitBody = document.body as WKElement;
    this.webskitShadowRoot = document?.querySelector(".wk-workspace")?.shadowRoot?.querySelector("wk-instance")?.shadowRoot;
    this.workspaceElement = document.querySelector(".wk-workspace");
    this.placeholder = this.webskitShadowRoot?.querySelector("webskit > wk-tool");
    this.workspaceBodyElement = document.body as WKElement;
    this.EMPTY_TAGS = ["span", "p", "ul", "li"];
    this.EMPTY_TAG_CONFIG = {
      span: {
        tag: "span",
        content: "Empty SPAN",
      },
      p: {
        tag: "p",
        content: "Empty Paragraph",
      },
      div: {
        tag: "div",
      },
    };
  },

  CreateGUID(size = 5, complex = false): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    if (complex) {
      return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    } else {
      return nanoid(size);
    }
  },

  sleep(milliseconds: number | 0): Promise<never> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  },

  getElementsInFragment(obj: Children): string[] {
    let elements: string[] = [];
    obj.children?.map((element) => (elements = [...elements, ...this.getElementsInFragment(element)]));
    return [String(obj.guid), ...elements];
  },

  round(num: number): number {
    num = num * 1000;
    const numString: string = num.toString();
    const numArray: string[] = numString.split(".");
    num = parseInt(numArray[0]);
    num = num / 1000;
    return num;
  },

  checkEmpty(obj: Children): void {
    if (obj.type && this.EMPTY_TAG_CONFIG && this.EMPTY_TAGS.includes(<string>obj.type)) {
      const config = this.EMPTY_TAG_CONFIG[<string>obj.type];
      if (obj.children?.length === 0) {
        if (!obj.props) obj.props = {};
        obj.props["tag"] = config.tag;
        config.content && (obj.content = config.content);
        obj.type = "wk-empty";
      } else {
        if (obj.props && "empty" in obj.props) {
          delete obj.props.tag;
          delete obj.content;
          obj.type = config.tag;
        }
      }
    }
    if (obj.type === "wk-empty") {
      if (obj.children?.length && obj.props && obj.props.tag) {
        obj.type = String(obj.props.tag);
        delete obj.content;
        delete obj.props.tag;
      }
    }
  },

  ObjToTemplate(obj: Children, root: Children): string {
    !obj.props && (obj.props = {});
    this.checkEmpty(obj);
    obj.props[":key"] = `'${obj.guid}'`;
    obj.props["v-r"] = `{ guid: '${obj.guid}', me: this }`;

    if (!root) root = obj;

    const children = obj.content
      ? obj.content
      : obj.children
          ?.map((node: Children) => {
            node.root = toRaw(root);
            node.parent = toRaw(obj);
            return node.type === "Component" ? `<Render :key="'${node.guid}'" :guid="'${node.guid}'"/>` : this.ObjToTemplate(node, root);
          })
          .join("") || "";
    const props = obj.props ? obj.props : {};
    const tag = obj.tag;
    return `<${tag}${
      Object.keys(props).length
        ? " " +
          Object.keys(props)
            .map((key) => `${key}="${props[key]}"`)
            .join(" ")
        : ""
    }>${children}
    </${tag}>`;
  },

  ChildrenToTemplate(obj: Children, root: Children): string {
    !obj.props && (obj.props = {});
    this.checkEmpty(obj);
    obj.props[":key"] = `'${obj.guid}'`;
    obj.props["v-r"] = `{ guid: '${obj.guid}', me: this }`;

    if (!root) root = obj;

    return obj.content
      ? obj.content
      : obj.children
          ?.map((node: Children) => {
            node.root = toRaw(root);
            node.parent = toRaw(obj);
            return node.type === "Component" ? `<Render :key="'${node.guid}'" :guid="'${node.guid}'"/>` : this.ObjToTemplate(node, root);
          })
          .join("") || "";
  },

  isOutOfViewport(elem: WKElement | undefined): OutOfViewportResult {
    const out: OutOfViewportResult = {};

    if (elem) {
      // Get element's bounding
      const bounding = elem.getBoundingClientRect();

      // Check if it's out of the viewport on each side
      out.top = bounding.top < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;
      out.all = out.top && out.left && out.bottom && out.right;
    } else {
      out.top = false;
      out.left = false;
      out.bottom = false;
      out.right = false;
      out.any = out.top || out.left || out.bottom || out.right;
      out.all = out.top && out.left && out.bottom && out.right;
    }

    return out;
  },

  getComputedTranslateXY(obj: Element): [] | undefined | number | number[] {
    const transArr = [];
    if (!window.getComputedStyle) return;
    const style = getComputedStyle(obj);

    const transform = style.transform;
    let mat = transform.match(/^matrix3d\((.+)\)$/);
    if (mat) return parseFloat(mat[1].split(", ")[13]);
    mat = transform.match(/^matrix\((.+)\)$/);
    mat ? transArr.push(parseFloat(mat[1].split(", ")[4])) : transArr.push(0);
    mat ? transArr.push(parseFloat(mat[1].split(", ")[5])) : transArr.push(0);
    return transArr;
  },

  turnOnPointerEvents(): void {
    this.webskitBody && this.webskitBody.classList.remove("wk-pointer-events-off");
  },

  turnOffPointerEvents(): void {
    this.webskitBody && this.webskitBody.classList.add("wk-pointer-events-off");
  },

  getAbsoluteWidth(el: WKElement): number {
    const styles = getComputedStyle(el);
    const margin = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
    return Math.ceil(el.offsetWidth + margin);
  },

  getAbsoluteHeight(el: WKElement): number {
    const styles = getComputedStyle(el);
    const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
    return Math.ceil(el.offsetHeight + margin);
  },

  whichSideEnterInternal(elem: WKElement | null | undefined, mouseX: number, mouseY: number): { x: string; y: string } {
    if (!elem) elem = this.workspaceBodyElement;
    const pair: { x: string; y: string } = { x: "LEFT", y: "PRE" };

    if (elem) {
      const styles:
        | {
            marginLeft: number;
            marginRight: number;
            marginTop: number;
            marginBottom: number;
          }
        | CSSStyleDeclaration = elem.nodeType === 3 ? { marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 } : getComputedStyle(elem);
      const marginLeft = parseFloat(<string>styles.marginLeft);
      const marginRight = parseFloat(<string>styles.marginRight);
      const marginTop = parseFloat(<string>styles.marginTop);
      const marginBottom = parseFloat(<string>styles.marginBottom);

      const rects = this.getEdgeRects(elem);
      const width = rects.width + marginLeft + marginRight;
      const height = rects.height + marginTop + marginBottom;
      const left = rects.left - marginLeft;
      const top = rects.top - marginTop;

      if (mouseX <= left + width / 2) {
        pair.x = "LEFT";
      } else {
        pair.x = "RIGHT";
      }

      if (mouseY <= top + height / 2) {
        pair.y = "PRE";
      } else {
        pair.y = "POST";
      }
    }

    return pair;
  },

  whichSideEnterInternalClosest(elem: WKElement, mouseX: number, mouseY: number): string {
    const pair: { x: string; y: string } = { x: "LEFT", y: "PRE" };
    const styles = getComputedStyle(elem);
    const marginTop = parseFloat(styles.marginTop);
    const marginLeft = parseFloat(styles.marginLeft);
    let side: string;

    if (mouseX <= elem.getBoundingClientRect().left - marginLeft + this.getAbsoluteWidth(elem) / 2) {
      pair.x = "LEFT";
    } else {
      pair.x = "RIGHT";
    }
    if (mouseY <= elem.getBoundingClientRect().top - marginTop + this.getAbsoluteHeight(elem) / 2) {
      pair.y = "PRE";
    } else {
      pair.y = "POST";
    }

    const distanceX = mouseX - elem.getBoundingClientRect().left + this.getAbsoluteWidth(elem);
    const distanceY = mouseY - elem.getBoundingClientRect().top + this.getAbsoluteHeight(elem);

    if (distanceX > distanceY) {
      side = pair.x;
    } else {
      side = pair.y;
    }

    return side;
  },

  getClosestElementByChildren(children: WKElement[], x: number, y: number): { el: null | WKElement; distance: null | number } {
    const distances: { el: WKElement; distance: number }[] = [];
    const distance = (element: WKElement, x: number, y: number) => {
      if (document.body) {
        const styles = getComputedStyle(element);
        const mX = x;
        const mY = y;
        const from = { x: mX, y: mY };
        const offset = element.getBoundingClientRect();
        const nx1 = offset.left - parseFloat(styles.marginLeft) - document.body.scrollLeft;
        const ny1 = offset.top - parseFloat(styles.marginTop) - document.body.scrollTop;
        const nx2 = nx1 + this.getAbsoluteWidth(element);
        const ny2 = ny1 + this.getAbsoluteHeight(element);
        const maxX1 = Math.max(mX, nx1);
        const minX2 = Math.min(mX, nx2);
        const maxY1 = Math.max(mY, ny1);
        const minY2 = Math.min(mY, ny2);
        const intersectX = minX2 >= maxX1;
        const intersectY = minY2 >= maxY1;
        const to = {
          x: intersectX ? mX : nx2 < mX ? nx2 : nx1,
          y: intersectY ? mY : ny2 < mY ? ny2 : ny1,
        };
        const distX = to.x - from.x;
        const distY = to.y - from.y;
        return Math.sqrt(distX * distX + distY * distY);
      } else {
        return 0;
      }
    };

    [].forEach.call(children, (el: WKElement) => {
      if (!el.tagName.match(/^WK-/)) {
        distances.push({ el: el, distance: distance(el, x, y) });
      }
    });

    return distances.length ? distances.reduce((prev, curr) => (prev.distance < curr.distance ? prev : curr)) : { el: null, distance: null };
  },

  getClosestElement(target: WKElement, x: number, y: number): { el: null | WKElement; distance: null | number } {
    const distances: { el: WKElement; distance: number }[] = [];
    const distance = (element: WKElement, x: number, y: number) => {
      if (document.body) {
        const styles = getComputedStyle(element);
        const mX = x;
        const mY = y;
        const from = { x: mX, y: mY };
        const offset = element.getBoundingClientRect();
        const nx1 = offset.left - parseFloat(styles.marginLeft) - document.body.scrollLeft;
        const ny1 = offset.top - parseFloat(styles.marginTop) - document.body.scrollTop;
        const nx2 = nx1 + this.getAbsoluteWidth(element);
        const ny2 = ny1 + this.getAbsoluteHeight(element);
        const maxX1 = Math.max(mX, nx1);
        const minX2 = Math.min(mX, nx2);
        const maxY1 = Math.max(mY, ny1);
        const minY2 = Math.min(mY, ny2);
        const intersectX = minX2 >= maxX1;
        const intersectY = minY2 >= maxY1;
        const to = {
          x: intersectX ? mX : nx2 < mX ? nx2 : nx1,
          y: intersectY ? mY : ny2 < mY ? ny2 : ny1,
        };
        const distX = to.x - from.x;
        const distY = to.y - from.y;
        return Math.sqrt(distX * distX + distY * distY);
      } else {
        return 0;
      }
    };

    [].forEach.call(target.children, (el: WKElement) => {
      if (!el.tagName.match(/^WK-/)) {
        distances.push({ el: el, distance: distance(el, x, y) });
      }
    });

    return distances.length ? distances.reduce((prev, curr) => (prev.distance < curr.distance ? prev : curr)) : { el: null, distance: null };
  },

  isLastChild(el: WKElement): boolean {
    return el.parentNode?.lastChild === el;
  },

  selectElementContents(el: Node & ParentNode): Range {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel: Selection | null = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    return range;
  },

  getEdgeRects(target: WKElement): EdgeRects {
    if (target?.parentNode && target.nodeType === 3) {
      const range: Range = this.selectElementContents(target.parentNode);
      const rects = range.getBoundingClientRect();

      return {
        top: rects.top,
        bottom: rects.bottom,
        left: rects.left,
        right: rects.right,
        marginLeft: 0,
        marginTop: 0,
        width: rects.width,
        height: rects.height,
      };
    }

    return {
      top: target.getBoundingClientRect().top,
      bottom: target.getBoundingClientRect().bottom,
      left: target.getBoundingClientRect().left,
      right: target.getBoundingClientRect().right,
      marginLeft: parseFloat(getComputedStyle(target).marginLeft),
      marginTop: parseFloat(getComputedStyle(target).marginTop),
      width: target.getBoundingClientRect().width + parseFloat(getComputedStyle(target).marginLeft) + parseFloat(getComputedStyle(target).marginRight),
      height: target.getBoundingClientRect().height + parseFloat(getComputedStyle(target).marginTop) + parseFloat(getComputedStyle(target).marginBottom),
    };
  },

  getNaturalRects(target: WKElement): EdgeRects {
    if (!target) {
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        marginLeft: 0,
        marginTop: 0,
        width: 0,
        height: 0,
      };
    }

    if (target?.parentNode && target.nodeType === 3) {
      return {
        top: target.getBoundingClientRect().top,
        bottom: target.getBoundingClientRect().bottom,
        left: target.getBoundingClientRect().left,
        right: target.getBoundingClientRect().right,
        marginLeft: 0,
        marginTop: 0,
        width: target.getBoundingClientRect().width,
        height: target.getBoundingClientRect().height,
      };
    }

    return {
      top: target.getBoundingClientRect().top,
      bottom: target.getBoundingClientRect().bottom,
      left: target.getBoundingClientRect().left,
      right: target.getBoundingClientRect().right,
      marginLeft: parseFloat(getComputedStyle(target).marginLeft),
      marginTop: parseFloat(getComputedStyle(target).marginTop),
      width: target.getBoundingClientRect().width,
      height: target.getBoundingClientRect().height,
    };
  },

  calculateDistance(elem: WKElement, mouseX: number, mouseY: number): { x: number; y: number } {
    if (!elem) elem = document.body as WKElement;
    const edgeRects = this.getEdgeRects(elem);
    return {
      x: Math.abs(Math.sqrt((mouseX - (edgeRects.left - edgeRects.marginLeft + edgeRects.width / 2)) ** 2) - edgeRects.width / 2),
      y: Math.abs(Math.sqrt((mouseY - (edgeRects.top - edgeRects.marginTop + edgeRects.height / 2)) ** 2) - edgeRects.height / 2),
    };
  },

  calculatePosition(e: { target: WKElement; x: number; y: number }): {
    side: { x: string; y: string };
    position: { x: number; y: number };
  } {
    const position = this.calculateDistance(e.target, e.x, e.y);
    const side = this.whichSideEnterInternal(e.target, e.x, e.y);
    return { side, position };
  },

  trackMouseInfo(): void {
    const handle = (e: { clientX: number; clientY: number }) => {
      this.x = e.clientX;
      this.y = e.clientY;
      this.elementFromPoint = window.elementFromPoint(this.x, this.y);
    };
    window.addEventListener("mousemove", handle);
  },

  getDisplayFlow(element: WKElement | null | undefined): string {
    if (!element || element.tagName === "BODY" || element.tagName === "HTML" || element.nodeType === 3 || !element.parentNode) {
      return "block";
    }

    const cStyle = element.currentStyle || window.getComputedStyle(element, "");
    let display = cStyle.display;
    if (element.parentNode.nodeType === 1 && window.getComputedStyle(<Element>element.parentNode, "").display === "flex") {
      if (window.getComputedStyle(<Element>element.parentNode, "").flexDirection === "row") {
        display = "inline";
      } else {
        display = "block";
      }
    } else if (window.getComputedStyle(element, "").display === "flex") {
      display = "block";
    } else if (window.getComputedStyle(element, "").float === "left") {
      display = "inline";
    }

    return display;
  },
};

export default Utils;
