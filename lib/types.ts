export type Question =
  | { id: string; type: "single"; q: string; hint: string; opts: readonly string[] }
  | { id: string; type: "multi"; q: string; hint: string; opts: readonly string[] }
  | { id: string; type: "text"; q: string; hint: string; opts?: readonly string[] }
  | { id: string; type: "textarea"; q: string; hint: string; opts?: readonly string[] };

export type Section = {
  id: string;
  title: string;
  desc: string;
  qs: readonly Question[];
};
