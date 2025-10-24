# Inbound Management - Low-Fidelity Wireframe

> **Note**: This is a low-fidelity grayscale wireframe focusing on layout and interaction flow, not visual design.

---

## 1. Overall Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [ WMS Logo ]              INBOUND MANAGEMENT              [ ⚙️ ]│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║  Status Timeline (Global)                               ║ │
│  ║                                                         ║ │
│  ║  ○ ─── ● ─── ○ ─── ○ ─── ○                           ║ │
│  ║  Requested Approved Zone    Zone   Invoice             ║ │
│  ║           Allocated Moved   Issued                     ║ │
│  ║                                                         ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [ Approval List ] [ Zone Move ] [ Invoice History ]           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  TAB CONTENT AREA (Changes based on selected tab)        │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Tab 1: Approval List

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🔄 Refresh                          [📥 Import]  [⬇️ Export]   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Inbound ID │ Shipper Name │ Product Count │ Req Date    │   │
│  │─────────────────────────────────────────────────────────│   │
│  │ INB-001    │ ABC Company  │ 5 items      │ 2025-10-24  │   │
│  │ Status: Pending                                         │   │
│  │ Approver: -                                             │   │
│  │ ┌─────────────────────────────────────────────┐         │   │
│  │ │ [Approve]  [Reject]                         │         │   │
│  │ │ API: PATCH /api/inbound-status             │         │   │
│  │ └─────────────────────────────────────────────┘         │   │
│  │                                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ INB-002    │ XYZ Corp    │ 12 items     │ 2025-10-23  │   │
│  │ Status: Approved                                        │   │
│  │ Approver: 이순신                                        │   │
│  │ ┌─────────────────────────────────────────────┐         │   │
│  │ │ [View Details]  [✓ Zone Allocated]         │         │   │
│  │ │ API: Zone moved to A-1-C-05                │         │   │
│  │ └─────────────────────────────────────────────┘         │   │
│  │                                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ INB-003    │ LG Chem     │ 8 items      │ 2025-10-22  │   │
│  │ Status: Zone Allocated                                  │   │
│  │ Approver: 김철수                                        │   │
│  │ ┌─────────────────────────────────────────────┐         │   │
│  │ │ [View Details]  [Zone: A-1]  [Bin: A-1-C]  │         │   │
│  │ │ Allocated at: 2025-10-23 14:30              │         │   │
│  │ └─────────────────────────────────────────────┘         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Pagination ───┐                                         │
│  │ < 1 2 3 ... >    │                                         │
│  └───────────────────┘                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Approval List Features

| Element | Description |
|---------|-------------|
| **Table Headers** | Inbound ID, Shipper Name, Product Count, Request Date, Status, Approver |
| **Row Expand** | Click row to see details (Product list, Notes, etc.) |
| **Status Badge** | Pending (Gray), Approved (Green), Rejected (Red), Zone Allocated (Blue) |
| **Action Buttons** | [Approve] → PATCH /api/inbound-status (status: approved) |
| | [Reject] → Delete from list / Archive |
| **Post-Approval** | Auto-trigger POST /api/zone/allocate |
| | Zone info appears: "Zone: A-1, Bin: A-1-C-05" |
| **Refresher** | 🔄 button to reload list from OMS |

---

