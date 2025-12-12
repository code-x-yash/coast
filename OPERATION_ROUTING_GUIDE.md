# Operation Routing Guide - Edge Function vs Direct Query

## Quick Reference: When to Use What

---

## 🟢 Direct Supabase Queries (No Edge Function)

These operations work directly from the frontend using RLS policies:

### User Authentication
```typescript
// ✅ Direct Supabase Auth
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
```

### User Profile Management
```typescript
// ✅ Direct query with RLS
await supabase.from('users').select('*').eq('userid', userId).maybeSingle()
await supabase.from('users').update({ name, phone }).eq('userid', userId)
```

### Course Browsing (Public)
```typescript
// ✅ Direct query with RLS
await supabase.from('courses').select('*').eq('status', 'active')
await supabase.from('master_courses').select('*').eq('is_active', true)
```

### Institute Profile (Own Data)
```typescript
// ✅ Direct query with RLS
await supabase.from('institutes').select('*').eq('userid', userId).maybeSingle()
await supabase.from('institutes').update({ name, address }).eq('instid', instId)
```

### Course Creation (by Institute)
```typescript
// ✅ Direct insert with RLS
await supabase.from('courses').insert({
  instid: userInstituteId,
  title, type, duration, mode, fees
})
```

### Batch Management (by Institute)
```typescript
// ✅ Direct operations with RLS
await supabase.from('batches').select('*').eq('courseid', courseId)
await supabase.from('batches').insert({ courseid, batch_name, start_date, end_date })
await supabase.from('batches').update({ seats_total }).eq('batchid', batchId)
```

### View Own Bookings
```typescript
// ✅ Direct query with RLS
await supabase.from('bookings').select('*').eq('studid', studentId)
```

### View Own Certificates
```typescript
// ✅ Direct query with RLS
await supabase.from('certificates').select('*').eq('studid', studentId)
```

---

## 🔴 Edge Functions Required

These operations MUST use edge functions:

### 1. Phone/Email Verification
```typescript
// ❌ Cannot do client-side (needs SMS API)
// ✅ Use edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/otp-service/generate-phone`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ phone: '+919876543210' })
})
```

### 2. Payment Processing
```typescript
// ❌ Cannot expose payment keys client-side
// ✅ Use edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-handler/create-order`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bookingId: 'uuid',
    amount: 15000,
    currency: 'INR'
  })
})
```

### 3. Booking Creation (with Payment)
```typescript
// ❌ Needs atomic transaction + seat locking
// ✅ Use edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/booking-manager/create`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studid: studentId,
    batchid: batchId,
    amount: 15000
  })
})
```

### 4. Send Notifications
```typescript
// ❌ Cannot expose WhatsApp API keys
// ✅ Use edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/notification-service/whatsapp`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '+919876543210',
    template: 'booking_confirmation',
    data: { bookingId, courseName, date }
  })
})
```

### 5. Generate Certificate
```typescript
// ❌ Needs PDF generation
// ✅ Use edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/certificate-generator/generate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studid: studentId,
    courseid: courseId,
    bookingId: bookingId
  })
})
```

### 6. Admin Actions (Approve Institute)
```typescript
// ❌ Needs service role to bypass RLS
// ✅ Use edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-operations/approve-institute`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    instid: instituteId,
    commission_percent: 5.0
  })
})
```

### 7. File Upload with Processing
```typescript
// ❌ Needs validation + virus scan + processing
// ✅ Use edge function
const formData = new FormData()
formData.append('file', file)
formData.append('type', 'logo')
formData.append('instid', instituteId)

