import { defineStore } from "pinia";
import { CreateGUID } from "./CreateGUID";
import { ref } from "vue";

const versionString = import.meta.env.MODE === "development" ? import.meta.env.VITE_APP_VERSION + "-dev" : import.meta.env.VITE_APP_VERSION;

export const useStore = defineStore("main", {
  state: () =>
    ({
      debug: import.meta.env.MODE === "development",
      version: versionString,
      isInitialized: false,
      preReady: false,
      ready: false,
      count: 0,
      family: "Valeria, Gati, Niña, Mu, Ra, Filiberto, El Niño :(",
      skipTags: [],
      rootReady: false,
      ResetNodes: {
        guid: CreateGUID(),
        root: true,
        children: [
          {
            guid: "root",
            elementId: "root",
            props: {},
            tree: { isOpen: false, opening: false },
            type: "Component",
            component: `root`,
          },
        ],
      },
      Nodes: {
        guid: CreateGUID(),
        root: true,
        children: [
          {
            guid: "root",
            elementId: "root",
            props: {},
            tree: { isOpen: false, opening: false },
            type: "Component",
            component: `root`,
          },
        ],
      },
      Context: {} as unknown,
      currentComponent: "",
      ComponentsDefinition: {} as Record<string, WKComponentDefinition>,
      ProjectComponents: {
        root: {
          name: "root",
          setup: [
            { name: "var1", type: "ref", value: 100 },
            { name: "var2", type: "ref", value: "' - PEREJIL - '" },
            { name: "var3", type: "ref", value: 300 },
            { name: "var4", type: "ref", value: "'TEST'" },
            {
              name: "changeVar4",
              type: "method",
              value: "var4.value = `'xmen'`",
            },
            { name: "catName", type: "ref", value: "'Niña'" },
          ],
          guid: "root",
          tree: { isOpen: false, opening: false },
          tag: "body",
          type: "Component",
          component: "root",
          isContainer: true,
          props: {
            class: ["gap-6", "justify-center", "items-center", "w-screen", "max-w-full", "p-10", "min-h-screen", "h-auto", "max-h-full"],
          },
          propsDefinition: [],
          data: { list: ["Gati", "Niña", "Valeria"], counter: 0 },
          methods: "",
          children: [
            {
              guid: "Ygsmn",
              elementId: "mxCXB",
              tree: { isOpen: false, opening: false },
              type: "div",
              tag: "div",
              isContainer: true,
              props: {
                class: ["flex", "justify-center", "xl:justify-end", "bg-blue-500", "p-4", "gap-4"],
              },
              children: [],
            },
            {
              guid: "dwqd21",
              elementId: "nBmiw",
              tree: { isOpen: false, opening: false },
              type: "button",
              tag: "button",
              isContainer: false,
              props: { "@mousedown": "changeVar4" },
              content: 'Change var4 to "xmen"',
              children: [],
            },
            {
              guid: "213wdq",
              elementId: "dqwd23",
              tree: { isOpen: false, opening: false },
              type: "div",
              tag: "div",
              isContainer: true,
              props: {
                class: ["flex", "justify-center", "xl:justify-end", "bg-white", "p-4"],
              },
              children: [],
            },
            {
              guid: "23e2de",
              elementId: "d32dw",
              tree: { isOpen: false, opening: false },
              type: "button",
              tag: "button",
              isContainer: false,
              props: { "@mousedown": "changeVar4" },
              content: 'Change var4 to "xmen"',
              children: [],
            },
            {
              guid: CreateGUID(),
              elementId: CreateGUID(),
              type: "component-b",
              tag: "component-b",
            },
            // {
            //   guid: CreateGUID(),
            //   elementId: CreateGUID(),
            //   tree: {isOpen: false, opening: false},
            //   type: 'Component',
            //   component: `component-list`
            // }
          ],
        },
        "component-a": {
          name: "component-a",
          setup: [
            { name: "var1", type: "ref", value: 100 },
            { name: "var2", type: "ref", value: "' Gati '" },
            { name: "var3", type: "ref", value: 300 },
            { name: "catName", type: "ref", value: "'Niña'" },
            {
              name: "changeName",
              type: "method",
              value: "var2.value = 'WebsKit '",
            },
          ],
          tree: { isOpen: false, opening: false },
          elementId: "T_dpz",
          tag: "div",
          type: "Component",
          component: "component-a",
          isContainer: true,
          props: { class: ["header"] },
          children: [
            {
              guid: "jUhGb",
              elementId: "Qyqc_",
              tree: { isOpen: false, opening: false },
              type: "input",
              tag: "input",
              isContainer: false,
              content: "",
              props: { class: ["title"], type: "text", "v-model": "var2" },
              children: [],
            },
            {
              guid: "qbicN",
              elementId: "aHwEg",
              tree: { isOpen: false, opening: false },
              type: "button",
              tag: "button",
              isContainer: false,
              props: { "@mousedown": "changeName" },
              content: "Change Name",
              children: [],
            },
            {
              guid: "_8jbM",
              elementId: "J1CiJ",
              tree: { isOpen: false, opening: false },
              type: "h1",
              tag: "h1",
              isContainer: false,
              props: { class: ["title"] },
              content: "My cat: {{ var2 }}",
              children: [],
            },
            {
              guid: "A-mHS",
              elementId: "zXbdz",
              tree: { isOpen: false, opening: false },
              type: "h1",
              tag: "h1",
              isContainer: false,
              props: { class: ["sub-title"] },
              content: "Improve website readability and user experience with correct contrast",
              children: [],
            },
            {
              guid: "CaJlH",
              tree: { isOpen: false, opening: false },
              type: "div",
              tag: "div",
              isContainer: true,
              props: { class: ["p-4"] },
              children: [
                {
                  guid: "ovL_U",
                  tree: { isOpen: false, opening: false },
                  type: "div",
                  tag: "div",
                  isContainer: true,
                  props: { class: ["p-4"] },
                  children: [
                    {
                      guid: "3JD0A",
                      tree: { isOpen: false, opening: false },
                      type: "div",
                      tag: "div",
                      isContainer: true,
                      props: { class: ["p-4"] },
                      children: [
                        {
                          guid: "IXOuI",
                          tree: { isOpen: false, opening: false },
                          type: "div",
                          tag: "div",
                          isContainer: true,
                          props: { class: ["p-4"] },
                          children: [
                            {
                              guid: "IjucQ",
                              tree: { isOpen: false, opening: false },
                              type: "div",
                              tag: "div",
                              isContainer: true,
                              props: { class: ["p-4"] },
                              children: [
                                {
                                  guid: "Yt4od",
                                  tree: { isOpen: false, opening: false },
                                  type: "div",
                                  tag: "div",
                                  isContainer: true,
                                  props: { class: ["p-4"] },
                                  children: [
                                    {
                                      guid: "KwvOZ",
                                      tree: { isOpen: false, opening: false },
                                      type: "div",
                                      tag: "div",
                                      isContainer: true,
                                      props: { class: ["p-4"] },
                                      children: [
                                        {
                                          guid: "lhtUn",
                                          tree: {
                                            isOpen: false,
                                            opening: false,
                                          },
                                          type: "div",
                                          tag: "div",
                                          isContainer: true,
                                          props: { class: ["p-4"] },
                                          children: [
                                            {
                                              guid: "BgXJE",
                                              tree: {
                                                isOpen: false,
                                                opening: false,
                                              },
                                              type: "div",
                                              tag: "div",
                                              isContainer: true,
                                              props: { class: ["p-4"] },
                                              children: [
                                                {
                                                  guid: "9JLrq",
                                                  tree: {
                                                    isOpen: false,
                                                    opening: false,
                                                  },
                                                  type: "div",
                                                  tag: "div",
                                                  isContainer: true,
                                                  props: { class: ["p-4"] },
                                                  children: [
                                                    {
                                                      guid: "JdBR0",
                                                      tree: {
                                                        isOpen: false,
                                                        opening: false,
                                                      },
                                                      type: "div",
                                                      tag: "div",
                                                      isContainer: true,
                                                      props: { class: ["p-4"] },
                                                      children: [
                                                        {
                                                          guid: "zkAmc",
                                                          tree: {
                                                            isOpen: false,
                                                            opening: false,
                                                          },
                                                          type: "div",
                                                          tag: "div",
                                                          isContainer: true,
                                                          props: {
                                                            class: ["p-4"],
                                                          },
                                                          children: [
                                                            {
                                                              guid: "y6U8u",
                                                              tree: {
                                                                isOpen: false,
                                                                opening: false,
                                                              },
                                                              type: "div",
                                                              tag: "div",
                                                              isContainer: true,
                                                              props: {
                                                                class: ["p-4"],
                                                              },
                                                              children: [
                                                                {
                                                                  guid: "KcDK4",
                                                                  tree: {
                                                                    isOpen: false,
                                                                    opening: false,
                                                                  },
                                                                  type: "div",
                                                                  tag: "div",
                                                                  isContainer: true,
                                                                  props: {
                                                                    class: ["p-4"],
                                                                  },
                                                                  children: [],
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              guid: "-CLzN",
              elementId: "YtYqp",
              tree: { isOpen: false, opening: false },
              type: "Component",
              component: "component-list",
              props: {},
            },
          ],
        },
        "component-list": {
          name: "component-list",
          setup: [
            { name: "var1", type: "ref", value: 100 },
            { name: "var2", type: "ref", value: "' Gati '" },
            { name: "var3", type: "ref", value: 300 },
            { name: "catName", type: "ref", value: "'Niña'" },
            {
              name: "changeName",
              type: "method",
              value: "var2.value = 'WebsKit '",
            },
          ],
          tree: { isOpen: false, opening: false },
          elementId: "9QQsL",
          component: "component-list",
          type: "p",
          tag: "p",
          props: { "v-for": "(n, index) in 5" },
          isContainer: true,
          children: [
            {
              guid: "SwJ_r",
              tree: { isOpen: false, opening: false },
              type: "span",
              tag: "span",
              isContainer: true,
              props: {},
              children: [
                {
                  guid: "3x6GO",
                  tree: { isOpen: false, opening: false },
                  type: "text",
                  props: {},
                  tag: "text",
                  content: "ITEM {{ index }}",
                },
              ],
            },
          ],
        },
      },
      Components: [] as Component[],
      ElementsCache: {},
      APP: {
        mode: "MOVE", // ["MOVE", "EDIT", "EDITING", "GALLERY"]
        pause: false,
        ready: false,
        preReady: false,
        SHIFTKEY_PRESSED: false,
        CTRLKEY_PRESSED: false,
        windowsToolPool: [],
      },
      Elements: {
        cache: {},
        dragAction: "STOPPED",
        dropAction: {},
        elementInfo: "",
        elementTag: "",
        element: undefined,
        onHoverElement: undefined,
        lastDropAction: {},
        originalSelected: undefined,
        originalElementSelected: undefined,
        lastSelected: undefined,
        elementSelected: undefined,
        selected: "",
        selection_mode: "WK-COMPONENTS", // [WK-COMPONENTS, WK-TEXT, OTHERS]
      },
      ToolTip: {
        coords: {
          x: 0,
          y: 0,
        },
        hidden: true,
        component: "TooltipLogger",
        DOMElement: undefined,
        DOMGhostElement: undefined,
        overflowInfo: undefined,
        transform: undefined,
        logInfo: {
          onHoverElement: undefined,
          element: "",
          guid: "",
          side: "",
        },
      },
    } as APPState),

  actions: {
    // initApp() {
    //   this.isInitialized = true
    //   console.log('app initialized!')
    // },
    //
    // increment(value = 1) {
    //   this.count += value
    // },
  },

  getters: {
    isReady: (state) => {
      return !state.isInitialized;
    },
  },
});

window.wkNodes = {};
window.UPDATE_VBLOCK = ref<string>("");
window.rootHash = ref<string>(CreateGUID());
