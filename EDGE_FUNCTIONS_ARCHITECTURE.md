# Edge Functions Architecture - Maximum 12 Functions

## Strategic Overview

**Current Status:** 0/12 edge functions deployed ✅

**Philosophy:** Most operations use Supabase RLS policies for security. Edge functions are ONLY for operations requiring:
- Elevated privileges (service role access)
- External API integrations
- Complex business logic that can't be exposed client-side
- Background processing

---

## Core Edge Functions (12 Total)

### 1. **payment-handler** 🔐
**Purpose:** Handle payment processing and webhook events

**Operations:**
- Razorpay/Stripe payment initialization
- Payment confirmation
- Webhook handling for payment status
- Refund processing
- Update booking payment_status

**Why Edge Function:**
- Requires payment gateway API keys
- Must verify webhook signatures
- Service role access to update payment status

**Endpoints:**
- POST `/payment-handler/create-order`
- POST `/payment-handler/verify`
- POST `/payment-handler/webhook`
- POST `/payment-handler/refund`

---

### 2. **notification-service** 📱
**Purpose:** Send notifications via multiple channels

**Operations:**
- WhatsApp notifications (booking confirmations, reminders)
- SMS notifications (OTP, alerts)
- Email notifications (verification, certificates)
- Batch notifications for announcements

**Why Edge Function:**
- Requires third-party API keys (Twilio, WhatsApp Business API)
- Must hide API credentials
- Queue management for bulk sends

**Endpoints:**
- POST `/notification-service/whatsapp`
- POST `/notification-service/sms`
- POST `/notification-service/email`
- POST `/notification-service/batch`

---

### 3. **certificate-generator** 📜
**Purpose:** Generate PDF certificates

**Operations:**
- Create certificate PDFs from templates
- Watermark certificates with QR codes
- Upload to storage bucket
- Update certificate records

**Why Edge Function:**
- CPU-intensive PDF generation
- Template processing
- Service role access to insert certificate records

**Endpoints:**
- POST `/certificate-generator/generate`
- POST `/certificate-generator/verify`
- GET `/certificate-generator/download/:certid`

---

### 4. **dgshipping-integration** 🚢
**Purpose:** Upload certificates to DG Shipping portal

**Operations:**
- Authenticate with DG Shipping API
- Upload certificate data
- Check upload status
- Sync certificate status

**Why Edge Function:**
- Requires DG Shipping credentials
- Complex authentication flow
- Service role access to update dgshipping_uploaded status

**Endpoints:**
- POST `/dgshipping-integration/upload`
- GET `/dgshipping-integration/status/:certid`
- POST `/dgshipping-integration/sync`

---

### 5. **admin-operations** 👨‍💼
**Purpose:** Privileged admin operations

**Operations:**
- Approve/reject institute applications
- Set institute commission rates
- Approve course applications
- Suspend/reactivate accounts
- Process reactivation requests

**Why Edge Function:**
- Requires service role for operations bypassing RLS
- Complex approval workflows
- Audit logging requirements
- Commission calculations

**Endpoints:**
- POST `/admin-operations/approve-institute`
- POST `/admin-operations/set-commission`
- POST `/admin-operations/approve-course`
- POST `/admin-operations/manage-account`
- POST `/admin-operations/process-reactivation`

---

### 6. **booking-manager** 🎫
**Purpose:** Handle complex booking operations

**Operations:**
- Create booking with seat validation
- Handle concurrent booking conflicts
- Process booking cancellations
- Waitlist management
- Batch seat updates

**Why Edge Function:**
- Transaction management for seat allocation
- Race condition prevention
- Service role for atomic operations
- Complex validation logic

**Endpoints:**
- POST `/booking-manager/create`
- POST `/booking-manager/cancel`
- POST `/booking-manager/waitlist-add`
- POST `/booking-manager/process-waitlist`

---

### 7. **file-processor** 📁
**Purpose:** Handle file uploads with validation

**Operations:**
- Validate file types and sizes
- Virus scanning (if integration available)
- Image compression and optimization
- Generate thumbnails
- Upload to storage bucket
- Update database records

**Why Edge Function:**
- File validation before storage
- Security scanning
- Image processing
- Storage bucket management

