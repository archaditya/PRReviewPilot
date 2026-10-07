from typing import Optional, List
from pydantic import BaseModel, Field

class ReviewRequest(BaseModel):
    repo_name: str
    pr_title: str
    diff: str
    strictness: str = Field(default="balanced", description="lenient | balanced | strict")
    custom_rules: List[str] = Field(default_factory=list)
    language: str = Field(default="en")
    max_diff_tokens: Optional[int] = 16000

class FindingItem(BaseModel):
    file_path: str
    line_number: Optional[int] = None
    rule_id: Optional[str] = "RULE"
    category: str = Field(default="bug_risk", description="security | performance | bug_risk | style | maintainability")
    severity: str = Field(default="medium", description="critical | high | medium | low | info")
    title: Optional[str] = None
    message: str
    suggestion: Optional[str] = None

class TokenUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    was_truncated: bool = False
    estimated_cost_usd: float = 0.0

class ReviewResponse(BaseModel):
    summary: str
    risk_level: str = Field(default="low", description="critical | high | medium | low")
    findings: List[FindingItem] = Field(default_factory=list)
    usage: TokenUsage = Field(default_factory=TokenUsage)
