import { useEffect, useRef } from "react";

type KeybindCallback = (e: KeyboardEvent) => void;
type Keybinds = Record<string, KeybindCallback>;

const mods = ['ctrl', 'alt', 'shift'] as const;
type Mod = typeof mods[number];

type ModRecord = Record<Mod, boolean>;
const modRecord = (mr: Partial<ModRecord>) => ({
  alt: 'alt' in mr && !!mr.alt,
  shift: 'shift' in mr && !!mr.shift,
  ctrl: 'ctrl' in mr && !!mr.ctrl,
})

type PressRecord = {
  key: string;
} & ModRecord;

const toPR = <T extends KeyboardEvent>(e: T) => ({
  alt: e.altKey,
  shift: e.shiftKey,
  ctrl: e.ctrlKey,
  key: e.key
});

const prToString = (pr: PressRecord) => 
  (mods.map(m => pr[m] ? m : false).filter(x => x).join('') + pr.key).toLowerCase();

const stringToPr = (x: string) => {
  const matcher = /^(\s*((alt)|(ctrl)|(shift))\s*){0,3}.*$/;
  const match = matcher.exec(x);
  if (!match) throw new Error('Cant parse press record');

  const alt = x.includes('alt');
  const ctrl = x.includes('ctrl');
  const shift = x.includes('shift');

  const keyMatch = /\b\w+$/.exec(x.replace(/ctrl|alt|shift/g, ''));

  return {ctrl, alt, shift, key: (keyMatch || [])[0]} as PressRecord;
}

const normalizeShortcut = (shortcut: string) => prToString(stringToPr(shortcut));

const isShortcutRegex = (x: string) => x.length > 1 && x[0] === '/';

const normalizeBinds = (b: Binds) => Object.keys(b).reduce((acc, cur) => ({
  ...acc,
  ...{
    [!isShortcutRegex(cur) ? normalizeShortcut(cur) : cur]: b[cur]
  }
}), {})

export type Binds = Record<string /* PressRecord */, <T extends React.KeyboardEvent>(e: T) => any>;

let isBoundHandler = false;

// A global map to store keybinds for each element
const globalKeybindsMap = new WeakMap<HTMLElement, Keybinds>();

export const useKeybinds = (keybinds: Keybinds) => {
  const elementRef = useRef<HTMLElement|null>(null);
  const lastElement = useRef<HTMLElement|null>(null);

  useEffect(() => {
    //if (lastElement.current !== elementRef.current) {
      const currentElement = elementRef.current;
      lastElement.current = currentElement;
      if (currentElement) {
        currentElement.tabIndex = 0;
        globalKeybindsMap.set(currentElement as any, keybinds);
      }
    //}
  }, [keybinds]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {

      let targetElement: HTMLElement | null = e.target as HTMLElement;

      const keybind = prToString(toPR(e));
      // Traverse up the DOM tree to check for keybinds
      while (targetElement) {
        const binds = globalKeybindsMap.get(targetElement);
        if (!binds) {
          //if (targetElement === e.target) break;
          targetElement = targetElement.parentElement;
          continue;
        }

        const handler = Object.keys(binds).find(k => {
          if (k[0] === '/') { //try regex
            return eval(k).test(keybind);
          }
          else {
            return normalizeShortcut(k) === keybind
          }
        });

        if (handler) {
          binds[handler](e);
          break;
        }

        targetElement = targetElement.parentElement;
      }
    };

    if (!isBoundHandler) {
      console.log('binding keydown');
      document.addEventListener('keydown', handleKeydown);
      isBoundHandler = true;
    }
    
    return () => {
      //console.log('unbinding keydown');
      globalKeybindsMap.delete(elementRef as any);
      document.removeEventListener('keydown', handleKeydown);
      isBoundHandler = false;
    };
  }, []);

  return elementRef;
};
