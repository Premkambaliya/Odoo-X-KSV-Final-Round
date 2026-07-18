# API Test Guide

## Authentication
1. **POST /api/auth/register**: Register a new user.
2. **POST /api/auth/login**: Login and extract JWT.
3. **GET /api/auth/profile**: Test with valid, invalid, missing JWT.

## CRUD Testing
For each module (Categories, Vehicles, Rental Periods, etc.):
1. Create a record (Positive).
2. Create with missing fields (Negative).
3. Update the record.
4. Delete the record.

## Business Rule Testing
- **Rental Orders**: Cannot double book overlapping dates.
- **Payments**: Cannot pay more than remaining balance.
- **Pickups**: Only confirmed orders can be picked up.
- **Returns**: Only active orders can be returned. Odometer must be >= pickup odometer.
- **Penalties**: Security deposits are properly deducted.
