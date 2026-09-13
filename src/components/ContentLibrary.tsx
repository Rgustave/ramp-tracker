import { useMemo, useState } from 'react';
import { Badge, Card, CardContent } from './ui/primitives';

type Track = 'All' | 'DS&A' | 'System Design' | 'AI Infra' | 'Agentic AI' | 'Behavioral';
type Entry = { term: string; track: Exclude<Track, 'All'>; definition: string; signal: string };
type Course = { order: string; title: string; provider: string; level: string; url: string; focus: string; build: string; topics: string[] };

const COURSES: Course[] = [
  { order: '01', title: 'AI Agents Course', provider: 'Hugging Face', level: 'Foundation → advanced', url: 'https://huggingface.co/learn/agents-course/unit0/introduction', focus: 'A hands-on foundation in agent concepts, frameworks, tool use, reasoning loops, and real assignments.', build: 'Build a research agent that cites sources, handles tool failure, and produces a structured brief.', topics: ['Agent loop', 'Tools', 'Frameworks', 'Assignments'] },
  { order: '02', title: 'Agentic AI', provider: 'DeepLearning.AI', level: 'Intermediate', url: 'https://www.deeplearning.ai/courses/agentic-ai/', focus: 'A structured course on reflection, tool use, planning, and multi-agent collaboration patterns.', build: 'Create a planner–executor workflow with explicit stop conditions and a critique pass.', topics: ['Reflection', 'Planning', 'Multi-agent', 'Patterns'] },
  { order: '03', title: 'Building Effective Agents', provider: 'Anthropic', level: 'Production patterns', url: 'https://www.anthropic.com/research/building-effective-agents', focus: 'A pragmatic guide to choosing workflows versus agents and composing reliable orchestration patterns.', build: 'Implement routing, parallelization, and evaluator–optimizer variants against the same task.', topics: ['Routing', 'Orchestration', 'Evaluation', 'Tradeoffs'] },
  { order: '04', title: 'Agents Guide', provider: 'OpenAI', level: 'Production implementation', url: 'https://platform.openai.com/docs/guides/agents', focus: 'Current platform guidance for models, tools, knowledge, control flow, deployment, and optimization.', build: 'Ship one observable agent with tools, traces, guardrails, and a regression eval set.', topics: ['Tools', 'Knowledge', 'Control flow', 'Evals'] },
  { order: '05', title: 'Model Context Protocol', provider: 'MCP', level: 'Ecosystem standard', url: 'https://modelcontextprotocol.io/docs/getting-started/intro', focus: 'The open protocol for connecting AI applications to tools, resources, prompts, and external systems.', build: 'Create a narrow MCP server with one resource and one safe, idempotent tool.', topics: ['Servers', 'Clients', 'Resources', 'Security'] },
];

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
  { term: 'Agent loop', track: 'Agentic AI', definition: 'A bounded cycle in which a model observes state, chooses an action, receives the result, and decides what comes next.', signal: 'Define the termination condition, budget, recoverable errors, and human escalation path.' },
  { term: 'Context engineering', track: 'Agentic AI', definition: 'Designing the information, tools, memory, and instructions available to a model at each decision point.', signal: 'Discuss relevance, token cost, provenance, isolation, and what should deliberately be withheld.' },
  { term: 'Evals', track: 'Agentic AI', definition: 'Repeatable tests that measure an AI system’s task success, quality, safety, latency, and cost.', signal: 'Use representative datasets, deterministic graders where possible, traces, and regression thresholds.' },
  { term: 'Guardrail', track: 'Agentic AI', definition: 'A control that constrains, validates, or blocks agent inputs, decisions, tool calls, or outputs.', signal: 'Layer permissions, validation, policy checks, sandboxing, and human approval instead of relying on prompts.' },
  { term: 'Handoff', track: 'Agentic AI', definition: 'A deliberate transfer of control and relevant state from one specialized agent or human to another.', signal: 'Specify routing criteria, the state contract, ownership, and how failed transfers recover.' },
  { term: 'MCP', track: 'Agentic AI', definition: 'Model Context Protocol: a standard interface through which AI applications discover and use tools, resources, and prompts.', signal: 'Explain trust boundaries, capability discovery, authentication, and least-privilege tool design.' },
  { term: 'Structured output', track: 'Agentic AI', definition: 'Model output constrained to a declared schema so downstream software can validate and consume it safely.', signal: 'Separate syntactic validity from semantic correctness and include retry or repair behavior.' },
  { term: 'Tool calling', track: 'Agentic AI', definition: 'Letting a model select a declared operation and produce validated arguments for application-controlled execution.', signal: 'Keep execution outside the model, validate arguments, make side effects explicit, and return actionable errors.' },
  { term: 'Backward compatibility', track: 'System Design', definition: 'The ability of existing clients, integrations, and saved data to keep working as a platform evolves.', signal: 'Discuss additive change, deprecation windows, version negotiation, migrations, telemetry, and rollback.' },
  { term: 'Plugin lifecycle', track: 'Agentic AI', definition: 'The complete path for an extension: create, configure, test, publish, discover, install, update, observe, and retire.', signal: 'Treat permissions, versioning, review, rollback, and debugging as first-class platform surfaces.' },
  { term: 'SDK ergonomics', track: 'System Design', definition: 'How effectively a software development kit guides developers toward correct, discoverable, and maintainable use.', signal: 'Show consistent naming, typed contracts, actionable errors, safe defaults, escape hatches, and examples.' },
  { term: 'Capability model', track: 'Agentic AI', definition: 'An explicit description of what an extension or agent is allowed to access and do.', signal: 'Prefer least privilege, user-visible consent, scoped credentials, revocation, and auditable execution.' },
  { term: 'Code review', track: 'System Design', definition: 'A structured examination of a change for correctness, maintainability, security, testability, efficiency, and operational risk.', signal: 'Prioritize behavior and risk over style; make feedback specific, justified, and proportionate.' },
  { term: 'Production triage', track: 'System Design', definition: 'Rapidly determining scope, impact, likely fault domain, and safest response when a live system misbehaves.', signal: 'Start with evidence, separate mitigation from root cause, and trace across application, service, network, runtime, and hardware.' },
  { term: 'ETL / ELT', track: 'AI Infra', definition: 'Data-integration patterns that transform before loading or load before transforming, depending on governance, scale, and platform capabilities.', signal: 'Discuss schema evolution, lineage, idempotency, backfills, quality gates, orchestration, and batch versus streaming.' },
  { term: 'Multimodal evaluation', track: 'AI Infra', definition: 'Evaluation that accounts for the distinct semantics and failure modes of text, tabular data, images, audio, and video.', signal: 'Use modality-specific slices, grounded human review, robustness tests, and task-level—not merely model-level—metrics.' },
  { term: 'Technical facilitation', track: 'Behavioral', definition: 'Guiding a group through difficult material using clear outcomes, active practice, feedback, and adaptation.', signal: 'Demonstrate subject mastery, audience calibration, live debugging, inclusive participation, and evidence-driven curriculum revision.' },
  { term: 'STAR', track: 'Behavioral', definition: 'Structures an example as Situation, Task, Action, and Result.', signal: 'Keep context brief, make your actions the majority, and quantify the result.' },
  { term: 'Story matrix', track: 'Behavioral', definition: 'Maps a reusable set of real experiences to common leadership and collaboration prompts.', signal: 'Avoid memorized scripts; preserve decisions, tension, tradeoffs, and learning.' },
];

