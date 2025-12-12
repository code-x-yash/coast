# Edge Functions Summary - Quick Reference

## 📊 At a Glance

- **Current Deployed:** 0/12
- **Maximum Allowed:** 12
- **Current Usage:** 0% of limit ✅
- **Strategy:** Direct Supabase queries + RLS for 90% of operations

---

## 🎯 The 12 Edge Functions

| # | Function Name | Purpose | Priority | Status |
|---|---------------|---------|----------|--------|
| 1 | `otp-service` | Phone/Email OTP | High | ❌ Not deployed |
| 2 | `notification-service` | WhatsApp/SMS/Email | High | ❌ Not deployed |
| 3 | `admin-operations` | Institute approvals | High | ❌ Not deployed |
| 4 | `file-processor` | File uploads + validation | High | ❌ Not deployed |
| 5 | `payment-handler` | Payment processing | Medium | ❌ Not deployed |
| 6 | `booking-manager` | Booking + seat lock | Medium | ❌ Not deployed |
| 7 | `certificate-generator` | PDF generation | Medium | ❌ Not deployed |
| 8 | `dgshipping-integration` | DG Shipping upload | Medium | ❌ Not deployed |
| 9 | `analytics-engine` | Reports & analytics | Low | ❌ Not deployed |
| 10 | `commission-processor` | Commission calc | Low | ❌ Not deployed |
| 11 | `scheduled-jobs` | Cron tasks | Low | ❌ Not deployed |
| 12 | `webhook-router` | External webhooks | Low | ❌ Not deployed |

---

## 🟢 What Works Without Edge Functions (90% of Operations)

### User Management
- Registration (Supabase Auth)
- Login (Supabase Auth)
- Profile updates (Direct query with RLS)
- View own data (Direct query with RLS)

### Course Management
- Browse courses (Direct query)
- View course details (Direct query)
- Create courses as institute (Direct insert with RLS)
- Update courses (Direct update with RLS)
- View batches (Direct query)
- Create batches (Direct insert with RLS)

### Data Retrieval
- View own bookings (Direct query)
- View own certificates (Direct query)
- View institute details (Direct query)
- Search & filter (Direct query)

**Total Operations:** ~40+

---

## 🔴 What Requires Edge Functions (10% of Operations)

### Authentication & Security
- OTP generation/verification → `otp-service`

### External Integrations
- WhatsApp notifications → `notification-service`
- SMS notifications → `notification-service`
- Email sending → `notification-service`
- Payment processing → `payment-handler`
- DG Shipping upload → `dgshipping-integration`

### Complex Business Logic
- Booking with atomic seat lock → `booking-manager`
- Certificate PDF generation → `certificate-generator`
- Institute approval workflow → `admin-operations`
- Commission calculations → `commission-processor`

### File Operations
- Upload with validation → `file-processor`

### Background Tasks
- Scheduled reminders → `scheduled-jobs`
- Status updates → `scheduled-jobs`

### Webhook Handling
- External service webhooks → `webhook-router`

**Total Operations:** ~12

---

## 💰 Cost Breakdown (Estimated)

### Free Tier (Supabase Pro)
- **Edge Function Invocations:** 2 million/month
- **Bandwidth:** 50 GB/month
- **Database:** 8 GB storage

### Expected Monthly Usage (1000 active users)

| Function | Calls/Month | Within Free Tier |
|----------|-------------|------------------|
| otp-service | 2,000 | ✅ Yes |
| notification-service | 5,000 | ✅ Yes |
| admin-operations | 500 | ✅ Yes |
| file-processor | 1,000 | ✅ Yes |
| payment-handler | 500 | ✅ Yes |
| booking-manager | 500 | ✅ Yes |
| certificate-generator | 300 | ✅ Yes |
| dgshipping-integration | 300 | ✅ Yes |
| analytics-engine | 200 | ✅ Yes |
| commission-processor | 100 | ✅ Yes |
| scheduled-jobs | 90 (3/day) | ✅ Yes |
| webhook-router | 1,000 | ✅ Yes |
| **TOTAL** | **11,490** | ✅ Yes (0.57% of limit) |

**Conclusion:** Well within free tier limits! 🎉

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-2)
**Goal:** Basic registration and admin approval

**Deploy:**
1. ✅ `otp-service` - Required for phone verification
2. ✅ `notification-service` - Required for emails
3. ✅ `admin-operations` - Required for institute approval
4. ✅ `file-processor` - Required for logo/banner uploads

**Milestone:** Institutes can register and get approved

---

### Phase 2: Payments (Week 3)
**Goal:** Enable course bookings with payments

**Deploy:**
5. ✅ `payment-handler` - Razorpay integration
6. ✅ `booking-manager` - Atomic booking creation

**Milestone:** Students can book and pay for courses

---

### Phase 3: Certificates (Week 4)
**Goal:** Issue and upload certificates

**Deploy:**
7. ✅ `certificate-generator` - PDF generation
8. ✅ `dgshipping-integration` - Upload to DG Shipping

