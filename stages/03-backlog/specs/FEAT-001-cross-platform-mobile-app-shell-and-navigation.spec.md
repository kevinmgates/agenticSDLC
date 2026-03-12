# Spec: Cross-Platform Mobile App Shell & Navigation
**Feature ID:** FEAT-001  
**Epic:** EPIC-001 — Mobile Field Technician Experience  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature provides the foundational cross-platform mobile application shell for Contoso Industrial field technicians on iOS and Android. It establishes the app startup experience, Azure AD SSO-based authentication entry point, home screen, primary navigation model, and responsive layouts for phones and ruggedized tablets. It is the enabling feature for all downstream mobile capabilities because work orders, offline sync, photo capture, signatures, and checklists all depend on a stable, accessible, and performant mobile shell.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-001 | Set up cross-platform mobile app framework | 8 | Critical |
| US-002 | Implement mobile app navigation and home screen | 5 | Critical |
| US-003 | Implement responsive layout for phones and tablets | 5 | Critical |

---

## 3. Functional Behavior

### 3.1 App bootstrap, installation, and launch experience

The system must provide a single mobile application codebase that can be packaged and distributed for both iOS 16+ and Android 13+ devices.

When the user installs and launches the app:
- The app opens to a branded splash screen.
- Cold start from app icon tap to interactive first screen must complete in less than 3 seconds under normal device conditions.
- The first interactive screen is the authentication entry screen unless a valid session already exists.
- The app must support both personal phones and managed ruggedized tablets.

The bootstrap process must:
- Load app configuration appropriate to the current environment.
- Initialize secure storage, telemetry, and network reachability services.
- Load persisted session and navigation state if available.
- Detect form factor and set the initial layout mode before rendering the main shell.

Business rules:
- Devices below the supported OS minimum are not supported.
- The app must fail gracefully if required bootstrap configuration is unavailable.
- The startup path must avoid blocking on non-critical background initialization.

State transitions:
- `Not Installed` → `Installed`
- `Installed` → `Launching`
- `Launching` → `Unauthenticated` if no valid token is present
- `Launching` → `Authenticated Home` if a valid token can be silently reused
- `Launching` → `Bootstrap Error` if critical configuration fails

### 3.2 Authentication entry and Azure AD SSO handoff

The mobile shell must present Azure AD SSO as the authentication mechanism for field technicians, consistent with Contoso's Entra ID tenant requirements.

User flow:
1. User launches app for the first time.
2. User sees login screen with Contoso branding and a clear SSO sign-in action.
3. User taps the sign-in action.
4. The app opens the platform authentication flow using Azure AD.
5. On successful authentication, the app stores session metadata securely and routes the user to the home screen.

System behavior:
- The mobile shell initiates sign-in using the organization tenant only.
- If MFA is enabled, the authentication flow must support it without additional app-specific logic.
- Tokens must be stored only in secure OS-provided storage.
- If a valid session is already present, the app should bypass the explicit login screen and navigate directly into the authenticated shell.

Business rules:
- Users outside the Contoso tenant are denied access.
- Unauthenticated users cannot access any primary function screen.
- Authentication failures must not expose tenant configuration or technical details.

### 3.3 Home screen and primary navigation model

After successful authentication, the user lands on the home screen.

The home screen must display primary function entry points for:
- My Work Orders
- Schedule
- Parts
- Notifications

Navigation requirements:
- All primary functions must be reachable within two taps from the home screen.
- From any child screen, the user must be able to return to the prior screen with back navigation.
- From any primary function, the user must be able to return to home without data loss.
- The navigation structure must support future deep links from notifications and Teams integrations.

The shell must provide:
- A consistent top-level navigation container
- Route protection for authenticated screens
- Visual indication of the currently selected primary area
- Preservation of navigation context when moving between primary areas where practical

Business rules:
- Navigation options shown to the user must respect the user's role, though full RBAC enforcement is defined elsewhere.
- The shell must be extensible so future top-level features can be added without redesigning the entire app frame.

State transitions:
- `Authenticated Home` → `Primary Function Screen`
- `Primary Function Screen` → `Detail Screen`
- `Detail Screen` → `Primary Function Screen` via back
- `Any Screen` → `Home` via home navigation action

### 3.4 Responsive layout across phones and tablets

