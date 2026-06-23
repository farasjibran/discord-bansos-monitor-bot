#!/usr/bin/env node

/**
 * Clear storage script - Reset posted items
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storagePath = path.join(__dirname, '../data/posted.json');

console.log('='.repeat(60));
console.log('🗑️  CLEAR STORAGE - Reset Posted Items');
console.log('='.repeat(60));
console.log();

// Check if storage exists
if (!fs.existsSync(storagePath)) {
  console.log('⚠️  Storage file tidak ditemukan');
  console.log(`   Path: ${storagePath}`);
  console.log();
  console.log('   Storage sudah kosong atau belum dibuat.');
  process.exit(0);
}

// Read current storage
const currentData = JSON.parse(fs.readFileSync(storagePath, 'utf8'));

console.log('📊 Current storage:');
console.log(`   - Posted items: ${currentData.posted.length}`);
console.log(`   - Last check: ${currentData.lastCheck || 'N/A'}`);
console.log();

// Confirm
console.log('⚠️  WARNING: This will delete all posted items!');
console.log('   Bot akan mengirim notifikasi untuk SEMUA items di website.');
console.log();

// Reset storage
const newData = {
  posted: [],
  lastCheck: null
};

fs.writeFileSync(storagePath, JSON.stringify(newData, null, 2), 'utf8');

console.log('✅ Storage berhasil di-clear!');
console.log();
console.log('📝 New storage state:');
console.log(`   - Posted items: 0`);
console.log(`   - Last check: null`);
console.log();
console.log('🚀 Next run akan post semua items di website!');
console.log();
console.log('='.repeat(60));
