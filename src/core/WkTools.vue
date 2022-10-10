<template>
  <wk-tool>
    <wk-tool element-pointer-selector></wk-tool>
    <wk-tool parent-pointer-selector></wk-tool>
    <wk-tool rect-pointer-selector-background></wk-tool>
    <wk-tool rect-pointer-selector></wk-tool>
    <wk-tool placeholder="placeholder" main-placeholder>
      <wk-tool placeholder-wrapper="center">
        <wk-tool placeholder="center">
          <svg id="selector-svg-placeholder" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
               viewBox="0 0 0 0" style="top: 0; left: 0; position: absolute">
            <path class="path2-placeholder" stroke="#fff" stroke-width="2" stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-miterlimit="50" stroke-dasharray="1" stroke-dashoffset="6" fill="none"
                  d="M0 0 H 0 V 0 H 0 L 0 0"></path>
            <path class="path-placeholder" stroke="#000" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"
                  stroke-miterlimit="50" stroke-dasharray="3" stroke-dashoffset="6" fill="none"
                  d="M0 0 H 0 V 0 H 0 L 0 0"></path>
          </svg>
        </wk-tool>
      </wk-tool>
      <wk-tool placeholder-wrapper="top">
        <wk-tool placeholder="top">
          <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 480 200"
               style="enable-background: new 0 0 480 200" xml:space="preserve">
          <line class="dash-move-opposite" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
                stroke-miterlimit="50" stroke-dasharray="1" stroke-dashoffset="6" fill="none" x1="0" y1="0" x2="100%"
                y2="0"/>
            <line class="dash-move-opposite" stroke="#000" stroke-width="1" stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-miterlimit="50" stroke-dasharray="3" stroke-dashoffset="6" fill="none" x1="0" y1="0" x2="100%"
                  y2="0"/>
        </svg>
          <wk-tool placeholder="left-arrow">
            <wk-tool class="left-arrow-1"></wk-tool>
            <wk-tool class="left-arrow-2"></wk-tool>
          </wk-tool>
          <wk-tool placeholder="right-arrow">
            <wk-tool class="right-arrow-1"></wk-tool>
            <wk-tool class="right-arrow-2"></wk-tool>
          </wk-tool>
          <wk-tool class="wk-arrow-container-x" style="opacity: 1; display: block">
            <wk-tool class="wk-arrow wk-up" style="display: none">
              <wk-tool class="arrow-left"
                       style="opacity: 1; transform: rotate(270deg); top: calc(100%); display: block">
                <wk-tool
                    style="width: 0; height: 0; position: absolute; left: 0; top: -8px; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(255, 255, 255); border-style: solid; border-width: 8px 0 8px 8px; display: block"></wk-tool>
                <wk-tool
                    style="width: 0; height: 0; padding: 0; margin: 0; z-index: 2147483647; color: rgb(222, 13, 13); position: absolute; font-size: 0; line-height: 0; left: 1px; top: -6px; opacity: 1; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(67, 19, 101); border-style: solid; border-width: 6px 0 6px 6px; display: block"></wk-tool>
              </wk-tool>
            </wk-tool>
            <wk-tool class="wk-arrow wk-down" style="display: block">
              <wk-tool class="arrow-left" style="opacity: 1; transform: rotate(90deg); display: block">
                <wk-tool
                    style="width: 0; height: 0; position: absolute; left: 0; top: -8px; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(255, 255, 255); border-style: solid; border-width: 8px 0 8px 8px; display: block"></wk-tool>
                <wk-tool
                    style="width: 0; height: 0; padding: 0; margin: 0; z-index: 2147483647; color: rgb(222, 13, 13); position: absolute; font-size: 0; line-height: 0; left: 1px; top: -6px; opacity: 1; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(67, 19, 101); border-style: solid; border-width: 6px 0 6px 6px; display: block"></wk-tool>
              </wk-tool>
            </wk-tool>
          </wk-tool>
        </wk-tool>
      </wk-tool>
      <wk-tool placeholder-wrapper="bottom">
        <wk-tool placeholder="bottom">
          <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 480 200"
               style="enable-background: new 0 0 480 200" xml:space="preserve">
          <line class="dash-move-opposite" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
                stroke-miterlimit="50" stroke-dasharray="1" stroke-dashoffset="6" fill="none" x1="0" y1="0" x2="100%"
                y2="0"/>
            <line class="dash-move-opposite" stroke="#000" stroke-width="1" stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-miterlimit="50" stroke-dasharray="3" stroke-dashoffset="6" fill="none" x1="0" y1="0" x2="100%"
                  y2="0"/>
        </svg>
          <wk-tool placeholder="left-arrow">
            <wk-tool class="left-arrow-1"></wk-tool>
            <wk-tool class="left-arrow-2"></wk-tool>
          </wk-tool>
          <wk-tool placeholder="right-arrow">
            <wk-tool class="right-arrow-1"></wk-tool>
            <wk-tool class="right-arrow-2"></wk-tool>
          </wk-tool>
          <wk-tool class="wk-arrow-container-x" style="opacity: 1; display: block">
            <wk-tool class="wk-arrow wk-up" style="display: none">
              <wk-tool class="arrow-left"
                       style="opacity: 1; transform: rotate(270deg); top: calc(100%); display: block">
                <wk-tool
                    style="width: 0; height: 0; position: absolute; left: 0; top: -8px; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(255, 255, 255); border-style: solid; border-width: 8px 0 8px 8px; display: block"></wk-tool>
                <wk-tool
                    style="width: 0; height: 0; padding: 0; margin: 0; z-index: 2147483647; color: rgb(222, 13, 13); position: absolute; font-size: 0; line-height: 0; left: 1px; top: -6px; opacity: 1; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(67, 19, 101); border-style: solid; border-width: 6px 0 6px 6px; display: block"></wk-tool>
              </wk-tool>
            </wk-tool>
            <wk-tool class="wk-arrow wk-down" style="display: block">
              <wk-tool class="arrow-left" style="opacity: 1; transform: rotate(90deg); display: block">
                <wk-tool
                    style="width: 0; height: 0; position: absolute; left: 0; top: -8px; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(255, 255, 255); border-style: solid; border-width: 8px 0 8px 8px; display: block"></wk-tool>
                <wk-tool
                    style="width: 0; height: 0; padding: 0; margin: 0; z-index: 2147483647; color: rgb(222, 13, 13); position: absolute; font-size: 0; line-height: 0; left: 1px; top: -6px; opacity: 1; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(67, 19, 101); border-style: solid; border-width: 6px 0 6px 6px; display: block"></wk-tool>
              </wk-tool>
            </wk-tool>
          </wk-tool>
        </wk-tool>
      </wk-tool>
      <wk-tool placeholder-wrapper="left">
        <wk-tool placeholder="left">
          <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 480 200"
               style="enable-background: new 0 0 480 200" xml:space="preserve">
          <line class="dash-move-opposite" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
                stroke-miterlimit="50" stroke-dasharray="1" stroke-dashoffset="6" fill="none" x1="0" y1="0" x2="0"
                y2="100%"/>
            <line class="dash-move-opposite" stroke="#000" stroke-width="1" stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-miterlimit="50" stroke-dasharray="3" stroke-dashoffset="6" fill="none" x1="0" y1="0" x2="0"
                  y2="100%"/>
        </svg>
          <wk-tool placeholder="top-arrow">
            <wk-tool class="top-arrow-1"></wk-tool>
            <wk-tool class="top-arrow-2"></wk-tool>
          </wk-tool>
          <wk-tool placeholder="bottom-arrow">
            <wk-tool class="bottom-arrow-1"></wk-tool>
            <wk-tool class="bottom-arrow-2"></wk-tool>
          </wk-tool>
          <wk-tool class="wk-arrow-container-y" style="opacity: 1; display: block">
            <wk-tool class="wk-arrow wk-left" style="display: block">
              <wk-tool class="arrow-left" style="opacity: 1; display: block">
                <wk-tool
                    style="width: 0; height: 0; position: absolute; left: 0; top: -8px; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(255, 255, 255); border-style: solid; border-width: 8px 0 8px 8px; display: block"></wk-tool>
                <wk-tool
                    style="width: 0; height: 0; padding: 0; margin: 0; z-index: 2147483647; color: rgb(222, 13, 13); position: absolute; font-size: 0; line-height: 0; left: 1px; top: -6px; opacity: 1; border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(67, 19, 101); border-style: solid; border-width: 6px 0 6px 6px; display: block"></wk-tool>
              </wk-tool>
            </wk-tool>
          </wk-tool>
        </wk-tool>
      </wk-tool>
      <wk-tool placeholder-wrapper="right">
        <wk-tool placeholder="right">
          <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 480 200"
               style="enable-background: new 0 0 480 200" xml:space="preserve">
          <line class="dash-move-opposite" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
                stroke-miterlimit="50" stroke-dasharray="1" stroke-dashoffset="6" fill="none" x1="0" y1="0" x2="0"
                y2="100%"/>
            <line class="dash-move-opposite" stroke="#000" stroke-width="1" stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-miterlimit="50" stroke-dasharray="3" stroke-dashoffset="6" fill="none" x1="0" y1="0" x2="0"
                  y2="100%"/>
        </svg>
          <wk-tool placeholder="top-arrow">
            <wk-tool class="top-arrow-1"></wk-tool>
            <wk-tool class="top-arrow-2"></wk-tool>
          </wk-tool>
          <wk-tool placeholder="bottom-arrow">
            <wk-tool class="bottom-arrow-1"></wk-tool>
            <wk-tool class="bottom-arrow-2"></wk-tool>
          </wk-tool>
          <wk-tool class="wk-arrow-container-y" style="opacity: 1; display: block">
            <wk-tool class="wk-arrow wk-right" style="display: block">
              <wk-tool class="arrow-right" style="opacity: 1; display: block">
                <wk-tool
                    style="width: 0; height: 0; position: absolute; left: 0; top: -8px; border-color: rgba(0, 0, 0, 0) rgb(255, 255, 255) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0); border-style: solid; border-width: 8px 8px 8px 0; display: block"></wk-tool>
                <wk-tool
                    style="width: 0; height: 0; padding: 0; margin: 0; z-index: 2147483647; color: rgb(222, 13, 13); position: absolute; font-size: 0; line-height: 0; left: 1px; top: -6px; opacity: 1; border-color: rgba(0, 0, 0, 0) rgb(67, 19, 101) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0); border-style: solid; border-width: 6px 6px 6px 0; display: block"></wk-tool>
              </wk-tool>
            </wk-tool>
          </wk-tool>
        </wk-tool>
      </wk-tool>
    </wk-tool>
  </wk-tool>

</template>

<script setup lang="ts">
import WkTool from "./wk-tool.vue";
</script>
