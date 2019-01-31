import fetch from 'node-fetch';

interface Counts {
  [k: string]: number;
}

interface Entry {
  pubdate: string;
  tags: string[];
  // ...
}

const getPubdateFilter = (): ((i: Entry) => boolean) => {
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const year = yesterday.getFullYear();
  return (i) => i.pubdate.match(new RegExp('^' + year)) !== null;
};

const getTags = (): string[] => {
  const tagsJsonString = process.env.BBN_ENTRIES_TAGS;
  const tagsJson = typeof tagsJsonString === 'undefined'
    ? '[]'
    : tagsJsonString;
  return JSON.parse(tagsJson);
};

const getEntries = async (): Promise<Entry[]> => {
  const response = await fetch('http://blog.bouzuya.net/posts.json');
  return response.json();
};

// 昨日までの、その年のブログ記事の数をタグ別にまとめて返す
const count = async (): Promise<Counts> => {
  const tags = getTags();
  const pubdateFilter = getPubdateFilter();
  const entries = await getEntries();
  const filtered = entries.filter(pubdateFilter);
  const counts = tags.map((k) => {
    return { k, v: filtered.filter((i) => i.tags.some((j) => j === k)).length };
  }).concat([{ k: 'all', v: filtered.length }]);
  return counts.reduce((a, { k, v }) => {
    const key = 'bbn-entries-' + k.replace(/ /g, '-');
    return { ...a, [key]: v };
  }, {});
};

export default count;
