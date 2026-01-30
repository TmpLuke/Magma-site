#!/usr/bin/env node

/**
 * License Key Generator for Magma Cheats
 * Generates properly formatted license keys for your products
 */

function generateLicenseKey(productName = "MAGMA", duration = "30D") {
  // Create product prefix (first 4 letters, uppercase, replace non-letters with X)
  const prefix = productName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  
  // Duration codes
  const durationCode = duration.includes("30") ? "30D" : 
                      duration.includes("7") ? "7D" : 
                      duration.includes("1") ? "1D" : "30D";
  
  // Character set (excluding confusing characters like 0, O, I, 1)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  
  // Generate random segments
  const random1 = Array.from({ length: 4 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  
  const random2 = Array.from({ length: 4 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  
  return `MGMA-${prefix}-${durationCode}-${random1}-${random2}`;
}

function generateBulkKeys(count = 10, productName = "FORTNITE", duration = "30D") {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generateLicenseKey(productName, duration));
  }
  return keys;
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 10;
  const productName = args[1] || "FORTNITE";
  const duration = args[2] || "30D";
  
  console.log(`Generating ${count} license keys for ${productName} (${duration}):\n`);
  
  const keys = generateBulkKeys(count, productName, duration);
  keys.forEach((key, index) => {
    console.log(`${(index + 1).toString().padStart(2, '0')}. ${key}`);
  });
  
  console.log(`\n✅ Generated ${keys.length} license keys`);
  console.log(`📋 Copy and paste these into your admin panel`);
}

module.exports = { generateLicenseKey, generateBulkKeys };