**Milestone:** Students receive digital certificates

---

### Phase 4: Analytics (Week 5)
**Goal:** Business insights and commission management

**Deploy:**
9. ✅ `analytics-engine` - Reports and dashboards
10. ✅ `commission-processor` - Institute payouts

**Milestone:** Financial tracking complete

---

### Phase 5: Automation (Week 6)
**Goal:** Background tasks and external integrations

**Deploy:**
11. ✅ `scheduled-jobs` - Automated reminders
12. ✅ `webhook-router` - External service integration

**Milestone:** Full production-ready system

---

## 📝 Implementation Checklist

### Before Deploying Any Edge Function

- [ ] Create function directory: `supabase/functions/{function-name}/`
- [ ] Create `index.ts` with proper CORS headers
- [ ] Add JWT verification (if required)
- [ ] Add input validation
- [ ] Add error handling
- [ ] Test locally with `supabase functions serve`
- [ ] Set required secrets in Supabase Dashboard
- [ ] Deploy with `supabase functions deploy {function-name}`
- [ ] Test in production
- [ ] Update frontend to call function
- [ ] Monitor logs and errors

---

## 🔒 Security Requirements

### All Edge Functions MUST Have:
- ✅ CORS headers configured
- ✅ JWT verification (except webhook-router)
- ✅ Input validation
- ✅ Error handling that doesn't leak sensitive info
- ✅ Rate limiting for public endpoints
- ✅ Secrets stored in Supabase (never in code)

### All Direct Queries MUST Have:
- ✅ RLS enabled on table
- ✅ Policies checking `auth.uid()`
- ✅ No `USING (true)` policies
- ✅ Tested with different user roles

---

## 🛠️ Development Commands

### Test Edge Function Locally
```bash
# Start local Supabase
supabase start

# Serve specific function
supabase functions serve otp-service

# Test with curl
curl -X POST http://localhost:54321/functions/v1/otp-service/generate-phone \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'
```

### Deploy Edge Function
```bash
# Deploy single function
supabase functions deploy otp-service

# Deploy all functions
supabase functions deploy

# View logs
supabase functions logs otp-service
```

### Set Secrets
```bash
# Set via CLI
supabase secrets set TWILIO_ACCOUNT_SID=ACxxx

# Or via Dashboard
# Supabase Dashboard → Project Settings → Edge Functions → Secrets
```

---

## 📊 Monitoring Dashboard

### Check in Supabase Dashboard

**Navigate to:** Functions → {function-name}

**Monitor:**
- Invocation count (per hour/day/month)
- Response time (avg/p50/p95/p99)
- Error rate (4xx/5xx)
- Memory usage
- Execution time

**Set Alerts for:**
- Error rate > 5%
- Response time > 2 seconds
- Memory usage > 80%

---

## 🐛 Troubleshooting

### Edge Function Not Working

**1. Check Deployment Status**
```bash
supabase functions list
```

**2. Check Logs**
```bash
supabase functions logs {function-name}
```

**3. Test Locally**
```bash
supabase functions serve {function-name}
# Then test with curl
```

**4. Verify Secrets**
```bash
supabase secrets list
```

**5. Check CORS**
- Ensure CORS headers in function
- Check browser console for CORS errors

**6. Verify JWT**
- Check Authorization header
- Verify token not expired
- Check function has `verify_jwt: true`

---

## 📚 Additional Resources

### Documentation
- [EDGE_FUNCTIONS_ARCHITECTURE.md](./EDGE_FUNCTIONS_ARCHITECTURE.md) - Detailed architecture
- [OPERATION_ROUTING_GUIDE.md](./OPERATION_ROUTING_GUIDE.md) - When to use edge functions vs direct queries
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

### Code Examples
- [Supabase Edge Function Examples](https://github.com/supabase/supabase/tree/master/examples/edge-functions)

---

## ✅ Success Criteria

### System is Production-Ready When:
- [ ] All 12 edge functions deployed
- [ ] All functions tested in production
- [ ] Error rate < 1%
- [ ] Response time < 1 second (95th percentile)
- [ ] Monitoring and alerts configured
- [ ] Documentation complete
- [ ] Frontend integrated with all functions
- [ ] Security audit passed

---

## 🎯 Key Takeaways

1. **12 edge functions is the perfect balance** between functionality and simplicity
2. **90% of operations use direct queries** with RLS - this is by design!
3. **Edge functions only for external APIs and privileged operations**
4. **Well within cost limits** - only ~11K calls/month for 1K users
5. **Phased deployment** reduces risk and allows testing
6. **Security is built-in** with JWT verification and RLS

---

**Status:** Architecture Complete ✅
**Next Step:** Deploy Phase 1 (4 functions)
**Timeline:** 6 weeks to full deployment
**Risk:** Low - modular and tested approach

---

**Document Version:** 1.0
**Date:** December 12, 2024
**Author:** System Architecture Team
