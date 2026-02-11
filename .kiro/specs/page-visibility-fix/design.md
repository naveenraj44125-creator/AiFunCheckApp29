# Design Document: Page Visibility Fix

## Overview

This design addresses the page visibility issue in the AI Stories Sharing platform by modifying the `showPage()` function in `public/app.js` to properly manage the `.hidden` CSS class. The root cause is that the `.hidden` class uses `display: none !important`, which overrides the `.active` class visibility rules. The solution ensures that when showing a page, the `.hidden` class is removed, and when hiding a page, the `.hidden` class is added.

## Architecture

The fix involves a single-point modification to the Navigation System's page management logic. The architecture remains unchanged - this is a bug fix to the existing single-page application (SPA) navigation pattern.

**Current Flow (Broken):**
1. User clicks navigation link
2. `showPage()` removes `.active` from all pages
3. `showPage()` adds `.active` to target page
4. CSS tries to show page with `.active`, but `.hidden` with `!important` overrides it
5. Page remains invisible

**Fixed Flow:**
1. User clicks navigation link
2. `showPage()` removes `.active` from all pages AND adds `.hidden` to all pages
3. `showPage()` adds `.active` to target page AND removes `.hidden` from target page
4. CSS shows page with `.active` and no `.hidden` class
5. Page becomes visible

## Components and Interfaces

### Modified Component: Navigation System (`showPage` function)

**Location:** `public/app.js`

**Current Implementation:**
```javascript
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show requested page
    const page = document.getElementById(`${pageName}Page`);
    if (page) {
        page.classList.add('active');
        state.currentPage = pageName;
    }
    
    // Update nav links and load data...
}
```

**Fixed Implementation:**
```javascript
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    // Show requested page
    const page = document.getElementById(`${pageName}Page`);
    if (page) {
        page.classList.add('active');
        page.classList.remove('hidden');
        state.currentPage = pageName;
    }
    
    // Update nav links and load data...
}
```

**Key Changes:**
1. When hiding pages: Add `page.classList.add('hidden')` to ensure hidden pages have the `.hidden` class
2. When showing page: Add `page.classList.remove('hidden')` to ensure the visible page does not have the `.hidden` class

### Unchanged Components

**CSS Styles (`public/styles.css`):**
- No changes required
- The `.hidden { display: none !important; }` rule is correct for its purpose
- The `.page` and `.page.active` rules are correct

**HTML Structure (`public/index.html`):**
- No changes required
- Initial state with `.page.hidden` classes is correct
- JavaScript will manage these classes dynamically

## Data Models

No data model changes required. This is a UI state management fix.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system - essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Mutual Exclusivity of Page Visibility

*For any* point in time after page navigation, exactly one page element should be visible (have `.active` class and not have `.hidden` class), and all other page elements should be hidden (have `.hidden` class and not have `.active` class).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 2: Hidden Class Removal on Show

*For any* page that is being shown via `showPage()`, after the function completes, that page element should not have the `.hidden` class.

**Validates: Requirements 1.1, 2.1**

### Property 3: Hidden Class Addition on Hide

*For any* page that is being hidden when another page is shown, after `showPage()` completes, that page element should have the `.hidden` class.

**Validates: Requirements 1.4, 3.2**

### Property 4: Active Class Consistency

*For any* page element, if it has the `.active` class, it should not have the `.hidden` class, and vice versa - if it has the `.hidden` class, it should not have the `.active` class.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 3.3**

### Property 5: Initial State Correctness

*For any* application load, after the initial `showPage()` call completes, the displayed page (auth or feed based on authentication) should not have the `.hidden` class, and all other pages should have the `.hidden` class.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 6: Navigation Link Synchronization

*For any* page that is visible, the corresponding navigation link should have the `.active` class, and all other navigation links should not have the `.active` class.

**Validates: Requirements 5.1, 5.2, 5.3**

## Error Handling

### Edge Cases

1. **Invalid Page Name:** If `showPage()` is called with a page name that doesn't exist, the function should gracefully handle it by not modifying any page visibility (current behavior is acceptable - it checks `if (page)` before modifying).

2. **Multiple Rapid Navigation Clicks:** If a user rapidly clicks navigation links, each call to `showPage()` should properly reset all pages to hidden before showing the new page. The synchronous nature of the DOM manipulation ensures this works correctly.

