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

const nodesById = new Map(fullGraph.nodes.map((n) => [n.id, n]));
const chaptersById = new Map(chapters.map((d) => [d.articleId, d]));

function measureDiagram(nodes, edges, available, sizer) {
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
    const boxes = nodes.map((node) => {
      const box = document.createElement("span");
      box.className = "diagram-node";
      box.style.width = boxWidth + "px";
      box.textContent = node.label;
      return box;
    });
    sizer.replaceChildren(...boxes);
    nodes.forEach((node, i) =>
      graph.setNode(node.id, {
        width: boxWidth,
        height: Math.max(50, boxes[i].offsetHeight + 4),
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

function Diagram({
  title,
  summary,
  nodes,
  edges,
  source,
  initial,
  emphasis,
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
  const names = new Map(nodes.map((n) => [n.id, n.label]));
  const connected = edges.filter(
    (e) => e.from === selected.id || e.to === selected.id,
  );
  return (
    <figure className="knowledge-figure" aria-labelledby={captionId}>
      <figcaption className="figure-heading">
        <h2 id={captionId}>{title}</h2>
        <p>{summary}</p>
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
          {drawing.nodes.map((n) => (
            <button
              key={n.id}
              type="button"
              className={"diagram-node" + (n.id === emphasis ? " is-hub" : "")}
              style={{
                width: n.width,
                height: n.height,
                left: n.x - n.width / 2,
                top: n.y - n.height / 2,
              }}
              aria-pressed={selected.id === n.id}
              onClick={() => setPicked(n.id)}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>
      <div className="diagram-detail" aria-live="polite">
        <div>
          <h3>{selected.label}</h3>
          {selected.note && <p>{selected.note}</p>}
          {selected.href && <a href={selected.href}>Открыть карточку</a>}
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
export function ArticleDiagram({ id }) {
  if (id === "m7") return <CompositionChart />;
  const d = chaptersById.get(id);
  return d ? <Diagram {...d} /> : null;
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
