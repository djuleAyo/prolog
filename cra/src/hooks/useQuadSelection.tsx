import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

const SelectionQuad = styled.div<{
  a: [number, number],
  b: [number, number]
}>`
  position: absolute;
  border: 1px solid "red";
  background-color: #ccc;
  top: ${props => Math.min(props.a[1], props.b[1])}px;
  left: ${props => Math.min(props.a[0], props.b[0])}px;
  width: ${props => Math.abs(props.a[0] - props.b[0])}px;
  height: ${props => Math.abs(props.a[1] - props.b[1])}px;
  z-index: 100;
`;

const inParentCoords = (parent: any, event: any) => {
  let bounds = parent.getBoundingClientRect();
  let x = event.clientX - bounds.left + parent.scrollLeft;
  let y = event.clientY - bounds.top + parent.scrollTop;
  return [x, y] as [number, number];
}

const quadContainsDot = (a: [number, number], b: [number, number], dot: [number, number]) => {
  const [x, y] = dot;
  const [x1, y1] = a;
  const [x2, y2] = b;
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
}

const quadsIntersect = (a1: [number, number], b1: [number, number], a2: [number, number], b2: [number, number]) => {
  const x1 = Math.min(a1[0], b1[0]);
  const y1 = Math.min(a1[1], b1[1]);
  const x2 = Math.max(a1[0], b1[0]);
  const y2 = Math.max(a1[1], b1[1]);

  const x3 = Math.min(a2[0], b2[0]);
  const y3 = Math.min(a2[1], b2[1]);
  const x4 = Math.max(a2[0], b2[0]);
  const y4 = Math.max(a2[1], b2[1]);

  //check if any of the points are inside the other quad
  const vertexContained = quadContainsDot(a2, b2, a1) || quadContainsDot(a2, b2, b1) || quadContainsDot(a2, b2, a1) || quadContainsDot(a2, b2, b1)
    || quadContainsDot(a1, b1, a2) || quadContainsDot(a1, b1, b2) || quadContainsDot(a1, b1, a2) || quadContainsDot(a1, b1, b2);
  
  if (vertexContained) return true;

  //check if any of the lines intersect
  const linesIntersect = (x1 < x3 && x2 > x3 && y1 < y4 && y1 > y3)
    || (x1 < x4 && x2 > x4 && y1 < y4 && y1 > y3)
    || (x1 < x3 && x2 > x3 && y2 < y4 && y2 > y3)
    || (x1 < x4 && x2 > x4 && y2 < y4 && y2 > y3)
    || (x3 < x1 && x4 > x1 && y3 < y2 && y4 > y2)
    || (x3 < x2 && x4 > x2 && y3 < y2 && y4 > y2)
    || (x3 < x1 && x4 > x1 && y4 < y2 && y4 > y1)
    || (x3 < x2 && x4 > x2 && y4 < y2 && y4 > y1);


  return linesIntersect;
}


export const useQuadSelection = (host: HTMLDivElement, onSelection?: (a: string[]) => void) => {
  console.log('useQuadSelection', host)

  
  const [quadStart, setQuadStart] = useState<[number, number]>();
  const [mousePosition, setMousePosition] = useState<[number, number]>();


  const quad = useMemo(() => {
    if (!quadStart || !mousePosition) return null;
    return <SelectionQuad a={quadStart} b={mousePosition} />
  }, [quadStart, mousePosition])

  const onMouseDown = (e: MouseEvent) => setQuadStart(inParentCoords(host, e))
  const onMouseMove = (e: MouseEvent) => quadStart && setMousePosition(inParentCoords(host, e))
  useEffect(() => {
    console.log('here')
    if (!host) return;
    console.log('settings event listeners')
    host.addEventListener('mousedown', onMouseDown as any);
  }, [host])
  
  const onMouseUpRef = useRef<Function>()
  const onMouseMoveRef = useRef<Function>()

  useEffect(() => {
    if (!host) return;
    onMouseUpRef.current && host.removeEventListener('mouseup', onMouseUpRef.current as any);
    onMouseMoveRef.current && host.removeEventListener('mousemove', onMouseMoveRef.current as any);

    const onMouseUp = (e: MouseEvent) => {
      if (!quadStart) return;
      const [upX, upY] = inParentCoords(host, e);


      const toggleList = Array.prototype.slice.call(host.children)
        .filter(child => {
          const bounds = child.getBoundingClientRect();


          const a = [Math.min(quadStart![0], upX), Math.min(quadStart![1], upY)] as [number, number];
          const b = [Math.max(quadStart![0], upX), Math.max(quadStart![1], upY)] as [number, number];


          return quadsIntersect(a, b, [child.offsetLeft, child.offsetTop], [child.offsetLeft + bounds.width, child.offsetTop + bounds.height])
            /* && child.innerHTML !== ''; */

        }).map(child => child.attributes['data-id']?.value!)
        .filter(x => x)

      onSelection?.(toggleList)

      setMousePosition(undefined)
      setQuadStart(undefined)
    }

    onMouseUpRef.current = onMouseUp;
    onMouseMoveRef.current = onMouseMove!;

    host.addEventListener('mouseup', onMouseUp as any);
    host.addEventListener('mousemove', onMouseMove as any);
  }, [host, quadStart]);

  return (!host) ? null : quad;
}
