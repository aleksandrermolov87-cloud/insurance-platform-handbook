import React, { useState } from "react";
import fullGraph from "./data/full-graph.json";
import operations from "./data/operations.json";
import editorial from "./data/catalog-visuals.json";
import { stepsByArticle } from "./screen-evidence";
import { Diagram } from "./diagrams";
import "./catalog-visuals.css";

const model = new Map(fullGraph.nodes.map((n) => [n.id, n]));
const records = (ids) => ids.map((id) => model.get(id));
const href = (n) => "#/" + n.catalog + "/" + n.index;
function RecordLink({ node }) {
  return (
    <a className="record-link" href={href(node)}>
      {node.label}
    </a>
  );
}

const families = new Map(),
  parents = new Map();
for (const edge of fullGraph.edges.filter((e) => e.relation === "contains")) {
  if (!families.has(edge.source)) families.set(edge.source, []);
  if (!parents.has(edge.target)) parents.set(edge.target, []);
  families.get(edge.source).push(model.get(edge.target));
  parents.get(edge.target).push(model.get(edge.source));
}
const parentOrder = [...families.keys()].sort((a, b) =>
  model.get(a).label.localeCompare(model.get(b).label, "ru"),
);

function FamilyTree({ id, onDrill }) {
  const parentNodes = parents.get(id) || [];
  const children = families.get(id) || [];
  if (!parentNodes.length && !children.length) return null;
  return (
    <div className="family-tree">
      {parentNodes.length > 0 && (
        <div className="family-parents">
          <h4>Входит в состав</h4>
          {parentNodes.map((n) => (
            <RecordLink key={n.id} node={n} />
          ))}
        </div>
      )}
      <div className="family-core">
        <small>{model.get(id).group}</small>
        {onDrill ? (
          <RecordLink node={model.get(id)} />
        ) : (
          <strong>{model.get(id).label}</strong>
        )}
      </div>
      {!!children.length && (
        <div className="family-branches">
          <h4>Модули и компоненты</h4>
          <ul>
            {children.map((n) => (
              <li key={n.id}>
                <div>
                  <RecordLink node={n} />
                  {onDrill && families.has(n.id) && (
                    <button
                      type="button"
                      onClick={() => onDrill(n.id)}
                      aria-label={"Раскрыть состав " + n.label}
                    >
                      Раскрыть
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
function SystemExplorer() {
  const [picked, setPicked] = useState("s49");
  const featured = ["s49", "s53", "s27", "s55", "s56"];
  const [otherOpen, setOtherOpen] = useState(false);
  return (
    <section className="catalog-panel" id="catalog-overview" tabIndex="-1">
      <header>
        <h2>Как устроены системы</h2>
        <p>
          Выберите систему, чтобы увидеть входящие в неё модули. Название
          открывает карточку.
        </p>
      </header>
      <div className="visual-picks" aria-label="Системы">
        {featured.map((id) => (
          <button
            type="button"
            key={id}
            onClick={() => setPicked(id)}
            aria-pressed={id === picked}
          >
            {model.get(id).label}
          </button>
        ))}
        <button
          type="button"
          aria-expanded={otherOpen}
          onClick={() => setOtherOpen(!otherOpen)}
        >
          Другие системы
        </button>
      </div>
      {otherOpen && (
        <div className="other-systems">
          {parentOrder
            .filter((id) => !featured.includes(id))
            .map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={id === picked}
                onClick={() => {
                  setPicked(id);
                  setOtherOpen(false);
                }}
              >
                {model.get(id).label}
              </button>
            ))}
        </div>
      )}
      <FamilyTree id={picked} onDrill={setPicked} />
    </section>
  );
}
const phases = [
  ["Заявка", ["Заполнение заявки"]],
  ["Подготовка документов", ["Подготовка документов"]],
  [
    "Просмотр и подписание",
    ["Просмотр и подписание", "Просмотр документов и подписание"],
  ],
  ["Оплата премии", ["Оплата с расчётного счёта", "Оплата страховки"]],
  ["Финализация", ["Финализация"]],
  ["Сверка", ["Сверки со страховщиком"]],
  ["Общие функции канала", ["Общие функции канала"]],
];
const statuses = ["Описано в архитектуре", "Разработка", "Применение"];
const opsNodes = fullGraph.nodes.filter((n) => n.catalog === "operations");
const matrix = phases.map(([phase, labels]) => ({
  phase,
  cells: statuses.map((status) =>
    opsNodes
      .filter((n) => {
        const op = operations[n.index];
        return (
          op.status === status && labels.includes(op.source.split(" · ")[1])
        );
      })
      .map((n) => n.id),
  ),
}));
const highest = Math.max(
  ...matrix.flatMap((r) => r.cells.map((c) => c.length)),
);
function OperationsMatrix({ filter }) {
  return (
    <section className="catalog-panel" id="catalog-overview" tabIndex="-1">
      <header>
        <h2>Операции по этапам оформления</h2>
        <p>
          Число в ячейке открывает строки этого этапа и статуса. Один и тот же
          шаг может быть описан в двух источниках.
        </p>
      </header>
      <table className="ops-matrix">
        <caption className="visually-hidden">
          Число операций по этапам и документальным статусам
        </caption>
        <thead>
          <tr>
            <th scope="col">Этап</th>
            {["Архитектура", "Разработка", "Применение"].map((s) => (
              <th key={s} scope="col">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map(({ phase, cells }) => (
            <tr key={phase}>
              <th scope="row">{phase}</th>
              {cells.map((ids, i) => (
                <td key={statuses[i]}>
                  {ids.length ? (
                    <button
                      type="button"
                      aria-label={
                        phase + " · " + statuses[i] + " · " + ids.length
                      }
                      onClick={() => filter(phase + " · " + statuses[i], ids)}
                      style={{
                        "--weight": 0.08 + (ids.length / highest) * 0.37,
                      }}
                    >
                      {ids.length}
                    </button>
                  ) : (
                    <span aria-label="0">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
const processPhases = [
  ["Вход", ["b50"]],
  ["Анкета продукта", ["b51", "b52", "b53"]],
  ["Подготовка форм", ["b47", "b46"]],
  ["Подпись и оплата", ["b48", "b54"]],
  ["Финализация", ["b49"]],
];
function ProcessMap() {
  return (
    <section className="catalog-panel" id="catalog-overview" tabIndex="-1">
      <header>
        <h2>Карта девяти бизнес-процессов</h2>
        <p>
          Путь оформления через менеджера в архитектурном описании. В анкете
          выбирают продукт, а формы готовят по банковскому или партнёрскому
          варианту.
        </p>
      </header>
      <div className="process-route">
        {processPhases.map(([title, ids]) => (
          <section key={title}>
            <h3>{title}</h3>
            <div>
              {records(ids).map((n) => (
                <RecordLink key={n.id} node={n} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function RelationMap({ scene, title, summary, source }) {
  const nodes = scene.lanes.flatMap((l) =>
    records(l.nodeIds).map((n) => ({
      id: n.id,
      label: n.label,
      note: n.description,
      href: href(n),
      lane: l.title,
    })),
  );
  const edges = scene.edges.map((e) => ({
    from: e.source,
    to: e.target,
    label: e.label,
  }));
  return (
    <Diagram
      title={title}
      summary={summary}
      nodes={nodes}
      edges={edges}
      footer={<div className="visual-source">{source}</div>}
    />
  );
}
function ScenarioBrowser({ kind }) {
  const entries = editorial.catalogs[kind]?.scenes || [];
  const [choice, choose] = useState(0);
  const scene = entries[choice];
  if (!scene) return null;
  return (
    <section className="scenario-browser" id="catalog-scenes" tabIndex="-1">
      <h2>Схемы взаимодействий</h2>
      <div className="scene-menu">
        {entries.map((s, i) => (
          <button
            type="button"
            key={s.id}
            aria-pressed={i === choice}
            onClick={() => choose(i)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <RelationMap
        key={scene.id}
        scene={scene}
        title={scene.title}
        summary={scene.summary}
        source={scene.source}
      />
    </section>
  );
}
export function CatalogVisuals({ kind, filter, jump }) {
  const labels = {
    systems: "Состав систем",
    operations: "Этапы и статусы",
    subjects: "Карта процессов",
  };
  return (
    <>
      <nav className="catalog-jumps" aria-label="Навигация по каталогу">
        {[
          ["catalog-overview", labels[kind]],
          ["catalog-scenes", "Схемы взаимодействий"],
          ["catalog-records", "Список записей"],
        ].map(([id, title]) => (
          <button type="button" key={id} onClick={() => jump(id)}>
            {title}
          </button>
        ))}
      </nav>
      {kind === "systems" ? (
        <SystemExplorer />
      ) : kind === "operations" ? (
        <OperationsMatrix filter={filter} />
      ) : (
        <ProcessMap />
      )}
      <ScenarioBrowser kind={kind} />
    </>
  );
}
export function CatalogGroups({ kind, filter, selected }) {
  const groups = editorial.catalogs[kind]?.groups || [];
  return (
    <div className="catalog-groups" aria-label="Фильтр по теме">
      {groups.map((g) => (
        <button
          type="button"
          aria-pressed={selected === g.title}
          key={g.id}
          onClick={() => filter(g.title, g.nodeIds)}
        >
          {g.title} <b>{g.nodeIds.length}</b>
        </button>
      ))}
    </div>
  );
}

function OperationRoles({ node }) {
  const calls = fullGraph.edges.filter((e) => e.relation === "calls");
  const requesters = records(
    calls.filter((e) => e.target === node.id).map((e) => e.source),
  );
  const providers = records(
    calls.filter((e) => e.source === node.id).map((e) => e.target),
  );
  return (
    <section className="catalog-panel operation-roles">
      <header>
        <h2>Участники операции</h2>
      </header>
      <div className="role-route">
        <div>
          <h3>Запрашивает</h3>
          {requesters.map((n) => (
            <RecordLink key={n.id} node={n} />
          ))}
        </div>
        <div className="operation-center">
          <h3>Операция</h3>
          <strong>{node.label}</strong>
        </div>
        <div>
          <h3>Предоставляет</h3>
          {providers.map((n) => (
            <RecordLink key={n.id} node={n} />
          ))}
        </div>
      </div>
    </section>
  );
}
function ProcessFlow({ process, id, step }) {
  const [view, setView] = useState("flow");
  const nodes = stepsByArticle.get(id);
  const initial = nodes.find((n) => n.id === step)?.id;
  const edges = process.flow.map((e) => ({
    from: e.source,
    to: e.target,
    label: e.label,
  }));
  return (
    <section className="process-views">
      <div className="scene-menu" aria-label="Схемы процесса">
        <button
          type="button"
          aria-pressed={view === "flow"}
          onClick={() => setView("flow")}
        >
          Ход процесса
        </button>
        <button
          type="button"
          aria-pressed={view === "participants"}
          onClick={() => setView("participants")}
        >
          Участники процесса
        </button>
      </div>
      {view === "flow" ? (
        <Diagram
          key={id + ":" + (initial || "")}
          title="Ход процесса"
          nodes={nodes}
          edges={edges}
          initial={initial}
          scrollToInitial={Boolean(initial)}
          footer={
            <>
              <div className="process-io">
                {[
                  ["На входе", process.input],
                  ["Результат", process.output],
                ].map(([label, v]) => (
                  <div key={label}>
                    <h3>{label}</h3>
                    <p>{v}</p>
                  </div>
                ))}
              </div>
              <div className="visual-source">{process.source}</div>
            </>
          }
        />
      ) : (
        <RelationMap
          scene={process.participation}
          title="Участники процесса"
          summary={process.title}
          source={process.source}
        />
      )}
    </section>
  );
}
export function RecordVisuals({ node, step }) {
  if (node.catalog === "operations") return <OperationRoles node={node} />;
  if (editorial.processes[node.id])
    return (
      <ProcessFlow
        key={node.id + "-" + (step || "")}
        process={editorial.processes[node.id]}
        id={node.id}
        step={step}
      />
    );
  if (
    node.catalog === "systems" &&
    (families.has(node.id) || parents.has(node.id))
  )
    return (
      <section className="catalog-panel compact-family">
        <header>
          <h2>Место в составе системы</h2>
        </header>
        <FamilyTree id={node.id} />
      </section>
    );
  return null;
}
