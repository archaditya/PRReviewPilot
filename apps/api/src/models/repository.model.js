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
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active', // 'active', 'paused', 'archived'
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
