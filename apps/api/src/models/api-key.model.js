const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApiKey = sequelize.define('ApiKey', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    keyHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'key_hash',
    },
    keyPrefix: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'key_prefix',
    },
    scopes: {
      type: DataTypes.JSONB,
      defaultValue: ['read', 'write'],
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_used_at',
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active', // 'active', 'revoked'
    },
  }, {
    tableName: 'api_keys',
    underscored: true,
    timestamps: true,
  });

  return ApiKey;
};