## 3. Tab 2: Zone Move

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Zone Movement Control                                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Select Inbound Request:                                │   │
│  │  [ ▼ INB-002 (12 items, Zone: A-1) ]                  │   │
│  │                                                         │   │
│  │  Current Location: Zone A-1, Bin A-1-C-05             │   │
│  │                                                         │   │
│  │  ┌─────────────────┐  ──────────→  ┌──────────────┐  │   │
│  │  │ Zone A-1        │               │ Zone B-2     │  │   │
│  │  │ (From)          │               │ (To)         │  │   │
│  │  │ [ ▼ ]           │               │ [ ▼ ]        │  │   │
│  │  └─────────────────┘               └──────────────┘  │   │
│  │                                                         │   │
│  │  New Bin Location: [A-1-C-05]  ──→  [ B-2-A-12 ]    │   │
│  │                                                         │   │
│  │  Reason for Move:                                       │   │
│  │  [ Rebalancing / Demand forecast / Stock cleanup ]     │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────┐          │   │
│  │  │  [MOVE PRODUCT]                         │          │   │
│  │  │  API: PATCH /api/zone/move              │          │   │
│  │  └─────────────────────────────────────────┘          │   │
│  │                                                         │   │
│  │  ℹ️  Status: Zone moved successfully.                 │   │
│  │      INB-002 moved from A-1-C-05 → B-2-A-12          │   │
│  │      Timestamp: 2025-10-24 10:30 AM                  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Move History for Selected Inbound                       │   │
│  │                                                         │   │
│  │ A-1-C-05 → B-2-A-12 (2025-10-24 10:30) [User: Admin] │   │
│  │ A-1-B-15 → A-1-C-05 (2025-10-23 14:15) [User: Staff] │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Zone Move Features

| Element | Description |
|---------|-------------|
| **Inbound Selector** | Dropdown of approved inbounds (only Zone Allocated status) |
| **From/To Zones** | Dropdowns with available zones |
| **Current Location** | Display current zone/bin of selected inbound |
| **Reason Dropdown** | Rebalancing, Demand forecast, Stock cleanup, etc. |
| **[MOVE PRODUCT]** | Trigger PATCH /api/zone/move |
| **Status Message** | Green success message after move |
| **Move History** | Timeline of zone moves for audit trail |

---

## 4. Tab 3: Invoice History

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Invoice Management                                             │
│                                                                 │
│  Filter:  [ Date Range ▼ ]  [ Status ▼ ]  [ Search... ]       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Invoice No │ Inbound ID │ Issued Date │ Issued By    │   │
│  │─────────────────────────────────────────────────────────│   │
│  │ INV-2025-001 │ INB-001    │ 2025-10-24 │ 이순신       │   │
│  │ Status: ✓ Generated                                     │   │
│  │ API: PATCH /api/inbound-status (Invoice Issued)       │   │
│  │ OMS Callback: ✓ Sent                                   │   │
│  │ ┌──────────────────────────────────┐                   │   │
│  │ │ [View]  [Download PDF]  [Resend] │                   │   │
│  │ └──────────────────────────────────┘                   │   │
│  │                                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ INV-2025-002 │ INB-002    │ 2025-10-23 │ 김철수       │   │
│  │ Status: ✓ Generated & Sent to OMS                      │   │
│  │ OMS Response: ✓ Acknowledged (2025-10-23 15:45)       │   │
│  │ ┌──────────────────────────────────┐                   │   │
│  │ │ [View]  [Download PDF]  [Resend] │                   │   │
│  │ └──────────────────────────────────┘                   │   │
│  │                                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ INV-2025-003 │ INB-003    │ 2025-10-22 │ 박영희       │   │
│  │ Status: ⚠️ Pending OMS Acknowledgement                  │   │
│  │ OMS Response: Waiting (Last sent: 2025-10-22 16:20)   │   │
│  │ ┌──────────────────────────────────┐                   │   │
│  │ │ [View]  [Download PDF]  [Resend] │                   │   │
│  │ └──────────────────────────────────┘                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Pagination ───┐                                         │
│  │ < 1 2 3 ... >    │                                         │
│  └───────────────────┘                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Invoice History Features

| Element | Description |
|---------|-------------|
| **Table Columns** | Invoice No, Inbound ID, Issued Date, Issued By, Status |
| **Status Badge** | Generated (Green), Sent to OMS (Blue), Pending (Yellow), Failed (Red) |
| **Auto-Generation** | Triggered after "Zone Moved" status |
| **API Trigger** | PATCH /api/inbound-status (invoice_issued) |
| **OMS Callback** | PATCH /api/omsCallback (Invoice data) |
| **Resend Button** | Re-trigger invoice sending if OMS didn't acknowledge |
| **PDF Download** | Export invoice as PDF |
| **Response Status** | Show OMS acknowledgement timestamp |

---

## 5. Global Status Timeline Component

