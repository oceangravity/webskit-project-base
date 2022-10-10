// @ts-ignore
import { useStore } from "@/store";
import { CreateGUID } from "@/core/CreateGUID";

let templates = [] as WKComponentTemplateNode[];
const DefaultsRegistrator = {
  registerDefaults(name: string): WKComponentTemplateNode[] {
    templates = [];
    const store = useStore();
    const componentDefinition = store.ComponentsDefinition[name].template;
    this.traverseChildren(componentDefinition);
    return templates;
  },

  traverseChildren(templateNode: WKComponentTemplateNode) {
    if (templateNode.children && templateNode.children.length) {
      templateNode.children.forEach((node: WKComponentTemplateNode) => {
        if (node.tag === "slot" && node.props?.name) {
          const templateDefinition = {
            guid: CreateGUID(),
            tag: "template",
            props: { "#": node.props.name },
            children: [],
          };
          templates.push(templateDefinition);
        }
        if (node.children?.length) {
          this.traverseChildren(node);
        }
      });
    }
  },

  registerAllDefaults(): void {
    templates = [];
    const store = useStore();
    const componentDefinition = store.ComponentsDefinition[store.currentComponent].template;
    this.traverseComponent(componentDefinition);
  },

  traverseComponent(templateNode: WKComponentTemplateNode) {
    if (templateNode.children && templateNode.children.length) {
      templateNode.children.forEach((node: WKComponentTemplateNode) => {
        if (node.isComponent) {
          const templates = this.registerDefaults(node.tag);
          if (node.children) {
            templates.forEach((item) => {
              if (node.children) {
                const index = node.children.findIndex((node: WKComponentTemplateNode) => node.tag === "template" && node.props && item && item.props && node.props["#"] === item.props["#"]);
                if (index === -1) {
                  node.children.push(item);
                }
              }
            });
            node.children = [...toRaw(node.children).filter((x) => (templates as WKComponentTemplateNode[]).findIndex((item) => x && x.props && item.props && item.props["#"] === x.props["#"]) > -1)];
          }
        } else {
          if (node.children?.length) {
            this.traverseComponent(node);
          }
        }
      });
    }
  },
};

export default DefaultsRegistrator;
