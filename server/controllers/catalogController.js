import {
  listModules,
  listBusinessTypes,
  listPlans,
  listBackupModules,
} from '../models/catalogModel.js';

export async function getModules(req, res) {
  res.json({ modules: await listModules() });
}

export async function getBusinessTypes(req, res) {
  res.json({ businessTypes: await listBusinessTypes() });
}

export async function getPlans(req, res) {
  res.json({ plans: await listPlans() });
}

export async function getBackupModules(req, res) {
  res.json({ backupModules: await listBackupModules() });
}
