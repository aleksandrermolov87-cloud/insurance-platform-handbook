import React, { useState } from "react";
import model from "./data/model.json";
import space from "./data/space.json";
import pages from "./data/pages.json";
import systems from "./data/systems.json";
import ops from "./data/operations.json";
import subjects from "./data/subjects.json";
import fullGraph from "./data/full-graph.json";
import requirements from "./data/requirements.json";
import screens from "./data/screens.json";
import frameIndex from "./data/screen-index.json";
import {
  Title,
  Filter,
  Action,
  Empty,
  Sources,
  matches,
  searchable,
} from "./shared";
export const library = [
  ...space.map((a, i) => ({
    ...a,
    id: "s" + i,
    area: "Функциональные модули",
  })),
  ...model.map((a, i) => ({ ...a, id: "m" + i, area: "Архитектура" })),
  ...pages.map((a, i) => ({ ...a, id: "p" + i, area: "Пространство" })),
];
export function Articles({ category = "Функциональные модули" }) {
  const [q, setQ] = useState("");
  const rows = library.filter(
    (a) => a.area === category && matches(searchable(a), q),
  );
  const copy = {
    "Функциональные модули":
      "Что происходит с заявкой от выбора программы до выпуска полиса, как проходят сверки и где у целевых сценариев остаются открытые вопросы.",
    Архитектура:
      "Кто отвечает за каждую стадию оформления, какие данные нужны следующему участнику и где расходятся документальные источники.",
    Пространство:
      "Материалы раздела «Цифровое страхование» и связанных рабочих страниц. Для каждой темы доступны содержание, статус и ссылка на первоисточник.",
  };
  return (
    <>
      <Title context="Модель платформы" title={category}>
        {copy[category]}
      </Title>
      {category === "Архитектура" && (
        <div className="buttons">
          <Action primary href="#/graph">
            Исследовать 3D-карту
          </Action>
          <Action href="#/operations">Реестр операций</Action>
        </div>
      )}
      <Filter value={q} change={setQ} label="Поиск по описаниям" />
      <p className="count">Материалов · {rows.length}</p>
      <div className="article-list">
        {rows.map((a) => (
          <a key={a.id} href={"#/article/" + a.id}>
            <h2>{a.title}</h2>
            <p>{a.summary}</p>
            <span>Разделов · {a.sections.length}</span>
          </a>
        ))}
      </div>
      {!rows.length && <Empty />}
    </>
  );
}
const related = {
  s0: ["sfa-8290-19870", "sfa-6082-60020", "sfa-9785-46407"],
  s1: ["nib-8284-119994", "nib-8412-137412", "nib-8284-134365"],
  s2: ["sfa-5774-40312", "sfa-5774-40594", "nib-8284-123273"],
  s4: ["nib-8412-144750", "sfa-9282-35328"],
  s5: ["sfa-9785-46407", "nib-8304-160664"],
  s6: ["sfa-9746-46280", "sfa-5774-42435", "nib-8153-151301"],
  s7: ["nib-8412-159657", "nib-8284-134365", "nib-8284-136988"],
  m0: ["sfa-6082-60020", "sfa-9282-35328", "sfa-5774-42444"],
  m1: ["sfa-8290-19870", "sfa-9282-35058", "sfa-6128-86663"],
  m2: ["sfa-9282-35328", "nib-8412-144750"],
  m4: ["sfa-9282-36157", "sfa-9746-46280", "nib-8284-132984"],
  m5: ["nib-8412-159657", "nib-8284-136988"],
};
function RelatedScreens({ id }) {
  const rows = (related[id] || [])
    .map((key) => screens.find((s) => s.id === key))
    .filter(Boolean);
  if (!rows.length) return null;
  return (
    <section className="related">
      <h2>Как это выглядит в интерфейсе</h2>
      <div className="screen-grid">
        {rows.map((s) => (
          <a href={"#/screens/" + s.channel + "/" + s.id} key={s.id}>
            <div className="screen-preview">
              <img src={s.src} loading="lazy" alt="" />
            </div>
            <small>
              {s.channel === "sfa" ? "SFA" : "НИБ"} · {s.stage}
            </small>
            <h3>{s.title}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}
export function Article({ id }) {
  const a = library.find((a) => a.id === id);
  if (!a) return <Empty />;
  const path =
    id[0] === "s" ? "modules" : id[0] === "m" ? "architecture" : "space";
  return (
    <>
      <a className="backlink" href={"#/" + path}>
        {a.area}
      </a>
      <Title context={a.area} title={a.title}>
        {a.summary}
      </Title>
      <div className="article-body">
        {a.sections.map((s, i) => (
          <section key={i}>
            <h2>{s.title}</h2>
            {s.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </section>
        ))}
      </div>
      <RelatedScreens id={id} />
      <Sources items={a.sources} />
    </>
  );
}
export function Catalog({ kind, id }) {
  const system = kind !== "operations";
  const original = kind === "subjects" ? subjects : system ? systems : ops;
  const [q, sq] = useState(""),
    [type, st] = useState("");
  const typeKey = system ? "kind" : "status";
  const types = [...new Set(original.map((o) => o[typeKey]))];
  const rows = original
    .map((o, i) => ({ ...o, id: i }))
    .filter((o) => (!type || o[typeKey] === type) && matches(searchable(o), q));
  const record = id !== undefined ? original[Number(id)] : null;
  const node =
    record &&
    fullGraph.nodes.find((n) => n.catalog === kind && n.index === Number(id));
  const title =
    kind === "subjects"
      ? "Данные, процессы и продукты"
      : system
        ? "Системы и компоненты"
        : "Реестр операций";
  if (record)
    return (
      <>
        <a className="backlink" href={"#/" + kind}>
          {title}
        </a>
        <Title context={record[typeKey]} title={record.title}>
          {record.summary}
        </Title>
        <dl className="facts">
          <div>
            <dt>Источник</dt>
            <dd>{record.source}</dd>
          </div>
          {record.location && (
            <div>
              <dt>Где найти</dt>
              <dd>{record.location}</dd>
            </div>
          )}
          {record.status && (
            <div>
              <dt>Статус в документе</dt>
              <dd>{record.status}</dd>
            </div>
          )}
        </dl>
        <div className="buttons">
          {node && (
            <Action href={"#/graph/full/" + node.id}>
              Показать узел на карте
            </Action>
          )}
          <Action href="#/architecture">Архитектура</Action>
        </div>
      </>
    );
  return (
    <>
      <Title context="Каталог архитектуры" title={title}>
        {kind === "subjects"
          ? "Предметы данных, процессы, продукты, сервисы и первоисточники. Вместе с каталогом систем и реестром операций этот раздел охватывает все 389 исходных узлов."
          : system
            ? "Назначение систем и компонентов из архитектурного описания и пяти реестров интеграций. Записи источников сохранены раздельно."
            : "110 строк архитектуры и 110 строк из пяти реестров интеграций. Одинаковое действие может встречаться в обоих источниках. Статусы относятся к документам на дату среза."}
      </Title>
      <Filter
        label="Поиск по названию, назначению или источнику"
        value={q}
        change={sq}
      />
      <div className="filters">
        <label>
          {system ? "Тип объекта" : "Статус"}
          <select value={type} onChange={(e) => st(e.target.value)}>
            <option value="">Все варианты</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <p className="count">Записей · {rows.length}</p>
      </div>
      <div className="catalog">
        <div className="catalog-head">
          <span>{system ? "Объект / назначение" : "Операция / источник"}</span>
          <span>{system ? "Тип" : "Статус"}</span>
        </div>
        {rows.map((o) => (
          <a key={o.id} href={"#/" + kind + "/" + o.id}>
            <div>
              <b>{o.title}</b>
              <p>{o.summary || [o.source, o.location].join(" · ")}</p>
            </div>
            <small>{o[typeKey]}</small>
          </a>
        ))}
      </div>
      {!rows.length && <Empty />}
    </>
  );
}
const searchData = [
  ...frameIndex
    .filter((s) => !s.illustrated)
    .map((s) => [
      s.title,
      "Указатель Figma · " + s.section,
      "frames/" + s.channel + "/" + s.node,
      searchable(s),
    ]),
  ...library.map((a) => [a.title, a.area, "article/" + a.id, searchable(a)]),
  ...systems.map((s, i) => [
    s.title,
    "Система или компонент",
    "systems/" + i,
    searchable(s),
  ]),
  ...subjects.map((s, i) => [s.title, s.kind, "subjects/" + i, searchable(s)]),
  ...ops.map((o, i) => [o.title, o.source, "operations/" + i, searchable(o)]),
  ...requirements.map((p) => [
    p.title,
    "Требования v1.5 · стр. " + p.page,
    "requirements/" + p.page,
    searchable(p),
  ]),
  ...screens.map((s) => [
    s.title,
    "Экраны " + (s.channel === "sfa" ? "SFA" : "НИБ"),
    "screens/" + s.channel + "/" + s.id,
    searchable(s),
  ]),
];
export function Search({ term }) {
  const results = term ? searchData.filter((r) => matches(r[3], term)) : [];
  return (
    <>
      <Title context="Справочник" title="Поиск по платформе">
        Поиск охватывает описания, функциональные модули, операции,
        дизайн-макеты и текст требований.
      </Title>
      <form
        className="search-page"
        onSubmit={(e) => {
          e.preventDefault();
          const query = e.currentTarget.elements.query.value.trim();
          location.hash = "/search?q=" + encodeURIComponent(query);
        }}
      >
        <input
          name="query"
          type="search"
          defaultValue={term}
          key={term}
          placeholder="Например, подписание"
          aria-label="Поисковый запрос"
        />
        <Action type="submit" primary>
          Найти
        </Action>
      </form>
      {term && (
        <>
          <p className="count">Совпадений · {results.length}</p>
          <div className="search-results">
            {results.map(([t, label, path]) => (
              <a key={path} href={"#/" + path}>
                <small>{label}</small>
                <b>{t}</b>
              </a>
            ))}
          </div>
          {!results.length && <Empty />}
        </>
      )}
    </>
  );
}
