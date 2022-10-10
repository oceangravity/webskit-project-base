<template>
  <router-view />
  <wk-tools ref="mainPLaceHolder" />
</template>

<script setup lang="ts">
import NodeUtils from "./NodeUtils";
import core from "./Core";
import webskitCSS from "./webskit.css?inline";
import type { ComponentInternalInstance } from "vue";
import { getCurrentInstance, ref, nextTick, watch, onMounted } from "vue";
import WkTools from './WkTools.vue'

import { useStore } from "./store";
const instance = getCurrentInstance();

const store = useStore();
const mainPLaceHolder = ref();

onMounted(async () => {
  const wkInstance = document.createElement("wk-instance");
  const WebsKit = document.createElement("webskit");
  const HTML = document.querySelector("html");

  store.Context = instance as ComponentInternalInstance;

  // await ComponentRegistrator.registerAll()

  if (HTML) {
    const shadowRoot = HTML.appendChild(wkInstance).attachShadow({ mode: "open" }).appendChild(WebsKit);

    shadowRoot.appendChild(mainPLaceHolder.value.$el);
    let style = document.createElement("style");
    style.innerHTML = webskitCSS;
    shadowRoot.appendChild(style);
  }
  window.Components = store.ProjectComponents;
  await NodeUtils.flatNodes();

  await nextTick(() => {
    const Core = new core();
    if (instance) {
      // @ts-ignore
      instance.$Core = Core;
    }
    window.Core = Core;
    Core.init();

    window.addEventListener("message", function (msg) {
      let command;

      try {
        command = JSON.parse(msg.data)
      }catch (e) {
        return
      }

      if (command.event === "UNDO") {
        Core.Undo();
      }

      if (command.event === "REDO") {
        Core.Redo();
      }

      if (command.event === "HIDE_PLACEHOLDER") {
        Core.hidePlaceholder();
      }

      if (command.event === "SET_POINTER_SELECTOR") {
        Core.setPointerSelectorFromTree(command.data);
      }

      if (command.event === "LOAD_COMPONENT") {
        Core.loadComponent(command.data);
      }

      if (command.event === "ACTIVATE_PLACEHOLDER") {
        console.log(command.data);
        Core.activatePlaceHolder = command.data;
      }

      if (command.event === "WORKSPACE_MOUSEUP") {
        Core.mouseupWorkspace();
      }

      if (command.event === "LOAD_COMPONENTS_DEFINITION") {
        store.ComponentsDefinition = JSON.parse(command.data);
        Core.loadComponent("root");
      }

      if (command.event === "ALTKEY_DOWN") {
        Core.keyDown_ALT();
      }

      if (command.event === "ALTKEY_UP") {
        Core.keyUp_ALT();
      }
    });

    const checkReadyState = () => {
      if (document.readyState === "complete") {
        Core.sendMessage({ event: "WORKSPACE_READY", data: null });
        return;
      }
      window.setTimeout(checkReadyState, 100);
    };

    checkReadyState();
  });

  watch(
    () => store.ComponentsDefinition,
    async () => {
      await nextTick(async () => {
        window.Core.sendMessage({
          event: "TREE_NODES",
          data: {
            $Nodes: JSON.parse(JSON.stringify(store.ComponentsDefinition[store.currentComponent].template, window.Core.replacer)),
          },
        });
        setTimeout(() => {
          window.Core.sendMessage({ event: "CLEAR_TREE", data: {} });
        }, 0);
      });
    },
    {
      deep: true,
    }
  );
});
</script>

<style>
wk-instance {
  position: absolute;
  width: 100%;
  height: 100%;
  min-height: 100%;
  min-width: 100%;
  top: 0;
  left: 0;
  /*pointer-events: none;*/
  overflow: hidden;
}
</style>
