/*
 * Auto-generates SQL seed for tutorials based on markdown sources in Tutorial/
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TUTORIAL_DIR = path.resolve(ROOT_DIR, 'Tutorial');
const OUTPUT_PATH = path.resolve(__dirname, 'tutorial_seed.sql');

const tutorialConfigs = [
  {
    file: 'analisa.md',
    slug: 'analisis-teknikal-vs-fundamental',
    category: 'Analysis',
    difficulty: 'intermediate',
    description: 'Panduan membandingkan analisis teknikal dan fundamental serta cara menggabungkannya untuk keputusan investasi yang lebih tajam.',
    estimatedReadTime: 8,
    orderIndex: 10,
    author: 'Erwanto Khusuma',
    publishedAt: '2025-10-17T00:00:00Z',
    tags: ['Analisis Teknikal', 'Analisis Fundamental', 'Strategi Investasi', 'Trading'],
    metaKeywords: ['analisis teknikal', 'analisis fundamental', 'strategi investasi', 'techno-fundamental'],
    introTitle: 'Pendahuluan'
  },
  {
    file: 'BELAJAR-TRAD.md',
    slug: 'cara-belajar-trading-dari-nol',
    category: 'Trading Basics',
    difficulty: 'beginner',
    description: 'Panduan santai namun serius untuk pemula memahami mindset, langkah belajar, dan strategi awal sebelum terjun dari akun demo hingga trading live.',
    estimatedReadTime: 9,
    orderIndex: 20,
    author: 'FOREXimf Admin',
    publishedAt: '2025-05-15T00:00:00Z',
    tags: ['Trading Basics', 'Mindset Trading', 'Risk Management', 'Forex'],
    metaKeywords: ['belajar trading', 'akun demo', 'money management', 'trading forex pemula'],
    introTitle: 'Pendahuluan',
    sectionLevel: 3
  },
  {
    file: 'count.md',
    slug: 'cara-hitung-profit-return-saham-as',
    category: 'Portfolio Management',
    difficulty: 'intermediate',
    description: 'Langkah-langkah menghitung capital gain, dividend yield, dan total return saham Amerika termasuk dampak kurs USD terhadap rupiah.',
    estimatedReadTime: 6,
    orderIndex: 30,
    author: 'Erwanto Khusuma',
    publishedAt: '2025-11-10T00:00:00Z',
    tags: ['Capital Gain', 'Dividend Yield', 'US Stocks', 'Currency Risk'],
    metaKeywords: ['capital gain', 'dividend yield', 'total return', 'saham amerika', 'kurs usd idr'],
    introTitle: 'Pendahuluan'
  },
  {
    file: 'crypto.md',
    slug: 'panduan-perdagangan-cryptocurrency',
    category: 'Crypto Trading',
    difficulty: 'beginner',
    description: 'Panduan praktis untuk pemula memahami dasar crypto, jenis perdagangan, langkah memulai di exchange, dan keterampilan yang dibutuhkan.',
    estimatedReadTime: 7,
    orderIndex: 40,
    author: 'AI Trading Agent',
    publishedAt: '2025-08-15T00:00:00Z',
    tags: ['Crypto Trading', 'Blockchain', 'Risk Management', 'Diversifikasi Portofolio'],
    metaKeywords: ['crypto trading', 'blockchain', 'risk management', 'strategi crypto'],
    introTitle: 'Pendahuluan'
  },
  {
    file: 'ISTILAH.md',
    slug: 'istilah-trading-forex-untuk-pemula',
    category: 'Forex Basics',
    difficulty: 'beginner',
    description: 'Glosarium istilah penting trading forex lengkap dengan penjelasan singkat bagi pemula.',
    estimatedReadTime: 8,
    orderIndex: 50,
    author: 'Valbury Journal',
    publishedAt: '2025-08-13T00:00:00Z',
    tags: ['Forex Basics', 'Glosarium', 'Terminologi Trading'],
    metaKeywords: ['istilah forex', 'glosarium trading', 'trading forex pemula'],
    introTitle: 'Pendahuluan',
    defaultSectionTitle: 'Glosarium Istilah Forex',
    manualSections: istilahSections
  },
  {
    file: 'tipestok.md',
    slug: 'kriteria-saham-untuk-day-trading',
    category: 'Day Trading',
    difficulty: 'intermediate',
    description: 'Lima kriteria utama memilih saham untuk strategi day trading beserta contoh saham likuid di BEI.',
    estimatedReadTime: 5,
    orderIndex: 60,
    author: 'Guest User',
    publishedAt: '2024-06-22T00:00:00Z',
    tags: ['Day Trading', 'Stock Selection', 'Likuiditas'],
    metaKeywords: ['day trading', 'likuiditas saham', 'katalis saham'],
    introTitle: 'Pendahuluan'
  },
  {
    file: 'tips.md',
    slug: 'tips-investasi-pasar-modal-pemula',
    category: 'Investing Basics',
    difficulty: 'beginner',
    description: 'Sepuluh tips inti dari MOST Mandiri Sekuritas agar investor pemula dapat memulai investasi pasar modal dengan aman.',
    estimatedReadTime: 4,
    orderIndex: 70,
    author: 'MOST Editorial',
    publishedAt: '2025-06-01T00:00:00Z',
    tags: ['Investasi Pemula', 'Diversifikasi', 'Tujuan Finansial'],
    metaKeywords: ['investasi pasar modal', 'tips investasi', 'pemula'],
    introTitle: 'Pendahuluan'
  },
  {
    file: 'tradeing.md',
    slug: 'trading-saham-panduan-pemula',
    category: 'Trading Basics',
    difficulty: 'beginner',
    description: 'Panduan lengkap mengenal trading saham online, jenis strategi, risiko, dan cara memulai lewat aplikasi Ajaib untuk pemula.',
    estimatedReadTime: 5,
    orderIndex: 80,
    author: 'Sarifa',
    publishedAt: '2025-05-19T00:00:00Z',
    tags: ['Trading Saham', 'Aplikasi Ajaib', 'Strategi Trading'],
    metaKeywords: ['trading saham', 'day trading', 'swing trading', 'aplikasi ajaib'],
    introTitle: 'Pendahuluan'
  }
];

function istilahSections(content, config) {
  const lines = content.split('\n');
  const listStart = lines.findIndex(line => /^\s*1\./.test(line));
  if (listStart === -1) {
    return [
      {
        title: config.introTitle || 'Pendahuluan',
        content: content.trim()
      }
    ];
  }
  const intro = lines.slice(0, listStart).join('\n').trim();
  const list = lines.slice(listStart).join('\n').trim();
  const sections = [];
  if (intro) {
    sections.push({
      title: config.introTitle || 'Pendahuluan',
      content: intro
    });
  }
  sections.push({
    title: config.defaultSectionTitle || 'Glosarium Istilah Forex',
    content: list
  });
  return sections;
}

function main() {
  const blocks = tutorialConfigs.map(buildTutorialBlock);
  const sqlLines = [
    '-- Auto-generated by generate_tutorial_seed.js',
    'BEGIN;',
    '',
    ...blocks,
    '',
    'COMMIT;',
    ''
  ];
  fs.writeFileSync(OUTPUT_PATH, sqlLines.join('\n'), 'utf8');
  console.log(`SQL seed written to ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
}

function buildTutorialBlock(config) {
  const { title, content } = readAndClean(config);
  const slugTracker = createSlugTracker();
  const sections = getSections(config, content, slugTracker);
  if (!sections.length) {
    throw new Error(`No sections found for ${config.file}`);
  }

  const tags = uniqueArray(config.tags || []);
  const metaKeywords = uniqueArray(config.metaKeywords && config.metaKeywords.length ? config.metaKeywords : tags);

  const tutorialValues = [
    sqlString(title),
    sqlString(config.slug),
    sqlString(config.description),
    sqlString(config.category),
    sqlString(config.difficulty),
    String(config.estimatedReadTime || 0),
    String(config.orderIndex || 0),
    sqlString('published'),
    sqlArray(metaKeywords),
    sqlString(config.author || 'AI Trading Agent'),
    sqlTimestamp(config.publishedAt)
  ];

  const tagValues = tags.map(tag => `(${sqlString(tag)})`).join(',\n      ');

  const sectionRows = sections.map((section, idx) => {
    const orderIndex = (idx + 1) * 10;
    const titleLiteral = sqlString(section.title);
    const slugLiteral = sqlString(section.slug);
    const contentLiteral = dollarQuote(section.content);
    return `((SELECT id FROM tutorial_upsert), ${titleLiteral}, ${slugLiteral}, ${contentLiteral}, 'markdown', ${orderIndex}, true)`;
  }).join(',\n    ');

  return [
    `-- Tutorial: ${title}`,
    'WITH tutorial_upsert AS (',
    `  INSERT INTO public.tutorials (title, slug, description, category, difficulty_level, estimated_read_time, order_index, status, meta_keywords, author, published_at)`,
    `  VALUES (${tutorialValues.join(', ')})`,
    '  ON CONFLICT (slug) DO UPDATE SET',
    '    title = EXCLUDED.title,',
    '    description = EXCLUDED.description,',
    '    category = EXCLUDED.category,',
    '    difficulty_level = EXCLUDED.difficulty_level,',
    '    estimated_read_time = EXCLUDED.estimated_read_time,',
    '    order_index = EXCLUDED.order_index,',
    '    status = EXCLUDED.status,',
    '    meta_keywords = EXCLUDED.meta_keywords,',
    '    author = EXCLUDED.author,',
    '    updated_at = timezone(\'utc\', now()),',
    '    published_at = EXCLUDED.published_at',
    '  RETURNING id',
    '),',
    'section_cleanup AS (',
    '  DELETE FROM public.sections WHERE tutorial_id = (SELECT id FROM tutorial_upsert)',
    '),',
    'tag_cleanup AS (',
    '  DELETE FROM public.tutorial_tag_relations WHERE tutorial_id = (SELECT id FROM tutorial_upsert)',
    '),',
    'tag_inserts AS (',
    '  INSERT INTO public.tutorial_tags (name)',
    '  SELECT DISTINCT name FROM (VALUES',
    `      ${tagValues}`,
    '  ) AS v(name)',
    '  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name',
    '  RETURNING id, name',
    '),',
    'section_inserts AS (',
    '  INSERT INTO public.sections (tutorial_id, title, slug, content, content_type, order_index, is_visible)',
    `  VALUES\n    ${sectionRows}`,
    '  RETURNING id',
    ')',
    'INSERT INTO public.tutorial_tag_relations (tutorial_id, tag_id)',
    'SELECT (SELECT id FROM tutorial_upsert), id FROM tag_inserts;',
    ''
  ].join('\n');
}

function readAndClean(config) {
  const filePath = path.join(TUTORIAL_DIR, config.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Tutorial file not found: ${config.file}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const titleMatch = raw.match(/^#\s+(.*)$/m);
  if (!titleMatch) {
    throw new Error(`Missing level-1 heading in ${config.file}`);
  }
  const title = titleMatch[1].trim();
  const bodyStart = raw.indexOf(titleMatch[0]) + titleMatch[0].length;
  let body = raw.slice(bodyStart).trim();

  const removalPatterns = [
    /^\s*---\s*$/gm,
    /^\*\*Author:\*\*.*$/gim,
    /^\*\*Tanggal:\*\*.*$/gim,
    /^\*\*Tags:\*\*.*$/gim,
    /^\*\*Slug:\*\*.*$/gim,
    /^\*\*Penulis:\*\*.*$/gim,
    /^Penulis:.*$/gim,
    /^Tanggal:.*$/gim,
    /^\*\*Link:\*\*.*$/gim,
    /^\*\*Sumber:\*\*.*$/gim
  ];
  if (Array.isArray(config.additionalRemovalPatterns)) {
    removalPatterns.push(...config.additionalRemovalPatterns);
  }
  removalPatterns.forEach((pattern) => {
    body = body.replace(pattern, '').trim();
  });

  body = body
    .replace(/:contentReference\[.*?\]\{.*?\}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, content: body };
}

function getSections(config, content, slugTracker) {
  if (typeof config.manualSections === 'function') {
    const manual = config.manualSections(content, config);
    return manual.map((section) => normalizeSection(section, slugTracker));
  }

  const headingMatches = [...content.matchAll(/^#{2,6}\s+.*$/gm)];
  let targetLevel = config.sectionLevel;
  if (!targetLevel) {
    targetLevel = headingMatches.reduce((min, match) => {
      const level = (match[0].match(/^#+/) || [''])[0].length;
      if (level > 1 && level < min) {
        return level;
      }
      return min;
    }, Infinity);
    if (!isFinite(targetLevel) || targetLevel > 6) {
      targetLevel = null;
    }
  }

  if (!targetLevel) {
    return [normalizeSection({
      title: config.defaultSectionTitle || 'Konten Utama',
      content: content
    })];
  }

  const sectionPattern = new RegExp(`^#{${targetLevel}}\\s+(.*)$`, 'gm');
  const matches = [...content.matchAll(sectionPattern)];

  if (!matches.length) {
    return [normalizeSection({
      title: config.defaultSectionTitle || 'Konten Utama',
      content: content
    })];
  }

  const sections = [];
  const introTitle = config.introTitle || 'Pendahuluan';
  const firstMatch = matches[0];
  const introContent = content.slice(0, firstMatch.index).trim();
  if (introContent) {
    sections.push(normalizeSection({
      title: introTitle,
      content: introContent
    }, slugTracker));
  }

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const rawTitle = match[1].trim();
    const cleanedTitle = rawTitle.replace(/^\d+[\.|)]\s*/, '').trim();
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const sectionContent = content.slice(start, end).trim();
    sections.push(normalizeSection({
      title: cleanedTitle,
      content: sectionContent
    }, slugTracker));
  }

  return sections.filter(section => section.content.length > 0);
}

