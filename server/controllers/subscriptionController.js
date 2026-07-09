import { findSubscriptionByUserId } from '../models/subscriptionModel.js';

export async function getSubscriptionStatus(req, res) {
  try {
    const subscription = await findSubscriptionByUserId(req.user.id);
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    return res.status(200).json({ subscription });
  } catch (err) {
    console.error('Get subscription status error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}