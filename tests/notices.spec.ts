import { globSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { expect, test } from "@playwright/test";

const notices = readFileSync("THIRD_PARTY_NOTICES.md", "utf8");

/** The rows of the table under a heading of the notices, as lists of cells. */
function rows(heading: string) {
  const section = notices.split(/^## /m).find((part) => part.startsWith(`${heading}\n`));
  return (section ?? "")
    .split("\n")
    .filter((line) => line.startsWith("| "))
    .slice(2)
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
}

const distributed = rows("Distributed with the site");

/** Reads the licences file, which the build makes from what it distributes. */
function distributedPackages() {
  const licences = readFileSync("dist/third-party-licences.txt", "utf8");
  return [...licences.matchAll(/^# (\S+) \S+ \((.+)\)$/gm)].map(([, name, licence]) => ({ name, licence }));
}

test("the notices name exactly the packages that the site distributes, with their licences", () => {
  const packages = distributedPackages();
  expect([...new Set(distributed.map(([, name]) => name))]).toEqual(packages.map(({ name }) => name));
  for (const { name, licence } of packages) {
    expect(distributed.find(([item]) => item === name)?.[3], name).toBe(licence);
  }
});

test("the distributed licences hold the terms of the packages and of their fonts", () => {
  const licences = readFileSync("dist/third-party-licences.txt", "utf8");
  expect(licences).toContain(readFileSync("node_modules/katex/LICENSE", "utf8").trim());
  expect(licences).toContain("SIL OPEN FONT LICENSE\n\nVersion 1.1");
});

test("every distributed file is GetMath's own or comes from a package in the notices", () => {
  const own = ["favicon.svg", "third-party-licences.txt"];
  const packages = distributedPackages().map(({ name }) => join("node_modules", name));
  const theirs = packages.flatMap((folder) => globSync(`${folder}/**/*.{woff2,woff,ttf}`));
  const unexplained = globSync("dist/**/*.*").filter((file) => {
    if (file.endsWith(".html") || own.includes(file.slice("dist/".length))) return false;
    // Styles and scripts are bundles, and the build records what they are made of.
    if (/\.(css|js)$/.test(file)) return false;
    return !theirs.some((source) => readFileSync(source).equals(readFileSync(file)));
  });
  expect(unexplained).toEqual([]);
});

test("every distributed font is under the licence that the notices give it", () => {
  expect(distributed.find(([item]) => item === "KaTeX fonts")?.[3]).toBe("OFL-1.1");
  const licence = "SIL Open Font License, Version 1.1";
  const fonts = globSync("dist/**/*.ttf");
  expect(fonts.length).toBeGreaterThan(0);
  for (const font of fonts) {
    const bytes = readFileSync(font);
    const inFont = bytes.includes(licence) || bytes.includes(Buffer.from(licence, "utf16le").swap16());
    expect(inFont, basename(font)).toBe(true);
  }
});

test("the notices record every dependency of the project", () => {
  const { dependencies, devDependencies } = JSON.parse(readFileSync("package.json", "utf8"));
  const headings = ["Distributed with the site", "Used to build the site", "Used only in development and testing"];
  const recorded = headings.flatMap(rows).flatMap(([item]) => item.split(/,? /));
  expect(recorded).toEqual(expect.arrayContaining(Object.keys({ ...dependencies, ...devDependencies })));
});
