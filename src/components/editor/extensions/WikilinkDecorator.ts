import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'

export const WikilinkDecorator = Extension.create({
  name: 'wikilinkDecorator',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('wikilinkDecorator'),
        state: {
          init(_, { doc }) {
            return getDecorations(doc)
          },
          apply(tr, oldState) {
            return tr.docChanged ? getDecorations(tr.doc) : oldState
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

function getDecorations(doc: ProsemirrorNode) {
  const decorations: Decoration[] = []
  const regex = /\[\[(.*?)\]\]/g

  doc.descendants((node, pos) => {
    if (!node.isText) {
      return
    }

    const text = node.text
    if (!text) return

    let match
    while ((match = regex.exec(text)) !== null) {
      const start = pos + match.index
      const end = start + match[0].length

      decorations.push(
        Decoration.inline(start, end, {
          class: 'pill-link cursor-pointer',
          'data-id': match[1],
        })
      )
    }
  })

  return DecorationSet.create(doc, decorations)
}
