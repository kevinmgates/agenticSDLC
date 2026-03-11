# Requirements Document

## 1. Project Overview

- **Customer:** Contoso Industrial
- **Project:** Field Service Management Platform Modernization
- **Key Stakeholders:**
  - Sarah Chen — VP of Operations, Contoso Industrial
  - Marcus Webb — IT Director, Contoso Industrial
  - Priya Nair — Business Analyst, Contoso Industrial
  - James Holloway — Microsoft Services Engagement Lead
  - Tanya Okafor — Microsoft Solutions Architect
- **Business Drivers:**
  - Legacy system running on unsupported infrastructure (SQL Server 2012, end-of-life OS in Q4 2026)
  - Lost a major contract renewal due to lack of digital customer portal — competitive pressure
  - Excessive manual processes causing 2-3 week work-order-to-invoice cycle
  - 30% first-visit failure rate due to parts availability issues
  - No operational visibility or KPI dashboards
- **Timeline:** ~9 months total; pilot in production for highest-volume region by month 6 (approximately September 2026); hard deadline Q4 2026 for legacy OS end-of-life
- **Budget:** Approved for current fiscal year
- **Pilot Scope:** ~40 field technicians in highest-volume region; 200 technicians total

---

## 2. Functional Requirements

### Work Order Management

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-001 | The system must support creation of work orders triggered by customer calls, maintenance contracts, and (future) IoT sensor alerts. | **Must Have** | Priya Nair: *"A work order gets created in the legacy system — usually because a customer called in or because one of our maintenance contracts triggered it."* |
| FR-002 | Work orders must be linkable to specific customer assets managed in IBM Maximo. | **Must Have** | Marcus Webb: *"Work orders should be linkable to specific assets in Maximo."* |
| FR-003 | The system must support a two-level approval workflow: supervisor sign-off on completed work, then finance review before invoicing. | **Must Have** | Priya Nair: *"There are usually two approval levels — the tech's supervisor signs off on the completed work, and then finance reviews before invoicing."* |
| FR-004 | The system must allow technicians to complete work orders digitally on-site, eliminating paper forms and manual re-entry. | **Must Have** | Priya Nair: *"They do the work, fill out a paper form, bring it back, and then someone in the office manually re-enters it into SAP."* |

### Scheduling & Dispatch

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-005 | The system must provide automated scheduling and dispatch capabilities, replacing the manual whiteboard-and-phone-call process. | **Must Have** | Sarah Chen: *"Scheduling is done manually by our dispatch team — it's basically a big whiteboard and a lot of phone calls."* |
| FR-006 | Dispatchers must be able to view real-time technician locations (via FleetComplete integration) when assigning jobs. | **Should Have** | Marcus Webb: *"Ideally, dispatch would be able to see tech locations in real time when assigning jobs."* |
| FR-007 | The dispatch interface must be intuitive and require minimal training. | **Must Have** | Sarah Chen: *"Our dispatch team has been doing things the same way for 15 years. Whatever we build has to be intuitive — we can't do six months of training."* |

### Mobile Experience

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-008 | The platform must provide a mobile-first experience for field technicians, accessible on iOS and Android devices. | **Must Have** | Sarah Chen: *"It doesn't have a mobile interface, which is a huge problem because our techs are on the road all day."* / Marcus Webb: *"Some have iPhones, some Android."* |
| FR-009 | The mobile app must support offline operation and sync data when connectivity is restored. | **Must Have** | Sarah Chen: *"We have job sites in rural areas and inside facilities that have no signal. The app has to work offline and sync when connectivity is restored."* |
| FR-010 | Technicians must be able to capture photos, digital sign-offs, and compliance checklists on-site via the mobile app. | **Must Have** | Marcus Webb: *"We have documentation requirements — photos, sign-offs, compliance checklists — that have to be captured on-site."* |

### Parts & Inventory

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-011 | Technicians must be able to check parts availability before going on-site (integrated with SAP inventory). | **Must Have** | Sarah Chen: *"Right now technicians call into a parts warehouse to check availability before they go on site. About 30% of the time, the part they need isn't available."* |
| FR-012 | The system should proactively suggest or verify required parts for a work order before dispatch. | **Should Have** | *[Implied from the 30% second-visit rate and business desire to improve first-time fix rate]* |

### Customer Portal

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-013 | The platform must include a customer-facing self-service portal where customers can view the status of their work orders. | **Must Have** | Sarah Chen: *"Customers have been asking for a portal where they can see the status of their work orders, and honestly it's becoming a competitive differentiator."* |
| FR-014 | The system must send automated status notifications to customers (e.g., technician on the way, job complete). | **Must Have** | Priya Nair: *"We also want to send automated status notifications — like when a tech is on the way, when the job is complete."* |

### Reporting & Analytics

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-015 | The platform must provide operational dashboards for the dispatch team (e.g., real-time job status, technician utilization). | **Must Have** | Sarah Chen: *"We need dashboards — operational for dispatch, and executive-level KPIs for me and the leadership team."* |
| FR-016 | The platform must provide executive-level KPI dashboards (e.g., average time-to-resolution, first-time fix rate). | **Must Have** | Sarah Chen: *"I can't tell you our average time-to-resolution or our first-time fix rate off the top of my head."* |
| FR-017 | IT must have access to system health monitoring dashboards. | **Must Have** | Marcus Webb: *"The IT team needs system health monitoring. We've had incidents in the past where something broke and we didn't find out for days."* |

### Notifications & Communication

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-018 | The platform must integrate with Microsoft Teams so technicians can receive work orders and notifications through Teams. | **Must Have** | Sarah Chen: *"The platform has to integrate with Teams. Our techs use Teams on their phones. If they can get their work orders in Teams, that's huge for adoption."* |

