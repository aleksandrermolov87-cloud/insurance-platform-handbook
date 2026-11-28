import React, { useEffect, useMemo, useRef, useState } from "react";
import { MagnifierMIcon } from "@alfalab/icons-glyph/MagnifierMIcon";
import { searchHandbook } from "./library";

export function HandbookSearch() {
  const input = useRef(null);
  const form = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const results = useMemo(() => searchHandbook(query).slice(0, 5), [query]);
  const expanded = open && query.trim().length > 0;
  const shortcut = /Mac|iPhone|iPad/.test(navigator.platform)
    ? "⌘ K"
    : "Ctrl K";
  function close() {
    setOpen(false);
    setActive(-1);
  }
  function go(path) {
    close();
    input.current.blur();
    location.hash = "/" + path;
  }
  function submit(event) {
    event.preventDefault();
    if (expanded && active >= 0 && results[active]) go(results[active][2]);
    else go("search?q=" + encodeURIComponent(query.trim()));
  }
  useEffect(() => {
    const onShortcut = (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.code === "KeyK" || event.key.toLowerCase() === "k") &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        input.current.focus();
        input.current.select();
        setOpen(true);
      }
    };
    const outside = (event) => {
      if (!form.current.contains(event.target)) close();
    };
    const routeChanged = () => close();
    window.addEventListener("blur", close);
    window.addEventListener("keydown", onShortcut);
    window.addEventListener("hashchange", routeChanged);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("blur", close);
      window.removeEventListener("keydown", onShortcut);
      window.removeEventListener("hashchange", routeChanged);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  return (
    <form
      ref={form}
      role="search"
      className="top-search"
      onSubmit={submit}
      onBlur={(e) => {
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) close();
      }}
    >
      <button aria-label="Найти" type="submit">
        <MagnifierMIcon aria-hidden="true" />
      </button>
      <input
        ref={input}
        name="query"
        type="search"
        role="combobox"
        aria-label="Поиск по справочнику"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls="quick-results"
        autoComplete="off"
        aria-activedescendant={
          expanded && active >= 0 ? "quick-result-" + active : undefined
        }
        placeholder="Поиск"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
          if (
            (e.key === "ArrowDown" || e.key === "ArrowUp") &&
            results.length
          ) {
            e.preventDefault();
            setOpen(true);
            const forward = e.key === "ArrowDown";
            setActive((i) => {
              if (forward) return (i + 1) % results.length;
              return i <= 0 ? results.length - 1 : i - 1;
            });
          }
        }}
      />
      <kbd aria-hidden="true">{shortcut}</kbd>
      <div className="search-popover" hidden={!expanded}>
        <ul role="listbox" id="quick-results" aria-label="Быстрые результаты">
          {results.map(([title, group, path], i) => (
            <li
              role="option"
              id={"quick-result-" + i}
              aria-selected={active === i}
              key={path}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(path)}
            >
              <strong>{title}</strong>
              <small>{group}</small>
            </li>
          ))}
        </ul>
        {results.length ? (
          <button
            type="button"
            className="all-search-results"
            onClick={() => go("search?q=" + encodeURIComponent(query.trim()))}
          >
            Все результаты
          </button>
        ) : (
          <p role="status">Совпадений нет. Уточните запрос.</p>
        )}
      </div>
    </form>
  );
}
