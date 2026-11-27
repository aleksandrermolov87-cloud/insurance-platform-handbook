import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlfaBankLogoMIcon } from "@alfalab/icons-logotype/AlfaBankLogoMIcon";
import { BookMIcon } from "@alfalab/icons-glyph/BookMIcon";
import { ArrowsForkMIcon } from "@alfalab/icons-glyph/ArrowsForkMIcon";
import { ListBulletedMIcon } from "@alfalab/icons-glyph/ListBulletedMIcon";
import { DocumentLinesMIcon } from "@alfalab/icons-glyph/DocumentLinesMIcon";
import { WindowLandscapeMIcon } from "@alfalab/icons-glyph/WindowLandscapeMIcon";
import { ShieldMIcon } from "@alfalab/icons-glyph/ShieldMIcon";
import { MagnifierMIcon } from "@alfalab/icons-glyph/MagnifierMIcon";
import { Typography } from "@alfalab/core-components/typography/modern";
import { Action, Title, github, spaceUrl } from "./shared";
import { Graph } from "./graph";
import { Article, Articles, Catalog, Search } from "./library";
import { Protection, Requirements } from "./requirements";
import { Screens, FrameIndex, Journey } from "./screens";
import { SourceGuide } from "./sources";
import counts from "./data/screen-index.json";
import "@alfalab/core-components/vars/bundle/corp.css";
import "@alfalab/core-components/themes/corp.css";
import "./style.css";
const nav = [
  [
    "Справочник",
    [
      ["home", "Обзор", BookMIcon],
      ["architecture", "Архитектура", ArrowsForkMIcon],
      ["graph", "3D-карта", ArrowsForkMIcon],
      ["systems", "Системы и компоненты", ListBulletedMIcon],
      ["operations", "Реестр операций", ListBulletedMIcon],
      ["subjects", "Данные и процессы", DocumentLinesMIcon],
      ["modules", "Функциональные модули", DocumentLinesMIcon],
      ["space", "Пространство", BookMIcon],
    ],
  ],
  [
    "Атлас интерфейсов",
    [
      ["screens/sfa", "Рабочее место SFA", WindowLandscapeMIcon],
      ["screens/nib", "Интернет-банк НИБ", WindowLandscapeMIcon],
    ],
  ],
  [
    "Страховой продукт",
    [
      ["product", "Комплексная защита бизнеса", ShieldMIcon],
      ["requirements", "Требования v1.5", DocumentLinesMIcon],
    ],
  ],
  ["Документация", [["sources", "Источники и версии", BookMIcon]]],
];
function MapPreview() {
  return (
    <div className="map-preview" aria-label="Схема каналов и функций">
      <div className="dotfield" />
      <div className="diagram">
        <div className="map-duo">
          <a href="#/screens/sfa">
            <b>SFA</b>
            <span>Менеджер</span>
          </a>
          <a href="#/screens/nib">
            <b>НИБ</b>
            <span>Клиент</span>
          </a>
        </div>
        <div className="connector-top" />
        <a className="platform-node" href="#/graph">
          <ShieldMIcon aria-hidden="true" />
          <span>Страховая платформа</span>
        </a>
        <div className="connector-bottom" />
        <div className="map-ends">
          <a href="#/article/s5">Заявка</a>
          <a href="#/article/s6">Документы</a>
          <a href="#/article/s7">Учёт</a>
        </div>
      </div>
    </div>
  );
}
function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Справочник платформы</span>
          <h1>
            Страхование
            <br />
            для бизнеса
          </h1>
          <p>
            Как банк оформляет страховой полис, какие системы участвуют в сделке
            и что видят менеджер и клиент.
          </p>
          <div className="buttons">
            <Action primary href="#/architecture">
              Изучить архитектуру
            </Action>
            <Action href="#/graph">Открыть 3D-карту</Action>
          </div>
        </div>
        <MapPreview />
      </section>
      <div className="home-meta">
        <span>Срез справочника</span>
        <b>27 ноября 2026</b>
      </div>
      <section className="home-flows">
        <div className="section-label">
          <span className="eyebrow">Оформление</span>
          <h2>Путь от заявки до полиса</h2>
        </div>
        <div className="flow-index">
          {[
            [
              "Выбор и расчёт",
              "Канал определяет клиента, показывает продукты и рассчитывает премию.",
              "s4",
            ],
            [
              "Документы и согласие",
              "По данным заявки формируются печатные формы. Клиент проверяет пакет и подтверждает согласие.",
              "s6",
            ],
            [
              "Оплата и учёт",
              "После подписи банк получает результат оплаты, регистрирует договор и готовит сведения для сверки.",
              "s7",
            ],
          ].map(([t, d, id], i) => (
            <a key={id} href={"#/article/" + id}>
              <span className="step">{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
      <section className="home-atlas">
        <div className="section-label">
          <span className="eyebrow">Атлас интерфейсов</span>
          <h2>Два канала оформления</h2>
        </div>
        <div className="channel-tiles">
          {[
            ["sfa", "SFA", "Рабочее место менеджера"],
            ["nib", "НИБ", "Интернет-банк клиента"],
          ].map(([k, t, d]) => (
            <a href={"#/screens/" + k} key={k}>
              <span>{t}</span>
              <h3>{d}</h3>
              <p>
                Экранов с пройденным дизайн-чеком ·{" "}
                {counts.filter((x) => x.channel === k).length}
              </p>
            </a>
          ))}
        </div>
      </section>
      <section className="home-product">
        <div>
          <span className="eyebrow">Страховой продукт</span>
          <h2>Комплексная защита бизнеса</h2>
          <p>
            Имущество, ДМС и ответственность в одном полисе. Прототип, правила
            расчёта и критерии приёмки.
          </p>
        </div>
        <Action href="#/product">К продукту</Action>
      </section>
    </>
  );
}
function route() {
  const hash = location.hash.slice(1).replace(/^\//, "") || "home";
  const [path, query] = hash.split("?");
  return { parts: path.split("/"), query: new URLSearchParams(query), path };
}
function App() {
  const [r, setR] = useState(route),
    [menu, setMenu] = useState(false);
  const search = useRef(null);
  const [key, a, b] = r.parts;
  useEffect(() => {
    const listen = () => {
      setR(route());
      setMenu(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", listen);
    return () => window.removeEventListener("hashchange", listen);
  }, []);
  useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        search.current?.focus();
      }
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => {
    document.title =
      (document.querySelector("main h1")?.innerText.replace(/\s+/g, " ") ||
        "Справочник") + " · Страховая платформа";
  }, [r]);
  const label =
    nav
      .flatMap((n) => n[1])
      .find((n) => r.path === n[0] || r.path.startsWith(n[0] + "/"))?.[1] ||
    { article: "Материал", search: "Поиск", frames: "Галерея экранов" }[key] ||
    "Обзор";
  let page;
  switch (key) {
    case "home":
      page = <Home />;
      break;
    case "graph":
      page = <Graph mode={a} initialNode={b} />;
      break;
    case "systems":
    case "operations":
    case "subjects":
      page = <Catalog kind={key} id={a} />;
      break;
    case "architecture":
    case "modules":
    case "space":
      page = (
        <Articles
          category={
            {
              architecture: "Архитектура",
              modules: "Функциональные модули",
              space: "Пространство",
            }[key]
          }
        />
      );
      break;
    case "article":
      page = <Article id={a} />;
      break;
    case "journey":
      page = <Journey channel={a} />;
      break;
    case "frames":
      page = <FrameIndex channel={a} initial={b} />;
      break;
    case "screens":
      page = (
        <Screens channel={a} id={b} allFrames={r.query.get("view") === "all"} />
      );
      break;
    case "product":
      page = <Protection />;
      break;
    case "requirements":
      page = <Requirements id={a} />;
      break;
    case "sources":
      page = <SourceGuide />;
      break;
    case "search":
      page = <Search term={r.query.get("q") || ""} />;
      break;
    default:
      page = (
        <>
          <Title context="Справочник" title="Страница не найдена" />
          <Action href="#/home">К обзору</Action>
        </>
      );
  }
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main").focus();
        }}
      >
        К содержанию
      </a>
      <header className="topbar">
        <a className="brand" href="#/home">
          <AlfaBankLogoMIcon width={31} height={31} aria-hidden="true" />
          <strong>Альфа-Банк</strong>
        </a>
        <span className="top-name">Страховая платформа</span>
        <form
          className="top-search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = search.current.value.trim();
            location.hash = "/search?q=" + encodeURIComponent(q);
            search.current.blur();
          }}
        >
          <button aria-label="Найти" type="submit">
            <MagnifierMIcon />
          </button>
          <input
            ref={search}
            name="query"
            type="search"
            aria-label="Поиск по справочнику"
            placeholder="Поиск по справочнику"
          />
          <kbd>⌘ K</kbd>
        </form>
        <button
          className="mobile-toggle"
          aria-controls="rail"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Закрыть" : "Меню"}
        </button>
      </header>
      <div className="layout">
        <aside id="rail" className={"rail" + (menu ? " open" : "")}>
          <nav aria-label="Основные разделы">
            {nav.map(([title, items]) => (
              <div key={title}>
                <b>{title}</b>
                {items.map(([path, t, Icon]) => {
                  const active =
                    r.path === path ||
                    r.path.startsWith(path + "/") ||
                    (key === "article" &&
                      path ===
                        { m: "architecture", s: "modules", p: "space" }[
                          (a || "")[0]
                        ]);
                  return (
                    <a
                      key={path}
                      href={"#/" + path}
                      onClick={() => setMenu(false)}
                      className={active ? "active" : ""}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon aria-hidden="true" width={18} height={18} />
                      <span>{t}</span>
                    </a>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="rail-end">
            <a href={github} target="_blank" rel="noreferrer">
              Исходники на GitHub
            </a>
          </div>
        </aside>
        <main id="main" tabIndex="-1">
          <div className="crumb">
            <a href="#/home">Справочник</a>
            <span>/</span>
            {label}
          </div>
          <div key={r.path}>{page}</div>
          <footer>
            <Typography.Text view="secondary-small">
              Страховая платформа · Справочник проекта
            </Typography.Text>
            <a href={spaceUrl} target="_blank" rel="noreferrer">
              Пространство
            </a>
            <a
              href="https://core-ds.github.io/core-components/master/?path=/docs/intro--docs"
              target="_blank"
              rel="noreferrer"
            >
              Core Components
            </a>
          </footer>
        </main>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
