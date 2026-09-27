import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from './config/db.js';
import { createUser } from './models/userModel.js';
import { resetAdminPassword } from './controllers/userManagementController.js';
import { verifyAndChangePassword } from './models/profileModel.js';

async function runPasswordResetTests() {
  console.log('====================================================');
  console.log('   TESTING TEMPORARY PASSWORD & FORCED CHANGE FLOW  ');
  console.log('====================================================\n');

  let superAdminUser = null;
  let testUser = null;
  let cashierUser = null;
  let shopId = null;

  try {
    // 1. Setup Super Admin user with business_id IS NULL
    const saPassHash = await bcrypt.hash('SAPassword123!', 10);
    const saUname = `sa_null_${Date.now()}`;
    superAdminUser = await createUser({
      username: saUname,
      email: `${saUname}@test.local`,
      passwordHash: saPassHash,
      role: 'super_admin',
      status: 'active',
    });

    // Verify Super Admin has business_id IS NULL
    const [[saDb]] = await pool.query('SELECT business_id, role FROM users WHERE id = ?', [superAdminUser.id]);
    if (saDb.business_id !== null) throw new Error('Super Admin business_id is not NULL');
    console.log('✅ 1. Super Admin created with business_id = NULL.');

    // 2. Setup target business admin user and shop
    const passHash = await bcrypt.hash('InitialPass123!', 10);
    const uname = `p_reset_${Date.now()}`;
    testUser = await createUser({
      username: uname,
      email: `${uname}@test.local`,
      passwordHash: passHash,
      role: 'admin',
      status: 'active',
    });

    const [bizRes] = await pool.query(
      `INSERT INTO businesses (owner_user_id, module_id, name, status) VALUES (?, 1, 'Test Reset Shop', 'active')`,
      [testUser.id]
    );
    shopId = bizRes.insertId;

    // 3. Test 1: Super Admin with business_id = NULL resets target business owner password
    let tempPassword = null;
    let resData = null;
    const mockReq = {
      user: superAdminUser, // role: super_admin, business_id: null
      params: { id: shopId },
    };
    const mockRes = {
      json: (data) => {
        resData = data;
        tempPassword = data.temporaryPassword;
      },
    };

    await resetAdminPassword(mockReq, mockRes);
    if (!tempPassword || resData?.ownerUsername !== uname) {
      throw new Error(`Super Admin reset failed or returned wrong username: ${JSON.stringify(resData)}`);
    }
    console.log(`✅ 2. Super Admin (business_id=null) reset Admin password successfully. Temp pass: ${tempPassword}`);

    // 4. Test 2: Verify must_change_password = 1 and password_hash changed in DB
    const [[userAfterReset]] = await pool.query('SELECT must_change_password, password_hash FROM users WHERE id = ?', [testUser.id]);
    if (userAfterReset.must_change_password !== 1) {
      throw new Error('must_change_password was not set to TRUE (1)');
    }
    console.log('✅ 3. Target owner database state verified: must_change_password = 1');

    // 5. Test 3: Temporary password authenticates & flags forced change
    const matchesTemp = await bcrypt.compare(tempPassword, userAfterReset.password_hash);
    if (!matchesTemp) throw new Error('Temporary password hash mismatch');
    console.log('✅ 4. Temporary password authenticates successfully.');

    // 6. Test 4: Admin performs password change -> new password
    const newPassword = 'NewSecretPass123!';
    await verifyAndChangePassword(testUser.id, { currentPassword: tempPassword, newPassword });

    const [[userAfterChange]] = await pool.query('SELECT must_change_password, password_hash FROM users WHERE id = ?', [testUser.id]);
    if (userAfterChange.must_change_password !== 0) {
      throw new Error('must_change_password was not updated to FALSE (0)');
    }
    console.log('✅ 5. Forced password change executed. must_change_password = 0 verified in DB.');

    // 7. Test 5: New password works, old temporary password rejected
    const matchesNew = await bcrypt.compare(newPassword, userAfterChange.password_hash);
    const matchesOldTemp = await bcrypt.compare(tempPassword, userAfterChange.password_hash);
    if (!matchesNew || matchesOldTemp) throw new Error('Password transition validation failed');
    console.log('✅ 6. New password works and old temporary password rejected.');

    // 8. Test 6: Nonexistent business ID returns 404 (not tenant error)
    let errorCaught = false;
    try {
      await resetAdminPassword({ user: superAdminUser, params: { id: 99999999 } }, mockRes);
    } catch (err) {
      if ((err.status === 404 || err.statusCode === 404) && err.message === 'Business not found') {
        errorCaught = true;
      } else {
        throw err;
      }
    }
    if (!errorCaught) throw new Error('Invalid business ID did not return 404 Business not found');
    console.log('✅ 7. Nonexistent business ID correctly returns 404 Business not found.');

    console.log('\n====================================================');
    console.log('   ALL PASSWORD RESET & FORCED CHANGE TESTS PASSED  ');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ FAIL: Password Reset Test Error:', err);
    process.exit(1);
  } finally {
    if (shopId) await pool.query('DELETE FROM businesses WHERE id = ?', [shopId]);
    if (testUser?.id) await pool.query('DELETE FROM users WHERE id = ?', [testUser.id]);
    if (superAdminUser?.id) await pool.query('DELETE FROM users WHERE id = ?', [superAdminUser.id]);
    if (cashierUser?.id) await pool.query('DELETE FROM users WHERE id = ?', [cashierUser.id]);
    await pool.end();
  }
}

runPasswordResetTests();
