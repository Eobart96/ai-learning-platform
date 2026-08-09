import { type ReactNode } from "react";

type MathNotationProps = {
  children: string;
};

const powerPattern = /(\([^()]+\)|[A-Za-zА-Яа-яЁё0-9]+)\^(\([^()]+\)|[A-Za-zА-Яа-яЁё0-9]+)/;
const fractionPattern = /(^|[^\p{L}\p{N}_])([A-Za-zА-Яа-яЁё0-9]+)\s*\/\s*([A-Za-zА-Яа-яЁё0-9]+)/u;

function renderFractions(value: string, keyPrefix: string): ReactNode[] {
  const matcher = new RegExp(fractionPattern.source, "gu");
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = matcher.exec(value)) !== null) {
    const [whole, prefix, numerator, denominator] = match;
    const start = match.index;
    if (start > cursor || prefix) nodes.push(`${value.slice(cursor, start)}${prefix}`);
    nodes.push(<span className="math-fraction" key={`${keyPrefix}-fraction-${index++}`}><span>{numerator}</span><span>{denominator}</span></span>);
    cursor = start + whole.length;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

function renderNotation(value: string, keyPrefix: string): ReactNode[] {
  const matcher = new RegExp(powerPattern.source, "g");
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = matcher.exec(value)) !== null) {
    const [whole, base, exponent] = match;
    const start = match.index;
    nodes.push(...renderFractions(value.slice(cursor, start), `${keyPrefix}-before-${index}`));
    nodes.push(<span className="math-power" key={`${keyPrefix}-power-${index++}`}>{renderNotation(base, `${keyPrefix}-base`)}<sup>{renderNotation(exponent, `${keyPrefix}-exponent`)}</sup></span>);
    cursor = start + whole.length;
  }
  nodes.push(...renderFractions(value.slice(cursor), `${keyPrefix}-after`));
  return nodes;
}

export function MathNotation({ children }: MathNotationProps) {
  return <span className="math-notation">{renderNotation(children, "math")}</span>;
}
