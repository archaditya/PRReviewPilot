const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReviewJob = sequelize.define('ReviewJob', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    repositoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'repository_id',
    },
    pullRequestId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'pull_request_id',
    },
    provider: {
      type: DataTypes.STRING(20),
      allowNull: false, // 'github', 'bitbucket'
    },
    prNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'pr_number',
    },
    commitSha: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'commit_sha',
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'queued', // 'queued', 'diff_fetched', 'analyzing', 'posting_comments', 'completed', 'failed'
    },
    riskLevel: {
      type: DataTypes.STRING(20),
      defaultValue: 'low', // 'low', 'medium', 'high', 'critical'
      field: 'risk_level',
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    findingsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'findings_count',
    },
    tokensUsed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'tokens_used',
    },
    estimatedCostUsd: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      field: 'estimated_cost_usd',
    },
    durationMs: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'duration_ms',
    },
    wasTruncated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'was_truncated',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
  }, {
    tableName: 'review_jobs',
    underscored: true,
    timestamps: true,
  });

  return ReviewJob;
};
