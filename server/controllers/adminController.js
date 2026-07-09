import { findAllUsers } from '../models/userModel.js';
import { getAllSubscriptionsWithUser, updateSubscriptionStatus } from '../models/subscriptionModel.js';
import { setSubscriptionStatus as syncProfileSubscriptionStatus } from '../models/businessProfileModel.js';

export async function getAllUsersHandler(req, res) {
  try {
    const users = await findAllUsers();
    return res.status(200).json({ users });
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getAllSubscriptionsHandler(req, res) {
  try {
    const subscriptions = await getAllSubscriptionsWithUser();
    return res.status(200).json({ subscriptions });
  } catch (err) {
    console.error('Get all subscriptions error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// Approves (or otherwise updates the status of) a subscription. Keeps
// two tables in sync in one request: the subscriptions row itself
// (source of truth) and the cached subscription_status on the user's
// business_profiles row (fast read for dashboards).
export async function approveSubscription(req, res) {
  try {
    const { id } = req.params;
    const { status = 'active', plan, paymentDate, renewsAt } = req.body;

    const updated = await updateSubscriptionStatus(id, { status, plan, paymentDate, renewsAt });
    if (!updated) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await syncProfileSubscriptionStatus(updated.user_id, status);

    return res.status(200).json({ message: 'Subscription updated', subscription: updated });
  } catch (err) {
    console.error('Approve subscription error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}