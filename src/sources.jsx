import React from "react";
import { Title, Action, figma, spaceUrl, proto } from "./shared";
import screens from "./data/screens.json";
import frameIndex from "./data/screen-index.json";
export function SourceGuide() {
  return (
    <>
      <Title context="Справочник проекта" title="Источники и версии">
        Архитектура описывает документальный срез. Страницы Пространства
        фиксируют требования и решения, а статус макета проверяется отдельно в
        Figma.
      </Title>
      <div className="lined-list">
        <div>
          <h3>Архитектура · 13 октября 2026</h3>
          <p>
            Основа графа — Vision от 10 июля и пять реестров интеграций. На дату
            среза все пять находились на согласовании. В них 94 строки со
            статусом «Разработка» и 16 со статусом «Применение». Версия системы
            в промышленной среде требует отдельного подтверждения.
          </p>
          <div className="buttons">
            <Action href="#/graph/full">Модель из 389 узлов</Action>
            <Action href="./model-sources.html">Перечень документов</Action>
          </div>
        </div>
        <div>
          <h3>Пространство · «Цифровое страхование»</h3>
          <p>
            Опорная модель обновлена 28 октября. Навигатор охватывает 42
            предметные страницы и связанные решения. Требования к
            самостоятельному оформлению, встраиванию и сверке помечены в
            соответствующих материалах.
          </p>
          <div className="buttons">
            <Action href="#/space">Навигатор по страницам</Action>
            <Action href={spaceUrl} target="_blank" rel="noreferrer">
              Исходное Пространство
            </Action>
          </div>
        </div>
        <div>
          <h3>Figma · 27 ноября 2026</h3>
          <p>
            В галерее доступны изображения и описания всех {frameIndex.length}{" "}
            фреймов. В пошаговую подборку включены {screens.length} основных
            экранов. Источники обеих галерей помещены в разделы с пройденным
            дизайн-чеком. Каждая запись ведёт к конкретному узлу Figma. Даты на
            именах рабочих страниц сохранены в описаниях каналов.
          </p>
          <div className="buttons">
            <Action href={figma.sfa} target="_blank" rel="noreferrer">
              Источник SFA
            </Action>
            <Action href={figma.nib} target="_blank" rel="noreferrer">
              Источник НИБ
            </Action>
          </div>
        </div>
        <div>
          <h3>Комплексная защита бизнеса · требования v1.5</h3>
          <p>
            Требования опираются на прототип от 10 ноября. Действующая
            демонстрация содержит изменения от 26 ноября в выборе адреса и
            обработке отказа. В справочнике доступны все 67 страниц в текстовом
            виде и 57 таблиц. Иллюстрации требований относятся к
            демонстрационному прототипу.
          </p>
          <div className="buttons">
            <Action href="#/product">Карточка продукта</Action>
            <Action href={proto} target="_blank" rel="noreferrer">
              Действующий прототип
            </Action>
          </div>
        </div>
      </div>
    </>
  );
}
