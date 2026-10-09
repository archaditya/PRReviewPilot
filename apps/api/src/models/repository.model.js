const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Repository = sequelize.define('Repository', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'organization_id',
    },
    installationId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'installation_id',
    },
    provider: {
      type: DataTypes.STRING(20),
      allowNull: false, // 'github', 'bitbucket'
      validate: {
        isIn: [['github', 'bitbucket']],
      },
    },
    providerRepoId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'provider_repo_id',
    },
    providerFullName: {
      type: DataTypes.STRING(500),
      allowNull: false, // e.g., 'owner/repo' or 'workspace/repo-slug'
      field: 'provider_full_name',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    defaultBranch: {
      type: DataTypes.STRING(255),
      defaultValue: 'main',
      field: 'default_branch',
    },
    language: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_private',
    },
    cloneUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'clone_url',
    },
    htmlUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'html_url',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    webhookId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'webhook_id',
    },
    reviewConfig: {
      type: DataTypes.JSONB,
      defaultValue: {
        auto_review_on_pr: true,
        review_strictness: 'balanced', // 'lenient', 'balanced', 'strict'
        ignored_paths: ['node_modules/**', '*.lock', 'dist/**', 'build/**'],
        ignored_extensions: ['.min.js', '.map'],
        custom_rules: [],
        review_language: 'en',
      },
      field: 'review_config',
    },
    indexStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'NOT_INDEXED',
      field: 'index_status',
    },
    indexedCommitSha: {
      type: DataTypes.STRING(40),
      allowNull: true,
      field: 'indexed_commit_sha',
    },
    indexedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'indexed_at',
    },
    indexError: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'index_error',
    },
    fileCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'file_count',
    },
    symbolCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'symbol_count',
    },
    aiReviewEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'ai_review_enabled',
    },
    reviewLevel: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'balanced',
      field: 'review_level',
    },
    customVoice: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'custom_voice',
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active', // 'active', 'paused', 'archived'
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('providerFullName') || this.getDataValue('name');
      },
      set(val) {
        this.setDataValue('providerFullName', val);
      },
    },
    githubRepoId: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('providerRepoId');
      },
      set(val) {
        this.setDataValue('providerRepoId', String(val));
      },
    },
  }, {
    tableName: 'repositories',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['organization_id', 'provider', 'provider_repo_id'],
      },
    ],
  });

  return Repository;
};
