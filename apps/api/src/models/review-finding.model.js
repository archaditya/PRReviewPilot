const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReviewFinding = sequelize.define('ReviewFinding', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reviewJobId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'review_job_id',
    },
    filePath: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      field: 'file_path',
    },
    lineNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'line_number',
    },
    ruleId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'rule_id',
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: 'bug_risk', // 'security', 'performance', 'bug_risk', 'style', 'maintainability'
    },
    severity: {
      type: DataTypes.STRING(20),
      defaultValue: 'medium', // 'critical', 'high', 'medium', 'low', 'info'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    suggestion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    providerCommentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'provider_comment_id', // GitHub comment ID or Bitbucket comment ID
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: 'open', // 'open', 'resolved', 'dismissed'
    },
  }, {
    tableName: 'review_findings',
    underscored: true,
    timestamps: true,
  });

  return ReviewFinding;
};
