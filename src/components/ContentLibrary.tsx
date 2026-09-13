import { useMemo, useState } from 'react';
import { Badge, Card, CardContent } from './ui/primitives';

type Track = 'All' | 'DS&A' | 'System Design' | 'AI Infra' | 'Behavioral';
type Entry = { term: string; track: Exclude<Track, 'All'>; definition: string; signal: string };

const ENTRIES: Entry[] = [
  { term: 'Backpressure', track: 'System Design', definition: 'A system’s ability to slow producers when consumers cannot keep up.', signal: 'Discuss bounded queues, load shedding, retries, and how pressure propagates.' },
  { term: 'CAP theorem', track: 'System Design', definition: 'During a network partition, a distributed system must choose consistency or availability.', signal: 'Name the failure mode first; CAP is not a permanent two-of-three menu.' },
  { term: 'Consistent hashing', track: 'System Design', definition: 'Maps keys and nodes onto a ring so membership changes move only a small share of keys.', signal: 'Explain virtual nodes, hotspots, replication, and rebalancing.' },
  { term: 'Idempotency', track: 'System Design', definition: 'Repeating an operation produces the same externally visible result as executing it once.', signal: 'Use idempotency keys, deduplication records, and explicit expiry.' },
  { term: 'Quorum', track: 'System Design', definition: 'A read or write succeeds after responses from a required subset of replicas.', signal: 'Reason with N, R, W; then address latency and conflict resolution.' },
  { term: 'Sharding', track: 'System Design', definition: 'Partitions a dataset across machines to distribute storage and request load.', signal: 'Choose a key, then discuss skew, resharding, joins, and hot partitions.' },
  { term: 'Write-through cache', track: 'System Design', definition: 'Writes update cache and backing store synchronously before success is returned.', signal: 'Contrast consistency and write latency with write-back and cache-aside.' },
  { term: 'Sliding window', track: 'DS&A', definition: 'Maintains an evolving range to avoid recomputing overlapping subproblems.', signal: 'State the window invariant and exactly when each pointer moves.' },
  { term: 'Dynamic programming', track: 'DS&A', definition: 'Solves overlapping subproblems once and composes their results.', signal: 'Define state, transition, base cases, iteration order, and space optimization.' },
  { term: 'Monotonic stack', track: 'DS&A', definition: 'A stack kept in sorted order to find the next greater or smaller element efficiently.', signal: 'Explain what causes a pop and why every item is pushed and popped once.' },
  { term: 'Union–find', track: 'DS&A', definition: 'Tracks disjoint sets with near-constant-time union and connectivity checks.', signal: 'Mention path compression, union by rank, and the graph interpretation.' },
  { term: 'Topological sort', track: 'DS&A', definition: 'Orders a directed acyclic graph so every dependency precedes its dependents.', signal: 'Choose Kahn’s algorithm or DFS and show how you detect a cycle.' },
  { term: 'Batching', track: 'AI Infra', definition: 'Combines inference requests to improve accelerator utilization and throughput.', signal: 'Balance batch size against queue delay, memory, sequence length, and SLOs.' },
  { term: 'KV cache', track: 'AI Infra', definition: 'Stores transformer attention keys and values so generation does not recompute prior tokens.', signal: 'Connect memory pressure to concurrency, context length, and eviction.' },
  { term: 'HNSW', track: 'AI Infra', definition: 'A layered proximity graph used for fast approximate nearest-neighbor retrieval.', signal: 'Explain recall/latency/memory tradeoffs and construction versus query parameters.' },
  { term: 'Hybrid search', track: 'AI Infra', definition: 'Combines lexical and semantic retrieval to improve coverage and precision.', signal: 'Discuss score fusion, metadata filters, reranking, and evaluation.' },
  { term: 'Model routing', track: 'AI Infra', definition: 'Selects a model or serving path per request based on quality, latency, cost, and capacity.', signal: 'Define routing inputs, fallbacks, observability, and safe experimentation.' },
  { term: 'Reranking', track: 'AI Infra', definition: 'Applies a stronger model to reorder an initial set of retrieved candidates.', signal: 'Separate retrieval recall from final precision and account for added latency.' },
  { term: 'STAR', track: 'Behavioral', definition: 'Structures an example as Situation, Task, Action, and Result.', signal: 'Keep context brief, make your actions the majority, and quantify the result.' },
  { term: 'Story matrix', track: 'Behavioral', definition: 'Maps a reusable set of real experiences to common leadership and collaboration prompts.', signal: 'Avoid memorized scripts; preserve decisions, tension, tradeoffs, and learning.' },
];

const TRACKS: Track[] = ['All', 'DS&A', 'System Design', 'AI Infra', 'Behavioral'];

export function ContentLibrary() {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<Track>('All');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter((entry) => (track === 'All' || entry.track === track) && (!q || `${entry.term} ${entry.definition} ${entry.signal}`.toLowerCase().includes(q)));
  }, [query, track]);

  return (
    <div className="mx-auto max-w-6xl space-y-7 p-4 sm:p-6 lg:py-8">
      <section className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl shadow-zinc-900/[.04] backdrop-blur sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
        <Badge tone="info">Knowledge base</Badge>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] text-zinc-950 sm:text-5xl dark:text-white">Know the words. Explain the tradeoffs.</h1>
        <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">A compact field guide for the concepts you are expected to use fluently in coding, architecture, AI infrastructure, and behavioral interviews.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search the library</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search concepts, patterns, or signals…" className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by track">
          {TRACKS.map((item) => <button key={item} onClick={() => setTrack(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${track === item ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'}`}>{item}</button>)}
        </div>
      </section>

      <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-zinc-950 dark:text-white">Glossary</h2><span className="text-xs font-medium text-zinc-500">{results.length} concepts</span></div>
      {results.length ? <div className="grid gap-4 md:grid-cols-2">
        {results.map((entry) => <Card key={entry.term} className="group transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/[.06] dark:hover:border-indigo-700">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">{entry.term}</h3><Badge tone={entry.track === 'AI Infra' ? 'info' : entry.track === 'Behavioral' ? 'warn' : 'default'}>{entry.track}</Badge></div>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{entry.definition}</p>
            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800"><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Interview signal</div><p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">{entry.signal}</p></div>
          </CardContent>
        </Card>)}
      </div> : <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">No concepts match your search.</div>}
    </div>
  );
}
