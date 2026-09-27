import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from './config/db.js';
import { createUser } from './models/userModel.js';
import { finishSetup } from './controllers/registrationController.js';
import { updateShopRequestStatus } from './models/shopRequestModel.js';

async function runRegistrationIntegrationTests() {
  console.log('====================================================');
  console.log('  TESTING REGISTRATION, PROOF & FIRST STAFF FLOW   ');
  console.log('====================================================\n');

  let owner = null;
  let businessId = null;

  try {
    // 1. Create owner account
    const passHash = await bcrypt.hash('OwnerPass123!', 10);
    const uname = `reg_owner_${Date.now()}`;
    owner = await createUser({
      username: uname,
      email: `${uname}@test.local`,
      passwordHash: passHash,
      role: 'admin',
      status: 'active',
    });

    console.log(`✅ 1. Owner account created: ${owner.username}`);

    // 2a. Call finishSetup WITHOUT paymentProofUrl
    const mockReqNoProof = {
      user: owner,
      body: {
        business: {
          businessName: 'No Proof Test Shop',
          businessTypeCode: 'grocery',
          location: 'Lahore, Punjab',
          cityRegion: 'Lahore',
          shopAddress: 'Shop 2, Test Street',
          isRegistered: false,
        },
        moduleCode: 'grocery',
        subscription: {
          planCode: 'retention_6m',
          platform: 'web_app',
          paymentMethod: 'card',
          backupModuleCodes: [],
        },
        paymentProofUrl: null,
      },
    };

    let noProofResponse = null;
    const mockResNoProof = {
      status: (code) => ({
        json: (data) => {
          noProofResponse = { code, data };
        },
      }),
    };

    await finishSetup(mockReqNoProof, mockResNoProof);
    if (noProofResponse?.code !== 201) {
      throw new Error(`finishSetup without proof failed: ${JSON.stringify(noProofResponse)}`);
    }

    const noProofBizId = noProofResponse.data.business.id;
    const [[noProofBizRow]] = await pool.query('SELECT payment_proof_url, payment_proof_status FROM businesses WHERE id = ?', [noProofBizId]);
    if (noProofBizRow.payment_proof_url !== null || noProofBizRow.payment_proof_status !== 'not_submitted') {
      throw new Error(`NO-PROOF payment proof DB verification failed: ${JSON.stringify(noProofBizRow)}`);
    }
    console.log('✅ 2a. Registration WITHOUT payment proof verified: payment_proof_status="not_submitted", payment_proof_url=null.');

    // Clean up temporary no-proof business
    await pool.query('DELETE FROM shop_requests WHERE business_id = ?', [noProofBizId]);
    await pool.query('DELETE FROM subscriptions WHERE business_id = ?', [noProofBizId]);
    await pool.query('DELETE FROM businesses WHERE id = ?', [noProofBizId]);

    // 2b. Call finishSetup WITH firstStaff & paymentProofUrl
    const mockReq = {
      user: owner,
      body: {
        business: {
          businessName: 'Automated Test Shop',
          businessTypeCode: 'pharmacy',
          location: 'Karachi, Sindh',
          cityRegion: 'Karachi',
          shopAddress: 'Shop 101, Test Market',
          isRegistered: true,
          nicNumber: '42101-1234567-1',
        },
        moduleCode: 'pharmacy',
        subscription: {
          planCode: 'retention_6m',
          platform: 'web_app',
          paymentMethod: 'bank_transfer',
          backupModuleCodes: ['sales_pos'],
        },
        paymentProofUrl: '/uploads/proofs/test_receipt.png',
        firstStaff: {
          username: `staff_${Date.now()}`,
          fullName: 'Test Cashier',
          password: 'StaffPassword123!',
        },
      },
    };

    let finishResponse = null;
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          finishResponse = { code, data };
        },
      }),
    };

    await finishSetup(mockReq, mockRes);
    if (finishResponse?.code !== 201) {
      throw new Error(`finishSetup failed: ${JSON.stringify(finishResponse)}`);
    }

    businessId = finishResponse.data.business.id;
    console.log(`✅ 2b. finishSetup WITH proof executed successfully. Business #${businessId} created.`);

    // 3. Verify Payment Proof status & URL in DB
    const [[bizRow]] = await pool.query('SELECT payment_proof_url, payment_proof_status FROM businesses WHERE id = ?', [businessId]);
    if (bizRow.payment_proof_url !== '/uploads/proofs/test_receipt.png' || bizRow.payment_proof_status !== 'submitted') {
      throw new Error(`Payment proof DB verification failed: ${JSON.stringify(bizRow)}`);
    }
    console.log('✅ 3. Payment proof URL and status ("submitted") verified in DB.');

    // 4. Verify First Staff member in DB (associated with businessId and status='pending')
    const [staffRows] = await pool.query('SELECT * FROM users WHERE business_id = ? AND role = "user"', [businessId]);
    if (staffRows.length === 0) throw new Error('First staff member was not created in DB');
    const staff = staffRows[0];
    if (staff.status !== 'pending') throw new Error('First staff member status is not pending before approval');

    const bcryptCheck = await bcrypt.compare('StaffPassword123!', staff.password_hash);
    if (!bcryptCheck) throw new Error('Staff password bcrypt hash verification failed');
    console.log(`✅ 4. First Staff member "${staff.username}" verified in DB (bcrypt hashed, status=pending).`);

    // 5. Verify Pending Shop Request contains proof & staff details
    const [reqRows] = await pool.query('SELECT id, details FROM shop_requests WHERE business_id = ? AND request_type = "registration"', [businessId]);
    const details = JSON.parse(reqRows[0].details);
    if (details.paymentProofUrl !== '/uploads/proofs/test_receipt.png' || !details.firstStaffUsername) {
      throw new Error('Shop request details missing proof or staff info');
    }
    console.log('✅ 5. Registration request details verified for Super Admin review.');

    // 6. Super Admin Approves Registration
    await updateShopRequestStatus(reqRows[0].id, { status: 'Approved', reviewerId: 1 });
    console.log('✅ 6. Super Admin approved registration request.');

    // 7. Verify Owner & Staff become 'active'
    const [[ownerAfter]] = await pool.query('SELECT status FROM users WHERE id = ?', [owner.id]);
    const [[staffAfter]] = await pool.query('SELECT status FROM users WHERE id = ?', [staff.id]);
    const [[bizAfter]] = await pool.query('SELECT status FROM businesses WHERE id = ?', [businessId]);

    if (ownerAfter.status !== 'active' || staffAfter.status !== 'active' || bizAfter.status !== 'active') {
      throw new Error(`Activation failed: owner=${ownerAfter.status}, staff=${staffAfter.status}, biz=${bizAfter.status}`);
    }
    console.log('✅ 7. Owner, Business, and First Staff all activated successfully upon approval.');

    console.log('\n====================================================');
    console.log('  ALL REGISTRATION & PROOF INTEGRATION TESTS PASSED ');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ FAIL: Registration Integration Test Error:', err);
    process.exit(1);
  } finally {
    if (businessId) {
      await pool.query('DELETE FROM shop_requests WHERE business_id = ?', [businessId]);
      await pool.query('DELETE FROM subscriptions WHERE business_id = ?', [businessId]);
      await pool.query('DELETE FROM users WHERE business_id = ?', [businessId]);
      await pool.query('DELETE FROM businesses WHERE id = ?', [businessId]);
    }
    if (owner?.id) await pool.query('DELETE FROM users WHERE id = ?', [owner.id]);
    await pool.end();
  }
}

runRegistrationIntegrationTests();
