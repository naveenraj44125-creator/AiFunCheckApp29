# Implementation Plan: Page Visibility Fix

## Overview

This implementation plan fixes the page visibility issue by modifying the `showPage()` function in `public/app.js` to properly manage the `.hidden` CSS class. The fix ensures that when showing a page, the `.hidden` class is removed, and when hiding pages, the `.hidden` class is added. This resolves the CSS conflict where `.hidden { display: none !important; }` was overriding the `.active` class visibility rules.

## Tasks

- [-] 1. Modify the showPage function to manage the hidden class
  - Update `public/app.js` to add `.hidden` class when hiding pages
  - Update `public/app.js` to remove `.hidden` class when showing a page
  - Ensure the fix maintains existing functionality for nav link updates and data loading
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3_

- [ ]* 2. Write unit tests for page visibility
  - [ ]* 2.1 Test Create Post page becomes visible
    - Verify page has `.active` class and no `.hidden` class after `showPage('create')`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 2.2 Test previous page becomes hidden
    - Verify previous page has `.hidden` class and no `.active` class after navigation
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 2.3 Test invalid page name handling
    - Verify no errors and current page remains visible when invalid page name is used
    - _Requirements: 1.1_
  
  - [ ]* 2.4 Test initial auth page display
    - Verify auth page is visible and others are hidden when not authenticated
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ]* 2.5 Test initial feed page display
    - Verify feed page is visible and others are hidden when authenticated
    - _Requirements: 4.2, 4.3, 4.4_

- [ ]* 3. Write property-based tests for page visibility
  - [ ]* 3.1 Property test for mutual exclusivity
    - **Property 1: Mutual Exclusivity of Page Visibility**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Generate random sequences of valid page names and verify exactly one page is visible after each navigation
  
  - [ ]* 3.2 Property test for hidden class removal on show
    - **Property 2: Hidden Class Removal on Show**
    - **Validates: Requirements 1.1, 2.1**
    - Generate random page names and verify `.hidden` class is removed when page is shown
  
  - [ ]* 3.3 Property test for hidden class addition on hide
    - **Property 3: Hidden Class Addition on Hide**
    - **Validates: Requirements 1.4, 3.2**
    - Generate pairs of page names and verify first page gets `.hidden` when second is shown
  
  - [ ]* 3.4 Property test for active-hidden mutual exclusion
    - **Property 4: Active Class Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 3.3**
    - Generate random navigation sequences and verify no page ever has both `.active` and `.hidden`
  
  - [ ]* 3.5 Property test for navigation link synchronization
    - **Property 6: Navigation Link Synchronization**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Generate random page names and verify corresponding nav link has `.active` class

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The core fix is in task 1 - modifying the `showPage()` function
- Property tests should run minimum 100 iterations each
- Testing requires Jest with jsdom for DOM manipulation
- Mock `localStorage` and `fetch` for isolated testing
- Manual verification recommended: click through all navigation links to verify pages display correctly
