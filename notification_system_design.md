# Notification Priority Inbox System Design

## Problem Statement

Students receive a large number of notifications related to placements, results, and events.

The system should prioritize unread notifications and return the Top 10 most important notifications.

---

## Priority Rules

- Placement = 3
- Result = 2
- Event = 1
- Unread notifications only are considered.
- Within the same category, newer notifications have higher priority.

---

## Architecture

Client Request

↓

Authentication Middleware

↓

Logging Middleware

↓

Notification Service

↓

Priority Engine

↓

Top 10 Response

---

## Algorithm

1. Fetch notifications.
2. Remove read notifications.
3. Assign weight.
4. Calculate priority score.
5. Sort by score descending.
6. Return first 10 records.

---

## Time Complexity

- Filtering: O(n)
- Sorting: O(n log n)
- Top 10 extraction: O(10)

Overall: O(n log n)

---

## Scalability

For large datasets:

Use Min Heap of size 10.

Complexity:

- O(n log 10) ≈ O(n)

This allows efficient maintenance of the Top 10 notifications.

---

## Error Handling

- Unauthorized requests
- Missing data
- Invalid notification type
- Server failures

All events are logged through logging middleware.