```
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  Status Timeline (appears at top of all tabs)                        │
│                                                                       │
│  Requested ─── Approved ─── Zone ─── Zone ─── Invoice              │
│     ●           ●          Allocated  Moved    Issued               │
│    (Gray)      (Green)      (Blue)    (Yellow) (Purple)             │
│                                                                       │
│  Legend:                                                             │
│  ● = Completed/Current step                                         │
│  ○ = Pending step                                                   │
│                                                                       │
│  Current Selected Item: INB-002                                     │
│  Progress: 75% (Zone Moved, awaiting Invoice)                       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          OMS SYSTEM                                  │
│                     (sends inbound requests)                         │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                      POST /api/inbound
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    WMS WAREHOUSE SYSTEM                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. APPROVAL LIST TAB                                        │   │
│  │    - Warehouse staff reviews inbound requests              │   │
│  │    - Click [Approve] → PATCH /api/inbound-status          │   │
│  │    - Auto-allocate zone → POST /api/zone/allocate         │   │
│  │    - Status changes: Pending → Approved → Zone Allocated  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 2. ZONE MOVE TAB                                            │   │
│  │    - Physical goods moved to allocated zones              │   │
│  │    - Warehouse staff updates zone via UI                  │   │
│  │    - Click [MOVE PRODUCT] → PATCH /api/zone/move          │   │
│  │    - Status changes: Zone Allocated → Zone Moved          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 3. AUTO-INVOICE GENERATION                                 │   │
│  │    - Triggered after Zone Moved status                    │   │
│  │    - Invoice auto-generated → PATCH /api/inbound-status   │   │
│  │    - Status changes: Zone Moved → Invoice Issued          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 4. INVOICE HISTORY TAB                                      │   │
│  │    - Invoice displayed with OMS sync status               │   │
│  │    - Auto-send to OMS → PATCH /api/omsCallback            │   │
│  │    - Resend if OMS acknowledgement fails                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
           PATCH /api/omsCallback (Invoice data)
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          OMS SYSTEM                                  │
│                  (receives invoice & updates)                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 7. API Endpoints Reference

### Approval Flow
```
1. GET /api/inbound-requests
   → Fetch pending inbound requests from OMS
   Response: [ { id, shipper, product_count, request_date, status } ]

2. PATCH /api/inbound-status
   → Update inbound status after approval
   Payload: { inbound_id, status: "approved" }
   
3. POST /api/zone/allocate
   → Auto-allocate zone for approved inbound
   Payload: { inbound_id }
   Response: { zone, bin }
```

### Zone Move Flow
```
4. PATCH /api/zone/move
   → Move product to different zone
   Payload: { inbound_id, from_zone, to_zone, reason }
   Response: { success, new_location }
   
5. PATCH /api/inbound-status
   → Update status to "zone_moved"
   Payload: { inbound_id, status: "zone_moved" }
```

### Invoice Flow
```
6. POST /api/invoice/generate
   → Auto-generate invoice after zone move
   Payload: { inbound_id }
   Response: { invoice_id, pdf_url }
   
7. PATCH /api/inbound-status
   → Update status to "invoice_issued"
   Payload: { inbound_id, status: "invoice_issued", invoice_id }
   
8. PATCH /api/omsCallback
   → Send invoice to OMS
   Payload: { invoice_id, inbound_id, invoice_data, timestamp }
   Response: { acknowledged, timestamp }
```

---

## 8. User Interaction Flow

### Scenario: Process Single Inbound (End-to-End)

```
Step 1: APPROVAL PHASE
├─ Warehouse staff opens "Inbound Management" page
├─ Clicks "Approval List" tab
├─ Sees pending inbound INB-001 from "ABC Company"
├─ Clicks [Approve] button
├─ System calls: PATCH /api/inbound-status (status: "approved")
├─ System calls: POST /api/zone/allocate (auto-assigns Zone A-1)
└─ Status changes: Pending → Approved → Zone Allocated ✓