function normalizeSection(section, slugTracker) {
  const title = section.title || 'Bagian';
  const slug = makeUniqueSlug(slugTracker, title, section.slugCounter);
  return {
    title,
    slug,
    content: (section.content || '').trim()
  };
}

function createSlugTracker() {
  return new Map();
}

function makeUniqueSlug(registry, title) {
  const base = slugify(title);
  if (!registry.has(base)) {
    registry.set(base, 1);
    return base;
  }
  const count = registry.get(base) + 1;
  registry.set(base, count);
  return `${base}-${count}`;
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return slug || 'section';
}

function sqlString(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlTimestamp(value) {
  if (!value) {
    return 'timezone(\'utc\', now())';
  }
  return `${sqlString(value)}::timestamptz`;
}

function sqlArray(items) {
  const arr = (items || []).map((item) => sqlString(item));
  if (!arr.length) {
    return `'{}'::text[]`;
  }
  return `ARRAY[${arr.join(', ')}]::text[]`;
}

function dollarQuote(content) {
  const sanitized = content.replace(/\s+$/g, '').replace(/\u0000/g, '');
  let tag = '$$';
  let attempt = 0;
  while (sanitized.includes(tag)) {
    attempt += 1;
    tag = `$q${attempt}$`;
  }
  return `${tag}${sanitized}${tag}`;
}

function uniqueArray(items) {
  return Array.from(new Set((items || []).map((item) => item.trim()).filter(Boolean)));
}

main();
