# HarvestHub Manual Validation Strategy

Testing for the HarvestHub prototype is conducted by manually exercising the application in the local development environment. There are currently no automated end-to-end integration tests.

## Manual Test Scenarios

| Test | Result | Verification Type | Notes |
| :--- | :--- | :--- | :--- |
| **FARMER** | | | |
| Dashboard loading | Passed | Manual Runtime Verification | Rendered contextual Recharts. |
| Marketplace access | Passed | Manual Runtime Verification | Listings visible. |
| Listing management | Passed | Manual Runtime Verification | Ability to add/edit listings. |
| Crop management | Passed | Manual Runtime Verification | Ability to define crop stats. |
| AI price forecast interface | Passed | Manual Runtime Verification | Sent context to API. |
| **MERCHANT** | | | |
| Dashboard loading | Passed | Manual Runtime Verification | Rendered orders. |
| Marketplace access | Passed | Manual Runtime Verification | Listings visible. |
| Search/filter | Passed | Manual Runtime Verification | Frontend filtering works. |
| Deals | Passed | Manual Runtime Verification | Deal cards render. |
| Purchases/orders | Passed | Manual Runtime Verification | Simulated UI purchase flow. |
| Demand features | Passed | Manual Runtime Verification | Demand context loaded. |
| **ADMIN** | | | |
| Dashboard loading | Passed | Manual Runtime Verification | Rendered platform stats. |
| Platform analytics | Passed | Manual Runtime Verification | Rendered mock charts. |
| Approvals | Passed | Manual Runtime Verification | Mock approval workflow. |
| Monitoring features | Passed | Manual Runtime Verification | General monitoring view. |
| **UI** | | | |
| Landing page | Passed | Manual Runtime Verification | Loaded successfully. |
| Responsive layout | Passed | Manual Runtime Verification | Resized correctly to mobile widths. |

## AI Runtime Limitations Observed

The AI-dependent behavior requires valid API configuration and service availability. The following limitations were observed during manual runtime testing:

- **AI Assistant**: The AI Assistant interface rendered correctly, but response generation was unavailable during one runtime test. This is documented as an integration/runtime limitation rather than represented as a successful AI response. It returned a temporary service-unavailable message.
- **AI Market Insights**: Some Merchant/Admin AI insight requests may also return temporarily unavailable depending on runtime API availability/configuration.