const response = await fetch(`${SUPABASE_URL}/functions/v1/file-processor/upload-logo`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  },
  body: formData
})
```

### 8. Commission Calculation
```typescript
// ❌ Complex financial logic
// ✅ Use edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/commission-processor/calculate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    instid: instituteId,
    period: '2024-12'
  })
})
```

---

## Operation-by-Operation Breakdown

### Institute Registration Flow

| Step | Operation | Method |
|------|-----------|--------|
| 1 | Create auth account | 🟢 Direct: `supabase.auth.signUp()` |
| 2 | Send OTP | 🔴 Edge: `/otp-service/generate-phone` |
| 3 | Verify OTP | 🔴 Edge: `/otp-service/verify` |
| 4 | Upload logo/banner | 🔴 Edge: `/file-processor/upload-logo` |
| 5 | Create institute record | 🟢 Direct: `supabase.from('institutes').insert()` |
| 6 | Send welcome email | 🔴 Edge: `/notification-service/email` |

### Student Registration Flow

| Step | Operation | Method |
|------|-----------|--------|
| 1 | Create auth account | 🟢 Direct: `supabase.auth.signUp()` |
| 2 | Send OTP | 🔴 Edge: `/otp-service/generate-phone` |
| 3 | Verify OTP | 🔴 Edge: `/otp-service/verify` |
| 4 | Create student record | 🟢 Direct: `supabase.from('students').insert()` |
| 5 | Send welcome email | 🔴 Edge: `/notification-service/email` |

### Course Booking Flow

| Step | Operation | Method |
|------|-----------|--------|
| 1 | View courses | 🟢 Direct: `supabase.from('courses').select()` |
| 2 | View batches | 🟢 Direct: `supabase.from('batches').select()` |
| 3 | Check seat availability | 🟢 Direct: Query batch seats |
| 4 | Create booking + payment | 🔴 Edge: `/booking-manager/create` |
| 5 | Process payment | 🔴 Edge: `/payment-handler/verify` |
| 6 | Send confirmation | 🔴 Edge: `/notification-service/whatsapp` |

### Certificate Generation Flow

| Step | Operation | Method |
|------|-----------|--------|
| 1 | Check course completion | 🟢 Direct: Query attendance |
| 2 | Generate PDF | 🔴 Edge: `/certificate-generator/generate` |
| 3 | Upload to DG Shipping | 🔴 Edge: `/dgshipping-integration/upload` |
| 4 | Send certificate email | 🔴 Edge: `/notification-service/email` |
| 5 | Update certificate record | 🟢 Direct: Already done by edge function |

### Admin Institute Approval Flow

| Step | Operation | Method |
|------|-----------|--------|
| 1 | View pending institutes | 🟢 Direct: `supabase.from('institutes').select()` |
| 2 | Review documents | 🟢 Direct: Fetch from storage |
| 3 | Approve + Set commission | 🔴 Edge: `/admin-operations/approve-institute` |
| 4 | Send approval notification | 🔴 Edge: Already done by edge function |

---

## Why This Split?

### 🟢 Direct Queries Are Used When:
- ✅ RLS policies provide sufficient security
- ✅ No external API calls needed
- ✅ No sensitive credentials required
- ✅ Simple CRUD operations
- ✅ User is accessing their own data

**Benefits:**
- Faster (no extra network hop)
- Cheaper (no function invocation cost)
- Simpler code
- Real-time subscriptions possible

### 🔴 Edge Functions Are Used When:
- ✅ Need to access external APIs (payment, SMS, etc.)
- ✅ Need service role privileges
- ✅ Complex business logic
- ✅ Financial transactions
- ✅ File processing
- ✅ Must hide API keys

**Benefits:**
- Secure API key storage
- Complex logic on server
- Atomic transactions
- Better error handling
- Audit logging

---

## Cost Comparison

### Example: 1000 Users, 500 Bookings/Month

#### Current Architecture (Optimized)
| Operation | Count/Month | Method | Cost |
|-----------|-------------|--------|------|
| View courses | 5,000 | Direct | $0 |
| View batches | 3,000 | Direct | $0 |
| Create booking | 500 | Edge Function | $0 (within free tier) |
| Payment processing | 500 | Edge Function | $0 (within free tier) |
| Send notifications | 1,500 | Edge Function | $0 (within free tier) |
| **Total** | | | **$0** |

#### Alternative: All via Edge Functions
| Operation | Count/Month | Method | Cost |
|-----------|-------------|--------|------|
| View courses | 5,000 | Edge Function | Potential costs |
| View batches | 3,000 | Edge Function | Potential costs |
| Create booking | 500 | Edge Function | Potential costs |
| Payment processing | 500 | Edge Function | Potential costs |
| Send notifications | 1,500 | Edge Function | Potential costs |
| **Total** | | | **Higher costs + slower** |

**Conclusion:** Use direct queries wherever possible!

---

## Implementation Checklist

### Phase 1: Current State (No Edge Functions Yet) ✅
- [x] All operations use direct Supabase queries
- [x] RLS policies in place
- [x] Basic functionality works

### Phase 2: Add Critical Edge Functions (Next)
- [ ] Implement `otp-service` for phone verification
- [ ] Implement `notification-service` for emails/SMS
- [ ] Implement `file-processor` for uploads
- [ ] Implement `admin-operations` for approvals

### Phase 3: Payment Integration
- [ ] Implement `payment-handler` for Razorpay
- [ ] Implement `booking-manager` for atomic bookings
- [ ] Update frontend to use new endpoints

### Phase 4: Certificates
- [ ] Implement `certificate-generator`
- [ ] Implement `dgshipping-integration`
- [ ] Update frontend certificate flow

### Phase 5: Analytics & Automation
- [ ] Implement `analytics-engine`
- [ ] Implement `commission-processor`
- [ ] Implement `scheduled-jobs`
- [ ] Implement `webhook-router`

---

## Frontend Helper Functions

### Create a helper to call edge functions:

```typescript
// src/lib/edge-functions.ts

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

export async function callEdgeFunction(
  functionName: string,
  endpoint: string,
  data?: any,
  requireAuth: boolean = true
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  if (requireAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')
    headers['Authorization'] = `Bearer ${session.access_token}`
  } else {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}/${functionName}${endpoint}`, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Edge function call failed')
  }

  return response.json()
}

// Usage:
// const result = await callEdgeFunction('payment-handler', '/create-order', { amount: 15000 })
```

---

## Security Checklist

### Direct Queries
- [x] RLS policies on ALL tables
- [x] Policies check `auth.uid()`
- [x] No `USING (true)` policies
- [x] Test with different users

### Edge Functions
- [ ] All functions verify JWT (except webhooks)
- [ ] All functions validate input
- [ ] Service role key only in edge functions
- [ ] API keys in Supabase secrets
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting on public endpoints

---

## Summary

**12 Edge Functions** are carefully designed to handle ONLY operations that:
1. Require external API integration
2. Need elevated privileges
3. Involve sensitive credentials
4. Require complex server-side logic

**Everything else** uses direct Supabase queries with RLS for:
- Better performance
- Lower costs
- Simpler code
- Real-time capabilities

**Result:** Maximum functionality with minimum edge functions! ✅

---

**Document Version:** 1.0
**Date:** December 12, 2024
**Status:** Architecture Optimized ✅
