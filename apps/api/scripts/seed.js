const bcrypt = require('bcryptjs');
const db = require('../src/models');
const config = require('../src/config');
const logger = require('../src/utils/logger');

async function seed() {
  try {
    console.log('\n--- PRReviewPilot Database Seeder ---');
    await db.sequelize.authenticate();
    console.log('✓ Database connection established.');

    await db.sequelize.sync({ alter: true });
    console.log('✓ Models synchronized.');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@prreviewpilot.archadi.dev';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    let user = await db.User.findOne({ where: { email: adminEmail } });

    if (!user) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      user = await db.User.create({
        email: adminEmail,
        name: 'Super Admin',
        passwordHash,
        emailVerified: true,
        role: 'superadmin',
        status: 'active',
      });
      console.log(`✓ SuperAdmin account created successfully!`);
    } else {
      // User already exists: Preserve existing custom password
      let updated = false;
      if (user.role !== 'superadmin') {
        user.role = 'superadmin';
        updated = true;
      }
      if (user.status !== 'active') {
        user.status = 'active';
        updated = true;
      }
      
      // Only reset password if explicitly passed flag
      if (process.argv.includes('--force-password-reset')) {
        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(adminPassword, salt);
        updated = true;
        console.log(`✓ Admin password forcefully reset to default.`);
      } else {
        console.log(`✓ SuperAdmin account already exists. Existing password preserved (NOT overwritten).`);
      }

      if (updated) {
        await user.save();
      }
    }

    // Ensure Default Organization
    let membership = await db.OrganizationMember.findOne({
      where: { userId: user.id },
      include: [{ model: db.Organization, as: 'organization' }],
    });

    if (!membership) {
      const org = await db.Organization.create({
        name: "Admin's Workspace",
        slug: `admin-workspace-${user.id.substring(0, 6)}`,
        ownerUserId: user.id,
        billingEmail: user.email,
      });

      await db.OrganizationMember.create({
        organizationId: org.id,
        userId: user.id,
        role: 'owner',
        status: 'active',
      });
      console.log(`✓ Default workspace organization created.`);
    }

    console.log('\n=============================================');
    console.log('  SUPERADMIN ACCOUNT STATUS:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${process.argv.includes('--force-password-reset') || !user ? adminPassword : '[Unchanged / Custom Password Preserved]'}`);
    console.log(`  Role:     ${user.role || 'superadmin'}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('✗ Seeder failed:', err);
    process.exit(1);
  }
}

seed();