3. **Page Elements Missing Classes:** If a page element is missing the `.page` class, it won't be selected by `querySelectorAll('.page')` and won't be managed. This is acceptable as it indicates a malformed HTML structure.

### Error Prevention

The fix prevents the original error by ensuring class state consistency:
- Always remove `.hidden` when adding `.active`
- Always add `.hidden` when removing `.active`
- This prevents the CSS conflict that caused the bug

## Testing Strategy

### Unit Tests

Unit tests should verify specific scenarios and edge cases:

1. **Test: Create Post page becomes visible**
   - Setup: Start with all pages hidden
   - Action: Call `showPage('create')`
   - Assert: Create Post page has `.active` class and does not have `.hidden` class

2. **Test: Previous page becomes hidden**
   - Setup: Feed page is visible
   - Action: Call `showPage('create')`
   - Assert: Feed page has `.hidden` class and does not have `.active` class

3. **Test: Invalid page name handling**
   - Setup: Feed page is visible
   - Action: Call `showPage('nonexistent')`
   - Assert: Feed page remains visible, no errors thrown

4. **Test: Initial auth page display**
   - Setup: No token in localStorage
   - Action: Load application (DOMContentLoaded)
   - Assert: Auth page is visible, all other pages are hidden

5. **Test: Initial feed page display**
   - Setup: Valid token in localStorage
   - Action: Load application (DOMContentLoaded)
   - Assert: Feed page is visible, all other pages are hidden

### Property-Based Tests

Property-based tests should verify universal properties across all inputs. Each test should run a minimum of 100 iterations.

**Property Test 1: Mutual Exclusivity**
- **Feature: page-visibility-fix, Property 1: Mutual Exclusivity of Page Visibility**
- Generate: Random sequence of valid page names
- Action: Call `showPage()` for each page in sequence
- Assert: After each call, exactly one page has `.active` without `.hidden`, all others have `.hidden` without `.active`

**Property Test 2: Hidden Class Removal**
- **Feature: page-visibility-fix, Property 2: Hidden Class Removal on Show**
- Generate: Random valid page name
- Setup: Ensure page has `.hidden` class
- Action: Call `showPage()` with that page name
- Assert: Page does not have `.hidden` class

**Property Test 3: Hidden Class Addition**
- **Feature: page-visibility-fix, Property 3: Hidden Class Addition on Hide**
- Generate: Two different random valid page names
- Setup: Show first page
- Action: Show second page
- Assert: First page has `.hidden` class

**Property Test 4: Active-Hidden Mutual Exclusion**
- **Feature: page-visibility-fix, Property 4: Active Class Consistency**
- Generate: Random sequence of page navigations
- Action: Perform navigation sequence
- Assert: After each navigation, no page has both `.active` and `.hidden` classes

**Property Test 5: Navigation Link Sync**
- **Feature: page-visibility-fix, Property 6: Navigation Link Synchronization**
- Generate: Random valid page name
- Action: Call `showPage()` with that page name
- Assert: Corresponding nav link has `.active`, all others don't

### Testing Framework

**Recommended:** Jest with jsdom for DOM manipulation testing

**Configuration:**
- Minimum 100 iterations per property test (use test library's configuration)
- Mock `localStorage` for authentication state tests
- Mock `fetch` for API calls to isolate navigation logic

### Integration Testing

After the fix, manual integration testing should verify:
1. Click through all navigation links (Feed, Create Post, Friends)
2. Verify each page displays correctly with all content visible
3. Test navigation while logged in and logged out
4. Verify page transitions are smooth with no flashing or layout issues

## Implementation Notes

### Minimal Change Principle

This fix follows the minimal change principle - only the `showPage()` function needs modification. The CSS and HTML remain unchanged, which reduces risk and maintains the existing design intent.

### Why Not Change CSS?

An alternative solution would be to remove `!important` from `.hidden` or restructure the CSS specificity. However, this approach is rejected because:
1. The `.hidden` utility class with `!important` is a common pattern for ensuring elements are truly hidden
2. Changing CSS could have unintended side effects on other elements using `.hidden`
3. The JavaScript should be responsible for managing dynamic state, not the CSS

### Performance Considerations

The fix adds two additional DOM operations per page navigation:
- One `classList.add('hidden')` per hidden page
- One `classList.remove('hidden')` for the shown page

With only 4 pages in the application, this adds negligible overhead (microseconds). The synchronous nature of DOM operations ensures no race conditions.
