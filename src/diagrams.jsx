import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Graph as LayoutGraph, layout } from "@dagrejs/dagre";
import chapters from "./data/article-diagrams.json";
import fullGraph from "./data/full-graph.json";
import "./diagrams.css";
import {
  stepsByArticle,
  commonStates,
  channelStateGroup,
} from "./screen-evidence";

const nodesById = new Map(fullGraph.nodes.map((n) => [n.id, n]));
const chaptersById = new Map(chapters.map((d) => [d.articleId, d]));

function measureDiagram(nodes, edges, available, sizer) {
  const measuring = document.createElement("canvas").getContext("2d");
  measuring.font = "600 14px Arial";
  const words = nodes.map(
    (n) =>
      Math.ceil(
        Math.max(
          ...n.label.split(/\s+/).map((w) => measuring.measureText(w).width),
        ),
      ) + 26,
  );
  function measure(direction, boxWidth) {
    const graph = new LayoutGraph({ multigraph: true });
    graph.setGraph({
      rankdir: direction,
      ranksep: direction === "LR" ? 29 : 28,
      nodesep: 15,
      marginx: 12,
      marginy: 15,
    });
    graph.setDefaultEdgeLabel(() => ({}));
    const boxes = nodes.map((node, i) => {
      const box = document.createElement("span");
      box.className = "diagram-node";
      box.style.width =
        (words[i] > boxWidth && words[i] <= boxWidth + 14
          ? words[i]
          : boxWidth) + "px";
      box.textContent = node.label;
      return box;
    });
    sizer.replaceChildren(...boxes);
    nodes.forEach((node, i) =>
      graph.setNode(node.id, {
        width: boxes[i].offsetWidth,
        height:
          Math.max(50, boxes[i].offsetHeight + 4) +
          (node.targets?.length ? 32 : 0),
      }),
    );
    edges.forEach((e, i) => graph.setEdge(e.from, e.to, {}, String(i)));
    layout(graph);
    return {
      ...graph.graph(),
      nodes: nodes.map((n) => ({ ...n, ...graph.node(n.id) })),
      edges: edges.map((e, i) => graph.edge(e.from, e.to, String(i)).points),
    };
  }
  const compact = available < 550;
  const wide = measure("LR", compact ? 122 : 148);
  if (wide.width <= available) return wide;
  // A single row still reads naturally on a narrow desktop column with slightly smaller boxes.
  if (!compact) {
    const tight = measure("LR", 115);
    if (tight.width <= available) return tight;
  }
  const twoAcross = Math.max(
    100,
    Math.min(140, Math.floor((available - 41) / 2)),
  );
  const tall = measure("TB", compact ? twoAcross : 155);
  if (compact && tall.width > available) {
    const twoRanks = measure(
      "LR",
      Math.max(98, Math.min(125, Math.floor((available - 55) / 2))),
    );
    if (twoRanks.width <= available) return twoRanks;
  }
  if (tall.width <= available || tall.width <= wide.width) return tall;
  return wide;
}

