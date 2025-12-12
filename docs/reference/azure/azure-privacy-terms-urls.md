# Azure SMS Verification - Privacy Policy and Terms URLs
**Last Updated:** December 8, 2025

## URLs for Azure Verification Form

### Privacy Policy
**URL:** https://dev-swa.traccems.com/privacy-policy

**Content Includes:**
- Information collection practices
- SMS notification opt-in/opt-out procedures
- Data usage and sharing policies
- User rights and contact information

### Terms and Conditions
**URL:** https://dev-swa.traccems.com/terms
**Alternative URL:** https://dev-swa.traccems.com/terms-and-conditions

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

**Privacy Policy URL:**
```
https://dev-swa.traccems.com/privacy-policy
```

**Terms and Conditions URL:**
```
https://dev-swa.traccems.com/terms
```

Both URLs are live and accessible for Azure verification.

