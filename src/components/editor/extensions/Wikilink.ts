import Mention from '@tiptap/extension-mention'
import { ReactRenderer } from '@tiptap/react'
import tippy, { GetReferenceClientRect, Instance } from 'tippy.js'
import { WikilinkList } from './WikilinkList'

let allNoteTitles: string[] = []

export const setWikilinkTitles = (titles: string[]) => {
  allNoteTitles = titles
}

import { PluginKey } from '@tiptap/pm/state'

export const Wikilink = Mention.configure({
  HTMLAttributes: {
    class: 'pill-link cursor-pointer',
  },
  renderLabel({ options, node }) {
    return `[[${node.attrs.id ?? node.attrs.label}]]`
  },
  suggestion: {
    char: '[[',
    pluginKey: new PluginKey('wikilinkSuggestion'),
    items: ({ query }: { query: string }) => {
      return allNoteTitles
        .filter(item => item.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
    },
    render: () => {
      let component: ReactRenderer | null = null
      let popup: Instance[] | null = null

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(WikilinkList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          })
        },

        onUpdate(props: any) {
          component?.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup?.[0].setProps({
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
          })
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup?.[0].hide()
            return true
          }
          return (component?.ref as any)?.onKeyDown(props)
        },

        onExit() {
          popup?.[0].destroy()
          component?.destroy()
        },
      }
    },
  },
})
