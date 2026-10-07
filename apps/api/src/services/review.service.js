const db = require('../models');
const { getProvider } = require('../integrations/providers');
const aiClient = require('./ai-client.service');
const logger = require('../utils/logger');

class ReviewService {
  /**
   * Orchestrate an end-to-end PR review with strict quota enforcement
   */
  async processPullRequestReview({ repositoryId, prNumber, userToken, commitSha }) {
    const startTime = Date.now();

    const repo = await db.Repository.findByPk(repositoryId, {
      include: [
        {
          model: db.Organization,
          as: 'organization',
          include: [{ model: db.User, as: 'owner' }],
        },
      ],
    });

    if (!repo) {
      throw new Error(`Repository not found: ${repositoryId}`);
    }

    const org = repo.organization;
    const owner = org.owner;

    // Check user & organization quotas
    const currentUsage = owner.usage || { review_count: 0, tokens_used: 0 };
    const maxReviews = org.features?.max_reviews_per_month || 100;

    if (currentUsage.review_count >= maxReviews) {
      logger.warn({ orgId: org.id, ownerId: owner.id }, 'Review quota exceeded for organization');
      throw new Error(`Monthly review quota of ${maxReviews} reviews has been reached. Please contact admin to increase quota.`);
    }

    const provider = getProvider(repo.provider);

    let token = userToken;
    if (!token) {
      token = repo.provider === 'github' ? owner.githubAccessToken : owner.bitbucketAccessToken;
    }

    if (!token) {
      throw new Error(`No access token available for ${repo.provider} provider`);
    }

    // 1. Fetch Pull Request metadata
    logger.info({ repo: repo.providerFullName, prNumber }, 'Fetching PR metadata');
    const prMeta = await provider.getPullRequest(token, repo.providerFullName, prNumber);

    // 2. Upsert PullRequest record
    const [pullRequest] = await db.PullRequest.findOrCreate({
      where: {
        repositoryId: repo.id,
        prNumber,
      },
      defaults: {
        repositoryId: repo.id,
        prNumber,
        provider: repo.provider,
        title: prMeta.title,
        author: prMeta.author,
        baseBranch: prMeta.baseBranch,
        headBranch: prMeta.headBranch,
        headSha: prMeta.headSha || commitSha,
        status: prMeta.state || 'open',
      },
    });

    // 3. Create ReviewJob record
    const reviewJob = await db.ReviewJob.create({
      repositoryId: repo.id,
      pullRequestId: pullRequest.id,
      provider: repo.provider,
      prNumber,
      commitSha: prMeta.headSha || commitSha,
      status: 'queued',
      startedAt: new Date(),
    });

    await db.JobEvent.create({
      reviewJobId: reviewJob.id,
      eventType: 'job_queued',
      message: `Review job queued for PR #${prNumber}: ${prMeta.title}`,
      metadata: { author: prMeta.author, base: prMeta.baseBranch, head: prMeta.headBranch },
    });

    // Background processing
    this.runPipelineAsync({
      reviewJob,
      pullRequest,
      repo,
      owner,
      provider,
      token,
      startTime,
    }).catch((err) => {
      logger.error({ err: err.message, reviewJobId: reviewJob.id }, 'Review pipeline failed in background');
    });

    return reviewJob;
  }

