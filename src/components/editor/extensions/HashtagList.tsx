import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Icon } from '../../Icons'

interface HashtagListProps {
  items: string[]
  command: (item: { id: string }) => void
}

export const HashtagList = forwardRef((props: HashtagListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command({ id: item })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="z-50 bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-md shadow-xl overflow-hidden py-1 w-48">
      {props.items.length > 0 ? (
        props.items.map((item, index) => (
          <button
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] ${
              index === selectedIndex ? 'bg-[var(--bg-3)] text-[var(--fg-0)]' : 'text-[var(--fg-1)] hover:bg-[var(--bg-2)]'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <Icon name="tag" size={14} className="text-[var(--fg-3)]" />
            <span className="truncate">{item}</span>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-[12px] text-[var(--fg-3)]">No matching tags</div>
      )}
    </div>
  )
})
HashtagList.displayName = 'HashtagList'
