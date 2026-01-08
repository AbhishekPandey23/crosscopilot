# V0.dev Prompt: RFP Multi-Source AI Answer Generator UI

Create a comprehensive, modern SaaS application UI for an AI-powered RFP (Request for Proposal) answer generator. The design should be professional, clean, and optimized for productivity.

## Design System Requirements

**Framework & Styling:**
- Next.js 14+ with App Router
- Tailwind CSS for styling
- shadcn/ui components (use proper shadcn/ui component patterns)
- Lucide React icons
- Professional SaaS aesthetic with good typography and spacing

**Color Scheme:**
- Primary: Blue/Indigo for main actions and accents
- Success: Green for approved items
- Warning: Yellow/Amber for items needing review
- Neutral: Gray scale for backgrounds and secondary elements
- Use subtle gradients for hero sections and cards

**Typography:**
- Headers: Bold, clear hierarchy
- Body: Readable, comfortable line height
- Monospace: For confidence scores and metadata

---

## Page 1: RFP List Dashboard (Main Landing)

**Layout:**
- Top navigation bar with logo, search, and user profile
- Left sidebar with navigation items:
  - Dashboard (active)
  - RFPs
  - Sources
  - Settings
- Main content area with padding

**Content:**

**Header Section:**
- Large heading: "Your RFPs"
- Subheading: "Manage and generate AI-powered responses to your proposals"
- Primary CTA button: "Upload New RFP" (prominent, blue/indigo)
- Secondary button: "Connect Sources" (outline style)

**Filter Bar:**
- Tabs for status: "All", "Processing", "Ready", "In Progress", "Completed"
- Search input with icon
- Sort dropdown (Date, Name, Status)
- View toggle (Grid/List view)

**RFP Cards Grid (3 columns on desktop):**

Each card should contain:
- Top badge showing status (Processing/Ready/In Progress/Completed) with appropriate colors
- RFP title (bold, truncated with ellipsis if long)
- Client name with icon
- Metadata row with icons:
  - Calendar icon + deadline date
  - Document icon + question count (e.g., "24 questions")
  - Chart icon + completion percentage with progress bar
- Bottom action row:
  - "Open" button (primary)
  - Three-dot menu for (Edit, Duplicate, Delete)
- Timestamp: "Created 2 days ago"

**Empty State (if no RFPs):**
- Center-aligned illustration/icon of documents
- Heading: "No RFPs yet"
- Description: "Upload your first RFP document to start generating AI-powered responses"
- CTA button: "Upload RFP"

---

## Page 2: Upload New RFP Modal/Page

**Modal or Full Page with Centered Card:**

**Step 1 - File Upload:**
- Large dashed border drop zone
- Upload cloud icon (centered)
- Text: "Drag and drop your RFP document here"
- "or click to browse" link
- Supported formats: ".pdf, .docx, .doc"
- File size limit: "Max 50MB"

**Step 2 - RFP Details Form:**
- Input: RFP Title (auto-filled from filename, editable)
- Input: Client Name (optional)
- Date picker: Submission Deadline (optional)
- Select: Industry (dropdown with common industries)
- Textarea: Additional Notes (optional)

**Bottom Actions:**
- Cancel button (secondary)
- "Process RFP" button (primary, full width on mobile)

**Processing State:**
- Loading spinner with animated progress
- Text: "Extracting questions from your document..."
- Progress bar showing percentage
- List of steps with checkmarks:
  - ✓ Document uploaded
  - ⏳ Parsing content
  - ⏳ Extracting questions
  - ⏳ Organizing sections

---

## Page 3: RFP Detail Page - Questions View

**Top Header:**
- Breadcrumb: Home > RFPs > [RFP Title]
- Large RFP title
- Metadata badges:
  - Status badge
  - Client name with avatar/icon
  - Deadline countdown (e.g., "Due in 12 days")
- Action buttons:
  - "Generate All Answers" (primary)
  - "Export" dropdown (PDF, Word, CSV)
  - "Settings" icon button
  - Three-dot menu

**Stats Bar (4 cards in a row):**
1. Total Questions (large number + icon)
2. Answered (number + green checkmark)
3. Pending (number + clock icon)
4. Avg. Confidence (percentage + chart icon)

