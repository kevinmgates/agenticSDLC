# Meeting Transcript — Customer Scoping Call
**Project:** Field Service Management Platform Modernization  
**Date:** March 5, 2026  
**Duration:** 62 minutes  
**Attendees:**
- Sarah Chen — VP of Operations, Contoso Industrial
- Marcus Webb — IT Director, Contoso Industrial
- Priya Nair — Business Analyst, Contoso Industrial
- James Holloway — Microsoft Services Engagement Lead
- Tanya Okafor — Microsoft Solutions Architect

---

## Transcript

**James Holloway:** Thanks everyone for joining. The goal today is to understand your current field service processes, the pain points you're experiencing, and what success looks like for the new platform. Sarah, do you want to start with an overview of where things stand today?

**Sarah Chen:** Sure. So right now our field technicians are working off a combination of paper-based work orders and a legacy system we built in-house about twelve years ago. It doesn't have a mobile interface, which is a huge problem because our techs are on the road all day. Scheduling is done manually by our dispatch team — it's basically a big whiteboard and a lot of phone calls.

**Marcus Webb:** And from an IT perspective, that system is a nightmare to maintain. It's running on on-premises SQL Server 2012, and we're about to lose support on the underlying OS. We've been patching it with duct tape for years. The integration points with our ERP — we're on SAP S/4HANA — are all custom stored procedures. Every time SAP does an update, something breaks.

**James Holloway:** Got it. Priya, what does the day-to-day look like from a process standpoint?

**Priya Nair:** So a work order gets created in the legacy system — usually because a customer called in or because one of our maintenance contracts triggered it. A dispatcher then looks at technician availability on that whiteboard Sarah mentioned, calls the tech, and manually assigns it. The tech gets a printed work order if they come into the office, or sometimes we just read it to them over the phone. They do the work, fill out a paper form, bring it back, and then someone in the office manually re-enters it into SAP. The whole cycle from work order creation to invoice can take two to three weeks.

**Tanya Okafor:** That's a significant delay. Is the invoicing bottleneck mostly the re-entry process, or are there approval steps in between?

**Priya Nair:** Both. There are usually two approval levels — the tech's supervisor signs off on the completed work, and then finance reviews before invoicing. But a big chunk of the delay is just the manual data re-entry and the back-and-forth when there are discrepancies.

**Sarah Chen:** We also have a parts and inventory problem. Right now technicians call into a parts warehouse to check availability before they go on site. About 30% of the time, the part they need isn't available, which means a second visit. That's costing us a lot in customer satisfaction and overtime.

**James Holloway:** Let's talk about the mobile experience since you mentioned it. What devices are techs using today?

**Marcus Webb:** Mostly personal phones. We don't have a standardized device program. Some have iPhones, some Android. We've been talking about issuing ruggedized tablets — probably Microsoft Surface Pro or a similar device — as part of this project.

**Tanya Okafor:** That's important context. So we'd want the mobile app to work offline as well, since field locations aren't always connected?

**Sarah Chen:** Yes, absolutely. We have job sites in rural areas and inside facilities that have no signal. The app has to work offline and sync when connectivity is restored.

**James Holloway:** Understood. Let's talk about customer-facing aspects. Do your customers have any self-service capabilities today?

**Sarah Chen:** Zero. They call a 1-800 number. Customers have been asking for a portal where they can see the status of their work orders, and honestly it's becoming a competitive differentiator in our market. Some of our competitors already have this.

**Priya Nair:** We also want to send automated status notifications — like when a tech is on the way, when the job is complete. Right now all of that is manual calls from our dispatchers.

**Marcus Webb:** From a compliance standpoint, we operate in regulated industries. Some of our customers are in utilities and oil and gas. We have documentation requirements — photos, sign-offs, compliance checklists — that have to be captured on-site and retained for up to seven years.

**Tanya Okafor:** Got it. So the platform needs document retention and audit trail capabilities baked in from day one.

