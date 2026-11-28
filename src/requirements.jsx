import React, { useEffect, useRef, useState } from "react";
import pages from "./data/requirements.json";
import {
  Action,
  Filter,
  Title,
  Empty,
  matches,
  searchable,
  proto,
} from "./shared";
import { ProductJourney } from "./product-journey";
import { productLink, screenFor, validChannel } from "./product-journey-model";
function crosslinks(text) {
  return text.split(/(стр\.\s*\d+(?:[–-]\d+)?)/g).map((part, i) => {
    const m = part.match(/^стр\.\s*(\d+)/);
    return m ? (
      <a key={i} href={"#/requirements/" + m[1]}>
        {part}
      </a>
    ) : (
      part
    );
  });
}
export function Protection({ step, channel, onMap }) {
  return (
    <>
      <Title context="Продукт" title="Комплексная защита бизнеса">
        Имущество, ДМС сотрудников и гражданская ответственность в одном полисе.
        Клиент собирает пакет в интернет-банке или вместе с менеджером в SFA.
      </Title>
      <div className="buttons">
        <Action primary href={proto} target="_blank" rel="noreferrer">
          Открыть прототип
        </Action>
        <Action href="#/requirements">Требования v1.5</Action>
        <Action
          href="./documents/requirements-v1.5.html"
          download="Комплексная защита бизнеса — требования v1.5.html"
        >
          Скачать требования
        </Action>
      </div>
      <ProductJourney
        initialStep={step}
        initialChannel={channel}
        onMap={onMap}
      />
      <div className="product-summary">
        <div>
          <span className="eyebrow">Пример из требований</span>
          <h2>Один полис на 42 000 ₽ в год</h2>
          <p>
            Помещение на 3 млн ₽, запасы на 1 млн ₽, ответственность на 3 млн ₽
            и ДМС одного сотрудника без стоматологии.
          </p>
        </div>
        <dl className="price">
          <div>
            <dt>Имущество</dt>
            <dd>4 000 ₽</dd>
          </div>
          <div>
            <dt>Ответственность</dt>
            <dd>3 000 ₽</dd>
          </div>
          <div>
            <dt>ДМС</dt>
            <dd>35 000 ₽</dd>
          </div>
        </dl>
      </div>
      <h2>Как собирается пакет</h2>
      <div className="lined-list">
        {[
          [
            "Имущество",
            "Страхователь владеет помещением. Помещение обязательно, оборудование и запасы можно добавить отдельно. В калькуляторе указывается один адрес.",
          ],
          [
            "ДМС сотрудников",
            "В пакет входят от 1 до 10 человек. На дату оплаты каждому должно быть от 18 до 65 полных лет. Программа и опция стоматологии общие для всего списка.",
          ],
          [
            "Гражданская ответственность",
            "Клиент добавляет модуль к имуществу или ДМС. Для опции вреда из-за недостатков товаров, работ или услуг сублимит входит в общий лимит ответственности.",
          ],
        ].map(([t, d]) => (
          <div key={t}>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
      <h2>От расчёта до полиса</h2>
      <p className="reading">
        При изменении списка сотрудников клиент сверяет новую цену. Затем
        проверяет единый полис и подписывает согласие на поручения. Система
        отдельно показывает ожидание, результат оплаты и готовность файла
        полиса. Для сверки один платёж раскладывается по модулям и опциям.
      </p>
      <aside className="callout">
        <h3>Что изменилось после версии 1.5</h3>
        <p>
          В опубликованном 26 ноября прототипе адрес выбирают из подсказок. При
          отказе можно исправить адрес, пересобрать защиту или оставить уже
          выбранное ДМС. Для имущества и ответственности отказ блокирует
          оформление по этому адресу. Проверка адреса и финансовые операции в
          прототипе демонстрационные.
        </p>
        <a
          href="https://github.com/aleksandrermolov87-cloud/biz-protection-prototype/commit/281fc3d0bdb7d91c07d015ec5f1617120d6358f5"
          target="_blank"
          rel="noreferrer"
        >
          Изменение прототипа за 26 ноября
        </a>
      </aside>
      <h2>Требования и приёмка</h2>
      <p className="reading">
        В версии 1.5 собраны 27 бизнес-требований, 19 экранных сценариев, 27
        числовых правил, 20 групп правил сверки и 22 критерия приёмки. Тексты и
        таблицы доступны по разделам.
      </p>
      <div className="buttons">
        <Action href="#/requirements/13">Правила покрытия</Action>
        <Action href="#/requirements/27">Экранные сценарии</Action>
        <Action href="#/requirements/56">Сверка</Action>
        <Action href="#/requirements/60">Приёмка</Action>
      </div>
    </>
  );
}
const updateClauses = [
  [
    "Подсказки адреса",
    "Пользователь вводит адрес одной строкой и выбирает предложение. Прототип сохраняет выбранные части адреса. При редактировании строки прежний выбор сбрасывается.",
  ],
  [
    "Отказ для имущества",
    "Отказ по выбранному адресу блокирует оформление имущественной защиты. Можно исправить адрес или вернуться к составу защиты.",
  ],
  [
    "Отказ для пакета с ДМС",
    "Можно исправить адрес либо оставить уже выбранное ДМС. Во втором случае прототип убирает имущество и ответственность, сохраняет сведения о сотрудниках и пересчитывает цену.",
  ],
  [
    "Отказ для ответственности с ДМС",
    "Если имущество выключено, адрес ответственности проверяется на шаге данных. При отказе можно выбрать другой адрес, изменить состав или продолжить только с ДМС.",
  ],
  [
    "Исправление отказанного адреса",
    "Редактирование снимает прежний выбор. После выбора подходящей подсказки прототип заново определяет результат проверки и разрешает продолжить с выбранными покрытиями.",
  ],
  [
    "Сохранение ДМС",
    "При переходе на ДМС прототип снимает имущественные покрытия и ответственность. Список сотрудников сохраняется, стоимость пересчитывается, адрес исключается из состава полиса ДМС.",
  ],
];
function RequirementReturn({ query }) {
  const channel = validChannel(query.get("channel"));
  const screen = screenFor(query.get("from"), channel);
  return (
    screen && (
      <a
        className="backlink requirement-return"
        href={productLink(screen.id, channel, query.get("view") === "map")}
      >
        К схеме · {screen.title}
      </a>
    )
  );
}
export function Requirements({ id, query }) {
  const [q, sq] = useState("");
  const highlight = useRef(null);
  const number = (key) => {
    const value = query.get(key);
    return value !== null && /^\d+$/.test(value) ? Number(value) : null;
  };
  const block = number("block"),
    row = number("row");
  const marker = (b, r = null) =>
    b === block && r === row
      ? { ref: highlight, "aria-current": "location", tabIndex: -1 }
      : {};
  useEffect(() => {
    const el = highlight.current;
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: "center" });
    }
  }, [id, block, row, query]);
  if (id === "demo-rules")
    return (
      <>
        <RequirementReturn query={query} />
        <a className="backlink" href="#/product">
          К продукту
        </a>
        <Title context="Особенности демонстратора" title="Проверки в прототипе">
          Эти условия воспроизводятся в демонстрации. Параметры для
          промышленного продукта требуют отдельного решения.
        </Title>
        <article className="update-clauses">
          <section {...marker(0)}>
            <h2>Повторная запись сотрудника</h2>
            <p>
              Прототип сравнивает ФИО и дату рождения с другими записями списка.
              При совпадении он показывает ошибку и предлагает исправить анкету.
            </p>
          </section>
          <section {...marker(1)}>
            <h2>Исчерпаны попытки ввода кода</h2>
            <p>
              После трёх неверных попыток демонстрационное поле блокируется.
              Можно запросить новый код и повторить подтверждение.
            </p>
          </section>
        </article>
        <p>
          <a
            className="product-update-source"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/aleksandrermolov87-cloud/biz-protection-prototype/blob/281fc3d0bdb7d91c07d015ec5f1617120d6358f5/index.html"
          >
            Исходная версия демонстратора
          </a>
        </p>
      </>
    );
  if (id === "address-update")
    return (
      <>
        <RequirementReturn query={query} />
        <a className="backlink" href="#/product">
          К продукту
        </a>
        <Title
          context="Изменение прототипа · 26 ноября 2026"
          title="Проверка адреса и действия при отказе"
        >
          После выпуска требований v1.5 в прототип добавили выбор адреса из
          подсказок и сценарии восстановления. Результат проверки адреса
          моделируется.
        </Title>
        <article className="update-clauses">
          {updateClauses.map(([title, text], i) => (
            <section key={title} {...marker(i)}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </article>
        <p>
          <a
            className="product-update-source"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/aleksandrermolov87-cloud/biz-protection-prototype/commit/281fc3d0bdb7d91c07d015ec5f1617120d6358f5"
          >
            Изменение прототипа от 26 ноября
          </a>
        </p>
      </>
    );
  const doc = pages.find((p) => String(p.page) === id);
  if (doc)
    return (
      <>
        <RequirementReturn query={query} />
        <a href="#/requirements" className="backlink">
          Все требования
        </a>
        <Title
          context={"Бизнес-требования v1.5 · Страница " + doc.page + " из 67"}
          title={doc.title}
        />
        <article className="doc-body">
          {doc.blocks.map((b, i) =>
            b.type === "table" ? (
              <div className="table-wrap" key={i} {...marker(i)}>
                <table>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} {...marker(i, j)}>
                        {r.map((v, k) =>
                          j === 0 ? (
                            <th key={k}>{crosslinks(v)}</th>
                          ) : (
                            <td key={k}>{crosslinks(v)}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : b.type === "link" ? (
              <p key={i} {...marker(i)}>
                <a href={b.url} target="_blank" rel="noreferrer">
                  {b.text}
                </a>
              </p>
            ) : b.type === "heading" ? (
              <h2 key={i} {...marker(i)}>
                {b.text}
              </h2>
            ) : (
              <p className={b.type} key={i} {...marker(i)}>
                {crosslinks(b.text)}
              </p>
            ),
          )}
        </article>
        <div className="buttons pager">
          {doc.page > 1 && (
            <Action href={"#/requirements/" + (doc.page - 1)}>
              Предыдущая страница
            </Action>
          )}
          {doc.page < 67 && (
            <Action href={"#/requirements/" + (doc.page + 1)}>
              Следующая страница
            </Action>
          )}
          <Action href="#/product">К продукту</Action>
        </div>
      </>
    );
  const filtered = pages.filter((p) => matches(searchable(p), q));
  return (
    <>
      <Title context="Комплексная защита бизнеса" title="Требования v1.5">
        Полный текст и таблицы 67 страниц. Ссылки «стр.» ведут к
        соответствующему разделу. Внешний прототип доступен в карточке продукта.
      </Title>
      <Filter
        label="Поиск по тексту требований, BR, SC и AC"
        value={q}
        change={sq}
      />
      <p className="count">Страниц · {filtered.length}</p>
      <div className="result-list">
        {filtered.map((p) => (
          <a key={p.page} href={"#/requirements/" + p.page}>
            <span className="numeric">{String(p.page).padStart(2, "0")}</span>
            <span>{p.title}</span>
          </a>
        ))}
      </div>
      {!filtered.length && <Empty />}
    </>
  );
}
