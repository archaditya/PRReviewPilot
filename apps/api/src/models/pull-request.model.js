const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PullRequest = sequelize.define('PullRequest', {
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
    prNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'pr_number',
    },
    provider: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['github', 'bitbucket']],
      },
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    baseBranch: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'base_branch',
    },
    headBranch: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'head_branch',
    },
    headSha: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'head_sha',
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'open', // 'open', 'merged', 'closed'
    },
    diffSummary: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'diff_summary',
    },
    githubPrNumber: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('prNumber');
      },
      set(val) {
        this.setDataValue('prNumber', val);
      },
    },
    authorLogin: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('author');
      },
      set(val) {
        this.setDataValue('author', val);
      },
    },
  }, {
    tableName: 'pull_requests',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['repository_id', 'pr_number'],
      },
    ],
  });

  return PullRequest;
};