  async runPipelineAsync({ reviewJob, pullRequest, repo, owner, provider, token, startTime }) {
    try {
      // Step A: Fetch Diff
      reviewJob.status = 'fetching_diff';
      await reviewJob.save();

      const rawDiff = await provider.getPullRequestDiff(token, repo.providerFullName, reviewJob.prNumber);

      await db.JobEvent.create({
        reviewJobId: reviewJob.id,
        eventType: 'diff_fetched',
        message: `Successfully fetched diff (${rawDiff.length} bytes)`,
      });

      // Step B: AI Analysis
      reviewJob.status = 'analyzing';
      await reviewJob.save();

      await db.JobEvent.create({
        reviewJobId: reviewJob.id,
        eventType: 'ai_analysis_started',
        message: 'Sent diff to AI review engine for static and semantic analysis',
      });

      const analysis = await aiClient.analyzeDiff({
        repoFullName: repo.providerFullName,
        prTitle: pullRequest.title,
        diff: rawDiff,
        config: repo.reviewConfig,
      });

      const usage = analysis.usage || {};
      const tokensUsed = usage.total_tokens || 0;
      const estimatedCost = usage.estimated_cost_usd || 0.0;
      const wasTruncated = usage.was_truncated || false;

      await db.JobEvent.create({
        reviewJobId: reviewJob.id,
        eventType: 'ai_analysis_completed',
        message: `AI analysis completed with ${analysis.findings?.length || 0} findings (${tokensUsed} tokens, ~$${estimatedCost})`,
        metadata: { riskLevel: analysis.risk_level, tokensUsed, wasTruncated },
      });

      // Step C: Save Findings
      const findings = analysis.findings || [];
      const savedFindings = [];

      for (const item of findings) {
        const finding = await db.ReviewFinding.create({
          reviewJobId: reviewJob.id,
          filePath: item.file_path,
          lineNumber: item.line_number || null,
          ruleId: item.rule_id || 'GENERAL',
          category: item.category || 'bug_risk',
          severity: item.severity || 'medium',
          title: item.title || item.message.slice(0, 50),
          message: item.message,
          suggestion: item.suggestion || null,
          status: 'open',
        });
        savedFindings.push(finding);
      }

      // Step D: Post Comments to GitHub/Bitbucket
      reviewJob.status = 'posting_comments';
      await reviewJob.save();

      // Post Summary Comment
      const summaryMarkdown = this.formatReviewSummary(analysis, savedFindings);
      await provider.postComment(token, repo.providerFullName, reviewJob.prNumber, {
        body: summaryMarkdown,
      });

      // Post Inline Comments for critical & high severity findings
      for (const f of savedFindings) {
        if (['critical', 'high'].includes(f.severity) && f.lineNumber) {
          const inlineBody = `### ⚠️ ReviewPilot AI Finding [${f.severity.toUpperCase()}]\n**Category:** ${f.category}\n\n${f.message}\n\n${f.suggestion ? `\`\`\`suggestion\n${f.suggestion}\n\`\`\`` : ''}`;
          try {
            const commentRes = await provider.postComment(token, repo.providerFullName, reviewJob.prNumber, {
              body: inlineBody,
              filePath: f.filePath,
              lineNumber: f.lineNumber,
              commitSha: reviewJob.commitSha,
            });
            f.providerCommentId = commentRes.id;
            await f.save();
          } catch (err) {
            logger.warn({ err: err.message, file: f.filePath }, 'Skipped inline comment');
          }
        }
      }

      // Step E: Complete Job & Record Metrics
      const durationMs = Date.now() - startTime;
      reviewJob.status = 'completed';
      reviewJob.riskLevel = analysis.risk_level || 'low';
      reviewJob.summary = analysis.summary || 'Review completed successfully.';
      reviewJob.findingsCount = savedFindings.length;
      reviewJob.tokensUsed = tokensUsed;
      reviewJob.estimatedCostUsd = estimatedCost;
      reviewJob.durationMs = durationMs;
      reviewJob.wasTruncated = wasTruncated;
      reviewJob.completedAt = new Date();
      await reviewJob.save();

      // Increment User & Org Usage Accumulator
      const currentUsage = owner.usage || { review_count: 0, tokens_used: 0, cost_usd: 0 };
      owner.usage = {
        review_count: (currentUsage.review_count || 0) + 1,
        tokens_used: (currentUsage.tokens_used || 0) + tokensUsed,
        cost_usd: Number(((currentUsage.cost_usd || 0) + estimatedCost).toFixed(4)),
      };
      await owner.save();

      await db.JobEvent.create({
        reviewJobId: reviewJob.id,
        eventType: 'job_completed',
        message: `Review completed in ${(durationMs / 1000).toFixed(1)}s`,
      });
    } catch (err) {
      reviewJob.status = 'failed';
      reviewJob.errorMessage = err.message;
      reviewJob.completedAt = new Date();
      await reviewJob.save();

      await db.JobEvent.create({
        reviewJobId: reviewJob.id,
        eventType: 'job_failed',
        message: `Review job failed: ${err.message}`,
      });
    }
  }

  formatReviewSummary(analysis, findings) {
    const riskBadge = {
      critical: '🔴 **CRITICAL RISK**',
      high: '🟠 **HIGH RISK**',
      medium: '🟡 **MEDIUM RISK**',
      low: '🟢 **LOW RISK**',
    }[analysis.risk_level || 'low'];

    let md = `## 🤖 PRReviewPilot Automated Code Review\n\n`;
    md += `**Overall Assessment:** ${riskBadge}\n\n`;
    md += `${analysis.summary || 'Automated code review summary'}\n\n`;

    if (findings.length > 0) {
      md += `### 🔍 Key Findings (${findings.length})\n\n`;
      md += `| File | Line | Severity | Category | Description |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      for (const f of findings.slice(0, 10)) {
        md += `| \`${f.filePath}\` | ${f.lineNumber || 'N/A'} | ${f.severity} | ${f.category} | ${f.message.replace(/\|/g, '-').slice(0, 80)}... |\n`;
      }
      if (findings.length > 10) {
        md += `\n*... and ${findings.length - 10} more findings. View full report in the PRReviewPilot dashboard.*\n`;
      }
    } else {
      md += `✅ **No high-risk issues found in this pull request! Clean code.**\n`;
    }

    md += `\n---\n*Powered by [PRReviewPilot](https://prreviewpilot.com) — Production AI Code Review for GitHub & Bitbucket*`;
    return md;
  }
}

module.exports = new ReviewService();
