import React, { useEffect, useRef, useState } from "react";
import screens from "./data/screens.json";
import frameIndex from "./data/screen-index.json";
import checks from "./data/design-check.json";
import {
  Title,
  Filter,
  Action,
  Empty,
  figma,
  matches,
  searchable,
} from "./shared";
export const channelName = { sfa: "SFA", nib: "НИБ" };
const channelInfo = {
  sfa: {
    title: "Экраны SFA",
    intro:
      "Рабочее место менеджера. Макеты страницы «Страхование» в файле «Нефинансовые сервисы».",
    group: "ЧЕК ПРОЙДЕН",
  },
  nib: {
    title: "Экраны НИБ",
    intro:
      "Интернет-банк для бизнеса. Макеты страницы «Витрина и оформление ДМС [27.10 – 11.11]» в файле «Альфа-Страхование».",
    group: "ДИЗАЙН-ЧЕК ПРОЙДЕН",
  },
};
function Zoom({ screen, close }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    return () => {
      d.close();
    };
  }, []);
  return (
    <dialog
      className="zoom"
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="zoom-bar">
        <b>{screen.title}</b>
        <Action onClick={close}>Закрыть</Action>
      </div>
      <div className="zoom-scroll">
        <img
          src={screen.src}
          alt={screen.title}
          style={{ minWidth: Math.min(screen.width || 1100, 1800) }}
        />
      </div>
    </dialog>
  );
}
export function Screens({ channel = "sfa", id }) {
  const [q, sq] = useState(""),
    [stage, ss] = useState(""),
    [zoom, sz] = useState(false);
  const info = channelInfo[channel] || channelInfo.sfa,
    all = screens.filter((s) => s.channel === channel);
  const stages = [...new Set(all.map((s) => s.stage))];
  const list = all.filter(
    (s) => (!stage || s.stage === stage) && matches(searchable(s), q),
  );
  const selected = all.find((s) => s.id === id);
  const variant =
    !selected &&
    frameIndex.find((f) => f.id === id && f.channel === channel && f.src);
  const item =
    selected ||
    (variant && {
      ...variant,
      stage: variant.section,
      caption: variant.reason,
      nodeId: variant.node,
      width: variant.imageWidth,
      height: variant.imageHeight,
    });
  if (item) {
    const ix = all.indexOf(item);
    return (
      <>
        <a className="backlink" href={"#/screens/" + channel}>
          Все экраны {channelName[channel]}
        </a>
        <Title
          context={`${channelName[channel]} · ${item.stage}`}
          title={item.title}
        >
          {item.caption}
        </Title>
        <div className="screen-focus">
          <button onClick={() => sz(true)} aria-label="Увеличить экран">
            <img
              src={item.src}
              alt={item.title}
              width={item.width}
              height={item.height}
            />
          </button>
        </div>
        <div className="buttons">
          <Action primary onClick={() => sz(true)}>
            Увеличить
          </Action>
          <Action href={item.url} target="_blank" rel="noreferrer">
            Фрейм в Figma
          </Action>
        </div>
        {item.details?.length > 0 && (
          <div className="reading">
            <h2>Что видно на экране</h2>
            <ul>
              {item.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="callout">
          <h3>Основание дизайн-чека</h3>
          <p>
            {item.evidence ||
              `Фрейм принадлежит странице в разделе «${info.group}».`}
          </p>
          <p className="meta">
            Узел {item.nodeId} · секция {item.sectionId} · сверено 27 ноября
            2026
          </p>
        </div>
        <div className="buttons pager">
          {ix > 0 && (
            <Action href={"#/screens/" + channel + "/" + all[ix - 1].id}>
              Предыдущий экран
            </Action>
          )}
          {ix >= 0 && ix + 1 < all.length && (
            <Action href={"#/screens/" + channel + "/" + all[ix + 1].id}>
              Следующий экран
            </Action>
          )}
        </div>
        {zoom && <Zoom screen={item} close={() => sz(false)} />}
      </>
    );
  }
  return (
    <>
      <Title context="Атлас интерфейсов" title={info.title}>
        {info.intro}
      </Title>
      <div className="channel-status">
        <span className="okmark">✓</span>
        <div>
          <b>Дизайн-чек пройден</b>
          <p>
            Страница находится в разделе «{info.group}». Проверено 27 ноября
            2026. {checks[channel].detail?.text}
          </p>
        </div>
        <a href={figma[channel]} target="_blank" rel="noreferrer">
          Страница Figma
        </a>
      </div>
      <div className="buttons">
        <Action primary href={"#/journey/" + channel}>
          Оформление ДМС по шагам
        </Action>
        <Action href={"#/frames/" + channel}>
          Все фреймы в Figma ·{" "}
          {frameIndex.filter((f) => f.channel === channel).length}
        </Action>
        <Action
          href={checks[channel].markerUrl}
          target="_blank"
          rel="noreferrer"
        >
          Метка дизайн-чека
        </Action>
        {checks[channel].detail?.url && (
          <Action
            href={checks[channel].detail.url}
            target="_blank"
            rel="noreferrer"
          >
            Карточка проверки
          </Action>
        )}
      </div>
      <p className="atlas-note">
        Демонстрационные реквизиты на изображениях скрыты. На отдельных фреймах
        сохранены линии переходов с холста Figma.
      </p>
      <details className="check-proof">
        <summary>Основание отбора экранов</summary>
        <p>
          {checks[channel].detail?.text} Порядок страниц и идентификаторы
          зафиксированы в исходном файле 27 ноября 2026 года.
        </p>
        <img
          src={"./screens/design-check-" + channel + ".png"}
          alt={
            "Выписка из Figma: начало группы, страница " +
            checks[channel].name +
            " и следующая группа."
          }
          loading="lazy"
        />
      </details>
      <Filter label="Найти экран или состояние" value={q} change={sq} />
      <div className="filters">
        <label>
          Сценарий
          <select value={stage} onChange={(e) => ss(e.target.value)}>
            <option value="">Все сценарии</option>
            {stages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <p className="count">Экранов · {list.length}</p>
      </div>
      <div className="screen-grid">
        {list.map((s) => (
          <a href={"#/screens/" + channel + "/" + s.id} key={s.id}>
            <div className="screen-preview">
              <img src={s.src} loading="lazy" alt="" />
            </div>
            <small>{s.stage}</small>
            <h3>{s.title}</h3>
            <p>{s.caption}</p>
          </a>
        ))}
      </div>
      {!list.length && <Empty />}
    </>
  );
}

export function FrameIndex({ channel, initial }) {
  const [query, setQuery] = useState(initial || "");
  const [group, setGroup] = useState("");
  const all = frameIndex.filter((f) => f.channel === channel);
  const groups = [...new Set(all.map((f) => f.section))];
  const shown = all.filter(
    (f) => (!group || f.section === group) && matches(searchable(f), query),
  );
  return (
    <>
      <a className="backlink" href={"#/screens/" + channel}>
        Атлас {channelName[channel]}
      </a>
      <Title
        context="Указатель Figma"
        title={"Все фреймы " + channelName[channel]}
      >
        Для каждого узла указаны раздел и ссылка на исходный фрейм. Варианты
        компоновки, адаптивы и компоненты перечислены отдельно от
        иллюстрированного пути.
      </Title>
      <Filter
        value={query}
        change={setQuery}
        label="Найти по названию или идентификатору узла"
      />
      <div className="filters">
        <label>
          Раздел Figma
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">Все разделы</option>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <p className="count">Фреймов · {shown.length}</p>
      </div>
      <div className="frame-index">
        {shown.map((f) => (
          <div key={f.id}>
            <div>
              <small>
                {f.section} · {f.role}
              </small>
              <h3>{f.title}</h3>
              <p>{f.reason}</p>
            </div>
            <div>
              {f.illustrated ? (
                <a href={"#/screens/" + channel + "/" + f.id}>
                  Карточка экрана
                </a>
              ) : f.src ? (
                <a
                  href={"#/screens/" + channel + "/" + f.id}
                  target="_blank"
                  rel="noreferrer"
                >
                  Изображение
                </a>
              ) : null}
              <a href={f.url} target="_blank" rel="noreferrer">
                Figma · {f.node}
              </a>
            </div>
          </div>
        ))}
      </div>
      {!shown.length && <Empty />}
    </>
  );
}

const journeySteps = {
  sfa: [
    "sfa-8290-19870",
    "sfa-6082-60020",
    "sfa-9317-45816",
    "sfa-9317-45521",
    "sfa-9282-35328",
    "sfa-9746-46280",
    "sfa-5774-42435",
    "sfa-5774-42444",
  ],
  nib: [
    "nib-8284-119994",
    "nib-8412-137412",
    "nib-8412-138390",
    "nib-8412-144750",
    "nib-8284-132984",
    "nib-8153-151301",
    "nib-8284-134365",
    "nib-8284-136988",
  ],
};
export function Journey({ channel }) {
  const all = screens.filter((s) => s.channel === channel);
  const steps = (journeySteps[channel] || [])
    .map((id) => all.find((s) => s.id === id))
    .filter(Boolean);
  return (
    <>
      <a href={"#/screens/" + channel} className="backlink">
        Все экраны {channelName[channel]}
      </a>
      <Title
        context="Оформление ДМС"
        title={
          channel === "sfa"
            ? "Менеджер оформляет полис"
            : "Клиент оформляет полис"
        }
      >
        {channel === "sfa"
          ? "Этапы работы менеджера показаны на примерах утверждённых вариантов SFA. Для каждого шага указан исходный раздел макета."
          : "Путь клиента в интернет-банке от первого входа до карточки оформленного полиса."}
      </Title>
      <nav className="journey-nav" aria-label="Этапы оформления">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() =>
              document
                .getElementById("journey-" + s.id)
                ?.scrollIntoView({ block: "start" })
            }
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </nav>
      <div className="journey">
        {steps.map((s, i) => (
          <section key={s.id} id={"journey-" + s.id}>
            <div>
              <span className="eyebrow">
                Шаг {i + 1} из {steps.length}
              </span>
              <h2>{s.title}</h2>
              <p>{s.caption}</p>
              <small>
                {s.section} · {s.nodeId}
              </small>
              <div className="buttons">
                <Action href={"#/screens/" + channel + "/" + s.id}>
                  Рассмотреть экран
                </Action>
              </div>
            </div>
            <a
              className="journey-image"
              href={"#/screens/" + channel + "/" + s.id}
            >
              <img loading="lazy" src={s.src} alt={s.title} />
            </a>
          </section>
        ))}
      </div>
    </>
  );
}