Step 2: ZONE MOVEMENT PHASE
├─ Physical goods arrive at warehouse
├─ Staff clicks "Zone Move" tab
├─ Selects INB-001 from dropdown
├─ Sees current location: "Zone A-1, Bin A-1-C-05"
├─ Selects destination zone: "Zone B-2"
├─ Clicks [MOVE PRODUCT] button
├─ System calls: PATCH /api/zone/move
├─ System calls: PATCH /api/inbound-status (status: "zone_moved")
└─ Status changes: Zone Allocated → Zone Moved ✓
    Success message: "Zone moved successfully from A-1-C-05 → B-2-A-12"

Step 3: AUTO-INVOICE & OMS SYNC PHASE
├─ System auto-generates invoice (triggered by "Zone Moved" status)
├─ System calls: POST /api/invoice/generate
├─ System calls: PATCH /api/inbound-status (status: "invoice_issued")
├─ System calls: PATCH /api/omsCallback (sends invoice to OMS)
├─ Staff opens "Invoice History" tab
├─ Sees INV-2025-001 with status: "Generated & Sent to OMS"
├─ Waits for OMS acknowledgement ✓
└─ Status changes: Zone Moved → Invoice Issued → Complete ✓

Step 4: COMPLETION
├─ OMS returns: PATCH /api/omsCallback/acknowledgement
├─ Invoice status updates: "Pending OMS Ack" → "OMS Acknowledged"
├─ Timeline shows all 5 steps completed: ● ● ● ● ●
└─ Inbound INB-001 process complete
```

---

## 9. Error Handling Scenarios

### Scenario: Approval Rejection
```
Staff clicks [Reject] on INB-002
├─ System calls: DELETE /api/inbound/{id} or PATCH status: "rejected"
├─ System calls: PATCH /api/omsCallback (notify OMS of rejection)
└─ Inbound removed from list / marked as rejected
```

### Scenario: Zone Move Failure
```
Staff clicks [MOVE PRODUCT] but zone is full
├─ System returns: { success: false, error: "Zone B-2 is at capacity" }
├─ Error message displayed: "⚠️ Zone B-2 is full. Choose another zone."
└─ No state change occurs
```

### Scenario: OMS Callback Timeout
```
Invoice generated but OMS doesn't acknowledge within 5 minutes
├─ Status changes: "Pending OMS Ack" (yellow)
├─ [Resend] button appears
├─ Staff can manually click [Resend] to retry
├─ System retries up to 3 times, then escalates to admin
└─ Alert: "⚠️ OMS acknowledgement pending for INV-2025-003"
```

---

## 10. Key Design Notes

### Wireframe Style
- **Grayscale**: No colors used (only text descriptions)
- **ASCII Art**: Uses box-drawing characters (│ ─ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼)
- **Focus**: Layout and interaction flow only
- **Device**: Desktop/Tablet (no mobile optimization shown here)

### Interaction Patterns
- **Tabs**: Switch content without page reload
- **Dropdowns**: Multi-select possible (e.g., batch approval)
- **Buttons**: Primary ([Action]) vs Secondary ([View], [Details])
- **Status Badges**: Visual distinction via text symbols (✓, ⚠️, ●, ○)
- **Real-time Updates**: Status timeline updates immediately post-action

### API Integration Philosophy
1. **Sequential Workflow**: Each step depends on previous completion
2. **Auto-triggering**: Once approved → auto-allocate zone
3. **Auto-invoice**: Once zone moved → auto-generate invoice
4. **Async OMS Sync**: Invoice sent to OMS with retry logic
5. **Audit Trail**: All actions logged (user, timestamp, status change)

---

## 11. Future Enhancements

- [ ] Batch operations (approve multiple inbounds at once)
- [ ] Advanced filtering (by supplier, product type, date range)
- [ ] Email notifications to staff for pending approvals
- [ ] Mobile app view for warehouse floor operations
- [ ] Integration with barcode/QR code scanning
- [ ] Predictive zone allocation based on demand forecast
- [ ] Performance dashboard (approval time, error rates)
- [ ] Role-based access (Staff, Supervisor, Admin views)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-24  
**Created for**: WMS Wireframe Design Phase
