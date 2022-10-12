import {useStore} from "./store";
import {CreateGUID} from "./CreateGUID";

const GetComponentSFC = {
  get(componentDefinition: WKComponentDefinition): string {
    const store = useStore()
    return this.getChildren(componentDefinition.template)
  },

  objToTemplate(templateNode: WKComponentTemplateNode) {

    const templateProps = templateNode.props

    if (templateProps) {
      templateProps['v-b'] = `{ guid: '${templateNode.guid}' }`
      delete templateProps['v-r']
      Object.keys(templateProps).map((key) => document.body.setAttribute(key, String((templateProps[key] as String[]).join(" "))))
    }

    const childrenOrContent: string = templateNode.children ? templateNode.children.map(templateNode => this.getChildren(templateNode)).join('') : templateNode.content || ''

    return `${childrenOrContent}`
  },

  getChildren(templateNode: WKComponentTemplateNode) {
    const templateProps = templateNode.props || {}

    templateProps['v-b'] = `{ guid: '${templateNode.guid}' }`

    if (templateNode.tag !== 'v-slot' && templateNode.parent?.tag !== 'slot') {
      delete templateProps['v-r']
    }

    let renderedProps = ""

    templateNode.isContainer = Array.isArray(templateNode.children)

    if (templateProps.class && Array.isArray(templateProps.class)) {
      templateProps.class = (templateProps.class as String[]).join(" ")
    }

    // Clean v-slots
    if (templateNode.children && templateNode.children.length > 1) {
      const index = templateNode.children.findIndex(node => node.tag === 'v-slot')
      if (index > -1) {
        templateNode.children.splice(index, 1)
      }
    }

    // if tag is slot, check children is empty, if empty, add a wk-slot element
    if (templateNode.tag === 'slot') {
      if (!templateNode.children || templateNode.children.length === 0) {
        templateNode.children = []
        templateNode.children.push({
          guid: CreateGUID(),
          props: {
            'v-r' : `{ guid: '${templateNode.guid}', tag: '${templateNode.tag}', isContainer: ${templateNode.isContainer}, isComponent: ${templateNode.isComponent}, isSlot: ${templateNode.isSlot} }`,
            name: templateProps.name,
            'data-guid': templateNode.guid,
            'data-name': templateProps.name
          },
          tag: 'v-slot',
          isContainer: true,
          children: []
        })
      } else {
        templateNode.children.map(node => {
          if (node.props) {
            node.props['v-r'] = `{ guid: '${templateNode.guid}', tag: '${templateNode.tag}', isContainer: ${templateNode.isContainer}, isComponent: ${templateNode.isComponent}, isSlot: ${templateNode.isSlot} }`
           }
        })
      }
    }

    if (Object.keys(templateProps).length) {
      renderedProps = ' ' + Object.keys(templateProps).map((key) => `${key}="${((templateProps as Record<string, unknown>)[key])}"`).join(' ')
    }

    const childrenOrContent: string = templateNode.children ? templateNode.children.map(templateNode => this.getChildren(templateNode)).join('\n') : templateNode.content || ''

    return `<${templateNode.tag}${renderedProps}>${childrenOrContent}</${templateNode.tag}>`
  }

}

export default GetComponentSFC
