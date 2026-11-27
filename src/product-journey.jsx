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

function ScreenLinks({ id, channel, onOpen, detailed = false, onMap = false }) {
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
        href={requirementLink(primary, id, channel, onMap)}
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
const decisions = {
  config: {
    id: "address",
    title: "Адрес отклонён",
    note: "Адрес имущества проверяют при расчёте. Если выбрана ответственность с ДМС без имущества, проверка проходит на шаге 3.",
    paths: [
      {
        id: "address-corrected",
        title: "Исправить адрес",
        text: "Выбрать другой адрес из подсказок. Если он подходит, продолжить с теми же покрытиями.",
      },
      {
        id: "address-dms-only",
        title: "Оставить только ДМС",
        text: "Если ДМС уже выбрано, список сотрудников сохранится. Проверить новую цену на шаге 2.",
      },
      {
        id: "address-refused-property",
        title: "Вернуться к выбору страховки",
        text: "Без ДМС кнопка «К выбору страховки» возвращает на шаг 1.",
      },
    ],
  },
  data: {
    id: "skip",
    title: "В пакете нет ДМС",
    paths: [
      {
        id: "checkout-no-dms",
        title: "Сразу к проверке полиса",
        text: "После выбора счёта клиент переходит с шага 3 на шаг 5. Список сотрудников нужен только для ДМС.",
      },
    ],
  },
  checkout: {
    id: "paper",
    title: "Подпись на бумаге",
    channel: "sfa",
    paths: [
      {
        id: "paper",
        title: "Выбрать «На бумаге»",
        text: "На шаге 5 менеджер выбирает способ подписания и нажимает «Подготовить согласие для подписи».",
      },
      {
        id: "paper-consent",
        title: "Подтвердить подписание",
        text: "После подтверждения бумажной подписи оформление переходит к оплате на шаге 7.",
      },
    ],
  },
};

function decisionFor(stageId, channel) {
  const decision = decisions[stageId];
  return decision?.channel && decision.channel !== channel ? null : decision;
}

function Decision({ decision, channel, select }) {
  return (
    <section
      className={"map-decision decision-" + decision.id}
      data-decision={decision.id}
      aria-labelledby={"decision-" + decision.id}
    >
      <div className="decision-heading">
        <h3 id={"decision-" + decision.id}>{decision.title}</h3>
        {decision.channel && (
          <span className="decision-channel">Только в SFA</span>
        )}
      </div>
      {decision.note && <p className="decision-note">{decision.note}</p>}
      <ol
        className={
          "decision-paths" + (decision.id === "paper" ? " sequential" : "")
        }
      >
        {decision.paths.map((path) => (
          <li key={path.id} data-map-screen={path.id} tabIndex={-1}>
            <div className="decision-copy">
              <h4>{path.title}</h4>
              <p>{path.text}</p>
            </div>
            <ScreenLinks
              id={path.id}
              channel={channel}
              onMap
              onOpen={(id) => select(id, channel, true)}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

function useConnections(container, channel) {
  const [lines, setLines] = useState([]);
  useLayoutEffect(() => {
    const board = container.current;
    const update = () => {
      const origin = board.getBoundingClientRect();
      const bounds = (node) => {
        const r = node.getBoundingClientRect();
        // Measure from the SVG's own coordinate origin inside the board border.
        const left = r.left - origin.left - board.clientLeft,
          top = r.top - origin.top - board.clientTop;
        return {
          left,
          top,
          right: left + r.width,
          bottom: top + r.height,
          x: left + r.width / 2,
          y: top + r.height / 2,
        };
      };
      const boxes = [...board.querySelectorAll("[data-stage]")].map(bounds);
      const compact =
        getComputedStyle(board).getPropertyValue("--stacked").trim() === "1";
      const paths = [];
      function add(id, points, branch = false) {
        paths.push({ id, points, branch });
      }
      boxes.slice(1).forEach((b, i) => {
        const a = boxes[i];
        if (compact && decisionFor(stages[i].id, channel)) {
          const rail = a.left - 9;
          add(stages[i].id, [
            [a.left, a.y],
            [rail, a.y],
            [rail, b.y],
            [b.left - 2, b.y],
          ]);
        } else if (Math.abs(a.y - b.y) < 2) {
          const forward = b.x > a.x;
          add(stages[i].id, [
            [forward ? a.right : a.left, a.y],
            [forward ? b.left - 2 : b.right + 2, b.y],
          ]);
        } else {
          add(stages[i].id, [
            [a.x, a.bottom],
            [b.x, b.top - 2],
          ]);
        }
      });
      const address = bounds(board.querySelector('[data-decision="address"]'));
      const skip = bounds(board.querySelector('[data-decision="skip"]'));
      function branchIn(id, a, b) {
        if (compact) {
          add(
            id,
            [
              [b.x, a.bottom],
              [b.x, b.top - 2],
            ],
            true,
          );
        } else {
          const ty = Math.max(b.top + 18, Math.min(a.y, b.bottom - 18));
          const middle = (a.right + b.left) / 2;
          add(
            id,
            [
              [a.right, a.y],
              [middle, a.y],
              [middle, ty],
              [b.left - 2, ty],
            ],
            true,
          );
        }
      }
      function branchOut(id, a, b) {
        if (compact) {
          const rail = board.clientWidth - 7;
          add(
            id,
            [
              [a.right, a.y],
              [rail, a.y],
              [rail, b.y],
              [b.right + 2, b.y],
            ],
            true,
          );
        } else {
          const lane = a.left - (a.left - b.right) * 0.3;
          const sy = a.bottom - 14,
            ty = b.top + 12;
          add(
            id,
            [
              [a.left, sy],
              [lane, sy],
              [lane, ty],
              [b.right + 2, ty],
            ],
            true,
          );
        }
      }
      branchIn("config-address", boxes[1], address);
      // Liability without property collects the address on the data step.
      const data = boxes[2];
      if (compact) {
        add(
          "data-address",
          [
            [address.x, data.top],
            [address.x, address.bottom + 2],
          ],
          true,
        );
      } else {
        const y = data.top - 9,
          x = address.left + 18;
        add(
          "data-address",
          [
            [data.right - 16, data.top],
            [data.right - 16, y],
            [x, y],
            [x, address.bottom + 2],
          ],
          true,
        );
      }
      branchIn("data-skip", boxes[2], skip);
      branchOut("skip-checkout", skip, boxes[4]);
      const paperNode = board.querySelector('[data-decision="paper"]');
      if (paperNode) {
        const paper = bounds(paperNode);
        branchIn("checkout-paper", boxes[4], paper);
        branchOut("paper-payment", paper, boxes[6]);
      }
      setLines(paths);
    };
    const obs = new ResizeObserver(update);
    obs.observe(board);
    for (const n of board.querySelectorAll("[data-stage],[data-decision]"))
      obs.observe(n);
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

export function ProductJourney({ initialStep, initialChannel, onMap }) {
  const initial = readSelection(initialStep, initialChannel);
  const [selection, setSelection] = useState(initial);
  const [all, setAll] = useState(false);
  const { id, channel } = selection;
  const active = stageFor.get(id);
  const board = useRef(null),
    details = useRef(null);
  const marker = "journey-line-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const lines = useConnections(board, channel);
  function select(nextId, nextChannel = channel, map = false) {
    setSelection({ id: nextId, channel: nextChannel });
    history.replaceState(
      history.state,
      "",
      productLink(nextId, nextChannel, map),
    );
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
    if (initial.id !== initialStep) {
      history.replaceState(
        history.state,
        "",
        productLink(initial.id, initial.channel, onMap),
      );
    }
    const mapTarget =
      onMap &&
      [...board.current.querySelectorAll("[data-map-screen]")].find(
        (node) => node.dataset.mapScreen === initial.id,
      );
    const target =
      mapTarget ||
      (stageFor.get(initial.id)?.id === initial.id
        ? board.current?.querySelector('[data-stage="' + initial.id + '"]')
        : document.getElementById("case-" + initial.id));
    if (mapTarget) mapTarget.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start" });
  }, [initialStep, initial.id, initial.channel, onMap]);
  const selectedGroups = all ? stages : [active];
  return (
    <figure className="product-journey" aria-labelledby="product-journey-title">
      <figcaption className="product-map-heading">
        <div>
          <h2 id="product-journey-title">Путь оформления</h2>
          <p>
            Сплошные стрелки показывают основной путь, пунктирные — развилки.
            Выберите канал, чтобы открыть его экраны и требования.
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
      <div className="product-map-board" data-channel={channel} ref={board}>
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
          {lines.map(({ id, points, branch }) => (
            <polyline
              key={id}
              data-edge={id}
              className={branch ? "branch-line" : ""}
              points={points.map((p) => p.join(",")).join(" ")}
              markerEnd={"url(#" + marker + ")"}
            />
          ))}
        </svg>
        {stages.map((stage, i) => {
          const decision = decisionFor(stage.id, channel);
          return (
            <React.Fragment key={stage.id}>
              <div
                className={
                  "product-stop" + (active.id === stage.id ? " active" : "")
                }
                data-stage={stage.id}
                style={{ gridArea: stage.id }}
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
                  {channel === "nib" && stage.id === "done"
                    ? "Дата начала защиты и документ клиента."
                    : stage.note}
                </p>
                <ScreenLinks
                  id={stage.id}
                  channel={channel}
                  onOpen={(next) => select(next)}
                />
              </div>
              {decision && (
                <Decision
                  decision={decision}
                  channel={channel}
                  select={select}
                />
              )}
            </React.Fragment>
          );
        })}
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