**James Holloway:** Let's talk about integrations. You mentioned SAP. Are there other systems?

**Marcus Webb:** SAP is the big one for financials and inventory. We also have a fleet management system — it's a third-party SaaS product called FleetComplete — that tracks vehicle locations. Ideally, dispatch would be able to see tech locations in real time when assigning jobs. And we have an asset management system for tracking our customers' equipment — it's called Maximo. Work orders should be linkable to specific assets in Maximo.

**Priya Nair:** And we're hoping to start using IoT sensors on customer equipment in the next 12 to 18 months. So the platform should be able to receive alerts from those sensors and potentially auto-create work orders.

**James Holloway:** That's a great future-state goal. Let's capture that as a Phase 2 item. What about reporting and analytics?

**Sarah Chen:** We're flying blind right now. I can't tell you our average time-to-resolution or our first-time fix rate off the top of my head. I'd have to ask someone to pull data and build a spreadsheet. We need dashboards — operational for dispatch, and executive-level KPIs for me and the leadership team.

**Marcus Webb:** And the IT team needs system health monitoring. We've had incidents in the past where something broke and we didn't find out for days.

**James Holloway:** Security and identity — are you on Azure AD?

**Marcus Webb:** Yes, full Microsoft shop. Azure AD, M365, Teams. We'd want SSO using our existing Azure AD tenant. Role-based access is important — technicians shouldn't see things they don't need, and we have some sensitive customer contract data that should only be accessible to account managers and above.

**Tanya Okafor:** What's your thinking on hosting? Azure-native?

**Marcus Webb:** Azure preferred. We have an Enterprise Agreement. Data residency is a concern — customer data needs to stay in the US.

**Sarah Chen:** I want to add something on the change management side. Our dispatch team has been doing things the same way for 15 years. Whatever we build has to be intuitive — we can't do six months of training. And we should plan for a phased rollout so we can run parallel systems for a while.

**James Holloway:** Absolutely. Let's talk timeline and constraints. What's driving your urgency?

**Sarah Chen:** Two things. The OS end-of-life on the legacy system is in Q4 this year, so we have a hard deadline. And we just lost a major contract renewal — the customer cited our lack of a digital portal as a factor. That was a wake-up call.

**Marcus Webb:** Budget is approved for this fiscal year. We're in March, so realistically we have about nine months before the hard deadline. I'd want to see something in production for our highest-volume region by month six.

**Priya Nair:** We have about 200 field technicians total. About 40 in the pilot region.

**James Holloway:** That's very helpful. Any other constraints or non-negotiables before we wrap up?

**Sarah Chen:** The platform has to integrate with Teams. Our techs use Teams on their phones. If they can get their work orders in Teams, that's huge for adoption.

**Marcus Webb:** And we need comprehensive API documentation if we're building anything custom. We've been burned before by black-box systems.

**James Holloway:** Understood. Tanya, anything else from an architecture standpoint?

**Tanya Okafor:** Just want to confirm — you're open to Microsoft Dynamics 365 Field Service as a foundation, with customization on top?

**Marcus Webb:** We've looked at it. We're open to it. Cost is a factor — we'd want to see a licensing model before committing.

**Tanya Okafor:** Of course. We'll include that in the proposal.

**James Holloway:** Great. So to summarize what we've captured today: mobile-first experience with offline capability, automated scheduling and dispatch, customer self-service portal, integration with SAP, FleetComplete, and Maximo, document retention for compliance, Azure AD SSO with RBAC, analytics and dashboards, Teams integration, and a phased rollout with the pilot in about six months. We'll take this back and put together a formal requirements doc and a proposed project structure. Any final questions?

**Sarah Chen:** Just one — what does the engagement model look like? Are we getting a dedicated team?

**James Holloway:** Yes. You'd have a dedicated project manager, two solution architects, and a development team. We'll share the full team structure in the proposal. 

**Sarah Chen:** Perfect. Thanks everyone — this was really productive.

---
*[End of transcript]*
