const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'avatar_url',
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'password_hash',
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'email_verified',
    },
    githubUserId: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: true,
      field: 'github_user_id',
    },
    githubUsername: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'github_username',
    },
    githubAccessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'github_access_token',
    },
    bitbucketUserId: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
      field: 'bitbucket_user_id',
    },
    bitbucketUsername: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'bitbucket_username',
    },
    bitbucketAccessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'bitbucket_access_token',
    },
    bitbucketRefreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'bitbucket_refresh_token',
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'user', // 'superadmin', 'admin', 'user'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active', // 'active', 'suspended', 'deactivated'
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    usage: {
      type: DataTypes.JSONB,
      defaultValue: { review_count: 0, chat_count: 0 },
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
  });

  return User;
};
