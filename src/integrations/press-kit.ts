// Packs each language's press kit (visuals and texts) into one zip in
// dist/presse/ after every build, so the archives on /presse and /en/press
// never lag behind the pages.
import type { AstroIntegration } from "astro";
import { readFile, writeFile } from "node:fs/promises";
import { crc32 } from "node:zlib";
import { press, textsMarkdown } from "../lib/press";
import type { Locale } from "../lib/i18n";

/** A zip with stored (uncompressed) entries: the PNGs are compressed already.
 *  Every entry is dated 1980-01-01 so the same kit gives the same bytes. */
function zip(files: { name: string; data: Buffer }[]): Buffer {
  const dosDate = (1 << 5) | 1;
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const { name, data } of files) {
    const path = Buffer.from(name, "utf8");
    const crc = crc32(data);

    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(dosDate, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(path.length, 26);
    local.push(header, path, data);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4); // version made by
    entry.writeUInt16LE(20, 6); // version needed
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(dosDate, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(data.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(path.length, 28);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, path);

    offset += header.length + path.length + data.length;
  }

  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

export default function pressKit(): AstroIntegration {
  return {
    name: "press-kit",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const folder = new URL("presse/", dir);
        for (const locale of Object.keys(press) as Locale[]) {
          const { archive, visuals } = press[locale];
          const files = [
            ...(await Promise.all(visuals.map(async ({ file }) => ({ name: file, data: await readFile(new URL(file, folder)) })))),
            { name: archive.textFile, data: Buffer.from(textsMarkdown(locale), "utf8") },
          ].map(({ name, data }) => ({ name: `${archive.name}/${name}`, data }));

          await writeFile(new URL(`${archive.name}.zip`, folder), zip(files));
          logger.info(`presse/${archive.name}.zip: ${files.length} files`);
        }
      },
    },
  };
}