const TRACKS: Track[] = ['All', 'DS&A', 'System Design', 'AI Infra', 'Agentic AI', 'Behavioral'];

export function ContentLibrary() {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<Track>('All');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter((entry) => (track === 'All' || entry.track === track) && (!q || `${entry.term} ${entry.definition} ${entry.signal}`.toLowerCase().includes(q)));
  }, [query, track]);

  return (
    <div className="mx-auto max-w-6xl space-y-7 p-4 sm:p-6 lg:py-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <Badge tone="info">Knowledge base</Badge>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-[-0.03em] text-zinc-950 sm:text-4xl dark:text-white">Know the words. Explain the tradeoffs.</h1>
        <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">A compact field guide for the concepts you are expected to use fluently in coding, architecture, AI infrastructure, agentic systems, and behavioral interviews.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search the library</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search concepts, patterns, or signals…" className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by track">
          {TRACKS.map((item) => <button key={item} type="button" aria-pressed={track === item} onClick={() => setTrack(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${track === item ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'}`}>{item}</button>)}
        </div>
      </section>

      {(track === 'All' || track === 'Agentic AI') && <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Agentic AI learning path</div><h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">From agent demos to reliable systems</h2></div>
          <p className="max-w-md text-sm text-zinc-500 sm:text-right">Follow in order. Every resource ends with a portfolio-grade build, not a certificate.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {COURSES.map((course) => <a key={course.order} href={course.url} target="_blank" rel="noreferrer" className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 font-mono text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">{course.order}</div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-zinc-950 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">{course.title} <span aria-hidden="true">↗</span></h3><span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800">{course.level}</span></div><div className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{course.provider}</div></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{course.focus}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">{course.topics.map((topic) => <span key={topic} className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{topic}</span>)}</div>
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 dark:border-indigo-900/70 dark:bg-indigo-950/40"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">Build to prove it</div><p className="mt-1 text-xs leading-5 text-indigo-950 dark:text-indigo-100">{course.build}</p></div>
          </a>)}
        </div>
      </section>}

      <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-zinc-950 dark:text-white">Glossary</h2><span className="text-xs font-medium text-zinc-500">{results.length} concepts</span></div>
      {results.length ? <div className="grid gap-4 md:grid-cols-2">
        {results.map((entry) => <Card key={entry.term} className="group transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/[.06] dark:hover:border-indigo-700">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">{entry.term}</h3><Badge tone={entry.track === 'AI Infra' || entry.track === 'Agentic AI' ? 'info' : entry.track === 'Behavioral' ? 'warn' : 'default'}>{entry.track}</Badge></div>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{entry.definition}</p>
            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800"><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Interview signal</div><p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">{entry.signal}</p></div>
          </CardContent>
        </Card>)}
      </div> : <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">No concepts match your search.</div>}
    </div>
  );
}
