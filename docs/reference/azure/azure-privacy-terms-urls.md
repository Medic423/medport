# Azure SMS Verification - Privacy Policy and Terms URLs
**Last Updated:** February 3, 2026

## URLs for Azure Verification Form

**⚠️ IMPORTANT:** Use **PRODUCTION** URLs for Azure verification applications. Development URLs are not accepted.

### Privacy Policy
**Production URL:** https://traccems.com/privacy-policy  
**Development URL (DO NOT USE):** https://dev-swa.traccems.com/privacy-policy

**Content Includes:**
- Information collection practices
- SMS notification opt-in/opt-out procedures
- Data usage and sharing policies
- User rights and contact information

### Terms and Conditions
**Production URL:** https://traccems.com/terms  
**Alternative Production URL:** https://traccems.com/terms-and-conditions  
**Development URL (DO NOT USE):** https://dev-swa.traccems.com/terms

**Content Includes:**
- Service description
- SMS notification terms (opt-in/opt-out)
- User responsibilities
- Limitation of liability
- Contact information

## Pages Created

1. **`frontend/src/components/PrivacyPolicy.tsx`**
   - Generic privacy policy template
   - Includes SMS notification section
   - Publicly accessible

2. **`frontend/src/components/TermsAndConditions.tsx`**
   - Generic terms and conditions template
   - Includes SMS notification terms
   - Publicly accessible

## Routes Added

Added to `frontend/src/App.tsx`:
- `/privacy-policy` → PrivacyPolicy component
- `/terms` → TermsAndConditions component
- `/terms-and-conditions` → TermsAndConditions component (alternate route)

## Access

**No login required** - These pages are publicly accessible for Azure verification purposes.

## Customization Needed

Before final deployment, update:
- [ ] Business address in both documents
- [ ] Contact email (currently: support@traccems.com)
- [ ] Governing law jurisdiction
- [ ] Any specific business terms

## For Azure Form

**⚠️ USE PRODUCTION URLs ONLY:**

**Privacy Policy URL:**
```
https://traccems.com/privacy-policy
```

**Terms and Conditions URL:**
```
https://traccems.com/terms
```

**Verify URLs are accessible before submitting:**
```bash
./scripts/verify-toll-free-urls.sh
```

Both production URLs are live and accessible for Azure verification. Development URLs (`dev-swa.traccems.com`) will cause application rejection.

## URL Verification

Before submitting Azure toll-free verification application, verify all URLs are accessible:

```bash
# Run verification script
./scripts/verify-toll-free-urls.sh

# Or manually check
curl -I https://traccems.com
curl -I https://traccems.com/privacy-policy
curl -I https://traccems.com/terms
```

All should return HTTP 200.

