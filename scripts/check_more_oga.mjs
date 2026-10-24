const urls = [
  'https://opengameart.org/content/forest-background-art',
  'https://opengameart.org/content/forest-background-art-2',
  'https://opengameart.org/content/mixed-fantasy-backgrounds',
  'https://opengameart.org/content/hallway-daynight-background-for-visual-novels',
  'https://opengameart.org/content/visual-novel-background-auditorium'
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const fileMatches = html.match(/\/sites\/default\/files\/[^\s"'>]+\.(zip|7z|png|jpg|jpeg)/gi) || [];
    const absoluteFiles = [...new Set(fileMatches)].map(f => 'https://opengameart.org' + f);
    console.log(`URL: ${url}`);
    console.log(`Files found (${absoluteFiles.length}):`);
    absoluteFiles.forEach(f => console.log('  -', f));
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
  }
}

for (const u of urls) {
  await checkUrl(u);
}
