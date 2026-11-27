import React from "react";
import { Button } from "@alfalab/core-components/button/modern";
import { Input } from "@alfalab/core-components/input/modern";
import { MagnifierMIcon } from "@alfalab/icons-glyph/MagnifierMIcon";
export const proto =
  "https://aleksandrermolov87-cloud.github.io/biz-protection-prototype/";
export const github =
  "https://github.com/aleksandrermolov87-cloud/insurance-platform-handbook";
export const figma = {
  sfa: "https://www.figma.com/design/iF3QFBQOp6lVMgyCW8iOsY/?node-id=5703-176458",
  nib: "https://www.figma.com/design/zOdLGjEZCwhyWE5iPYLUv0/?node-id=5204-128",
};
export const spaceUrl =
  "https://chatgpt.com/space/page_6ae0783215f88191ae29386c25db1280";
export function Action({ children, href, primary = false, ...props }) {
  return (
    <Button
      size={40}
      view={primary ? "primary" : "secondary"}
      href={href}
      {...props}
    >
      {children}
    </Button>
  );
}
export function Filter({ value, change, label }) {
  return (
    <Input
      block
      type="search"
      size={48}
      aria-label={label}
      placeholder={label}
      value={value}
      onChange={(_, p) => change(p.value)}
      leftAddons={<MagnifierMIcon aria-hidden="true" />}
    />
  );
}
export function Title({ context, title, children }) {
  return (
    <header className="page-intro">
      <span className="eyebrow">{context}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}
export function Sources({ items = [] }) {
  return (
    items.length > 0 && (
      <div className="sources">
        <b>Источники</b>
        {items.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noreferrer">
            {s.title}
          </a>
        ))}
      </div>
    )
  );
}
export function AccentLink({ href, children }) {
  return (
    <a className="textlink" href={href}>
      {children}
    </a>
  );
}
export function norm(t) {
  return String(t ?? "")
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .replace(/\s+/g, " ")
    .trim();
}
export function searchable(obj) {
  return norm(JSON.stringify(obj));
}
export function matches(text, query) {
  return norm(query)
    .split(" ")
    .every((t) => text.includes(t));
}
export function Empty() {
  return (
    <p className="empty">
      Совпадений нет. Попробуйте другое слово или очистите фильтр.
    </p>
  );
}
