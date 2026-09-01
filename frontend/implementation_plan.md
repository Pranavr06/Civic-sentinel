# Civic Sentinel: Multi-Role Architecture Expansion

This plan outlines the implementation of the four distinct dashboards (Admin, Authority, Contractor, Public) requested for the Smart India Hackathon prototype.

## User Review Required

> [!WARNING]
> This is a massive expansion of the prototype's scope. Because this is a frontend-only React application without a real database, all of this data (contractor uploads, citizen petitions, assigned tenders) will be stored in **React Context (memory)**. It will work perfectly for your presentation demo, but if you refresh the page, the user-generated demo data (like uploaded photos or petitions) will reset. The core CSV dataset will still load automatically as we fixed earlier. 

> [!IMPORTANT]  
> To make it easy to present to the judges, I will build a **Role Switcher Dropdown** into the top navigation bar. During your pitch, you can simply click "Admin" -> switch to "Public" -> switch to "Contractor" to seamlessly show off all 4 dashboards without having to log in and out.

## Proposed Changes

### 1. Types and State Management (`src/types/index.ts`, `src/data/store.tsx`)
- Update `Role` to `'Admin' | 'Authority' | 'Contractor' | 'Public'`.
- Extend the `Project` interface with mock fields for the demo: `contractorId`, `predictedCost` (AI AI generated), `photos` (array of URLs), `bills` (array of amounts/descriptions).
- Create a `CitizenProposal` interface (id, description, location, upvotes/needScore).
- Create a `Contractor` interface (id, name, strikes, isBlocked).
- Update the Context store to hold proposals, contractors, and handle state mutations (submitting bills, assigning tenders, signing petitions).

### 2. Role Switcher UI (`src/components/Layout.tsx`)
- Add a highly visible dropdown in the header to instantly switch between the 4 roles.

### 3. Public Dashboard (`src/pages/PublicDashboard.tsx`)
- **Read-Only Project Map/List:** View sanitized project data (sanctioned amounts, MP details, completion dates).
- **Suggestion Box / Petition System:** A form for a citizen to propose a new project. A list of existing proposals with a "Sign Petition" button to increase the "Need Score".

### 4. Contractor Dashboard (`src/pages/ContractorDashboard.tsx`)
- **Tender Inbox:** View projects assigned to them by the Authority.
- **Upload Portal:** UI to "upload" infrastructure photos (we will use mock placeholder images for the demo) and submit weekly bills.

### 5. Authority Dashboard (`src/pages/AuthorityDashboard.tsx`)
- **Tender Assignment:** View unassigned projects and select a contractor from a dropdown to assign the tender.

### 6. Admin Dashboard Extensions (`src/pages/Dashboard.tsx` & `ProjectDetails.tsx`)
- **Contractor Oversight:** View all contractors, their assigned projects, and the AI Predicted Cost vs Actual Billed Cost.
- **Fraud/Blocking Logic:** If a contractor exceeds the AI predicted cost significantly on 2-3 projects, visually flag them as `BLOCKED`.

## Verification Plan

### Manual Verification
1. I will build the Role Switcher first.
2. I will build the underlying state changes.
3. I will build the Public and Contractor views.
4. You will switch through the roles and verify the flow (Citizen proposes -> Authority assigns -> Contractor bills -> Admin monitors).
