const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Installation = sequelize.define('Installation', {
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
    provider: {
      type: DataTypes.STRING(20),
      allowNull: false, // 'github' | 'bitbucket'
      validate: {
        isIn: [['github', 'bitbucket']],
      },
    },
    providerInstallationId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'provider_installation_id', // GitHub App numeric installation ID or Bitbucket workspace UUID
    },
    accountLogin: {
      type: DataTypes.STRING(255),
      allowNull: false, // Org slug or username
      field: 'account_login',
    },
    accountType: {
      type: DataTypes.STRING(50),
      defaultValue: 'Organization', // 'User' | 'Organization'
      field: 'account_type',
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    installedByUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'installed_by_user_id',
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active', // 'active' | 'suspended' | 'deleted'
    },
    githubInstallationId: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('providerInstallationId');
      },
      set(val) {
        this.setDataValue('providerInstallationId', String(val));
      },
    },
  }, {
    tableName: 'installations',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['provider', 'provider_installation_id'],
      },
    ],
  });

  return Installation;
};