**Endpoints:**
- POST `/file-processor/upload-logo`
- POST `/file-processor/upload-banner`
- POST `/file-processor/upload-document`
- POST `/file-processor/upload-certificate`

---

### 8. **analytics-engine** 📊
**Purpose:** Generate reports and analytics

**Operations:**
- Commission reports for institutes
- Revenue reports for admin
- Enrollment analytics
- Course performance metrics
- Export data to Excel/PDF

**Why Edge Function:**
- Complex aggregation queries
- Data transformation
- Large dataset processing
- Export generation

**Endpoints:**
- GET `/analytics-engine/institute-commission/:instid`
- GET `/analytics-engine/admin-revenue`
- GET `/analytics-engine/enrollment-stats`
- POST `/analytics-engine/export`

---

### 9. **scheduled-jobs** ⏰
**Purpose:** Background cron jobs

**Operations:**
- Certificate expiry reminders (daily)
- Course start date reminders (daily)
- Payment reminder for pending bookings
- Clean up expired sessions
- Update batch status (upcoming → ongoing → completed)

**Why Edge Function:**
- Requires scheduled execution
- Service role access
- Batch processing

**Endpoints:**
- POST `/scheduled-jobs/daily-reminders` (Cron: 0 9 * * *)
- POST `/scheduled-jobs/update-batch-status` (Cron: 0 0 * * *)
- POST `/scheduled-jobs/payment-reminders` (Cron: 0 10 * * *)

**Note:** Configure via Supabase Dashboard → Functions → Cron

---

### 10. **otp-service** 🔐
**Purpose:** Handle OTP generation and verification

**Operations:**
- Generate OTP for phone verification
- Generate OTP for email verification
- Verify OTP codes
- Rate limiting
- OTP expiry management

**Why Edge Function:**
- Security-sensitive operations
- Rate limiting to prevent abuse
- SMS/Email integration
- Temporary storage management

**Endpoints:**
- POST `/otp-service/generate-phone`
- POST `/otp-service/generate-email`
- POST `/otp-service/verify`

---

### 11. **commission-processor** 💰
**Purpose:** Calculate and process commissions

**Operations:**
- Calculate commission on completed bookings
- Generate commission payouts
- Track commission history
- Settlement processing
- Commission adjustments

**Why Edge Function:**
- Financial calculations
- Service role for creating commission records
- Complex business logic
- Audit trail requirements

**Endpoints:**
- POST `/commission-processor/calculate`
- POST `/commission-processor/process-payout`
- GET `/commission-processor/history/:instid`
- POST `/commission-processor/adjust`

---

### 12. **webhook-router** 🔗
**Purpose:** Generic webhook receiver for external services

**Operations:**
- Handle payment gateway webhooks
- Handle WhatsApp message webhooks
- Handle DG Shipping status webhooks
- Route to appropriate handlers
- Webhook signature verification

**Why Edge Function:**
- Public endpoint for external services
- Signature verification
- Request routing
- Service role access

**Endpoints:**
- POST `/webhook-router/payment/:provider`
- POST `/webhook-router/whatsapp`
- POST `/webhook-router/dgshipping`
- POST `/webhook-router/:service`

---

## What Does NOT Need Edge Functions

### ✅ Direct Supabase Client Operations (No Edge Function Needed)

1. **User Registration/Login** - Handled by Supabase Auth
2. **Course Browsing** - Direct queries with RLS
3. **Batch Listing** - Direct queries with RLS
4. **User Profile Updates** - Direct updates with RLS
5. **Course Creation by Institutes** - Direct inserts with RLS
6. **Batch Creation** - Direct inserts with RLS
7. **View Bookings** - Direct queries with RLS
8. **View Certificates** - Direct queries with RLS
9. **Institute Data Retrieval** - Direct queries with RLS
10. **Search and Filtering** - Direct queries with RLS

**Why?** RLS policies handle all security automatically!

---

## Implementation Priority

### Phase 1 - Essential for MVP (Implement First)
1. ✅ `otp-service` - Required for registration
2. ✅ `notification-service` - Required for user communication
3. ✅ `admin-operations` - Required for institute approval
4. ✅ `file-processor` - Required for document uploads

### Phase 2 - Payment Integration
5. ✅ `payment-handler` - Required for course bookings
6. ✅ `booking-manager` - Required with payment integration

