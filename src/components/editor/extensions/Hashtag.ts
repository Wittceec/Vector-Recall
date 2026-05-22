import Mention from '@tiptap/extension-mention'
import { ReactRenderer } from '@tiptap/react'
import tippy, { GetReferenceClientRect, Instance } from 'tippy.js'
import { HashtagList } from './HashtagList'

import { PluginKey } from '@tiptap/pm/state'

let allTags: string[] = []

export const setHashtags = (tags: string[]) => {
  allTags = tags
}

export const Hashtag = Mention.extend({
  name: 'hashtag',

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'tag cursor-pointer',
      },
      renderLabel({ options, node }: any) {
        return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
      },
      suggestion: {
        char: '#',
        pluginKey: new PluginKey('hashtagSuggestion'),
        items: ({ query }: { query: string }) => {
          return allTags
            .filter(item => item.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10)
        },
        render: () => {
          let component: ReactRenderer | null = null
          let popup: Instance[] | null = null

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(HashtagList, {
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
    } as any
  },
})
