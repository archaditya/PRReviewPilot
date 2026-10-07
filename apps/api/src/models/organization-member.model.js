const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrganizationMember = sequelize.define('OrganizationMember', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'developer', // 'owner', 'admin', 'developer', 'viewer'
      validate: {
        isIn: [['owner', 'admin', 'developer', 'viewer']],
      },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active', // 'invited', 'active', 'removed'
    },
  }, {
    tableName: 'organization_members',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['organization_id', 'user_id'],
      },
    ],
  });

  return OrganizationMember;
};
