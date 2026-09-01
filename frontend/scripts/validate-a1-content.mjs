import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const roadmapSource = readFileSync(resolve(root, "app/data/a1CourseRoadmap.ts"), "utf8");
const modulesDirectory = resolve(root, "app/data/modules");
const moduleNumbers = readdirSync(modulesDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^module\d+$/.test(entry.name))
  .map((entry) => Number(entry.name.slice("module".length)))
  .sort((left, right) => left - right);
const moduleFiles = moduleNumbers.map((moduleNumber) => {
  const directory = resolve(modulesDirectory, `module${moduleNumber}/lessons`);
  return readdirSync(directory).filter((name) => name.endsWith(".ts")).sort();
});
const moduleSources = moduleFiles.map((files, index) => {
  const directory = resolve(modulesDirectory, `module${moduleNumbers[index]}/lessons`);
  return files.map((name) => readFileSync(resolve(directory, name), "utf8")).join("\n");
});
const moduleIndexSources = moduleNumbers.map((moduleNumber) => readFileSync(resolve(modulesDirectory, `module${moduleNumber}/index.ts`), "utf8"));

const lessonPattern = /item\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"\)/g;
const plannedLessons = [...roadmapSource.matchAll(lessonPattern)].map((match) => ({ slug: match[1], title: match[2] }));
const allFileSlugs = moduleFiles.flatMap((files) => files.map((name) => name.slice(0, -3)));

const fail = (message) => { throw new Error(`A1 content validation failed: ${message}`); };
const uniquePlannedSlugs = new Set(plannedLessons.map((lesson) => lesson.slug));
const uniqueFileSlugs = new Set(allFileSlugs);
if (uniquePlannedSlugs.size !== plannedLessons.length) fail("duplicate roadmap lesson slug");
if (uniqueFileSlugs.size !== allFileSlugs.length) fail("duplicate lesson filename slug");
moduleNumbers.forEach((moduleNumber, index) => {
  if (moduleNumber !== index + 1) fail(`module directories are not contiguous at Module ${moduleNumber}`);
  const importedSlugs = [...moduleIndexSources[index].matchAll(/from "\.\/lessons\/([^"]+)"/g)].map((match) => match[1]);
  if (new Set(importedSlugs).size !== importedSlugs.length) fail(`duplicate lesson import in Module ${moduleNumber}`);
  const fileSlugs = moduleFiles[index].map((name) => name.slice(0, -3));
  for (const slug of fileSlugs) if (!importedSlugs.includes(slug)) fail(`unregistered Module ${moduleNumber} lesson file: ${slug}`);
  for (const slug of importedSlugs) if (!fileSlugs.includes(slug)) fail(`Module ${moduleNumber} imports missing lesson file: ${slug}`);
  if (!moduleIndexSources[index].includes(`export const module${moduleNumber}`)) fail(`Module ${moduleNumber} does not export its module definition`);
});
for (const lesson of plannedLessons) if (!uniqueFileSlugs.has(lesson.slug)) fail(`missing lesson file for ${lesson.slug}`);

const blockedText = /(?:TODO|placeholder|lorem ipsum|заполнить позже|запланировано)/i;
moduleSources.forEach((source, index) => {
  if (blockedText.test(source)) fail(`placeholder in Module ${index + 1} lesson source`);
});

const requiredModule3Fragments = [
  "aký dom?, aká kniha?, aké auto?",
  "cudzí turisti, но cudzie mestá",
  "Jeho, jej, ich не изменяются",
  "vaši kolegovia",
  "fialový",
  "nový študent — недавно пришёл; mladý študent — молод по возрасту",
  "Nie červené, ale modré.",
  "Mám aj brata, aj sestru.",
  "Najprv raňajkujem, potom pracujem a nakoniec oddychujem.",
];
for (const fragment of requiredModule3Fragments) {
  if (!moduleSources[2].includes(fragment)) fail(`Module 3 source coverage missing: ${fragment}`);
}

const requiredModule4Fragments = [
  "študenti → študentov",
  "na neho, na ňu, na nich",
  "v obchodoch, v školách, na uliciach",
  "dve knihy, tri mestá, štyri autá",
  "Niet času. Niet vody. Niet peňazí.",
  "Idem domov означает",
  "na stole — Kde? + Lokál",
  "u lekára, k lekárovi, od lekára",
  "so mnou, s tebou, s ním, s ňou",
  "naľavo/napravo — где",
  "doľava/doprava — куда",
];
for (const fragment of requiredModule4Fragments) {
  if (!moduleSources[3].includes(fragment)) fail(`Module 4 source coverage missing: ${fragment}`);
}

console.log(`Slovak A1 content valid: ${moduleNumbers.length} modules, ${allFileSlugs.length} registered lesson files.`);