The app shell must adapt to the device form factor.

Phone behavior:
- Use a single-column layout optimized for one-handed use.
- Use touch targets sized for mobile accessibility.
- Use a bottom-tab or similarly efficient compact navigation treatment.

Tablet behavior:
- Use layouts that take advantage of larger screen real estate.
- Support split-pane experiences where appropriate for future detail/list screens.
- Support more persistent navigation patterns such as a side navigation rail or drawer.

Orientation behavior:
- Portrait and landscape must both be supported.
- Rotation must preserve view state, unsaved form state, and scroll position when technically feasible.
- Layout adaptation must occur without forcing the user back to home.

Business rules:
- Layout mode is determined by effective screen size, not just OS-reported device category.
- Shared components must support responsive breakpoints instead of duplicating business logic per device type.

### 3.5 Accessibility and usability baseline

Because the dispatch and field workforce includes long-tenured users and the platform is replacing legacy/manual workflows, the shell must prioritize ease of use.

The app shell must:
- Meet WCAG 2.1 AA accessibility expectations for contrast, focus order, and tappable target size.
- Use clear labels and predictable navigation language.
- Avoid requiring multi-step discovery for core actions.
- Support screen readers for login, navigation, and home screen controls.

Usability requirements:
- A first-time technician should be able to identify the four primary function entry points without training.
- The login and home screen should avoid clutter and surface only critical information.

---

## 4. Data Model

### AppSession
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key for local session record |
| userId | string | Yes | Azure AD object identifier |
| accessTokenRef | string | Yes | Reference to secure token storage, not raw token |
| refreshTokenRef | string | Yes | Reference to secure token storage, not raw token |
| expiresAtUtc | datetime | Yes | Token/session expiry timestamp |
| lastAuthenticatedAtUtc | datetime | Yes | Last successful sign-in time |
| devicePlatform | string | Yes | `iOS` or `Android` |
| appVersion | string | Yes | Installed app version |
| isActive | boolean | Yes | Indicates whether session is currently valid |

### UserProfileCache
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Azure AD object identifier |
| displayName | string | Yes | Name shown in UI |
| email | string | Yes | Primary login email |
| role | string | Yes | `Technician`, `Dispatcher`, `Manager`, `Finance`, `IT Admin`, or `Customer` |
| tenantId | string | Yes | Azure AD tenant identifier |
| lastSyncedAtUtc | datetime | Yes | Last profile refresh time |

### NavigationState
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| userId | string | Yes | Owner of saved state |
| currentRoute | string | Yes | Current route name |
| previousRoute | string | No | Prior route for back support |
| selectedPrimaryNav | string | No | Current top-level navigation item |
| scrollPosition | integer | No | Optional per-screen scroll restore value |
| serializedViewState | json | No | Optional persisted state for restoration |

### DeviceLayoutProfile
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| userId | string | No | Optional if persisted per user |
| widthClass | string | Yes | `compact`, `medium`, or `expanded` |
| heightClass | string | Yes | `compact`, `regular`, or equivalent app-defined value |
| orientation | string | Yes | `portrait` or `landscape` |
| lastEvaluatedAtUtc | datetime | Yes | Timestamp of profile calculation |

Relationships:
- `AppSession` belongs to one `UserProfileCache`.
- `NavigationState` belongs to one authenticated user session.
- `DeviceLayoutProfile` can be derived at runtime and optionally persisted to optimize shell rendering.

---

## 5. API Contracts

N/A — this feature is primarily a mobile shell and navigation foundation. However, the shell depends on authentication-compatible and profile/bootstrap endpoints to support sign-in, role-aware rendering, and home screen initialization.

### POST /api/mobile/session/bootstrap
**Description:** Returns shell bootstrap information after authentication, including user profile and top-level navigation entitlements.

