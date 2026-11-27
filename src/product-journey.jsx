import React, { useId, useLayoutEffect, useRef, useState } from "react";
import {
  forChannel,
  primaryFor,
  productLink,
  prototypeLink,
  readSelection,
  requirementLink,
  screens,
  stageFor,
  stages,
} from "./product-journey-model";
import "./product-journey.css";

function ScreenLinks({ id, channel, onOpen, detailed = false }) {
  const screen = screens.get(id),
    primary = primaryFor(screen, channel);
  return (
    <div className="journey-links">
      <a
        className="screen-link"
        href={prototypeLink(id, channel)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={"Экран прототипа · " + screen.title}
        onClick={() => onOpen(id)}
      >
        Экран <span aria-hidden="true">↗</span>
      </a>
      <a
        href={requirementLink(primary, id, channel)}
        title={primary.label}
        aria-label={"Требования · " + screen.title}
        onClick={() => onOpen(id)}
      >
        {detailed && primary.page === "address-update"
          ? "Изменение 26 ноября"
          : detailed && primary.page === "demo-rules"
            ? "Правило демонстратора"
            : "Требования"}
        {detailed && typeof primary.page === "number"
          ? " · стр. " + primary.page
          : ""}
      </a>
    </div>
  );
}
function useConnections(container, channel) {
  const [lines, setLines] = useState([]);
  useLayoutEffect(() => {
    const el = container.current;
    const update = () => {
      const origin = el.getBoundingClientRect();
      const bounds = [...el.querySelectorAll(".product-stop")].map((node) => {
        const r = node.getBoundingClientRect();
        return {
          left: r.left - origin.left,
          right: r.right - origin.left,
          top: r.top - origin.top,
          bottom: r.bottom - origin.top,
          x: r.left - origin.left + r.width / 2,
          y: r.top - origin.top + r.height / 2,
        };
      });
      const links = bounds.slice(1).map((b, i) => {
        const a = bounds[i];
        if (Math.abs(a.y - b.y) < 2)
          return a.x < b.x
            ? [
                [a.right, a.y],
                [b.left - 3, b.y],
              ]
            : [
                [a.left, a.y],
                [b.right + 3, b.y],
              ];
        return [
          [a.x, a.bottom],
          [b.x, b.top - 3],
        ];
      });
      const a = bounds[2],
        b = bounds[4];
      if (Math.abs(a.x - b.x) < 2) {
        const gap = Math.min(origin.width - 4, a.right + 13);
        links.push([
          [a.right, a.y],
          [gap, a.y],
          [gap, b.y],
          [b.right + 3, b.y],
        ]);
      } else {
        const half = (a.bottom + b.top) / 2;
        links.push([
          [a.x - 18, a.bottom],
          [a.x - 18, half],
          [b.x, half],
          [b.x, b.top - 3],
        ]);
      }
      setLines(links);
    };
    const obs = new ResizeObserver(update);
    obs.observe(el);
    for (const n of el.querySelectorAll(".product-stop")) obs.observe(n);
    update();
    return () => obs.disconnect();
  }, [container, channel]);
  return lines;
}
function Branches({ stage, channel, selected, onOpen }) {
  const options = [stage.id, ...stage.variants].filter((id) =>
    forChannel(id, channel),
  );
  return (
    <div className="journey-cases">
      {options.map((id) => {
        const screen = screens.get(id);
        const primary = primaryFor(screen, channel);
        const secondary = screen.secondary.filter(
          (ref) =>
            (ref.page !== primary.page ||
              ref.block !== primary.block ||
              ref.row !== primary.row) &&
            !(id === "entry" && [27, 28].includes(ref.page)),
        );
        return (
          <article
            className={"journey-case" + (selected === id ? " current" : "")}
            key={id}
            id={"case-" + id}
            data-product-state={id}
          >
            <div>
              <h4>{screen.title}</h4>
              <p>{screen.observed}</p>
              {screen.next && (
                <p className="journey-continuation">{screen.next}</p>
              )}
            </div>
            <div className="case-actions">
              <ScreenLinks id={id} channel={channel} onOpen={onOpen} detailed />
              {secondary.length > 0 && (
                <details className="additional-requirements">
                  <summary>Связанные требования</summary>
                  <ul>
                    {secondary.map((ref, i) => (
                      <li key={i}>
                        <a
                          href={requirementLink(ref, id, channel)}
                          onClick={() => onOpen(id)}
                        >
                          {ref.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ProductJourney({ initialStep, initialChannel }) {
  const [selection, setSelection] = useState(() =>
    readSelection(initialStep, initialChannel),
  );
  const [all, setAll] = useState(false);
  const { id, channel } = selection;
  const active = stageFor.get(id);
  const board = useRef(null),
    details = useRef(null);
  const marker = "journey-line-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const lines = useConnections(board, channel);
  function select(nextId, nextChannel = channel) {
    setSelection({ id: nextId, channel: nextChannel });
    history.replaceState(history.state, "", productLink(nextId, nextChannel));
  }
  function showStage(stage) {
    select(stage.id);
    setAll(false);
    requestAnimationFrame(() => {
      details.current?.querySelector("h3")?.focus({ preventScroll: true });
      details.current?.scrollIntoView({ block: "start" });
    });
  }
  useLayoutEffect(() => {
    if (!initialStep) return;
    const target =
      stageFor.get(initialStep)?.id === initialStep
        ? board.current?.querySelector('[data-stage="' + initialStep + '"]')
        : document.getElementById("case-" + initialStep);
    target?.scrollIntoView({ block: "start" });
  }, [initialStep]);
  const selectedGroups = all ? stages : [active];
  return (
    <figure className="product-journey" aria-labelledby="product-journey-title">
      <figcaption className="product-map-heading">
        <div>
          <h2 id="product-journey-title">Путь оформления</h2>
          <p>
            Откройте экран и требования прямо на схеме. Нажмите название шага,
            чтобы увидеть его варианты.
          </p>
        </div>
        <div
          className="journey-channel"
          role="group"
          aria-label="Канал оформления"
        >
          {[
            ["nib", "НИБ"],
            ["sfa", "SFA"],
          ].map(([key, title]) => (
            <button
              type="button"
              key={key}
              aria-pressed={channel === key}
              onClick={() => select(forChannel(id, key) ? id : active.id, key)}
            >
              {title}
            </button>
          ))}
        </div>
      </figcaption>
      <div className="product-map-board" ref={board}>
        <svg aria-hidden="true" className="product-map-lines">
          <defs>
            <marker
              id={marker}
              viewBox="0 0 10 10"
              markerWidth="7"
              markerHeight="7"
              refX="8"
              refY="5"
              orient="auto-start-reverse"
            >
              <path
                d="M1 1L8.5 5L1 9"
                fill="none"
                stroke="context-stroke"
                strokeWidth="1.7"
              />
            </marker>
          </defs>
          {lines.map((points, i) => (
            <polyline
              key={i}
              className={i === 8 ? "without-dms" : ""}
              points={points.map((p) => p.join(",")).join(" ")}
              markerEnd={"url(#" + marker + ")"}
            />
          ))}
        </svg>
        {stages.map((stage, i) => {
          const row = Math.floor(i / 3),
            col = row % 2 === 0 ? i % 3 : 2 - (i % 3);
          return (
            <div
              className={
                "product-stop" + (active.id === stage.id ? " active" : "")
              }
              key={stage.id}
              data-stage={stage.id}
              style={{ "--column": col + 1, "--row": row + 1 }}
            >
              <button
                type="button"
                className="select-stop"
                aria-pressed={active.id === stage.id}
                aria-controls="journey-state-panel"
                onClick={() => showStage(stage)}
              >
                <span className="stop-number">{i + 1}</span>
                <span>{stage.title}</span>
              </button>
              <p>
                {channel === "nib" && stage.id === "code"
                  ? "Клиент подтверждает согласие кодом."
                  : channel === "nib" && stage.id === "done"
                    ? "Дата начала защиты и документ клиента."
                    : stage.note}
              </p>
              <ScreenLinks
                id={stage.id}
                channel={channel}
                onOpen={(next) => select(next)}
              />
            </div>
          );
        })}
      </div>
      <div className="skip-dms">
        <i aria-hidden="true" />
        Список сотрудников заполняют на экране данных. Без ДМС переходят сразу к
        проверке полиса.
      </div>
      <section
        id="journey-state-panel"
        className="journey-state-panel"
        ref={details}
      >
        <div className="state-panel-heading">
          <h3 tabIndex={-1}>{all ? "Все шаги и состояния" : active.title}</h3>
          <div className="state-nav">
            <button
              type="button"
              onClick={() => {
                const target = board.current.querySelector(
                  '[data-stage="' + active.id + '"] .select-stop',
                );
                target.focus({ preventScroll: true });
                target.scrollIntoView({ block: "center" });
              }}
            >
              К схеме
            </button>
            <button
              type="button"
              aria-expanded={all}
              onClick={() => setAll(!all)}
            >
              {all ? "Показать выбранный шаг" : "Развернуть все шаги"}
            </button>
          </div>
        </div>
        {selectedGroups.map((group) => (
          <section className="journey-case-group" key={group.id}>
            {all && (
              <h4 className="case-group-title">
                {stages.indexOf(group) + 1}. {group.title}
              </h4>
            )}
            <Branches
              stage={group}
              channel={channel}
              selected={id}
              onOpen={(next) => select(next)}
            />
          </section>
        ))}
      </section>
    </figure>
  );
}
