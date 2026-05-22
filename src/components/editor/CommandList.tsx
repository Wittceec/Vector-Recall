import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
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

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
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
    <div className="bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-lg shadow-xl p-1 overflow-hidden min-w-[200px]" style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8)" }}>
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded text-[13px] text-[var(--fg-1)] transition-colors ${
              index === selectedIndex ? 'bg-[var(--bg-3)] text-[var(--fg-0)]' : 'hover:bg-[var(--bg-2)]'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className="font-mono text-[10px] bg-[var(--bg-2)] border border-[var(--bd-2)] rounded px-1 min-w-[20px] text-center text-[var(--fg-3)]">
              {item.icon === 'h1' ? '#' : item.icon === 'h2' ? '##' : item.icon === 'check-square' ? '[]' : '</>'}
            </span>
            {item.title}
          </button>
        ))
      ) : (
        <div className="p-2 text-[12px] text-center text-[var(--fg-3)]">No results</div>
      )}
    </div>
  )
})

CommandList.displayName = 'CommandList'