**Request:**
```json
{
  "devicePlatform": "string — iOS or Android",
  "appVersion": "string — installed mobile app version",
  "deviceId": "string — client device identifier"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "string — Azure AD object ID",
    "displayName": "string — user display name",
    "email": "string — primary email",
    "role": "string — platform role"
  },
  "navigation": [
    {
      "key": "work-orders",
      "label": "My Work Orders",
      "enabled": true
    },
    {
      "key": "schedule",
      "label": "Schedule",
      "enabled": true
    },
    {
      "key": "parts",
      "label": "Parts",
      "enabled": true
    },
    {
      "key": "notifications",
      "label": "Notifications",
      "enabled": true
    }
  ],
  "layoutHints": {
    "defaultNavMode": "bottom-tabs",
    "supportsSplitPane": true
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid device metadata |
| 401 | Unauthenticated request |
| 403 | User is authenticated but not authorized for the mobile app |
| 500 | Bootstrap configuration could not be loaded |

### GET /api/mobile/home
**Description:** Returns home screen summary content required by the shell on first authenticated load.

**Request:**
```json
{
  "includeBadges": "boolean — whether to include top-level notification counts"
}
```

**Response (200):**
```json
{
  "welcomeMessage": "string — personalized greeting",
  "tiles": [
    {
      "key": "work-orders",
      "label": "My Work Orders",
      "badgeCount": 3
    },
    {
      "key": "notifications",
      "label": "Notifications",
      "badgeCount": 2
    }
  ]
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Unauthenticated request |
| 403 | Insufficient permissions |
| 503 | Dependent service unavailable |

### POST /api/mobile/navigation/state
**Description:** Persists lightweight navigation state so the mobile shell can restore the user's context.

**Request:**
```json
{
  "currentRoute": "string — active route name",
  "selectedPrimaryNav": "string — selected top-level navigation item",
  "scrollPosition": "integer — current scroll offset",
  "serializedViewState": {}
}
```

**Response (200):**
```json
{
  "saved": true,
  "savedAtUtc": "string — ISO 8601 timestamp"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid navigation state payload |
| 401 | Unauthenticated request |
| 500 | Navigation state could not be persisted |

---

## 6. UI/UX Behavior

### Login Screen
- Displays Contoso branding, product title, and a single primary sign-in action.
- Shows a concise explanation that sign-in uses the employee's Contoso account.
- While authentication is starting, disables duplicate taps and shows a loading indicator.
- Error state: shows a non-technical retry message if authentication fails.
- Offline state: if no connectivity is detected before sign-in, informs the user that initial sign-in requires connectivity.

### Splash / App Startup Screen
- Displays logo and branded loading treatment only while bootstrap is in progress.
- Must not remain visible longer than necessary.
- If startup fails, transitions to a recoverable error screen or login screen with retry action.

### Home Screen
- Displays the four primary navigation destinations clearly.
- Shows badge counts or status indicators if available from backend bootstrap data.
- Uses larger tappable cards or tiles on tablet layouts.
- Loading state: skeleton or spinner while first home payload loads.
- Empty state: N/A — primary navigation destinations are always shown even if no badge data is present.
- Error state: shell remains usable even if non-critical summary counts fail to load.

### Navigation Shell
- Compact devices: bottom navigation or compact tab pattern.
- Expanded devices: side navigation rail or drawer.
- The current primary section is visually highlighted.
- Back navigation preserves user progress where possible.

### Responsive behavior
- Phone: single-column layout, compact nav, one-handed reachability.
- Tablet: wider spacing, optional split-pane-ready shell, persistent navigation.
- Rotation updates layout without resetting the route.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Azure Active Directory (Entra ID) | Outbound | User sign-in | Identity tokens, tenant authentication challenge |
| Platform backend | Outbound | Post-auth bootstrap | User profile, navigation entitlements, home summary |
| Secure device storage | Outbound | Session persistence | Token references, session metadata, navigation restore state |
| Mobile OS accessibility services | Bidirectional | Screen rendering and interaction | Accessibility labels, focus events, screen reader output |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Cold start time | < 3 seconds | Required by story and definition of done |
| Platform support | iOS 16+ and Android 13+ | Minimum supported OS versions |
| Accessibility | WCAG 2.1 AA | Applies to login, navigation, and home shell |
| Concurrent scale | 200 field technicians | Shell must support full deployment scale |
| Authentication | Azure AD SSO | Must align with Contoso tenant |
| Responsiveness | All primary functions reachable within 2 taps | Core usability requirement |
| Stability | No data loss on back/home navigation | Especially for future in-progress screens |

---

## 9. Edge Cases & Error Handling

- **Scenario:** User launches app on unsupported OS version  
  **Expected behavior:** Prevent normal app use and display supported-version message.  
  **User-facing message (if any):** "This app requires iOS 16+ or Android 13+."

- **Scenario:** Startup configuration fails to load  
  **Expected behavior:** App shows retryable startup error and does not enter an inconsistent authenticated state.  
  **User-facing message (if any):** "The app could not start correctly. Please try again."

- **Scenario:** User has no internet connection on first launch  
  **Expected behavior:** Login screen renders, but sign-in action explains connectivity is required.  
  **User-facing message (if any):** "An internet connection is required to sign in."

- **Scenario:** Azure AD sign-in fails or is canceled  
  **Expected behavior:** User remains unauthenticated and can retry sign-in.  
  **User-facing message (if any):** "Sign-in was not completed. Please try again."

- **Scenario:** User belongs to the wrong tenant  
  **Expected behavior:** Access denied after authentication attempt; no app shell access granted.  
  **User-facing message (if any):** "Your account is not authorized for this application."

- **Scenario:** User rotates device while navigating  
  **Expected behavior:** Current route remains active and layout adapts without resetting session or shell state.  
  **User-facing message (if any):** None.

- **Scenario:** Home summary data fails to load after successful login  
  **Expected behavior:** Home shell still loads with primary navigation and non-critical content omitted or retried.  
  **User-facing message (if any):** "Some information could not be loaded right now."

- **Scenario:** Back navigation from a sub-screen with unsaved state  
  **Expected behavior:** Shell preserves state where possible or prompts if the child screen marks unsaved changes.  
  **User-facing message (if any):** Contextual confirmation dialog managed by downstream feature screens.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician with an iOS 16+ device, when they install the app from the App Store, then it installs and launches successfully within 3 seconds cold start
- [ ] Given a technician with an Android 13+ device, when they install the app from the Play Store, then it installs and launches successfully within 3 seconds cold start
- [ ] Given the app is launched for the first time, when the technician reaches the login screen, then it displays the Azure AD SSO login option
- [ ] Given an authenticated technician, when they view the home screen, then they see tiles or tabs for My Work Orders, Schedule, Parts, and Notifications
- [ ] Given any primary function, when the technician navigates from the home screen, then the function is reachable within two taps
- [ ] Given the technician is on any sub-screen, when they tap the back or home button, then they return to the previous screen or home screen without data loss
- [ ] Given a technician using a phone (< 7 inch screen), when they view any screen, then the layout uses a single-column design optimized for one-handed use
- [ ] Given a technician using a tablet (≥ 7 inch screen), when they view work order details, then the layout uses a split-pane design showing the list and detail side by side
- [ ] Given a device orientation change, when the technician rotates the device, then the layout adapts without losing form state or scroll position
- [ ] Given a field technician with an iOS or Android device, when they launch the app, then they see a login screen integrated with Azure AD SSO
- [ ] Given an authenticated technician, when they navigate the app, then all primary functions are accessible within two taps from the home screen
- [ ] Given a technician using a phone or tablet, when they view any screen, then the layout adapts responsively to the device form factor

---

## 11. Out of Scope

- Offline local data persistence and background synchronization logic — covered by FEAT-002.
- Work order list, detail, completion, and approval workflows — covered by FEAT-003 and FEAT-007.
- Photo capture, signatures, and compliance checklists — covered by FEAT-004.
- Full RBAC design and enforcement — covered by FEAT-022 and FEAT-023.
- Push notification delivery and job acceptance workflows — covered by FEAT-011.
- Teams-native experiences — covered by FEAT-026 and FEAT-027.
- Standardized device procurement and MDM rollout — organizational activity, not this feature.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which cross-platform framework will be used: React Native, .NET MAUI, or another approved option? | Tech Lead | Open |
| 2 | Should the mobile shell use bottom tabs, a navigation drawer, or a hybrid pattern by default? | UX Lead | Open |
| 3 | Will badge counts and home summary data be required for MVP, or can the initial home screen be purely navigational? | Product Owner | Open |
| 4 | What specific ruggedized tablet dimensions should be treated as the primary tablet test baseline? | Product Owner / IT Admin | Open |
| 5 | What is the expected behavior when a valid offline mobile session exists but Azure AD revalidation cannot occur immediately after reconnect? | Security Architect | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