function rememberStep(event, target) {
  if (
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.button === 0
  ) {
    history.replaceState(history.state, "", target.returnHref);
  }
}
function EvidenceLink({ target }) {
  return (
    <a
      className="step-screen-link"
      href={target.href}
      onClick={(e) => rememberStep(e, target)}
    >
      <div className="step-image">
        <img src={target.src} alt="" loading="lazy" />
      </div>
      <div>
        <small>
          {target.channel} · {target.section}
        </small>
        <strong>{target.title}</strong>
        <p>{target.why}</p>
      </div>
    </a>
  );
}
function StepEvidence({ step }) {
  const [query, setQuery] = useState("");
  const first = step.targets.filter(
    (t, i, all) => all.findIndex((other) => other.channel === t.channel) === i,
  );
  const variants = step.targets.filter((t) => !first.includes(t));
  const terms = query.toLocaleLowerCase("ru").trim().split(/\s+/);
  const shown = variants.filter((t) =>
    terms.every((term) =>
      [t.title, t.why, t.channel, t.section, t.node]
        .join(" ")
        .toLocaleLowerCase("ru")
        .includes(term),
    ),
  );
  return (
    <section className="step-evidence">
      <h3>Экраны шага «{step.label}»</h3>
      <div className="evidence-grid">
        {first.map((t) => (
          <EvidenceLink key={t.id} target={t} />
        ))}
      </div>
      {variants.length > 0 && (
        <details className="evidence-states">
          <summary>Другие состояния и варианты · {variants.length}</summary>
          {variants.length > 5 && (
            <label>
              Поиск по состояниям и каналам
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Название, канал или ID фрейма"
              />
            </label>
          )}
          <div className="evidence-grid">
            {shown.map((t) => (
              <EvidenceLink key={t.id} target={t} />
            ))}
          </div>
          {!shown.length && <p>Совпадений нет.</p>}
        </details>
      )}
    </section>
  );
}
export function Diagram({
  title,
  summary,
  nodes,
  edges,
  source,
  initial,
  emphasis,
  scrollToInitial,
  footer,
}) {
  const [picked, setPicked] = useState(initial || nodes[0].id);
  const selected = nodes.find((n) => n.id === picked) || nodes[0];
  const wrapper = useRef(null);
  const [available, setAvailable] = useState(720);
  const marker = "relation-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const captionId = marker + "-caption";
  const sizer = useRef(null);
  const [drawing, setDrawing] = useState({
    nodes: [],
    edges: [],
    width: 0,
    height: 60,
  });
  useLayoutEffect(() => {
    const el = wrapper.current;
    let lastWidth = 0;
    const update = () => {
      const width = Math.max(100, Math.floor(el.clientWidth) - 4);
      if (width === lastWidth) return;
      lastWidth = width;
      setDrawing(measureDiagram(nodes, edges, width, sizer.current));
      sizer.current.replaceChildren();
      setAvailable(width);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [nodes, edges]);
  const revealed = useRef(false);
  useEffect(() => {
    if (!scrollToInitial || revealed.current || !drawing.nodes.length) return;
    const node = drawing.nodes.find((n) => n.id === initial);
    if (!node) return;
    revealed.current = true;
    const el = wrapper.current;
    el.scrollLeft = Math.max(0, node.x - el.clientWidth / 2);
    el.closest("figure")?.scrollIntoView({ block: "start" });
  }, [drawing, initial, scrollToInitial]);
  const names = new Map(nodes.map((n) => [n.id, n.label]));
  const connected = edges.filter(
    (e) => e.from === selected.id || e.to === selected.id,
  );
  return (
    <figure className="knowledge-figure" aria-labelledby={captionId}>
      <figcaption className="figure-heading">
        <h2 id={captionId}>{title}</h2>
        {summary && <p>{summary}</p>}
        {nodes.some((n) => n.targets?.length) && (
          <p className="diagram-instruction">
            Нажмите метку канала на схеме, чтобы открыть экран. Выберите сам
            шаг, чтобы увидеть его описание и варианты.
          </p>
        )}
      </figcaption>
      <div className="diagram-sizer" ref={sizer} aria-hidden="true" />
      {drawing.width > available + 4 && (
        <p className="diagram-pan">
          Прокрутите схему по горизонтали, чтобы увидеть все узлы.
        </p>
      )}
      <div
        className="diagram-surface"
        ref={wrapper}
        role="group"
        aria-label="Интерактивная схема связей"
      >
        <div
          className="diagram-stage"
          style={{ width: drawing.width, height: drawing.height }}
        >
          <svg width={drawing.width} height={drawing.height} aria-hidden="true">
            <defs>
              <marker
                id={marker}
                viewBox="0 0 10 10"
                markerWidth="7"
                markerHeight="7"
                refX="9"
                refY="5"
                orient="auto-start-reverse"
              >
                <path
                  d="M1 1L9 5L1 9"
                  fill="none"
                  stroke="context-stroke"
                  strokeWidth="1.7"
                />
              </marker>
            </defs>
            {drawing.edges.map((points, i) => (
              <polyline
                key={i}
                className={connected.includes(edges[i]) ? "linked" : ""}
                points={points.map((p) => p.x + "," + p.y).join(" ")}
                markerEnd={"url(#" + marker + ")"}
              />
            ))}
          </svg>
          {drawing.nodes.map((n) => {
            const bounds = {
              width: n.width,
              height: n.height,
              left: n.x - n.width / 2,
              top: n.y - n.height / 2,
            };
            const shortcuts = (n.targets || []).filter(
              (t, i, all) =>
                all.findIndex((other) => other.channel === t.channel) === i,
            );
            const button = (
              <button
                key={n.id}
                data-node={n.id}
                type="button"
                className={
                  "diagram-node" + (n.id === emphasis ? " is-hub" : "")
                }
                style={shortcuts.length ? undefined : bounds}
                aria-pressed={selected.id === n.id}
                onClick={() => setPicked(n.id)}
              >
                {n.label}
              </button>
            );
            if (!shortcuts.length) return button;
            return (
              <div
                key={n.id}
                className={
                  "diagram-linked-node" +
                  (selected.id === n.id ? " selected" : "")
                }
                style={bounds}
              >
                {button}
                <div className="diagram-jumps">
                  {shortcuts.map((t) => (
                    <a
                      key={t.channel}
                      href={t.href}
                      onClick={(e) => rememberStep(e, t)}
                      aria-label={t.channel + " · " + t.title + " · " + n.label}
                    >
                      {t.channel}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="diagram-detail" aria-live="polite">
        <div>
          {selected.lane && (
            <small className="role-label">{selected.lane}</small>
          )}
          <h3>{selected.label}</h3>
          {selected.note && <p>{selected.note}</p>}
          {selected.href && <a href={selected.href}>Открыть карточку</a>}
          {!!selected.participants?.length && (
            <div className="process-records">
              {selected.participants.map((n) => (
                <a key={n.id} href={"#/" + n.catalog + "/" + n.index}>
                  {n.label}
                </a>
              ))}
            </div>
          )}
        </div>
        {!!connected.length && (
          <ul>
            {connected.map((e, i) => (
              <li key={i}>
                <span>{e.label}</span>
                <b>
                  {names.get(e.from)} → {names.get(e.to)}
                </b>
              </li>
            ))}
          </ul>
        )}
      </div>
      {!!selected.targets?.length && (
        <StepEvidence key={selected.id} step={selected} />
      )}
      {footer}
      {source && (
        <a
          className="diagram-source"
          href={source.url}
          target="_blank"
          rel="noreferrer"
        >
          {source.title} ↗
        </a>
      )}
    </figure>
  );
}

const catalogueSections = [
  [
    "operations",
    "Операции",
    "110 строк из архитектурного описания и 110 из пяти реестров",
  ],
  ["systems", "Системы и компоненты", "60 систем и модулей, 49 компонентов"],
  [
    "subjects",
    "Данные, процессы и документы",
    "39 объектов данных, 9 процессов, 3 продукта, 3 сервиса и 6 документов",
  ],
];
function CompositionChart() {
  const scale = Math.max(
    ...catalogueSections.map(
      ([k]) => fullGraph.nodes.filter((n) => n.catalog === k).length,
    ),
  );
  return (
    <figure className="knowledge-figure composition">
      <figcaption className="figure-heading">
        <h2>Из чего состоит документальная модель</h2>
        <p>
          Каждая из {fullGraph.nodes.length} записей входит в один каталог.
          Операция из разных источников может встречаться дважды.
        </p>
      </figcaption>
      {catalogueSections.map(([key, title, detail]) => {
        const count = fullGraph.nodes.filter((n) => n.catalog === key).length;
        return (
          <a key={key} href={"#/" + key}>
            <div>
              <strong>{title}</strong>
              <b>{count}</b>
            </div>
            <div className="bar-track">
              <i style={{ width: (100 * count) / scale + "%" }} />
            </div>
            <small>{detail}</small>
          </a>
        );
      })}
      <a className="diagram-source" href="#/graph/full">
        Открыть полную 3D-карту →
      </a>
    </figure>
  );
}
function CommonChannelStates({ reveal }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reveal) {
      ref.current.open = true;
      ref.current.scrollIntoView({ block: "start" });
    }
  }, [reveal]);
  return (
    <details className="step-evidence common-channel-states" ref={ref}>
      <summary>
        {channelStateGroup.title} · {commonStates.length}
      </summary>
      <p>
        Оба сообщения относятся к оформлению ДМС в интернет-банке. На экране
        видны причина прерывания и действие для повтора.
      </p>
      <div className="evidence-grid">
        {commonStates.map((t) => (
          <EvidenceLink key={t.id} target={t} />
        ))}
      </div>
    </details>
  );
}
export function ArticleDiagram({ id, step }) {
  if (id === "m7") return <CompositionChart />;
  const d = chaptersById.get(id);
  if (!d) return null;
  const nodes = stepsByArticle.get(id);
  const initial = nodes.find((n) => n.id === step)?.id;
  return (
    <Diagram
      key={id + "-" + (initial || "")}
      {...d}
      nodes={nodes}
      initial={initial}
      scrollToInitial={Boolean(initial)}
      footer={
        id === channelStateGroup.article && (
          <CommonChannelStates reveal={step === channelStateGroup.id} />
        )
      }
    />
  );
}

function neighboursFor(node) {
  const neighbours = new Map();
  for (const e of fullGraph.edges) {
    if (e.source !== node.id && e.target !== node.id) continue;
    const id = e.source === node.id ? e.target : e.source;
    if (!neighbours.has(id)) neighbours.set(id, []);
    neighbours.get(id).push({ from: e.source, to: e.target, label: e.label });
  }
  return [...neighbours.entries()];
}
export function Neighbourhood({ node }) {
  const narrow = "(max-width: 600px)";
  const [pageSize, setPageSize] = useState(() =>
    matchMedia(narrow).matches ? 2 : 4,
  );
  const [page, setPage] = useState(0);
  useEffect(() => {
    const media = matchMedia(narrow);
    const resize = () => {
      setPageSize(media.matches ? 2 : 4);
      setPage(0);
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  const neighbours = useMemo(() => neighboursFor(node), [node]);
  const portion = useMemo(
    () => neighbours.slice(page * pageSize, (page + 1) * pageSize),
    [neighbours, page, pageSize],
  );
  const nodes = useMemo(
    () =>
      [node, ...portion.map(([id]) => nodesById.get(id))].map((n) => ({
        id: n.id,
        label: n.label,
        note: n.description,
        href: n.id === node.id ? null : "#/" + n.catalog + "/" + n.index,
      })),
    [node, portion],
  );
  const edges = useMemo(() => portion.flatMap(([, items]) => items), [portion]);
  if (!edges.length)
    return (
      <section className="knowledge-figure figure-heading">
        <h2>Связи в исходной модели</h2>
        <p>Для этой записи в графе не указаны входящие или исходящие связи.</p>
      </section>
    );
  const totalPages = Math.ceil(neighbours.length / pageSize);
  return (
    <Diagram
      key={node.id + "-" + page}
      title="Связи в исходной модели"
      summary="Стрелки повторяют направление записи в источнике. Выберите участника, чтобы прочитать его роль и перейти в его карточку."
      nodes={nodes}
      edges={edges}
      initial={node.id}
      emphasis={node.id}
      footer={
        <div className="neighbour-pager">
          <span>
            Связанные записи · {page * pageSize + 1}–
            {Math.min((page + 1) * pageSize, neighbours.length)} из{" "}
            {neighbours.length}
          </span>
          {totalPages > 1 && (
            <div>
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={!page}
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page + 1 >= totalPages}
              >
                Дальше
              </button>
            </div>
          )}
        </div>
      }
    />
  );
}
