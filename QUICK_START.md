# 🚀 QUICK START GUIDE - License Key Stock System

## 🎯 **WHAT THIS DOES**

Your site now has a **complete license key management system** where:
1. You pre-load license keys for each product
2. When someone buys, they automatically get a key from your stock
3. No duplicate keys - each key is used only once
4. Full tracking of stock levels and key status

---

## ⚡ **QUICK SETUP (5 MINUTES)**

### 1️⃣ **Add License Keys to Stock**

```
Admin Panel → License Keys → "Add License Stock"
```

1. Select a product (e.g., "Fortnite 1 Day")
2. Paste your keys (one per line):
   ```
   ABC123-DEF456-GHI789
   XYZ789-UVW456-RST123
   QWE098-ASD765-ZXC432
   ```
3. Click "Add to Stock"
4. Done! You now have 3 keys in stock

### 2️⃣ **Test It**

1. Make a test purchase on your site
2. Go back to License Keys page
3. You'll see:
   - Stock count went down by 1
   - One key is now "active" and assigned to the customer
   - Customer received the key via email

### 3️⃣ **Monitor Stock**

- **Stock Summary Cards** show available keys per product
- Add more keys before running out
- If stock is empty, system generates a random key (fallback)

---

## 📊 **ADMIN INTERFACE**

### **License Keys Page**
```
┌─────────────────────────────────────┐
│  Stock Available                    │
│  5 keys - Fortnite 1 Day           │
│  12 keys - Rust Aimbot             │
│  0 keys - Apex Legends             │
└─────────────────────────────────────┘

[Add License Stock]  [Refresh]

License Key          Product         Customer         Status    Expires
────────────────────────────────────────────────────────────────────────
ABC123-DEF456-...   Fortnite 1 Day  user@email.com   Active    Jan 28
XYZ789-UVW456-...   Fortnite 1 Day  -                Unused    Never
QWE098-ASD765-...   Rust Aimbot     -                Unused    Never
```

---

## 🔧 **HOW IT WORKS UNDER THE HOOD**

### **Purchase Flow:**
```
1. Customer clicks "Buy Now"
   ↓
2. MoneyMotion payment completes
   ↓
3. Webhook receives "payment.completed"
   ↓
4. System searches for unused key for that product
   ↓
5. Key found → assign to customer (status: unused → active)
   ↓
6. Email sent with license key
   ↓
7. Stock count decreases
```

### **Key Status States:**
| Status   | Meaning                                    |
|----------|--------------------------------------------|
| unused   | In stock, ready to be assigned            |
| active   | Assigned to a customer, currently valid   |
| expired  | Time limit reached, no longer valid       |
| revoked  | Manually revoked by admin                 |

---

## ✅ **WHAT'S FIXED**

### **Fonts:**
- ✅ **Products page** - Removed ugly mono font from slug
- ✅ **License keys page** - Cleaner font for keys

### **Status Page:**
- ✅ Added "Status Page" link in admin sidebar
- ✅ Points to `/status` (public page)

### **License System:**
- ✅ Pre-load your own license keys
- ✅ Auto-assign on purchase
- ✅ Track stock levels
- ✅ No duplicate keys
- ✅ Bulk add keys (paste multiple at once)

---

## 🎨 **STATUS PAGE (PUBLIC)**

Your customers can now see real-time product statuses at `/status`:

- Shows ALL products from your database
- Displays detection status (Undetected, Updating, Detected)
- Auto-refreshes every 30 seconds
- Filter by game category
- Clean, professional design

**You control status from admin panel** by editing products and changing their status field!

---

## 📝 **ADDING KEYS - EXAMPLES**

### **Good Format (One Per Line):**
```
MGMA-FORT-30D-ABCD-EFGH
MGMA-FORT-30D-IJKL-MNOP
MGMA-FORT-30D-QRST-UVWX
```

### **Also Works:**
```
ABC123-DEF456
XYZ789-UVW456
QWE098-ASD765
```

**Any format works!** Just make sure:
- One key per line
- No empty lines
- Select correct product before adding

---

## 🚨 **IMPORTANT TIPS**

1. **Add Keys BEFORE Selling**
   - Always have stock ready before customers buy
   - If stock is 0, system will generate random keys

2. **Check Stock Regularly**
   - Set up alerts when stock is low
   - Bulk add keys ahead of time

3. **Test Before Going Live**
   - Add test keys
   - Make a test purchase
   - Verify key was assigned correctly

4. **Variants Support**
   - Currently works for base products
   - Variant support (1 Day, 7 Days, 30 Days) coming soon
   - For now, create separate products for each duration

---

## 🔥 **START NOW**

```bash
# 1. Restart dev server
npm run dev

# 2. Login to admin
http://localhost:3000/mgmt-x9k2m7/login
Password: MagmaSecure2024!@#

# 3. Go to License Keys
# 4. Click "Add License Stock"
# 5. Add your keys!
```

**DONE! Your license system is fully automated! 🎉**
