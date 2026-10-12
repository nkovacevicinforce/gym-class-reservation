# Reservation Acceptance Checks

Open [../src/index.html](../src/index.html) in a browser with JavaScript enabled.
Use [../requirements/REQUIREMENTS.md](../requirements/REQUIREMENTS.md) as the source
of truth. Refresh before each independent case unless repeat booking is specified.

| Case | Action | Expected result |
|---|---|---|
| Initial data | Select each class and inspect its sessions and unit price. | All four prices and twelve session availability values match the BRD. |
| Incomplete booking | Leave all selections empty, then select only a class or a class and session. | Confirmation remains unavailable; the status explains what is missing. No places change. |
| One participant | Book Spinning, Thursday 18:00, for 1. | Total EUR11.00; confirmation shows the selected details; session becomes full. |
| Exact remaining places | Book Yoga, Wednesday 19:00, for 6. | Total EUR48.00; all 6 places are deducted; session becomes full. |
| Maximum capacity | Book Yoga, Monday 18:00, for 10. | Total EUR80.00; remaining places become 0. |
| Initially full session | Select Pilates and inspect Saturday 11:30. | Session remains visible as Full with 0 places, but cannot be selected. |
| Too many participants | Select Yoga, Saturday 10:00. | Only 1 and 2 participants can be selected; a booking for 3 is impossible. |
| Editable review | Select Yoga and a session/count; change count, then class, then session. | Total updates automatically. Changing class clears session/count; changing session clears count. Nothing is deducted before confirmation. |
| Another reservation | Book Yoga, Wednesday 19:00, for 2; start another and book the same session for 3. | Availability progresses from 6 to 4 to 1. New drafts start empty. Other sessions remain unchanged. |
| Repeat confirmation | Double-click Confirm on a valid booking. | Exactly one booking is committed and places are deducted once. |
| Refresh/reopen | Confirm any booking, then refresh; also close and freshly reopen the application. | All initial BRD availability values are restored. No previous confirmation remains. |
| Independent tabs | Book a place in one tab and open the application in another tab. | The new tab starts with the initial availability; no synchronization occurs. |
| Narrow screen | Complete a booking at 375px width and inspect a narrow 280px viewport. | Controls and text fit, summary precedes confirmation, no horizontal scrolling occurs. |
| Keyboard | Use Tab, arrow keys, and Enter/Space to complete a booking and start another. | Controls have visible focus. Confirmation receives focus after booking; class selection receives focus after starting another. |
| Privacy/scope | Inspect the form and complete the flow. | No personal information or payment is requested; no backend or external API is needed. |

The automated tests in [reservation.test.js](reservation.test.js) additionally
exercise invalid values that native dropdowns prevent entering: missing values,
zero, negative/fractional/nonnumeric counts, excessive counts, a session from the
wrong class, and stale availability. Every invalid confirmation must leave
availability unchanged and must not produce a successful reservation.