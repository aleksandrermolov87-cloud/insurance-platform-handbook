import React, { useEffect, useRef, useState } from "react";
import graph from "./data/graph.json";
import { Action, Title, spaceUrl } from "./shared";
import fullGraph from "./data/full-graph.json";
import counts from "./data/counts.json";
const colors = [
  "#dd3026",
  "#277660",
  "#2f5683",
  "#946411",
  "#82547c",
  "#586773",
  "#016d81",
  "#ac4823",
  "#5a5985",
  "#566226",
];
function prepare(data) {
  const { nodes, edges } = data;
  const groups = [...new Set(nodes.map((n) => n.group))];
  const locations = new Map();
  groups.forEach((g, gi) => {
    const members = nodes.filter((n) => n.group === g),
      a = (gi * Math.PI * 2) / groups.length;
    members.forEach((n, j) => {
      const dense = members.length > 15;
      const b = dense ? j * 2.399963 : (j * 2 * Math.PI) / members.length;
      const radius = dense ? Math.sqrt((j + 0.5) / members.length) * 0.67 : 0.5;
      locations.set(n.id, [
        Math.cos(a) * 1.25 + Math.cos(b) * radius,
        Math.sin(a) * 0.87 + Math.sin(b) * radius * 0.84,
        Math.cos(b * 2 + gi) * 0.48,
      ]);
    });
  });
  return { nodes, edges, groups, locations };
}
const simple = prepare(graph),
  full = prepare(fullGraph);
