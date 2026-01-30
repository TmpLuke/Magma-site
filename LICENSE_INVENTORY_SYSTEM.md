# 🔑 License Key Inventory System

## Overview
A pure inventory management system for license keys. Keys are stored in stock and automatically consumed (deleted) when purchased.

---

## 🎯 How It Works

### **Admin Panel - Stock Management**
- **View Stock**: See all license keys in inventory
- **Add Stock**: Add new license keys (general, product-specific, or variant-specific)
- **Delete Stock**: Remove keys from inventory manually
- **Stock Summary**: View breakdown by product/variant

### **Purchase Flow - Automatic Consumption**
1. Customer purchases a product
2. MoneyMotion webhook triggers payment completion
3. System finds available license key matching:
   - Priority 1: Exact product+variant match
   - Priority 2: Product-only match (any variant)
   - Priority 3: General stock (any product)
4. License key is **automatically deleted** from database
5. Key is sent to customer via email
6. Stock count decreases by 1

---

## 📊 Stock Types

### **General Stock** (Blue Badge)
- Can be used for ANY product/variant
- Used when no product-specific keys available
- Flexible fallback option

### **Product Stock** (Green Badge)
- Reserved for specific product only
- Can be used with any variant of that product
- Useful for product-specific promotions

### **Variant Stock** (Purple Badge)
- Reserved for specific product+variant combination
- Most restrictive option
- Useful for limited-time offers

---

## 🔄 Database Schema

```sql
licenses table:
- id (UUID, primary key)
- license_key (TEXT, unique)
- product_id (UUID, nullable)
- product_name (TEXT, nullable)
- variant_id (UUID, nullable)
- created_at (TIMESTAMP)
```

**No customer tracking** - Keys are simply stored and consumed.

---

## 📝 Admin Panel Features

### **View Licenses**
- Search by license key
- Filter by stock type
- See product assignment
- View when added

### **Add Stock**
```
1. Click "Add Stock"
2. Choose stock type:
   - General Stock (any product)
   - Product Stock (specific product)
   - Variant Stock (specific variant)
3. Paste license keys (one per line)
4. Click "Add to Stock"
```

### **Delete Stock**
- Click trash icon to remove key from inventory
- Useful for removing duplicates or invalid keys

### **Stock Summary**
- Total keys in stock
- Breakdown by general/product/variant
- Count by product
- Count by variant

---

## 🛒 Purchase Integration

### **When Someone Buys:**
1. Order created as "pending"
2. Payment processed via MoneyMotion
3. Webhook received with payment confirmation
4. System calls `consumeLicenseFromStock()`
5. License key retrieved and deleted from DB
6. Key sent to customer email
7. Order marked as "completed"

### **If No Stock Available:**
- Webhook logs error
- Order remains pending
- Admin must manually add stock or generate key
- Customer doesn't receive key until resolved

---

## 🔧 API Functions

### **Admin Functions**

```typescript
// Get all licenses in stock
getLicenses()

// Add keys to stock
addLicenseStock({
  product_id?: string,
  variant_id?: string,
  license_keys: string[]
})

// Delete key from stock
deleteLicenseStock(licenseId: string)

// Get stock summary
getStockSummary()

// Get count for product/variant
getStockCountByProduct(productId?, variantId?)

// Bulk delete
bulkDeleteLicenses(licenseIds: string[])
```

### **Purchase Functions**

```typescript
// Consume license from stock (called by webhook)
consumeLicenseFromStock({
  product_id: string,
  variant_id: string | null
})
// Returns: { success, license_key } or { success: false, error }
// Automatically deletes the key from database
```

---

## 📋 License Key Format

**Required Format**: `XXXX-XXXX-XXXX-XXXX-XXXX`

**Rules:**
- 5 groups of 4 characters
- Alphanumeric only (A-Z, 0-9)
- Separated by dashes
- No confusing characters (0, O, I, 1)

**Example Valid Keys:**
```
MGMA-FORT-30D-7Z4J-23U4
MGMA-FORT-30D-FZ3N-LSS5
MGMA-FORT-30D-DQGW-7CUG
```

---

## 🚀 Workflow Example

### **Scenario: Fortnite Private 1-Day Keys**

**Step 1: Add Stock**
```
Admin goes to /mgmt-x9k2m7/licenses
Clicks "Add Stock"
Selects "Variant Stock"
Chooses "Fortnite Private"
Chooses "1 day - $15"
Pastes 100 license keys
Clicks "Add to Stock"
Result: 100 keys added to inventory
```

**Step 2: Customer Purchases**
```
Customer buys "Fortnite Private - 1 day"
Pays $15 via MoneyMotion
Payment confirmed
```

**Step 3: Automatic Fulfillment**
```
Webhook received
System finds variant-specific key
Key deleted from database
Email sent to customer with key
Stock count: 99 remaining
```

**Step 4: Admin Monitoring**
```
Admin checks Stock Summary
Sees: 99 keys remaining for Fortnite Private 1-day
When stock gets low, adds more keys
```

---

## ⚠️ Important Notes

### **Stock Consumption**
- Keys are **permanently deleted** when purchased
- No way to recover deleted keys
- Backup your keys before adding to system

### **Out of Stock**
- If no keys available, purchase fails
- Admin must add more stock
- Customer doesn't receive key until stock added

### **Priority System**
- Exact variant match used first
- Falls back to product-only keys
- Finally uses general stock
- Ensures efficient stock usage

### **No Customer Tracking**
- Keys not linked to customers
- No customer email stored
- No expiration tracking
- Pure inventory system

---

## 🔍 Monitoring Stock

### **Check Stock Levels**
1. Go to `/mgmt-x9k2m7/licenses`
2. Click "Stock Summary"
3. View total and breakdown by product/variant

### **Low Stock Alert**
- Manually check summary regularly
- Set up monitoring if needed
- Add stock before running out

### **Audit Trail**
- View when each key was added
- See product/variant assignment
- Track stock additions over time

---

## 🛠️ Troubleshooting

### **"No license keys available in stock"**
- Add more keys to inventory
- Check stock summary for availability
- Verify product/variant assignment

### **Invalid license key format**
- Use format: XXXX-XXXX-XXXX-XXXX-XXXX
- Avoid confusing characters (0, O, I, 1)
- Check for typos

### **Duplicate keys**
- System prevents adding same key twice
- Check existing stock before adding
- Remove duplicates if found

### **Wrong stock type**
- General stock: any product
- Product stock: specific product only
- Variant stock: specific variant only
- Choose correct type when adding

---

## 📊 Stock Summary View

Shows:
- **Total in Stock**: All keys available
- **General Stock**: Keys for any product
- **Product-Specific**: Keys for specific products
- **Variant-Specific**: Keys for specific variants
- **By Product**: Breakdown per product
- **By Variant**: Breakdown per variant

---

## ✅ Best Practices

1. **Add Stock Regularly**: Don't wait until out of stock
2. **Use Correct Type**: Choose appropriate stock type
3. **Monitor Levels**: Check summary weekly
4. **Backup Keys**: Keep backup of all keys
5. **Validate Format**: Ensure keys match format
6. **Test First**: Add small batch before bulk adding
7. **Track Additions**: Note when stock was added

---

## 🎯 Summary

This is a **pure inventory system**:
- ✅ Stock keys in database
- ✅ Automatically consume on purchase
- ✅ No customer tracking
- ✅ Simple and efficient
- ✅ Easy to manage
- ✅ Flexible stock types
- ✅ Priority-based assignment

Keys are stored, tracked, and consumed. That's it. Simple and effective.