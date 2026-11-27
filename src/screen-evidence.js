import frames from "./data/screen-index.json";
import diagrams from "./data/article-diagrams.json";
import catalog from "./data/catalog-visuals.json";
import graph from "./data/full-graph.json";
import assignments from "./data/step-screens.json";

const framesById = new Map(frames.map((frame) => [frame.id, frame]));
const model = new Map(graph.nodes.map((n) => [n.id, n]));
const screenSteps = new Map();
export const stepsByArticle = new Map();

function indexTargets(step, links) {
  return links.map(({ id, why }) => {
    const frame = framesById.get(id);
    if (!screenSteps.has(id)) screenSteps.set(id, []);
    screenSteps.get(id).push(step);
    const query = new URLSearchParams({
      view: "all",
      from: step.article,
      step: step.id,
    });
    return {
      id,
      why,
      title: frame.title,
      section: frame.section,
      node: frame.node,
      src: frame.src,
      channel: frame.channel === "sfa" ? "SFA" : "НИБ",
      returnHref: stepHref(step),
      href: "#/screens/" + frame.channel + "/" + id + "?" + query,
    };
  });
}
function registerSteps(owner, title, path, nodes) {
  const links = assignments[owner] || {};
  stepsByArticle.set(
    owner,
    nodes.map((node) => ({
      ...node,
      targets: indexTargets(
        {
          article: owner,
          id: node.id,
          title: node.label,
          diagram: title,
          path,
        },
        links[node.id] || [],
      ),
    })),
  );
}
for (const article of diagrams)
  registerSteps(
    article.articleId,
    article.title,
    "article/" + article.articleId,
    article.nodes,
  );
for (const [id, process] of Object.entries(catalog.processes)) {
  const nodes = process.steps.map((step) => ({
    id: step.id,
    label: step.title,
    note: step.detail,
    participants: step.nodeIds.filter((n) => n !== id).map((n) => model.get(n)),
  }));
  registerSteps(id, process.title, "subjects/" + model.get(id).index, nodes);
}
export function stepsForScreen(id) {
  return screenSteps.get(id) || [];
}
export function stepHref(step) {
  return "#/" + step.path + "?step=" + encodeURIComponent(step.id);
}

export const channelStateGroup = {
  article: "s1",
  id: "channel-states",
  title: "Общие состояния НИБ",
  diagram: diagrams.find((d) => d.articleId === "s1").title,
  path: "article/s1",
  channelLevel: true,
};
export const commonStates = indexTargets(channelStateGroup, [
  {
    id: "nib-8304-168161",
    why: "При сбое загрузки формы клиент может повторить запрос.",
  },
  {
    id: "nib-8305-169905",
    why: "При потере соединения клиенту предлагают проверить интернет и повторить запрос.",
  },
]);