### Compliance & Document Management

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-019 | The platform must retain compliance documentation (photos, sign-offs, checklists) with full audit trail capabilities. | **Must Have** | Marcus Webb: *"We have documentation requirements — photos, sign-offs, compliance checklists — that have to be captured on-site and retained for up to seven years."* |
| FR-020 | Compliance documents must be retained for a minimum of seven years. | **Must Have** | Marcus Webb: *"…retained for up to seven years."* |

---

## 3. Non-Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| NFR-001 | The mobile application must function fully offline and synchronize data reliably when connectivity is restored, with conflict resolution. | **Must Have** | Sarah Chen: *"The app has to work offline and sync when connectivity is restored."* |
| NFR-002 | The platform must use Azure AD (Entra ID) SSO for authentication, integrating with Contoso's existing Azure AD tenant. | **Must Have** | Marcus Webb: *"Azure AD, M365, Teams. We'd want SSO using our existing Azure AD tenant."* |
| NFR-003 | The platform must implement role-based access control (RBAC). Technicians should have limited access; sensitive customer contract data must be restricted to account managers and above. | **Must Have** | Marcus Webb: *"Role-based access is important — technicians shouldn't see things they don't need, and we have some sensitive customer contract data that should only be accessible to account managers and above."* |
| NFR-004 | All customer data must reside within the United States (US data residency). | **Must Have** | Marcus Webb: *"Data residency is a concern — customer data needs to stay in the US."* |
| NFR-005 | The platform must be hosted on Microsoft Azure. | **Must Have** | Marcus Webb: *"Azure preferred. We have an Enterprise Agreement."* |
| NFR-006 | The system must support a phased rollout, including parallel operation with the legacy system during transition. | **Must Have** | Sarah Chen: *"We should plan for a phased rollout so we can run parallel systems for a while."* |
| NFR-007 | The platform must provide comprehensive API documentation for any custom-built components. | **Must Have** | Marcus Webb: *"We need comprehensive API documentation if we're building anything custom. We've been burned before by black-box systems."* |
| NFR-008 | The platform must support 200 field technicians with concurrent mobile usage across the full deployment. | **Should Have** | Priya Nair: *"We have about 200 field technicians total."* *[Implied scalability requirement]* |

---

## 4. Integration Requirements

| ID | System | Integration Type | Details / Constraints | Priority |
|---|---|---|---|---|
| INT-001 | **SAP S/4HANA** | Bidirectional | Financials, inventory, and invoicing. Replace existing custom stored procedures. Must handle SAP updates without breaking. | **Must Have** |
| INT-002 | **FleetComplete** | Read (real-time) | Vehicle/technician GPS location data for dispatch. Third-party SaaS. | **Should Have** |
| INT-003 | **IBM Maximo** | Bidirectional | Asset management — link work orders to customer equipment assets. | **Must Have** |
| INT-004 | **Microsoft Teams** | Push/Bidirectional | Deliver work order notifications and enable technician interaction through Teams. | **Must Have** |
| INT-005 | **Azure Active Directory (Entra ID)** | Read | SSO authentication and RBAC using existing Contoso tenant. | **Must Have** |
| INT-006 | **IoT Sensors** (future) | Event-driven ingest | Receive alerts from IoT sensors on customer equipment; auto-create work orders. Planned for Phase 2 (12-18 months). | **Nice to Have** (Phase 2) |

---

## 5. Constraints & Assumptions

### Hard Constraints
- **Legacy OS end-of-life:** Q4 2026 — the current system must be replaced or decommissioned by this date.
- **Pilot deadline:** Production deployment for the highest-volume region (~40 technicians) by month 6 (~September 2026).
- **Budget:** Approved for the current fiscal year only.
- **US data residency:** Non-negotiable for all customer data.

### Technology Decisions
- Azure-native hosting (Enterprise Agreement in place).
- Microsoft identity stack (Azure AD / Entra ID, M365, Teams).
- Cross-platform mobile support (iOS and Android); ruggedized tablets (e.g., Surface Pro) under consideration.
- Dynamics 365 Field Service is under consideration as a foundation, pending licensing model review.

### Assumptions
- Contoso will provision a standardized device program (ruggedized tablets) for field technicians; mobile app design should not depend on this but should support both personal phones and managed devices.
- FleetComplete and Maximo expose suitable APIs or data feeds for integration.
- SAP S/4HANA integration will be rebuilt using modern API-based approaches (replacing legacy stored procedures).
- A dedicated Microsoft Services team (project manager, 2 solution architects, development team) will be assigned.
- Parallel system operation during phased rollout means the legacy system will remain operational until pilot validation is complete.

---

## 6. Out of Scope / Phase 2

| Item | Source | Notes |
|---|---|---|
| **IoT sensor integration** — Auto-creation of work orders from IoT alerts on customer equipment | Priya Nair: *"We're hoping to start using IoT sensors on customer equipment in the next 12 to 18 months."* / James Holloway: *"Let's capture that as a Phase 2 item."* | Platform should be architecturally ready to support this. |
| **Dynamics 365 Field Service licensing decision** | Marcus Webb: *"Cost is a factor — we'd want to see a licensing model before committing."* | Licensing proposal to be included in engagement proposal; build vs. buy decision pending. |
| **Standardized device program rollout** | Marcus Webb: *"We've been talking about issuing ruggedized tablets… as part of this project."* | Device procurement is separate from platform development. |
| **Sprint assignment and capacity planning** | *[Implied]* | Not discussed in the scoping call; assume standard agile delivery practices. |
| **Audio/voice transcript input** | *[Not discussed]* | Platform focuses on digital work order entry. |

Ask Copilot to save its output here: `stages/02-requirements/requirements.md`