function draw(canvas, angles, zoom, selected, group, data) {
  const { nodes, edges, groups, locations } = data;
  const dense = nodes.length > 100;
  const parent = canvas.parentElement;
  const w = parent.clientWidth,
    h = parent.clientHeight,
    dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const scale = Math.min(w / 4.15, h / 3.2) * zoom;
  const [ax, ay] = angles;
  const visible = nodes.filter((n) => !group || n.group === group);
  const ids = new Set(visible.map((n) => n.id));
  const near = new Set([
    selected,
    ...edges
      .filter((e) => e.source === selected || e.target === selected)
      .flatMap((e) => [e.source, e.target]),
  ]);
  const points = new Map();
  visible.forEach((n) => {
    const [x, y, z] = locations.get(n.id);
    const rx = x * Math.cos(ax) + z * Math.sin(ax),
      rz = -x * Math.sin(ax) + z * Math.cos(ax);
    const ry = y * Math.cos(ay) - rz * Math.sin(ay),
      depth = y * Math.sin(ay) + rz * Math.cos(ay),
      p = 4.6 / (4.6 - depth * 0.42);
    points.set(n.id, {
      x: w / 2 + rx * scale * p,
      y: h / 2 + ry * scale * p,
      z: depth,
      p,
    });
  });
  edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .forEach((e) => {
      const a = points.get(e.source),
        b = points.get(e.target);
      const active = e.source === selected || e.target === selected;
      ctx.strokeStyle = active ? "#ba332c" : "#b2b7bc";
      ctx.globalAlpha = active ? 0.9 : dense ? 0.18 : 0.48;
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      if (active) {
        const t = 0.78,
          ang = Math.atan2(b.y - a.y, b.x - a.x),
          x = a.x + (b.x - a.x) * t,
          y = a.y + (b.y - a.y) * t;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 7 * Math.cos(ang - 0.44), y - 7 * Math.sin(ang - 0.44));
        ctx.lineTo(x - 7 * Math.cos(ang + 0.44), y - 7 * Math.sin(ang + 0.44));
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      }
    });
  const ordered = visible
    .slice()
    .sort((a, b) => points.get(a.id).z - points.get(b.id).z);
  ordered.forEach((n) => {
    const p = points.get(n.id),
      active = n.id === selected;
    ctx.globalAlpha = near.has(n.id) ? 1 : 0.78;
    ctx.beginPath();
    ctx.arc(p.x, p.y, (active ? 10 : dense ? 3.5 : 6) * p.p, 0, Math.PI * 2);
    ctx.fillStyle = colors[groups.indexOf(n.group) % colors.length];
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  const sn = nodes.find((n) => n.id === selected),
    s = points.get(selected);
  if (s) {
    const str = sn.label;
    ctx.font = "600 13px Arial";
    const tw = ctx.measureText(str).width + 14;
    const x = Math.max(2, Math.min(w - tw - 2, s.x - tw / 2)),
      y = Math.max(4, s.y - 38);
    ctx.fillStyle = "#242528";
    ctx.fillRect(x, y, tw, 23);
    ctx.fillStyle = "white";
    ctx.fillText(str, x + 7, y + 16);
  }
  return points;
}
export function Graph({ mode, initialNode }) {
  const data = mode === "full" && full.nodes.length ? full : simple;
  const { nodes, edges, groups } = data;
  const canvas = useRef(null),
    camera = useRef([0.05, -0.16]),
    pointer = useRef(null),
    hit = useRef(new Map());
  const [angleVersion, refresh] = useState(0),
    [zoom, sz] = useState(1),
    [group, sg] = useState(""),
    [selected, ss] = useState(
      nodes.some((n) => n.id === initialNode)
        ? initialNode
        : data === simple
          ? "crm"
          : nodes[0].id,
    );
  const visible = nodes.filter((n) => !group || n.group === group);
  const pick = (id) => {
    ss(id);
    if (group && nodes.find((n) => n.id === id)?.group !== group) sg("");
  };
  const current = nodes.find((n) => n.id === selected) || nodes[0];
  const related = edges.filter(
    (e) => e.source === selected || e.target === selected,
  );
  useEffect(() => {
    const el = canvas.current;
    const render = () => {
      hit.current = draw(el, camera.current, zoom, selected, group, data);
    };
    const obs = new ResizeObserver(render);
    obs.observe(el.parentElement);
    render();
    return () => obs.disconnect();
  }, [zoom, selected, group, angleVersion]);
  function down(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointer.current = {
      x: e.clientX,
      y: e.clientY,
      initial: [...camera.current],
      moved: false,
    };
  }
  function move(e) {
    const p = pointer.current;
    if (!p) return;
    const dx = e.clientX - p.x,
      dy = e.clientY - p.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      p.moved = true;
      camera.current = [p.initial[0] + dx / 135, p.initial[1] + dy / 150];
      refresh((x) => x + 1);
    }
  }
  function up(e) {
    const p = pointer.current;
    if (!p) return;
    pointer.current = null;
    if (!p.moved) {
      const rect = canvas.current.getBoundingClientRect();
      const close = [...hit.current]
        .map(([id, c]) => [
          id,
          Math.hypot(e.clientX - rect.left - c.x, e.clientY - rect.top - c.y),
        ])
        .sort((a, b) => a[1] - b[1]);
      if (close[0]?.[1] < 20) pick(close[0][0]);
    }
  }
  return (
    <>
      <Title context="Архитектура" title="3D-карта платформы">
        Выберите узел, чтобы увидеть его назначение и связанные действия.
        Вращайте схему мышью или пальцем. Те же узлы доступны в списке.
      </Title>
      <div className="buttons">
        <Action primary={data === simple} href="#/graph">
          Функциональная карта · 42
        </Action>
        <Action primary={data === full} href="#/graph/full">
          Полная модель · 389
        </Action>
      </div>
      <p className="muted">
        {data === full
          ? "Все 389 записей и 901 связь. Для 417 связей сохранена исходная предметная роль. Ещё 484 связи укрупнены до документа или функциональной области и помечены «обобщено»."
          : "Краткая карта бизнес-процесса. Подпись выбранной связи объясняет действие между участниками."}
      </p>
      <div className="graph-filters">
        <label>
          Область
          <select
            value={group}
            onChange={(e) => {
              sg(e.target.value);
              if (e.target.value && current.group !== e.target.value)
                ss(nodes.find((n) => n.group === e.target.value).id);
            }}
          >
            <option value="">Все области</option>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label>
          Узел
          <select value={selected} onChange={(e) => pick(e.target.value)}>
            {visible.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="graph-box">
        <div className="graph-canvas">
          <canvas
            ref={canvas}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              pointer.current = null;
            }}
            role="img"
            aria-label="Пространственная схема систем и бизнес-действий"
          />
        </div>
        <div className="graph-tools">
          <Action
            aria-label="Приблизить"
            onClick={() => sz(Math.min(data === full ? 3 : 1.9, zoom + 0.2))}
          >
            +
          </Action>
          <Action
            aria-label="Отдалить"
            onClick={() => sz(Math.max(0.6, zoom - 0.2))}
          >
            −
          </Action>
          <Action
            onClick={() => {
              camera.current = [0.05, -0.16];
              sz(1);
              refresh((x) => x + 1);
            }}
          >
            Сбросить вид
          </Action>
        </div>
      </div>
      <div className="legend">
        {groups.map((g, i) => (
          <span key={g}>
            <i style={{ background: colors[i % colors.length] }} />
            {g}
          </span>
        ))}
      </div>
      <div className="graph-detail">
        <span className="eyebrow">{current.group}</span>
        <h2>{current.label}</h2>
        <p>{current.description}</p>
        {current.catalog && (
          <a
            className="textlink"
            href={"#/" + current.catalog + "/" + current.index}
          >
            Карточка и источник записи
          </a>
        )}
        <ul>
          {related.map((e, i) => {
            const other = nodes.find(
              (n) => n.id === (e.source === selected ? e.target : e.source),
            );
            return (
              <li key={i}>
                {e.source === selected ? (
                  <>
                    {current.label} · {e.label} ·{" "}
                    <button onClick={() => pick(other.id)}>
                      {other.label}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => pick(other.id)}>
                      {other.label}
                    </button>{" "}
                    · {e.label} · {current.label}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="muted">
        Исходная документальная модель содержит 389 узлов и 901 связь. На
        функциональной карте выделены 42 объекта и 65 направленных действий. В
        каталоге операций каждая исходная строка архитектуры и реестров
        сохранена отдельно.
      </p>
      <div className="buttons">
        <Action href="#/systems">Каталог систем</Action>
        <Action href="#/operations">Все операции</Action>
        <Action href="#/article/m7">Паспорт модели</Action>
        <Action href={spaceUrl} target="_blank" rel="noreferrer">
          Первоисточник в Пространстве
        </Action>
      </div>
      <details className="coverage">
        <summary>Как распределены 901 связь</summary>
        <p>{counts.method}</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Область</th>
                <th>Архитектура</th>
                <th>Реестры</th>
                <th>Всего</th>
              </tr>
            </thead>
            <tbody>
              {counts.areas.map((a) => (
                <tr key={a.area}>
                  <td>{a.area}</td>
                  <td>{a.architecture}</td>
                  <td>{a.registers}</td>
                  <td>{a.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
