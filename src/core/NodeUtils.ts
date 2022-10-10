import { useStore } from "./store";

const NodeUtils = {
  flatNodes(): Promise<void> {
    const store = useStore();
    window.wkNodes = window.wkNodes || {};
    // window.wkNodes[String("root")] = store.ComponentsDefinition.root.template
    return new Promise((resolve) => {
      Object.entries(store.ComponentsDefinition).map((component) => {
        this.flat(store.ComponentsDefinition[component[0]].template);
      });
      resolve();
    });
  },

  flat(node: WKComponentTemplateNode): void {
    try {
      window.wkNodes[String(node.guid)] = node;
      node.children?.forEach((child) => {
        child.parent = node;
        this.flat(child);
      });
    } catch (e) {
      console.log(e);
      // debugger
    }
  },
};

export default NodeUtils;
