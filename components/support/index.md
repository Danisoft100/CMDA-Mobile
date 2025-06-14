# Mobile Support System Components 

This directory contains components for the support system implementation on the mobile app.

## SupportButton.tsx
A floating button that appears at the bottom right of the screen, allowing users to access support features.

## SupportModal.tsx
A modal interface that opens when the support button is tapped. It provides:
- Ticket creation form with fields for subject, category and description
- Self-service tab for future knowledge base implementation 

## Usage
The support button is automatically rendered through the SupportContainer which wraps the entire app.

## Integration
These components are integrated through:
1. SupportContainer - Manages the button visibility and modal state
2. AppContainer - Includes SupportContainer in the app layout
3. Store actions and reducers - Handle ticket creation and management

## Data Flow
1. User taps support button → SupportModal opens
2. User fills ticket form → createTicket action dispatched
3. API call made to backend → ticket created
4. Feedback shown to user (success/error)

Future enhancements in Week 2 & 3 will include:
- Ticket listing screen
- Message threading for tickets
- Self-service knowledge base
- Notifications
