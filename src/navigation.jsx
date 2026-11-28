import React from "react";
import { github } from "./shared";
import { BookMIcon } from "@alfalab/icons-glyph/BookMIcon";
import { ArrowsForkMIcon } from "@alfalab/icons-glyph/ArrowsForkMIcon";
import { ListBulletedMIcon } from "@alfalab/icons-glyph/ListBulletedMIcon";
import { DocumentLinesMIcon } from "@alfalab/icons-glyph/DocumentLinesMIcon";
import { WindowLandscapeMIcon } from "@alfalab/icons-glyph/WindowLandscapeMIcon";
import { ShieldMIcon } from "@alfalab/icons-glyph/ShieldMIcon";
export const nav = [
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
export function Navigation({ routePath, onNavigate }) {
  const [key, a] = routePath.split("/");
  return (
    <>
      <nav className="handbook-nav" aria-label="Основные разделы">
        {nav.map(([title, items]) => (
          <div key={title}>
            <b>{title}</b>
            {items.map(([path, t, Icon]) => {
              const active =
                routePath === path ||
                routePath.startsWith(path + "/") ||
                (key === "article" &&
                  path ===
                    { m: "architecture", s: "modules", p: "space" }[
                      (a || "")[0]
                    ]);
              return (
                <a
                  key={path}
                  href={"#/" + path}
                  onClick={onNavigate}
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
    </>
  );
}
