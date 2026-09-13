import type { ResourceEntry, ResourceLink } from '../types';
import { FRONTIER_DAILY_FOCUS } from './frontierDailyPlan';

type Module = Omit<ResourceEntry, 'conceptSummary'> & { summary: string };

const link = (title: string, url: string, type: string, whyThisOne: string, estimatedMinutes?: number): ResourceLink => ({ title, url, type, cost: 'free', estimatedMinutes, whyThisOne });

const MODULES: Record<string, Module> = {
  career: {
    summary: 'Frontier-lab titles hide very different jobs. Build an evidence matrix from responsibilities—not titles—then choose preparation based on repeated requirements and your strongest demonstrated advantage.',
    learningObjectives: ['Separate applied AI, research engineering, ML systems, inference, platform, and safety/evals roles.', 'Translate every requirement into observable evidence: shipped system, experiment, review, talk, or operational result.', 'Identify one primary lane and two adjacent lanes without pretending one résumé fits every role.'],
    exercise: 'Collect 15–20 current postings from several labs and AI-forward companies. Tag every responsibility, tally recurring signals, score your evidence 0–3, and select the three gaps with the highest hiring impact.',
    proofStandard: 'The matrix links each claimed strength to a specific artifact or quantified work example and produces a ranked—not aspirational—learning backlog.',
    resources: [link('Anthropic — Current roles', 'https://www.anthropic.com/careers/jobs', 'job_evidence', 'A live cross-section of research, infrastructure, inference, safety, and product-facing roles.', 45), link('Google Machine Learning — Rules of ML', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'field_guide', 'Connects model work to production decisions and organizational reality.', 90)],
  },
  software: {
    summary: 'Frontier teams still hire exceptional software engineers. Fluency with tools, debugging, tests, reviews, interfaces, and unfamiliar repositories is the foundation beneath every AI specialization.',
    learningObjectives: ['Produce readable, tested Python and TypeScript with explicit failure behavior.', 'Debug from evidence across application, runtime, network, and service boundaries.', 'Review human- or agent-generated changes for correctness, security, scope, and operability.'],
    exercise: 'Take an unfamiliar repository issue from reproduction to reviewed patch. Write the failing test first, instrument the relevant path, implement the smallest fix, and write review notes as if the author were someone else.',
    proofStandard: 'Tests reproduce the original failure, the diff is narrow, review comments are risk-based, and another engineer can understand the diagnosis without a meeting.',
    resources: [link('MIT — The Missing Semester', 'https://missing.csail.mit.edu/', 'course', 'High-leverage command line, debugging, tooling, and version-control fundamentals.', 600), link('Google Engineering Practices — Code Review', 'https://google.github.io/eng-practices/review/', 'field_guide', 'Concrete standards for reviewing production code and communicating feedback.', 120)],
  },
  ml: {
    summary: 'A strong AI engineer must reason about data, objectives, optimization, generalization, and model behavior—not merely call an API. Implementation makes the abstractions inspectable.',
    learningObjectives: ['Explain training and inference from tensor inputs to evaluated outputs.', 'Recognize leakage, weak baselines, invalid metrics, and unstable optimization.', 'Move between framework abstractions and the underlying computation.'],
    exercise: 'Train or fine-tune a small model with a declared baseline. Track configuration, data version, curves, checkpoints, and evaluation; deliberately introduce one failure and diagnose it.',
    proofStandard: 'The run is reproducible, every metric has a reason to exist, and the write-up distinguishes evidence from interpretation.',
    resources: [link('Google — Machine Learning Crash Course', 'https://developers.google.com/machine-learning/crash-course', 'course', 'Strong practical foundation in objectives, data, generalization, and production ML.', 900), link('PyTorch — Learn the Basics', 'https://pytorch.org/tutorials/beginner/basics/intro.html', 'course', 'Official end-to-end path through tensors, autograd, training, and model saving.', 600), link('Stanford CS336 — Language Modeling from Scratch', 'https://stanford-cs336.github.io/spring2025/', 'course', 'Rigorous implementation-oriented treatment of modern language models.', 1800)],
  },
  ml_systems: {
    summary: 'ML systems work is the discipline of converting model computation into reliable throughput. The central habit is measurement: memory, utilization, latency distributions, communication, and recovery.',
    learningObjectives: ['Build capacity models for training and inference workloads.', 'Profile before optimizing and explain bottlenecks using hardware and systems constraints.', 'Design scheduling, batching, checkpointing, and recovery around explicit SLOs.'],
    exercise: 'Benchmark one model workload, locate the dominant bottleneck, change one variable, and produce a quality/latency/throughput/cost frontier with a falsifiable explanation.',
    proofStandard: 'Results include warmup, multiple runs, environment details, tail latency, uncertainty, and a finding that survives an independent rerun.',
    resources: [link('Full Stack Deep Learning — Course', 'https://fullstackdeeplearning.com/course/2022/', 'course', 'A practical bridge from model code to data, deployment, monitoring, and product.', 1200), link('PyTorch Profiler', 'https://pytorch.org/tutorials/recipes/recipes/profiler_recipe.html', 'tutorial', 'Official workflow for finding CPU and accelerator bottlenecks.', 90), link('vLLM Documentation', 'https://docs.vllm.ai/', 'reference', 'Concrete serving concepts including scheduling, KV cache, and production operation.', 180)],
  },
  systems: {
    summary: 'System design is constrained reasoning, not architecture vocabulary. Start with workload and guarantees, quantify scale, choose boundaries, and make failure and operations part of the design.',
    learningObjectives: ['Turn ambiguous requirements into workload, SLO, data, and trust assumptions.', 'Estimate capacity and compare alternatives using explicit tradeoffs.', 'Design for degradation, observability, security, migration, and recovery.'],
    exercise: 'Write a two-page design for the daily system. Include traffic and storage estimates, APIs, data model, critical path, failure table, observability, rollout, and the alternative you rejected.',
    proofStandard: 'A reviewer can challenge every major choice because assumptions, numbers, and consequences are visible.',
    resources: [link('Designing Data-Intensive Applications', 'https://dataintensive.net/', 'book', 'The most durable foundation for storage, replication, streams, consistency, and derived data.', 1200), link('Google — Site Reliability Engineering', 'https://sre.google/sre-book/table-of-contents/', 'book', 'Authoritative operational thinking about SLOs, incidents, automation, and reliability.', 900)],
  },
  applied: {
    summary: 'Applied AI is product engineering under probabilistic behavior. The job is to find a valuable workflow, build the smallest useful system, evaluate it honestly, and operate it safely.',
    learningObjectives: ['Frame user value and failure cost before choosing a model or architecture.', 'Use structured outputs, retrieval, tools, and multimodality only where they improve the workflow.', 'Treat evaluation, latency, cost, uncertainty, and recovery as product behavior.'],
    exercise: 'Build a vertical slice for one real user. Capture five representative tasks, define success and unacceptable failure, instrument the flow, and observe the user attempting it without coaching.',
    proofStandard: 'The demo solves a real task, the eval contains difficult cases, and the next recommendation follows from user and system evidence.',
    resources: [link('OpenAI Cookbook', 'https://cookbook.openai.com/', 'course_and_examples', 'Official practical patterns for building, evaluating, and operating model applications.', 600), link('Full Stack Deep Learning — LLM Bootcamp', 'https://fullstackdeeplearning.com/llm-bootcamp/', 'course', 'Product-oriented coverage from foundations through deployment and UX.', 900), link('W3C — WAI Tutorials', 'https://www.w3.org/WAI/tutorials/', 'field_guide', 'Make AI interfaces usable with keyboards, assistive technology, and inclusive interaction patterns.', 180)],
  },
  retrieval: {
    summary: 'Retrieval quality comes from the entire pipeline: source selection, parsing, chunks, metadata, candidate generation, reranking, grounding, and abstention. Vector search alone is not RAG.',
    learningObjectives: ['Separate retrieval recall from answer quality.', 'Design representative retrieval and grounded-answer evaluations.', 'Diagnose misses by stage instead of tuning prompts blindly.'],
    exercise: 'Create a small cited corpus and 30-query eval set with answerable, ambiguous, and unanswerable cases. Compare two chunking or retrieval strategies and inspect regressions by slice.',
    proofStandard: 'Every displayed claim traces to a source, unanswerable cases abstain, and improvements hold beyond the examples used during development.',
    resources: [link('OpenAI Cookbook — Embeddings', 'https://cookbook.openai.com/examples/semantic_text_search_using_embeddings', 'tutorial', 'A compact official starting point for semantic retrieval.', 60), link('Hugging Face — NLP Course', 'https://huggingface.co/learn/nlp-course/chapter1/1', 'course', 'Builds the underlying transformer and representation intuition.', 900)],
  },
  agents: {
    summary: 'Reliable agents are controlled software systems: explicit state, typed tools, bounded loops, observable decisions, permissions, evaluation, and graceful escalation. Autonomy is not the goal; dependable task completion is.',
    learningObjectives: ['Choose a deterministic workflow when an open-ended agent is unnecessary.', 'Design narrow tool contracts, budgets, stop conditions, and recovery paths.', 'Evaluate complete trajectories, side effects, safety, latency, and cost.'],
    exercise: 'Implement the smallest agent that needs at least two tools. Add traces, time and token budgets, injected tool failures, prompt-injection tests, and human approval before consequential actions.',
    proofStandard: 'The agent completes a held-out task set, fails closed under attack or dependency failure, and its traces make mistakes diagnosable.',
    resources: [link('Hugging Face — AI Agents Course', 'https://huggingface.co/learn/agents-course/unit0/introduction', 'course', 'A hands-on progression through agent concepts, frameworks, and assignments.', 1200), link('Anthropic — Building Effective Agents', 'https://www.anthropic.com/research/building-effective-agents', 'field_guide', 'Excellent guidance on workflows, agents, orchestration patterns, and simplicity.', 90), link('Model Context Protocol — Introduction', 'https://modelcontextprotocol.io/docs/getting-started/intro', 'reference', 'Official foundation for interoperable tools, resources, clients, and servers.', 120)],
  },
  evals: {
    summary: 'Evaluation is the control system for AI development. Good evals represent real tasks, expose important slices, combine appropriate graders, and prevent optimization from becoming anecdotal prompt tweaking.',
    learningObjectives: ['Define observable success and unacceptable failure before iteration.', 'Calibrate deterministic, model-based, and human grading.', 'Use slices and traces to explain aggregate movement and detect regressions.'],
    exercise: 'Build a versioned 40-case eval set for the daily system. Establish a baseline, change one thing, inspect disagreements and regressions, and set a release threshold.',
    proofStandard: 'Cases are representative and independently reviewable; grader agreement is measured; the eval catches at least one real regression.',
    resources: [link('OpenAI — Evaluation best practices', 'https://platform.openai.com/docs/guides/evaluation-best-practices', 'field_guide', 'Official patterns for designing useful evals and avoiding common failure modes.', 90), link('Google — Rules of ML', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'field_guide', 'Production-minded guidance on metrics, pipelines, iteration, and system behavior.', 90)],
  },
  safety: {
    summary: 'Production AI safety is a layered systems property. Model behavior, application logic, data access, identity, permissions, tools, auditability, and human escalation all contribute to the risk boundary.',
    learningObjectives: ['Threat-model assets, actors, trust boundaries, and consequential actions.', 'Apply least privilege, validation, isolation, monitoring, and approval at multiple layers.', 'Test abuse and prompt injection as engineering scenarios, not policy prose.'],
    exercise: 'Threat-model the daily system, create ten adversarial cases, implement two independent mitigations, and demonstrate both blocked and safely escalated behavior.',
    proofStandard: 'Controls fail closed, authorization is enforced outside the model, sensitive actions are auditable, and residual risk is documented.',
    resources: [link('OWASP — GenAI Security Project', 'https://genai.owasp.org/', 'field_guide', 'Concrete application-level risks and mitigations for LLM and agent systems.', 180), link('NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'framework', 'A durable structure for governing, mapping, measuring, and managing AI risk.', 180)],
  },
  research: {
    summary: 'Research engineering means turning a claim into a controlled, reproducible test. The differentiator is technical judgment: strong baselines, clean ablations, honest uncertainty, and useful negative results.',
    learningObjectives: ['Read papers by reconstructing claims, assumptions, methods, and evidence.', 'Design baselines and ablations that distinguish competing explanations.', 'Communicate uncertainty and reproduction gaps without overstating conclusions.'],
    exercise: 'Reproduce one bounded result from a recent paper, then run an ablation that could falsify the proposed explanation. Keep a complete experiment log.',
    proofStandard: 'Code and configuration reproduce the result, deviations are documented, and the report clearly separates observation from interpretation.',
    resources: [link('Stanford CS336 — Language Modeling from Scratch', 'https://stanford-cs336.github.io/spring2025/', 'course', 'Research-grade implementation and experimentation around language models.', 1800), link('Papers with Code', 'https://paperswithcode.com/', 'research_index', 'Useful for locating papers with implementations, datasets, and comparable results.', 120)],
  },
  communication: {
    summary: 'Senior frontier engineers multiply judgment through writing, reviews, teaching, and stakeholder alignment. Clarity means preserving the important technical truth while adapting depth and vocabulary to the audience.',
    learningObjectives: ['Explain one system at executive, product, and engineering depth.', 'Lead discovery and reviews without prematurely converging on a solution.', 'Turn feedback into a prioritized decision, curriculum revision, or engineering plan.'],
    exercise: 'Prepare a 15-minute workshop with a live technical exercise, deliver it to two people, record confusion and questions, then revise the material and architecture recommendation.',
    proofStandard: 'The audience can perform the task independently afterward, and revisions are visibly grounded in observed feedback.',
    resources: [link('Google — Technical Writing Courses', 'https://developers.google.com/tech-writing', 'course', 'Clear, practical training for engineering documentation and explanation.', 480), link('Google Engineering Practices — Review', 'https://google.github.io/eng-practices/review/', 'field_guide', 'Models precise, respectful, and decision-relevant engineering feedback.', 120)],
  },
};

function moduleFor(topic: string): Module {
  const t = topic.toLowerCase();
  if (/map frontier|choose a primary|company-specific/.test(t)) return MODULES.career;
  if (/agent|tool call|mcp|plugin/.test(t)) return MODULES.agents;
  if (/retrieval|rag|embedding|rerank/.test(t)) return MODULES.retrieval;
  if (/read a recent|reproduce|research reproduction|research pipeline|ablation/.test(t)) return MODULES.research;
  if (/eval|experiment/.test(t)) return MODULES.evals;
  if (/safety|threat|prompt injection|incident/.test(t)) return MODULES.safety;
  if (/gpu|inference|ml-systems|distributed training|checkpoint|performance lab|data platform|model serving/.test(t)) return MODULES.ml_systems;
  if (/ml fundamental|transformer|pytorch|post-training/.test(t)) return MODULES.ml;
  if (/customer|workshop|behavioral|feedback|communication|narrative/.test(t)) return MODULES.communication;
  if (/prototype|full-stack|multimodal|capstone|open-source/.test(t)) return MODULES.applied;
  if (/system|architecture|distributed|deployment|observability/.test(t)) return MODULES.systems;
  if (/paper|research/.test(t)) return MODULES.research;
  return MODULES.software;
}

export const FRONTIER_RESOURCES: Record<string, ResourceEntry> = Object.fromEntries(
  FRONTIER_DAILY_FOCUS.map((focus, index) => {
    const module = moduleFor(focus.topic);
    return [`frontier.day${index + 1}`, { ...module, conceptSummary: `${module.summary} Today: ${focus.topic}.` }];
  })
);
