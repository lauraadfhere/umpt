import type { PostSummary } from "@/lib/posts";

export const MOCK_ROOT_COMMENTS_PER_POST = 3;

export type MockCommentDraft = {
  name: string;
  message: string;
  likes: number;
  dislikes: number;
};

function normalizeDrafts(post: PostSummary, drafts: MockCommentDraft[]): MockCommentDraft[] {
  const trimmed = drafts.slice(0, MOCK_ROOT_COMMENTS_PER_POST);
  const topic = post.category || post.tags[0] || "this topic";
  while (trimmed.length < MOCK_ROOT_COMMENTS_PER_POST) {
    const index = trimmed.length;
    trimmed.push({
      name: index === 0 ? "Priya Nair" : index === 1 ? "Theo Bergmann" : "Yuki Tanaka",
      message: `Useful read on “${post.title}”. Comment ${index + 1}: more depth on ${topic} would help practitioners.`,
      likes: 1 + index,
      dislikes: 0,
    });
  }
  return trimmed;
}

/** Opinionated reader comments tailored to post topics (approved for display). Always returns exactly three roots. */
export function mockCommentsForPost(post: PostSummary): MockCommentDraft[] {
  const key = `${post.slug} ${post.title} ${post.excerpt} ${post.category} ${post.tags.join(" ")}`.toLowerCase();

  if (key.includes("reinforcement") || key.includes("q-learning") || key.includes("deep-q")) {
    return normalizeDrafts(post, [
      {
        name: "Mira Chen",
        message:
          "The walk from tabular Q-learning to function approximation is where most tutorials lose me — here the ε-greedy exploration piece and the replay-buffer note for DQN actually connect. I'd still like a short caveat on how brittle reward shaping can be in real robotics.",
        likes: 5,
        dislikes: 0,
      },
      {
        name: "James Okafor",
        message:
          "Clear split between value-based and policy-gradient ideas. I'm skeptical that DQN alone scales to our warehouse scheduling problem without a simulator, but the Bellman update intuition is exactly what I needed for our grad reading group.",
        likes: 3,
        dislikes: 1,
      },
      {
        name: "Sofia Laurent",
        message:
          "Loved the plain-language explanation of the exploration–exploitation trade-off. One disagreement: I don't think experience replay is always worth the memory cost for small state spaces — Q-tables trained fast enough on our gridworld without it.",
        likes: 2,
        dislikes: 0,
      },
    ]);
  }

  if (key.includes("transformer") || key.includes("attention") || key.includes("llm")) {
    return normalizeDrafts(post, [
      {
        name: "Arjun Patel",
        message:
          "The attention diagram description matches how we teach seq2seq now. I'd push back slightly on treating scaling laws as inevitable — our mid-size model still beats a larger one on domain QA with better curation.",
        likes: 4,
        dislikes: 0,
      },
      {
        name: "Elena Vogt",
        message:
          "Finally a post that mentions positional encoding without drowning in math. The section on context length limits is what our product team needed before the roadmap review.",
        likes: 2,
        dislikes: 0,
      },
      {
        name: "Luis Moreira",
        message: "Clear intro for engineers new to transformers — a short comparison with RNN latency on edge devices would round it out.",
        likes: 3,
        dislikes: 0,
      },
    ]);
  }

  if (
    key.includes("cybersecurity") ||
    key.includes("intelligent-threat") ||
    (key.includes("defending") && key.includes("ai"))
  ) {
    return normalizeDrafts(post, [
      {
        name: "Rachel Morrison",
        message:
          "The framing around AI-driven phishing and adaptive malware is spot on — our SOC has already seen LLM-crafted lures that pass basic filters. I'd add that human verification loops still beat most automated classifiers for executive impersonation.",
        likes: 8,
        dislikes: 0,
      },
      {
        name: "Dev Patel",
        message:
          "Strong overview, though I'm skeptical that buying another 'AI firewall' alone closes the gap. Tooling helps, but purple-team exercises against our own fine-tuned models exposed gaps we never saw with rule-based IDS.",
        likes: 5,
        dislikes: 1,
      },
      {
        name: "Ingrid Solberg",
        message:
          "Appreciate the distinction between offensive misuse of AI and using ML defensively. Our team is piloting anomaly detection on API logs — this post matches the vocabulary we need when briefing non-technical leadership.",
        likes: 4,
        dislikes: 0,
      },
    ]);
  }

  if (key.includes("privacy") || key.includes("security") || key.includes("gdpr")) {
    return normalizeDrafts(post, [
      {
        name: "Noah Fischer",
        message:
          "Practical tone — appreciates that you distinguish threat models instead of scare headlines. Our legal team will ask for citations on the retention section, but the risk framing is fair.",
        likes: 3,
        dislikes: 1,
      },
      {
        name: "Amira Hassan",
        message:
          "I disagree that federated learning alone fixes compliance; governance and audit trails still matter. Still, this is a solid primer for engineers talking to policy folks.",
        likes: 6,
        dislikes: 0,
      },
      {
        name: "Jonas Eliasson",
        message: "Good baseline for our privacy working group. We'd welcome a follow-up on DPIA templates for ML features.",
        likes: 2,
        dislikes: 0,
      },
    ]);
  }

  if (key.includes("software") || key.includes("engineering") || key.includes("refactor")) {
    return normalizeDrafts(post, [
      {
        name: "Claire Okonkwo",
        message:
          "The advice on incremental refactors versus big-bang rewrites mirrors what we've seen shipping legacy services. Would add that feature flags only help if you measure rollback time.",
        likes: 2,
        dislikes: 0,
      },
      {
        name: "Marcus Lindholm",
        message:
          "Skeptical of the 'test coverage as a gate' line — we've had 90% coverage and still missed race bugs. The discussion of contract tests between services is the part I'll forward to the team.",
        likes: 4,
        dislikes: 1,
      },
      {
        name: "Ana Rivas",
        message: "Solid engineering notes. The section on observability during refactors saved us a production incident last quarter.",
        likes: 1,
        dislikes: 0,
      },
    ]);
  }

  const topic = post.category || post.tags[0] || post.title.split(/\s+/).slice(0, 3).join(" ");
  return normalizeDrafts(post, [
    {
      name: "Priya Nair",
      message: `This piece on “${post.title}” is one of the few that ties ${topic} back to everyday trade-offs instead of buzzwords. I'd welcome a follow-up with concrete failure cases.`,
      likes: 3,
      dislikes: 0,
    },
    {
      name: "Theo Bergmann",
      message: post.excerpt
        ? `The opening summary matches what I took away, though I think the middle section could go deeper on limitations. Still sharing with our journal club.`
        : `Readable overview — I don't fully agree with every claim, but it gives our students a fair starting point before the primary sources.`,
      likes: 1,
      dislikes: 0,
    },
    {
      name: "Yuki Tanaka",
      message: `Useful for practitioners. My only nit: a few definitions assume graduate-level stats; a sidebar for newcomers would help.`,
      likes: 2,
      dislikes: 0,
    },
  ]);
}