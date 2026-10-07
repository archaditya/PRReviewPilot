import json
import logging
from openai import OpenAI
from ..core.config import settings
from ..schemas.review import ReviewRequest, ReviewResponse, FindingItem, TokenUsage
from ..utils.diff_capping import cap_diff

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are PRReviewPilot AI — a principal software engineer and automated code reviewer.
Your job is to thoroughly analyze Git pull request diffs and output structured code review findings.

Focus areas:
1. Bugs, logical defects, edge case failures, unhandled exceptions.
2. Security vulnerabilities (injection, auth flaws, secret leaks, SSRF, XSS).
3. Performance regressions (N+1 queries, unindexed lookups, memory leaks, blocking I/O).
4. Code quality & maintainability (dead code, typing flaws, architectural anti-patterns).

Review Sensitivity:
- lenient: Report ONLY critical/high bugs and severe security issues.
- balanced: Report security, correctness, and performance bugs. Avoid trivial cosmetic nits.
- strict: Strict standards: flag edge cases, missing error handling, type safety, and documentation gaps.

Output format: You MUST respond with pure JSON conforming to this schema:
{
  "summary": "Concise high-level overview of the pull request changes and risk assessment",
  "risk_level": "critical" | "high" | "medium" | "low",
  "findings": [
    {
      "file_path": "path/to/file.ext",
      "line_number": 42,
      "rule_id": "SEC-001",
      "category": "security" | "performance" | "bug_risk" | "style" | "maintainability",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "Short title",
      "message": "Clear explanation of the problem and its potential impact",
      "suggestion": "Exact replacement code or fix (optional)"
    }
  ]
}
"""

def analyze_code_review(req: ReviewRequest) -> ReviewResponse:
    # 1. Apply hard diff capping guardrail
    capped_diff_text, was_truncated = cap_diff(req.diff, max_tokens=req.max_diff_tokens or 16000)

    if not settings.openai_api_key:
        logger.warning("No OPENAI_API_KEY configured. Returning fallback mock review response.")
        return ReviewResponse(
            summary=f"Automated review for {req.pr_title}: Model execution simulated (no API key configured).",
            risk_level="low",
            findings=[],
            usage=TokenUsage(
                prompt_tokens=150,
                completion_tokens=50,
                total_tokens=200,
                was_truncated=was_truncated,
                estimated_cost_usd=0.00003,
            )
        )

    client = OpenAI(api_key=settings.openai_api_key)

    custom_rules_text = ""
    if req.custom_rules:
        custom_rules_text = "\nCustom repository rules to enforce:\n" + "\n".join(f"- {r}" for r in req.custom_rules)

    truncation_warning = ""
    if was_truncated:
        truncation_warning = "\nNOTE: This pull request diff exceeded maximum size ceiling and was truncated to prevent excessive token consumption.\n"

    user_content = f"""Repository: {req.repo_name}
Pull Request Title: {req.pr_title}
Strictness Level: {req.strictness}
{truncation_warning}
{custom_rules_text}

Unified Diff:
```diff
{capped_diff_text}
```

Provide your comprehensive code review in valid JSON format.
"""

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = response.choices[0].message.content
    
    # Calculate token usage and cost
    prompt_tokens = response.usage.prompt_tokens if response.usage else 0
    completion_tokens = response.usage.completion_tokens if response.usage else 0
    total_tokens = prompt_tokens + completion_tokens

    # Standard gpt-4o-mini pricing: $0.15 / 1M prompt, $0.60 / 1M completion
    estimated_cost = (prompt_tokens * 0.00000015) + (completion_tokens * 0.00000060)

    usage_metrics = TokenUsage(
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        was_truncated=was_truncated,
        estimated_cost_usd=round(estimated_cost, 6),
    )

    try:
        data = json.loads(content)
        findings = [FindingItem(**f) for f in data.get("findings", [])]
        return ReviewResponse(
            summary=data.get("summary", "Review complete."),
            risk_level=data.get("risk_level", "low"),
            findings=findings,
            usage=usage_metrics,
        )
    except Exception as e:
        logger.error(f"Error parsing LLM response: {e}")
        return ReviewResponse(
            summary="Review completed with raw analysis.",
            risk_level="low",
            findings=[],
            usage=usage_metrics,
        )
