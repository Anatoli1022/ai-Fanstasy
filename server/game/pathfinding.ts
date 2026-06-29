export interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: Node;
}

export interface Vector {
  x: number;
  y: number;
}

export function heuristic(a: Vector, b: Vector): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function aStar(
  start: Vector,
  end: Vector,
  width: number,
  height: number,
  blocked: Set<string> = new Set()
): Vector[] | null {
  if (start.x === end.x && start.y === end.y) return [start];

  const openList: Node[] = [];
  const closedSet = new Set<string>();
  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end),
    f: 0,
  };
  startNode.f = startNode.h;
  openList.push(startNode);

  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
  ];

  while (openList.length > 0) {
    const current = openList.reduce((a, b) => (a.f < b.f ? a : b));
    openList.splice(openList.indexOf(current), 1);
    closedSet.add(`${current.x},${current.y}`);

    if (current.x === end.x && current.y === end.y) {
      const path: Vector[] = [];
      let node: Node | undefined = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    const neighbors = directions.map((d) => ({
      x: current.x + d.x,
      y: current.y + d.y,
    }));

    for (const n of neighbors) {
      if (n.x < 0 || n.y < 0 || n.x >= width || n.y >= height) continue;
      if (closedSet.has(`${n.x},${n.y}`)) continue;
      if (blocked.has(`${n.x},${n.y}`)) continue;

      const g = current.g + (n.x !== current.x && n.y !== current.y ? 1.414 : 1);
      const h = heuristic(n, end);
      const f = g + h;

      const existing = openList.find((o) => o.x === n.x && o.y === n.y);
      if (existing && existing.f <= f) continue;

      const node: Node = { x: n.x, y: n.y, g, h, f, parent: current };
      openList.push(node);
    }
  }

  return null;
}

export function moveTowards(current: Vector, target: Vector): Vector {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return current;
  const step = 1;
  return {
    x: Math.round(current.x + (dx / dist) * step),
    y: Math.round(current.y + (dy / dist) * step),
  };
}

export function getPathLength(path: Vector[]): number {
  let length = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}