### Phase 3 - Certificate Management
7. ✅ `certificate-generator` - Required for course completion
8. ✅ `dgshipping-integration` - Required for certificate validation

### Phase 4 - Analytics & Optimization
9. ✅ `analytics-engine` - Dashboard insights
10. ✅ `commission-processor` - Institute payouts

### Phase 5 - Automation
11. ✅ `scheduled-jobs` - Background automation
12. ✅ `webhook-router` - External service integration

---

## Edge Function Guidelines

### Security Best Practices
- ✅ ALL functions must verify JWT tokens (except webhook-router)
- ✅ Use `verify_jwt: true` in function config
- ✅ Validate all input data
- ✅ Use service role key ONLY in edge functions
- ✅ Never expose API keys in client-side code

### Performance Best Practices
- ✅ Keep functions under 10MB
- ✅ Use efficient queries
- ✅ Implement caching where appropriate
- ✅ Set appropriate timeouts
- ✅ Use connection pooling

### Error Handling
- ✅ Return meaningful error messages
- ✅ Use appropriate HTTP status codes
- ✅ Log errors for debugging
- ✅ Implement retry logic where needed

---

## Environment Variables (Supabase Secrets)

All edge functions will have access to these pre-configured secrets:

### Automatically Available (No Manual Setup)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

### Need to Configure in Supabase Dashboard
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `SENDGRID_API_KEY`
- `DGSHIPPING_API_URL`
- `DGSHIPPING_API_KEY`
- `DGSHIPPING_CLIENT_ID`
- `DGSHIPPING_CLIENT_SECRET`

**Set via:** Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

## Cost Optimization

### Minimize Edge Function Calls

**Client-Side First:**
- Always try to use Supabase client queries with RLS
- Only call edge functions when absolutely necessary

**Batch Operations:**
- Combine multiple notification sends into one call
- Process bookings in batches when possible

**Caching:**
- Cache analytics results
- Cache master course data
- Use Redis/Upstash for session data

**Free Tier Limits:**
- 2 million edge function invocations/month
- 50GB bandwidth/month
- Should be sufficient for moderate traffic

---

## Testing Strategy

### Local Development
```bash
# Test edge functions locally
supabase functions serve function-name

# Test with curl
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

### Integration Testing
- Test each function independently
- Test with real Supabase data
- Test error scenarios
- Test rate limiting
- Test concurrent requests

---

## Monitoring & Observability

### Key Metrics to Track
- Function invocation count
- Response times
- Error rates
- Timeout rates
- Memory usage

### Available via Supabase Dashboard
- Real-time logs
- Execution analytics
- Error tracking
- Performance metrics

---

## Alternative: Edge Function Consolidation

If you need to reduce further, you can combine functions:

### Option A: 8 Functions (Aggressive Consolidation)
1. `auth-service` (OTP + verification)
2. `payment-handler` (payments + webhooks)
3. `notification-service` (all notifications)
4. `file-service` (uploads + processing)
5. `admin-service` (all admin operations)
6. `booking-service` (bookings + seat management)
7. `certificate-service` (generation + DG Shipping)
8. `analytics-service` (reports + commissions + scheduled jobs)

### Option B: 6 Functions (Maximum Consolidation)
1. `auth-notifications` (OTP + all notifications)
2. `payment-webhooks` (payments + all webhooks)
3. `admin-operations` (all admin functions)
4. `booking-certificates` (bookings + certificates + DG Shipping)
5. `file-analytics` (uploads + analytics + reports)
6. `background-jobs` (scheduled tasks + commission processing)

**Recommendation:** Stick with 12 functions for:
- Better organization
- Easier debugging
- Clearer responsibilities
- Better performance (smaller function sizes)

---

## Current Status

**Deployed:** 0/12 ✅
**Planned:** 12/12 ✅
**Budget:** Within limit ✅

All functionality preserved with efficient architecture!

---

## Next Steps

1. **Start with Phase 1** (OTP, Notifications, Admin, File Processing)
2. **Test each function** independently
3. **Deploy incrementally** to production
4. **Monitor performance** and costs
5. **Optimize** based on real usage patterns

---

**Document Version:** 1.0
**Date:** December 12, 2024
**Status:** Architecture Defined ✅
