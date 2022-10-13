import { ComponentInternalInstance } from "vue";

declare global {
  interface Window {
    UndoCache: Record<string, unknown>;
    Core: Core;
    APP: APP;
    wkNodes: { [p: string]: WKComponentTemplateNode };
    vNodesCache: { [p: string]: VNode };
    vnodes: Record<string, unknown>;
    tnode: Record<string, string>;
    cnode: Record<string, any>;
    wkTemplates: Record<string, string>;
    Components: any;
    loadComponent: any;
    rootNodes: any;
    UPDATE_VBLOCK: Ref<string>;
    CSSUtils: never;
    rootHash: Ref<string>;
    wkElementsInFragment: Record<string, string[]>;
    lastDropAction: Record<string, unknown>;
    widgetFromPoint: WKElement | null | undefined;

    elementFromPoint(x: number, y: number): Element | null;

    lastCmp: [];
  }

  /**
   * Size of star
   */
  interface StarTypes {
    Big: "Big";
    Small: "Small";
  }

  /**
   *  Input Range Data
   */
  interface RangeData {
    topLabel?: string;
    bottomLabel: string;
  }

  interface ObjTemplate {
    guid: string;
    props: Record<string, unknown>;
    parent?: never | ObjRoot | ObjParent;
    root?: ObjRoot;
    body?: never;
    content?: string;
    children: [];
    type: string | unknown;
  }

  interface ObjRoot {
    children: never[];
    guid: never;
  }

  interface ObjParent {
    guid: string;
  }

  interface OutOfViewportResult {
    top?: boolean;
    left?: boolean;
    bottom?: boolean;
    right?: boolean;
    any?: boolean;
    all?: boolean;
  }

  interface EdgeRects {
    top: number;
    bottom: number;
    left: number;
    right: number;
    marginLeft: number;
    marginTop: number;
    width: number;
    height: number;
  }

  interface ParentNode {
    $wk: Children;
    isGrid?: boolean;
    isGridArea?: boolean;
  }

  interface CSSCache {
    [p: string]: StyleNodeItem;
  }

  interface WKElement extends HTMLElement {
    currentSelector?: string;
    currentStyle: CSSStyleDeclaration | null;
    guid: string;
    bguid: string;
    nodeId?: string;
    elementId?: string;
    ownerElement?: WKElement;
    SELECTOR_POOL: CSSRule[];
    isComponent?: boolean;
    isContainer: boolean | undefined;
    isSlot: boolean | undefined;
    $wk: Children;
    syncsheet?: CSSStyleSheet;
    oldCSSCache?: CSSCache;
    CSSCache?: CSSCache;
    CCSCacheBySelector?: (selector: string) => CSSCache;
    oldCSSClasses?: string;
    CSSClasses?: string;
    CSSCacheID?: string;
    defaultSelector?: string;
    "data-wk-default-selector"?: string;
    WEBSKIT: Record<string, unknown>;

    elementsFromPoint(x: number, y: number): Element[];

    isGrid?: boolean;
    isGridArea?: boolean;
    keepAlive?: boolean;
  }

  interface CSSRestorePoint {
    media: string;
    selector: string;
    cssText: string;
    sheetString: string;
    property: string;
    value: string;
  }

  interface CSSStyleSheet extends StyleSheet {
    replaceSync?(reset_style: string): void;

    readonly cssRules: CSSRuleList;
  }

  interface ShadowRoot {
    adoptedStyleSheets?: CSSStyleSheet[];
    currentStyle?: CSSStyleDeclaration | null;
    guid?: string;
    SELECTOR_POOL?: CSSRule[];
    isContainer?: boolean | undefined;
    isSlot?: boolean | undefined;
    $wk?;
    syncsheet?: CSSStyleSheet;
    oldCSSCache?: { [p: string]: never };
    CSSCache?: { [p: string]: never };
    oldCSSClasses?: "";
    CSSClasses?: "";
    CSSCacheID?: "";
  }

  interface StyleNodeItem {
    property: string;
    value: string;
    parsed: ParsedUnit;
    important: boolean;
    selector: string;
    mediaQuery: string;
    specificity: number;
    index?: number;
    available?: boolean;
  }

  interface LegacyProperties {
    [p: string]: { property: string; value: string; available?: boolean };
  }

  interface CurrentCSSRule extends CSSRule {
    index?: number;
    properties?: StyleNode;
    legacyProperties?: LegacyProperties;
    specificity?: number;
    selectorText?: string;
    style?: CSSStyleDeclaration;
  }

  interface StyleNode {
    [k: string]: StyleNodeItem;
  }

  interface StyleNodeImportant {
    [k: string]: StyleNodeItem;
  }

  interface UtilsInterface {
    x: number;
    y: number;
    elementFromPoint: Element | null;
    props: Record<string, unknown> | undefined;
    webskitBody: WKElement | undefined | null;
    webskitShadowRoot: ShadowRoot | null | undefined;
    workspaceElement: Element | null;
    placeholder: Element | undefined | null;
    workspaceBodyElement: WKElement | undefined | null;
    EMPTY_TAGS: string[];
    EMPTY_TAG_CONFIG: { [k: string]: { tag: string; content?: string } } | undefined;
    init: () => void;

    CreateGUID(size: number = 5, complex: boolean = false): string;

    sleep(milliseconds: number | 0): Promise<never>;

    getElementsInFragment(obj: Children): string[];

    round(num: number): number;

    checkEmpty(obj: Children): void;

    ObjToTemplate(obj: Children, root?: Children): string;

    ChildrenToTemplate(obj: Children, root?: Children): string;

    isOutOfViewport(elem: WKElement | undefined): OutOfViewportResult;

    getComputedTranslateXY(obj: Element): [] | undefined | number | number[];

    turnOnPointerEvents(): void;

    turnOffPointerEvents(): void;

    getAbsoluteWidth(el: WKElement | null | undefined): number;

    getAbsoluteHeight(el: WKElement | null | undefined): number;

    whichSideEnterInternal(elem: WKElement | null | undefined, mouseX: number, mouseY: number): { x: string; y: string };

    whichSideEnterInternalClosest(elem: WKElement | null | undefined, mouseX: number, mouseY: number): string;

    getClosestElementByChildren(children: WKElement[], x: number, y: number): { el: null | WKElement; distance: null | number };

    getClosestElement(target: WKElement | null | undefined, x: number, y: number): { el: null | WKElement; distance: null | number };

    isLastChild(el: WKElement | null | undefined): boolean;

    selectElementContents(el: Node & ParentNode): Range;

    getEdgeRects(target: WKElement | null | undefined): EdgeRects;

    getNaturalRects(target: WKElement | null | undefined): EdgeRects;

    calculateDistance(elem: WKElement | null | undefined, mouseX: number, mouseY: number): { x: number; y: number };

    calculatePosition(e: { target: WKElement | null | undefined; x: number; y: number }): { side: { x: string; y: string }; position: { x: number; y: number } };

    trackMouseInfo(): void;

    getDisplayFlow(element: WKElement | null | undefined): string;
  }

  interface AppState {
    APP: APP;
    ToolTip: ToolTip;
    Tools: Tools;
    Tree: Tree;
    StylerAPI?: StylerAPI;
    Elements: Elements;
  }

  interface APP {
    mode: string;
    pause: boolean;
    ready: boolean;
    preReady: boolean;
    SHIFTKEY_PRESSED?: boolean;
    CTRLKEY_PRESSED?: boolean;
    ALTKEY_PRESSED?: boolean;
    WORKSPACE_LEAVE?: boolean;
    windowsToolPool: any[];
  }

  interface ToolTip {
    coords?: Coords;
    hidden?: boolean;
    component?: string;
    DOMElement?: WKElement;
    DOMGhostElement?: WKElement;
    overflowInfo?: OutOfViewportResult;
    transform?: string;
    logInfo: HoverElement;
  }

  interface HoverElement {
    onHoverElement: WKElement | null | undefined;
    element: string | undefined;
    guid: string | undefined;
    side: string | undefined;
    info?: string | undefined;
  }

  interface Rects {
    top: number;
    bottom: number;
    left: number;
    right: number;
    topPlusMarginTop: number;
    leftPlusMarginLeft: number;
    originalTop: number;
    originalLeft: number;
    marginLeft: number;
    marginTop: number;
    originalWidth: number;
    originalHeight: number;
    width: number;
    height: number;
  }

  interface Coords {
    x?: number;
    y?: number;
  }

  interface Tools {
    active?: number;
    componentHash?: string;
    menuItems: MenuItems[];
    skipTags: string[];
  }

  interface MenuItems {
    label?: string;
    icon?: boolean;
    component?: string;
    hide?: boolean;
    skipTags?: string[];
    height?: number;
    loaded?: boolean;
    rendered?: any;
  }

  interface Tree {
    pause?: boolean;
    highligthNode?: boolean;
    currentNode?: string;
    parentIsOpen?: boolean;
    fromTree?: boolean;
  }

  interface StylerAPI {
    currentSelector?: string;
    currentMediaQuery?: string;
  }

  interface DropAction {
    target?: WKElement | null | undefined;
    element?: WKElement | null | undefined;
    side?: string;
    slotInsert?: boolean;
    treeParent?: boolean;
    targetGUID?: string;
  }

  interface Element {
    ownerElement?: WKElement;
  }

  interface Elements {
    cache: Record<string, elementCacheEntry | string>;
    dragAction?: string;
    dropAction: DropAction;
    lastDropAction: Record<string, unknown>;
    elementInfo?: string;
    elementTag?: string;
    element?: WKElement | ShadowRoot | Element;
    onHoverElement?: WKElement | null | undefined;
    originalSelected?: string;
    originalElementSelected?: WKElement | null | undefined;
    lastSelected?: string;
    elementSelected: WKElement | null | undefined;
    selected?: string;
    selection_mode?: string;
  }

  interface elementCacheEntry {
    workspace: elementCacheEntryWorkspace;
  }

  interface elementCacheEntryWorkspace {
    cacheGUID: string;
    nodeDOM: WKElement;
    nodeData: Children;
  }

  interface projectStore {
    guid?: string;
    root?: boolean;
    children: Children[];
  }

  type SetupTokenType = "ref" | "reactive" | "method";

  interface SetupToken {
    name: string;
    type: SetupTokenType;
    value: any;
  }

  interface Component {
    name: string;
    setup: SetupToken[];
    guid?: string;
    elementId?: string;
    tree?: Tree;
    type?: string;
    loaded?: boolean;
    component?: string;
    tag?: string;
    isContainer?: boolean;
    props?: Props;
    SFC?: string;
    propsDefinition?: [];
    content?: string;
    data?: Data;
    methods?: string;
    children?: Children[];
    parent?: Children;
    root?: Children;
    body?: Children;
    DOMElement?: WKElement;
  }

  interface Children {
    guid?: string;
    elementId?: string;
    tree?: Tree;
    type?: string;
    loaded?: boolean;
    component?: string;
    tag?: string;
    isContainer?: boolean;
    isComponent?: boolean;
    props?: Props;
    SFC?: string;
    propsDefinition?: [];
    content?: string;
    data?: Data;
    methods?: string;
    children?: Children[];
    parent?: Children;
    root?: Children | boolean;
    body?: Children;
    DOMElement?: WKElement;
  }

  interface Tree {
    isOpen?: boolean;
    opening?: boolean;
  }

  interface Props {
    [k: string]: unknown;
  }

  interface Data {
    [k: string]: unknown;
  }

  interface CLASSDef {
    [key: string]: (property?: string, value?: string, updateMethod?: string) => void | string;
  }

  interface MediaDef {
    [key: string]: CLASSDef;
  }

  type ParsedUnit = [string | number] | [string | number, string | number] | boolean;

  interface CLASSCacheMethod {
    [key: string]: (property: string, value: string, updateMethod: string) => void | string;
  }

  interface CLASSCacheDef {
    [key: string]: CLASSCacheMethod;
  }

  interface CLASSCacheGetPropertyMethod {
    [key: string]: (property: string) => void | string;
  }

  interface CLASSCacheGetPropertyDef {
    [key: string]: CLASSCacheGetPropertyMethod;
  }

  interface CLASSCacheGetPropertyObjectMethod {
    [key: string]: (property: string) => StyleNode;
  }

  interface CLASSCacheGetPropertyObjectDef {
    [key: string]: CLASSCacheGetPropertyObjectMethod;
  }

  interface CLASSCacheGetPropertyParsedMethod {
    [key: string]: (property: string) => void | string | ParsedUnit;
  }

  interface CLASSCacheGetPropertyParsedDef {
    [key: string]: CLASSCacheGetPropertyParsedMethod;
  }

  interface CLASSCacheSetSelectorMethod {
    [key: string]: (property: string) => void | string | unknown;
  }

  interface CLASSCacheSetSelectorDef {
    [key: string]: CLASSCacheSetSelectorMethod;
  }

  interface CLASSCacheGetPropertyPoolMethod {
    [key: string]: () => void;
  }

  interface CLASSCacheGetPropertyPoolDef {
    [key: string]: CLASSCacheGetPropertyPoolMethod;
  }

  /**
   * Create WebsKit DOM tool
   *
   * @interface IWidget
   */
  interface IWidget {
    clean(): void;

    addStyle(style: string): void;

    /**
     * Create DOM tool and insert it into <webskit> element
     *
     * @function createDOM
     * @prop template
     * @prop noUUID
     */
    createDOM(template: string, noUUID = true): WKElement;
  }

  interface WKComponentTemplateNode {
    guid: string;
    tag: string;
    parent?: WKComponentTemplateNode;
    type?: "legacy" | "component";
    isContainer?: boolean;
    isComponent?: boolean;
    isSlot?: boolean;
    isTemplate?: boolean;
    DOMElement?: WKElement;
    props?: Record<string, unknown>;
    children?: WKComponentTemplateNode[];
    content?: string;
  }

  interface Variable {
    name: string;
    type: "ref" | "reactive";
    value: unknown;
  }

  interface Setup {
    imports: string[];
    variables: Variable[];
  }

  interface WKComponentDefinition {
    guid: string;
    name: string;
    template: WKComponentTemplateNode;
    setup?: Setup;
    slots?: Record<string, WKComponentDefinition>;
  }

  interface APPState {
    rootReady: boolean;
    debug: boolean;
    version: string;
    currentComponent: string;
    isInitialized: boolean;
    skipTags: string[];
    preReady: boolean;
    ready: boolean;
    count: number;
    Context: ComponentInternalInstance;
    ResetNodes: projectStore;
    Nodes: projectStore;
    Components: Component[];
    ProjectComponents: Record<string, Component>;
    ElementsCache: Record<string, elementCacheEntry | string>;
    APP: APP;
    Elements: Elements;
    ToolTip: ToolTip;
    ComponentsDefinition: Record<string, WKComponentDefinition>;
  }
}

export {};
