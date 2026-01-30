# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

## 📋 Pre-Launch Checklist

### 1. Database Cleanup
- [ ] Run `scripts/clear_test_data.sql` in Supabase SQL Editor
- [ ] Verify all test orders are deleted
- [ ] Verify all test licenses are deleted
- [ ] Verify all test customers are deleted
- [ ] Verify cart items are cleared

### 2. Environment Variables
- [ ] Update `.env.production` with production values
- [ ] Verify `NEXT_PUBLIC_SITE_URL` is your production domain
- [ ] Verify `MONEYMOTION_API_KEY` is production key (not test)
- [ ] Verify `MONEYMOTION_WEBHOOK_SECRET` is configured
- [ ] Verify `RESEND_API_KEY` is active and working
- [ ] Verify Supabase keys are production keys

### 3. Payment Configuration
- [ ] MoneyMotion webhook URL configured: `https://yourdomain.com/api/webhooks/moneymotion`
- [ ] Test webhook with MoneyMotion dashboard
- [ ] Verify webhook secret matches `.env.production`
- [ ] Test a real payment flow end-to-end

### 4. Email Configuration
- [ ] Resend API key is active
- [ ] Test password reset email
- [ ] Test order confirmation email
- [ ] Test license delivery email
- [ ] Verify sender domain is verified in Resend

### 5. Admin Panel
- [ ] Change admin password from default
- [ ] Test admin login at `/mgmt-x9k2m7/login`
- [ ] Verify all admin pages load correctly
- [ ] Add real products (not test products)
- [ ] Add license keys to stock for each product

### 6. Products Setup
- [ ] Remove any test/demo products
- [ ] Add real product images
- [ ] Add real product descriptions
- [ ] Set correct prices
- [ ] Configure product statuses (Undetected/Updating/Detected)
- [ ] Add feature cards for each product
- [ ] Set display order for products

### 7. Content Review
- [ ] Review homepage content
- [ ] Review FAQ section
- [ ] Review footer links
- [ ] Review terms of service (if applicable)
- [ ] Review privacy policy (if applicable)
- [ ] Check all images load correctly
- [ ] Check all videos load correctly

### 8. Security
- [ ] Admin password is strong and unique
- [ ] Environment variables are not exposed
- [ ] API keys are production keys (not test)
- [ ] HTTPS/SSL is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (if applicable)

### 9. Testing
- [ ] Test product browsing
- [ ] Test add to cart
- [ ] Test checkout flow (guest)
- [ ] Test checkout flow (logged in)
- [ ] Test payment completion
- [ ] Test license delivery
- [ ] Test password reset
- [ ] Test account creation
- [ ] Test mobile responsiveness
- [ ] Test on different browsers

### 10. Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure email alerts for failed orders
- [ ] Monitor webhook delivery

---

## 🗄️ Database Cleanup Commands

### Option 1: Clear All Test Data
```sql
-- Run in Supabase SQL Editor
-- See: scripts/clear_test_data.sql

DELETE FROM orders;
DELETE FROM licenses;
DELETE FROM cart_items;
DELETE FROM store_customers;
```

### Option 2: Clear Only Test Emails
```sql
-- Run in Supabase SQL Editor
DELETE FROM orders WHERE customer_email LIKE '%example.com%';
DELETE FROM licenses WHERE customer_email LIKE '%example.com%';
DELETE FROM store_customers WHERE email LIKE '%example.com%';
```

---

## 🔐 Security Checklist

### Change Admin Password
1. Go to `/mgmt-x9k2m7/login`
2. Login with current password: `MagmaSecure2024!@#`
3. Go to Settings (when implemented) or update in database:
```sql
-- Update admin password in database
-- (You'll need to hash the password first)
```

### Verify Environment Variables
```bash
# Check .env.production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
MONEYMOTION_API_KEY=mk_live_xxxxx (not mk_test_xxxxx)
RESEND_API_KEY=re_xxxxx
```

---

## 📧 Email Testing

### Test Password Reset
1. Go to `/forgot-password`
2. Enter your email
3. Check inbox for reset email
4. Click link and reset password
5. Verify you can login with new password

### Test Order Confirmation
1. Make a test purchase
2. Check email for order confirmation
3. Verify license key is included
4. Verify all details are correct

---

## 💳 Payment Testing

### Test MoneyMotion Integration
1. Create a test order
2. Complete payment in MoneyMotion
3. Verify webhook is received
4. Verify order status changes to "completed"
5. Verify license is assigned
6. Verify customer receives email

---

## 🎯 Launch Day

### Final Steps Before Launch
1. [ ] Run database cleanup script one final time
2. [ ] Verify all environment variables
3. [ ] Test complete purchase flow
4. [ ] Deploy to production
5. [ ] Verify site is accessible
6. [ ] Test one real purchase
7. [ ] Monitor logs for errors
8. [ ] Announce launch!

### Post-Launch Monitoring
- [ ] Check error logs every hour for first 24 hours
- [ ] Monitor order completion rate
- [ ] Monitor webhook delivery
- [ ] Monitor email delivery
- [ ] Check customer support channels

---

## 🆘 Rollback Plan

If something goes wrong:

1. **Revert deployment** to previous version
2. **Check logs** for error messages
3. **Verify environment variables** are correct
4. **Test webhook** delivery
5. **Contact support** if needed

---

## 📞 Support Contacts

- **MoneyMotion Support**: [support link]
- **Resend Support**: [support link]
- **Supabase Support**: [support link]
- **Vercel Support**: [support link]

---

## ✅ Launch Complete!

Once all items are checked:
- [ ] Site is live
- [ ] All systems operational
- [ ] Monitoring in place
- [ ] Ready for customers!

**🎉 Congratulations on your launch!**
