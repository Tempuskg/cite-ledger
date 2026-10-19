// Checks that every product claim on a public surface comes from the accepted claim register,
// word for word, and that every register claim names tests that exist. Run after `npm test`, so a
// passing run means the claims in this version are backed by passing tests (MTP constraint 4).
// Surfaces: README.md (tagged lines), package.json description (the Marketplace and Open VSX
// listing text) and site/**/*.html (elements with data-claim).
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const register = JSON.parse(readFileSync(join(root, 'docs', 'claim-register.json'), 'utf8'));
const byId = new Map(register.claims.map((claim) => [claim.id, claim]));
const errors = [];

function files(dir, pattern) {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full, pattern) : pattern.test(name) ? [full] : [];
  });
}

const testSource = files(join(root, 'test'), /\.ts$/).map((file) => readFileSync(file, 'utf8')).join('\n');
for (const claim of register.claims) {
  for (const name of claim.tests) {
    const escaped = name.replace(/\\/g, '\\\\');
    if (!testSource.includes(`'${escaped}'`) && !testSource.includes(`\`${escaped}\``) && !testSource.includes(`'${name}'`)) {
      errors.push(`${claim.id}: test "${name}" not found in test/`);
    }
  }
  if (claim.id.startsWith('P') && claim.tests.length === 0) {
    errors.push(`${claim.id}: a product claim needs at least one test`);
  }
}

function plain(text) {
  return text
    .replace(/<sup>.*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/^\s*[-*+]\s+/, '')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function use(surface, id, text) {
  const claim = byId.get(id);
  if (!claim) {
    errors.push(`${surface}: ${id} is not in the claim register`);
    return;
  }
  if (claim.status !== 'accepted') {
    errors.push(`${surface}: ${id} is ${claim.status}, not accepted; it may not appear publicly`);
  }
  if (claim.requiresLiveProduct && !claim.productUrl) {
    errors.push(`${surface}: ${id} needs the live Polar product page, which the register does not name yet`);
  }
  const allowed = [claim.text, claim.proText].filter(Boolean);
  if (!allowed.includes(text)) {
    errors.push(`${surface}: ${id} text differs from the register.\n    found:    ${text}\n    register: ${allowed.join(' | ')}`);
  }
}

const readme = readFileSync(join(root, 'README.md'), 'utf8');
for (const line of readme.split(/\r?\n/)) {
  const tags = [...line.matchAll(/\[([PL]\d+)\]\(docs\/claim-register\.md#[pl]\d+\)/g)].map((match) => match[1]);
  if (tags.length > 1) {
    errors.push(`README.md: one claim per line: ${line}`);
  } else if (tags.length === 1) {
    use('README.md', tags[0], plain(line));
  }
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const listingClaim = register.claims.find((claim) => claim.text === pkg.description);
if (!listingClaim) {
  errors.push(`package.json description is not a register claim: ${pkg.description}`);
} else {
  use('package.json description', listingClaim.id, pkg.description);
}

for (const file of files(join(root, 'site'), /\.html$/)) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<(\w+)[^>]*\sdata-claim="([PL]\d+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    use(relative(root, file), match[2], plain(match[3]));
  }
}

const doc = readFileSync(join(root, 'docs', 'claim-register.md'), 'utf8');
for (const claim of register.claims) {
  if (!doc.includes(claim.text)) {
    errors.push(`docs/claim-register.md does not state ${claim.id} as registered`);
  }
}

if (errors.length > 0) {
  console.error(`Claim check failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Claim check passed: ${register.claims.length} register entries; README, listing text and site use accepted claims only.`);
