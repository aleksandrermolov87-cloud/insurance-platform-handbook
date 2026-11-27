import references from "./data/product-journey.json";
import { proto } from "./shared";

export const stages = [
  {
    id: "entry",
    title: "Выбор продукта",
    note: "Витрина НИБ или предложение в SFA.",
    variants: ["draft", "version-changed"],
  },
  {
    id: "config",
    title: "Состав и расчёт",
    note: "Имущество, ДМС и ответственность.",
    variants: [
      "config-empty",
      "config-minimum",
      "property",
      "property-amount",
      "ownership-required",
      "address",
      "address-no-match",
      "address-selected",
      "rental",
      "address-refused-property",
      "address-refused-package",
      "address-corrected",
      "address-dms-only",
      "dms",
      "liability",
      "liability-alone",
      "commission",
      "package-details",
      "property-details",
      "dms-details",
      "liability-details",
      "manager",
      "manager-failed",
      "manager-success",
    ],
  },
  {
    id: "data",
    title: "Данные и счёт",
    note: "Реквизиты для оформления и оплаты.",
    variants: [
      "account-error",
      "liability-address",
      "address-refused-liability",
    ],
  },
  {
    id: "staff-list",
    title: "Сотрудники",
    note: "Только при выборе ДМС.",
    variants: [
      "staff-empty",
      "staff-add",
      "staff-edit",
      "staff-errors",
      "staff-duplicate",
      "staff-age",
      "staff-limit",
      "staff-pending",
      "staff-delete",
      "staff-less",
      "staff-more",
    ],
  },
  {
    id: "checkout",
    title: "Проверка полиса",
    note: "Состав, стоимость и документы.",
    variants: [
      "checkout-no-dms",
      "policy-preview",
      "consent",
      "email-invalid",
      "consent-required",
      "agree-current",
    ],
  },
  {
    id: "code",
    title: "Подпись кодом",
    note: "Клиент подтверждает согласие кодом.",
    variants: [
      "code-help",
      "code-wrong",
      "code-expired",
      "code-locked",
      "paper",
      "paper-consent",
      "sign-pending",
      "sign-failed",
    ],
  },
  {
    id: "payment-pending",
    title: "Оплата",
    note: "Результат списания страховой премии.",
    variants: ["payment-unknown", "payment-failed"],
  },
  {
    id: "issue-pending",
    title: "Выпуск и файл",
    note: "Сначала выпуск, затем подготовка файла.",
    variants: ["issue-failed", "file-preparing", "file-failed"],
  },
  {
    id: "done",
    title: "Готовый полис",
    note: "Документ клиенту и данные для сверки в SFA.",
    variants: ["policy-issued", "reconciliation"],
  },
];
export const screens = new Map(references.map((item) => [item.id, item]));
export const stageFor = new Map(
  stages.flatMap((stage) =>
    [stage.id, ...stage.variants].map((id) => [id, stage]),
  ),
);
export function validChannel(value) {
  return value === "sfa" ? "sfa" : "nib";
}
export function forChannel(id, channel) {
  return screens.get(id)?.channels.includes(channel);
}
export function readSelection(id, channel) {
  const screen = screens.get(id) || screens.get("entry");
  const chosenChannel = validChannel(channel);
  return {
    id: screen.id,
    channel: screen.channels.includes(chosenChannel)
      ? chosenChannel
      : screen.channels[0],
  };
}
export function productLink(id, channel, onMap = false) {
  const params = new URLSearchParams({ step: id, channel });
  if (onMap) params.set("view", "map");
  return "#/product?" + params;
}
export function prototypeLink(id, channel) {
  const u = new URL(proto);
  u.searchParams.set("screen", id);
  u.searchParams.set("channel", channel);
  return u.href;
}
export function primaryFor(screen, channel) {
  return screen.primaryByChannel?.[channel] || screen.primary;
}
export function requirementLink(ref, id, channel, onMap = false) {
  const params = new URLSearchParams({ from: id, channel });
  if (onMap) params.set("view", "map");
  if (ref.block != null) params.set("block", ref.block);
  if (ref.row != null) params.set("row", ref.row);
  return "#/requirements/" + ref.page + "?" + params;
}
