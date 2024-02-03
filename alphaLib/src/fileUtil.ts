import { promises as fs } from 'fs';
import { Source } from './compiler';
import { LineToken, lineToken } from './lineToken';
import { exists, onlyCreate } from '../../pkgs/file';
import { Err } from '../../pkgs/lang';

//✅
export const toLineTokens = (src: string) => src.split('\n').map((l, i) => lineToken(i, i, l))

const tokenSplice = (substituted: number, substitutions: LineToken[], src: Source) => {
  return src.lines.splice(
    src.lines.findIndex(t => t.lNoOr === substituted),
    1,
    ...substitutions.map((t, i) => lineToken( substituted, t.lNo, t.l ))
  ) && src;
}

// tested ✅  shollow import only ✅ TODO: full bundler 
export const include = async (source: Source) => {
  const buf = source;

  const inclusionLineMatcher = /^\s*include\s+(?<path>.*)/
  const inclusionLines = buf.lines.filter(t => inclusionLineMatcher.test(t.l));

  if (!inclusionLines.length) return buf;

  await Promise.all(inclusionLines.map(async (line) => {
    const { groups: { path } } = inclusionLineMatcher.exec(line.l) as any;
    !path && Err(`Path not found in include line ${line.lNo}`);
    const isLibFile = await exists('alphaLib/lib/' + path);

    !isLibFile && !exists(path) && Err(`File not found: ${path}`);

    const libFile = isLibFile ? `alphaLib/lib/${path}` : path
    const linesToInclude = await fs.readFile(libFile, 'utf8');
    const inclusionSource = {lines: toLineTokens(linesToInclude).map(t => (t.lNoOr = line.lNo, t))}
    //await include(inclusionSource)
    tokenSplice(
      line.lNo,
      inclusionSource.lines,
      buf
    );
    return
  }));

  return buf
} 
