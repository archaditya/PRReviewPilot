const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Organization = sequelize.define('Organization', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'avatar_url',
    },
    ownerUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'owner_user_id',
    },
    billingEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'billing_email',
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: {
        max_repos: 5,
        max_members: 5,
        max_reviews_per_month: 100,
      },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active', // 'active', 'suspended', 'deactivated'
    },
  }, {
    tableName: 'organizations',
    underscored: true,
    timestamps: true,
  });

  return Organization;
};