**Main Content Area - Two Column Layout:**

**Left Column (60% width):**

**Filter/Search Bar:**
- Search questions input
- Filter dropdown: "All", "Pending", "AI Generated", "Reviewed", "Approved"
- Sort: "Question Number", "Status", "Confidence"

**Question Cards (Stacked Vertically):**

**For Pending Questions:**
```
┌─────────────────────────────────────────────┐
│ Q1. [Badge: Pending] [Badge: Section A]    │
│                                              │
│ What is your company's approach to          │
│ cybersecurity and data protection?          │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ Customize Answer Generation           │   │
│ │ [Dropdown: Tone] [Dropdown: Length]   │   │
│ │ • Professional    • Detailed          │   │
│ │                                        │   │
│ │ [Button: Generate Answer →] (primary) │   │
│ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**For Generated/Reviewed Questions:**
```
┌─────────────────────────────────────────────┐
│ Q2. [Badge: AI Generated] [Badge: Section A]│
│ [Confidence: 87%] [Progress bar: green]     │
│                                              │
│ How do you ensure quality control in your   │
│ manufacturing process?                       │
│                                              │
│ [Answer Preview - First 2 lines...]         │
│ Our quality control process involves...     │
│                                              │
│ [Sources: 3 sources] [Last edited: 2h ago] │
│                                              │
│ [View Full Answer] [Regenerate] [Edit]      │
└─────────────────────────────────────────────┘
```

**Right Column (40% width - Sticky Sidebar):**

**Connected Sources Panel:**
- Heading: "Knowledge Sources"
- List of connected sources with icons:
  ```
  [Google Drive Icon] Google Drive
  23 documents • Last synced 1h ago
  [Sync button]
  
  [Notion Icon] Company Wiki
  156 pages • Last synced 3h ago
  [Sync button]
  
  [Globe Icon] Company Website
  45 pages • Last synced 1d ago
  [Sync button]
  ```
- "+ Connect New Source" button

**Quick Actions Panel:**
- "Generate All Pending Answers"
- "Review All Generated Answers"
- "Export Current Progress"

---

## Page 4: Individual Question Detail View (Expanded)

**Full Width Layout:**

**Question Header:**
- Back button with breadcrumb
- Question number and full text (large, prominent)
- Section badge
- Metadata: Page number in original RFP

**Main Content - Three Column Layout:**

**Left Column (20%):**
**Customization Panel:**
- Tone Selector (Radio buttons with icons):
  - 🎯 Professional
  - 💬 Casual
  - 🔧 Technical
- Length Selector (Radio buttons):
  - ⚡ Concise
  - 📄 Detailed  
  - 📚 Comprehensive
- "Regenerate with Settings" button

**Middle Column (50%):**

**Answer Editor Area:**
- Status badge at top
- Confidence score with colored progress bar
- Rich text editor with formatting toolbar:
  - Bold, Italic, Underline
  - Bullet list, Numbered list
  - Link insertion
  - Headers
- Answer content (editable)
- Character count at bottom
- Save/Discard buttons (sticky at bottom)

**Edit History Dropdown:**
- Collapsible section showing previous versions
- Each version with timestamp and "Restore" button

**Bottom Actions:**
- "Save Draft" (secondary)
- "Mark as Reviewed" (secondary)
- "Approve Answer" (primary, green)

**Right Column (30%):**

**Sources Panel:**
- Heading: "Sources Used" with count badge
- List of source cards:
  ```
  ┌───────────────────────────────────┐
  │ [Icon] Company Security Policy    │
  │ Relevance: 95%                    │
  │                                   │
  │ "Our multi-layered approach to    │
  │ cybersecurity includes..."        │
  │                                   │
  │ [View Full Document →]            │
  └───────────────────────────────────┘
  ```
- Each source shows:
  - Source name and type icon
  - Relevance score percentage
  - Relevant excerpt (truncated)
  - "View full document" link

**Suggestions Panel:**
- "Similar Questions in Other RFPs"
- Links to related questions

---

## Page 5: Sources Management Page

**Header:**
- Title: "Connected Sources"
- Description: "Manage your knowledge sources for AI-powered answers"
- Primary CTA: "+ Connect New Source"

**Source Cards Grid (2 columns):**

Each source card:
```
┌─────────────────────────────────────────┐
│ [Large Icon: Google Drive/Notion/etc]   │
│                                          │
│ Google Drive                             │
│ [Badge: Active] [Badge: Synced]         │
│                                          │
│ 📄 23 documents indexed                  │
│ 🔄 Last synced: 1 hour ago              │
│ ⚡ Next sync: in 30 minutes              │
│                                          │
│ [Settings] [Sync Now] [Disconnect]      │
└─────────────────────────────────────────┘
```

**Connect New Source Modal:**
- Grid of available integrations:
  - Google Drive (with logo)
  - Notion (with logo)
  - Website Scraper (with logo)
  - Upload Past Proposals (with logo)
- Each option is a large clickable card
- Shows "Connected" badge if already connected

**Individual Source Configuration:**
- Form based on source type
- For Google Drive:
  - "Select Folders" (folder picker UI)
  - "File Types" (checkboxes for pdf, docx, etc)
  - "Auto-sync frequency" (dropdown)
- For Website:
  - URL input
  - "Max pages to crawl" slider
  - "Crawl depth" slider
- Action buttons at bottom

---

## Page 6: RFP Settings Page

**Tabs:**
- General
- AI Preferences  
- Export Settings
- Notifications

**General Tab:**
- RFP Title (input)
- Client Name (input)
- Deadline (date picker)
- Industry (select)
- Custom Fields (add more metadata)

**AI Preferences Tab:**
- Default Tone (radio buttons with descriptions)
- Default Length (radio buttons)
- Confidence Threshold slider (0-100%)
  - "Only show answers above this confidence level"
- Auto-generate toggle
  - "Automatically generate answers for new questions"

**Export Settings Tab:**
- Template Selection (dropdown with preview)
- Logo upload
- Company information (form)
- Header/Footer customization

---

## Shared UI Components to Include

**1. Confidence Score Display:**
- Horizontal progress bar
- Color coding:
  - 0-50%: Red
  - 51-75%: Yellow
  - 76-100%: Green
- Percentage number displayed

**2. Status Badges:**
- Small, rounded pills
- Color coded by status
- Icons included

**3. Source Citation Component:**
- Small card with excerpt
- Truncated text with "Read more"
- Relevance score indicator

**4. Loading States:**
- Skeleton loaders for cards
- Spinner with text for actions
- Progress bars for long operations

**5. Empty States:**
- Centered icon/illustration
- Helpful message
- CTA button

**6. Toast Notifications:**
- Success: "Answer generated successfully"
- Error: "Failed to generate answer"
- Info: "Syncing sources..."

---

## Mobile Responsive Considerations

- Stack columns vertically
- Bottom sheet for filters/settings
- Floating action button for primary actions
- Swipeable cards
- Collapsible sections
- Full-screen modals for detailed views

---

## Interaction States

**Buttons:**
- Hover: Slight color change + shadow
- Active: Pressed effect
- Disabled: Reduced opacity + no pointer
- Loading: Spinner inside button

**Cards:**
- Hover: Slight elevation increase
- Selected: Border highlight
- Draggable: Drag handle indicator

**Inputs:**
- Focus: Border color change + ring
- Error: Red border + error message below
- Success: Green border + checkmark

---

## Key User Flows to Show

1. **Empty state → Upload → Processing → Questions ready**
2. **Question list → Select question → Generate answer → Review → Approve**
3. **Low confidence answer → View sources → Regenerate with different settings**
4. **Connect new source → Configure → Sync → See indexed content**

---

## Design Polish

- Use consistent border radius (6-8px for cards, 4px for buttons)
- Subtle shadows for depth (avoid harsh shadows)
- Adequate white space between elements
- Hover states for all interactive elements
- Smooth transitions (200-300ms)
- Loading skeletons match actual content layout
- Icon consistency (all from same icon family)
- Proper color contrast for accessibility

---

Generate mockups showing these pages with realistic content, proper spacing, and professional SaaS design patterns. Focus on clarity, usability, and modern web design best practices.