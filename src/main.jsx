import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlfaBankLogoMIcon } from "@alfalab/icons-logotype/AlfaBankLogoMIcon";
import { DesktopMIcon } from "@alfalab/icons-glyph/DesktopMIcon";
import { MobilePhoneMIcon } from "@alfalab/icons-glyph/MobilePhoneMIcon";
import { ShieldMIcon } from "@alfalab/icons-glyph/ShieldMIcon";
import { ListMIcon } from "@alfalab/icons-glyph/ListMIcon";
import { CrossMIcon } from "@alfalab/icons-glyph/CrossMIcon";
import { ChevronRightMIcon } from "@alfalab/icons-glyph/ChevronRightMIcon";
import { nav, Navigation } from "./navigation";
import { HandbookSearch } from "./handbook-search";
import { Typography } from "@alfalab/core-components/typography/modern";
import { Action, Title, spaceUrl } from "./shared";
import { Graph } from "./graph";
import { Article, Articles, Catalog, Search } from "./library";
import { Protection, Requirements } from "./requirements";
import { Screens, FrameIndex, Journey } from "./screens";
import { SourceGuide } from "./sources";
import counts from "./data/screen-index.json";
import "@alfalab/core-components/vars/bundle/corp.css";
import "@alfalab/core-components/themes/corp.css";
import "./style.css";
function MapPreview() {
  return (
    <div className="map-preview" aria-label="Схема каналов и функций">
      <div className="dotfield" />
      <div className="diagram">
        <div className="map-duo">
          <a href="#/screens/sfa">
            <b>
              <DesktopMIcon width={18} height={18} aria-hidden="true" />
              SFA
            </b>
            <span>Менеджер</span>
          </a>
          <a href="#/screens/nib">
            <b>
              <MobilePhoneMIcon width={18} height={18} aria-hidden="true" />
              НИБ
            </b>
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
          <p className="home-meta">
            Срез справочника <time dateTime="2026-11-27">27 ноября 2026</time>
          </p>
        </div>
        <MapPreview />
      </section>
      <section className="home-flows">
        <div className="section-label">
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
          <h2>Два канала оформления</h2>
        </div>
        <div className="channel-tiles">
          {[
            [
              "sfa",
              "SFA",
              "Рабочее место менеджера",
              "./screens/sfa-6082-60020.webp",
            ],
            [
              "nib",
              "НИБ",
              "Интернет-банк клиента",
              "./screens/nib-8284-119994.webp",
            ],
          ].map(([k, t, d, preview]) => (
            <a href={"#/screens/" + k} key={k}>
              <div className="channel-thumbnail">
                <img src={preview} loading="lazy" decoding="async" alt="" />
              </div>
              <div className="channel-caption">
                <span>{t}</span>
                <h3>{d}</h3>
                <p>
                  Экранов с пройденным дизайн-чеком ·{" "}
                  {counts.filter((x) => x.channel === k).length}
                </p>
                <ChevronRightMIcon aria-hidden="true" width={18} height={18} />
              </div>
            </a>
          ))}
        </div>
      </section>
      <section className="home-product">
        <div>
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
  const [r, setR] = useState(route);
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef(null);
  const [key, a, b] = r.parts;
  useEffect(() => {
    const listen = () => {
      setR(route());
      menu.current?.close();
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", listen);
    return () => window.removeEventListener("hashchange", listen);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const wide = window.matchMedia("(min-width: 851px)");
    const closeWhenWide = () => {
      if (wide.matches) menu.current?.close();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    wide.addEventListener("change", closeWhenWide);
    return () => {
      wide.removeEventListener("change", closeWhenWide);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);
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
      page = <Catalog kind={key} id={a} step={r.query.get("step")} />;
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
      page = <Article id={a} step={r.query.get("step")} />;
      break;
    case "journey":
      page = <Journey channel={a} />;
      break;
    case "frames":
      page = <FrameIndex channel={a} initial={b} />;
      break;
    case "screens":
      page = (
        <Screens
          channel={a}
          id={b}
          allFrames={r.query.get("view") === "all"}
          from={r.query.get("from")}
          step={r.query.get("step")}
        />
      );
      break;
    case "product":
      page = (
        <Protection
          key={r.query.toString()}
          step={r.query.get("step")}
          onMap={r.query.get("view") === "map"}
          channel={r.query.get("channel")}
        />
      );
      break;
    case "requirements":
      page = <Requirements id={a} query={r.query} />;
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
        <HandbookSearch />
        <button
          type="button"
          className="mobile-toggle"
          aria-label="Меню"
          aria-controls="section-menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => {
            menu.current.showModal();
            setMenuOpen(true);
          }}
        >
          <ListMIcon aria-hidden="true" width={23} height={23} />
        </button>
      </header>
      <div className="layout">
        <aside id="rail" className="rail">
          <Navigation routePath={r.path} />
        </aside>
        <dialog
          id="section-menu"
          className="section-menu"
          ref={menu}
          aria-labelledby="section-menu-title"
          onClose={() => setMenuOpen(false)}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              const rect = e.currentTarget.getBoundingClientRect();
              if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
              )
                e.currentTarget.close();
            }
          }}
        >
          <div className="sheet-content">
            <div className="sheet-heading">
              <h2 id="section-menu-title">Разделы справочника</h2>
              <button
                type="button"
                aria-label="Закрыть меню"
                onClick={() => menu.current.close()}
              >
                <CrossMIcon aria-hidden="true" width={19} height={19} />
              </button>
            </div>
            <Navigation
              routePath={r.path}
              onNavigate={() => menu.current.close()}
            />
          </div>
        </dialog>
        <main id="main" tabIndex="-1">
          <div className="crumb">
            <a href="#/home">Справочник</a>
            <ChevronRightMIcon aria-hidden="true" width={13} height={13} />
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
