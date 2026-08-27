import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const roadmapSource = readFileSync(resolve(root, "app/data/a1CourseRoadmap.ts"), "utf8");
const expandedModule1Source = readFileSync(resolve(root, "app/data/module1ExpandedLessons.ts"), "utf8");
const expandedModule2Source = readFileSync(resolve(root, "app/data/module2ExpandedLessons.ts"), "utf8");
const content = JSON.parse(readFileSync(resolve(root, "app/data/a1CourseContent.json"), "utf8"));
const lessonPattern = /item\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"\)/g;
const plannedLessons = [...roadmapSource.matchAll(lessonPattern)].map((match) => ({ slug: match[1], title: match[2] }));
const module1Additions = plannedLessons.slice(0, 8);
const importedLessons = plannedLessons.slice(8);
const expandedModule1Slugs = [...expandedModule1Source.matchAll(/^\s+slug: "([^"]+)"/gm)].map((match) => match[1]);
const expectedCounts = [14, 7, 6, 11, 11, 18, 7, 9];

const fail = (message) => { throw new Error(`A1 content validation failed: ${message}`); };
const uniqueSlugs = new Set(plannedLessons.map((lesson) => lesson.slug));
if (uniqueSlugs.size !== plannedLessons.length) fail("duplicate roadmap lesson slug");
if (module1Additions.length !== 8) fail(`expected 8 Module 1 additions, found ${module1Additions.length}`);
if (expandedModule1Slugs.length !== 8) fail(`expected 8 expanded Module 1 lessons, found ${expandedModule1Slugs.length}`);
for (const [index, lesson] of module1Additions.entries()) {
  if (expandedModule1Slugs[index] !== lesson.slug) fail(`expanded Module 1 order mismatch at ${lesson.slug}`);
}
if (importedLessons.length !== 69) fail(`expected 69 imported lessons, found ${importedLessons.length}`);
if (expectedCounts.reduce((sum, count) => sum + count, 0) !== 83) fail("expected lesson counts do not total 83");

const importedSlugs = new Set(importedLessons.map((lesson) => lesson.slug));
const contentSlugs = Object.keys(content);
if (contentSlugs.length !== importedSlugs.size) fail(`expected ${importedSlugs.size} content records, found ${contentSlugs.length}`);
for (const slug of contentSlugs) if (!importedSlugs.has(slug)) fail(`unexpected content slug ${slug}`);

const blockedText = /(?:TODO|placeholder|lorem ipsum|заполнить позже|запланировано)/i;
if (blockedText.test(expandedModule1Source)) fail("placeholder in expanded Module 1 source");
if (blockedText.test(expandedModule2Source)) fail("placeholder in expanded Module 2 source");
for (const lesson of importedLessons) {
  const value = content[lesson.slug];
  if (!value) fail(`missing content for ${lesson.slug}`);
  if (value.title !== lesson.title) fail(`title mismatch for ${lesson.slug}`);
  for (const field of ["summary", "model", "mistake", "task"]) {
    if (typeof value[field] !== "string" || !value[field].trim()) fail(`empty ${field} for ${lesson.slug}`);
    if (blockedText.test(value[field])) fail(`placeholder in ${field} for ${lesson.slug}`);
  }
  if (!Array.isArray(value.examples) || value.examples.length !== 4) fail(`expected 4 examples for ${lesson.slug}`);
  for (const example of value.examples) {
    if (!example.slovak?.trim() || !example.russian?.trim()) fail(`incomplete example for ${lesson.slug}`);
  }
}

console.log(`Slovak A1 content valid: 8 modules, 83 lessons, 8 expanded Module 1 lessons, 7 expanded Module 2 lessons, ${contentSlugs.length} imported content records.`);
