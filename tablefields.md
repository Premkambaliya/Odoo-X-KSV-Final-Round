# Database Schema & Field Definitions

This document details the database tables, fields, types, and relationships for the vehicle rental ERP system.

---

## 1. Users

**Purpose:** Stores customer and admin information.

### Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` (PK) | UUID | User ID |
| `role` | ENUM | Admin, Customer |
| `first_name` | VARCHAR | First Name |
| `last_name` | VARCHAR | Last Name |
| `email` | VARCHAR (Unique) | Email Address |
| `phone` | VARCHAR | Mobile Number |
| `password` | VARCHAR | Encrypted Password |
| `profile_image` | TEXT | Profile Image URL |
| `date_of_birth` | DATE | DOB |
| `gender` | ENUM | Male/Female/Other |
| `driving_license_no` | VARCHAR | Driving License Number |
| `driving_license_image` | TEXT | License Image |
| `account_status` | ENUM | Active, Inactive, Blocked |
| `is_verified` | BOOLEAN | Email/Phone Verification |
| `created_at` | TIMESTAMP | Created Date |
| `updated_at` | TIMESTAMP | Updated Date |

### Relationship

```text
Users (1)
   │
   ├──────────< UserAddresses
   │
   ├──────────< RentalOrders
   │
   ├──────────< Payments
   │
   ├──────────< SecurityDeposits
   │
   └──────────< Invoices
```

---

## 2. UserAddresses

**Purpose:** A user can save multiple addresses.

### Fields

| Field | Type |
| :--- | :--- |
| `id` (PK) | UUID |
| `user_id` (FK) | UUID |
| `address_type` | ENUM(Home, Office, Other) |
| `address_line` | TEXT |
| `city` | VARCHAR |
| `state` | VARCHAR |
| `pincode` | VARCHAR |
| `country` | VARCHAR |
| `is_default` | BOOLEAN |
| `created_at` | TIMESTAMP |

### Relationship

```text
Users (1) ───► UserAddresses (Many)
```

---

## 3. Categories

### Fields

| Field | Type |
| :--- | :--- |
| `id` (PK) | UUID |
| `category_name` | VARCHAR |
| `vehicle_type` | ENUM(Two Wheeler, Four Wheeler) |
| `description` | TEXT |
| `status` | BOOLEAN |
| `created_at` | TIMESTAMP |

### Examples
- Bike
- Scooter
- SUV
- Sedan
- MUV

### Relationship

```text
Category (1) ───► Vehicles (Many)
```

---

## 4. Vehicles

### Fields

| Field | Type |
| :--- | :--- |
| `id` (PK) | UUID |
| `category_id` (FK) | UUID |
| `vehicle_name` | VARCHAR |
| `brand` | VARCHAR |
| `model` | VARCHAR |
| `year` | INTEGER |
| `registration_number` | VARCHAR |
| `color` | VARCHAR |
| `fuel_type` | ENUM |
| `transmission` | ENUM |
| `seat_capacity` | INTEGER |
| `mileage` | DECIMAL |
| `engine_capacity` | VARCHAR |
| `current_odometer` | INTEGER |
| `rent_per_hour` | DECIMAL |
| `rent_per_day` | DECIMAL |
| `rent_per_week` | DECIMAL |
| `rent_per_month` | DECIMAL |
| `security_deposit` | DECIMAL |
| `description` | TEXT |
| `average_rating` | DECIMAL |
| `total_rentals` | INTEGER |
| `last_service_date` | DATE |
| `status` | ENUM(Available, Reserved, Rented, Maintenance) |
| `created_at` | TIMESTAMP |

### Relationship

```text
Category
   │
   ▼
Vehicles
   │
   ├──────── VehicleImages
   │
   └──────── RentalOrders
```

---

## 5. VehicleImages

### Fields

| Field | Type |
| :--- | :--- |
| `id` (PK) | UUID |
| `vehicle_id` (FK) | UUID |
| `image_url` | TEXT |
| `is_primary` | BOOLEAN |
| `display_order` | INTEGER |

### Relationship

```text
Vehicle (1) ───► Vehicle Images (Many)
```

---

## 6. RentalOrders ⭐

> [!NOTE]
> This is the heart of the ERP.

### Fields

| Field | Type |
| :--- | :--- |
| `id` (PK) | UUID |
| `order_number` | VARCHAR |
| `customer_id` (FK) | UUID |
| `vehicle_id` (FK) | UUID |
| `payment_id` (FK) | UUID (Nullable initially) |
| `deposit_id` (FK) | UUID (Nullable initially) |
| `invoice_id` (FK) | UUID (Nullable initially) |
| `pickup_type` | ENUM(Store Pickup, Home Delivery) |
| `delivery_address_id` (FK) | UUID |
| `pickup_date` | TIMESTAMP |
| `pickup_otp` | VARCHAR |
| `pickup_status` | BOOLEAN |
| `expected_return_date` | TIMESTAMP |
| `actual_return_date` | TIMESTAMP |
| `rental_unit` | ENUM(Hour, Day, Week, Month) |
| `rental_duration` | INTEGER |
| `rental_amount` | DECIMAL |
| `return_condition` | ENUM(Good, Damaged) |
| `return_remarks` | TEXT |
| `order_status` | ENUM |
| `remarks` | TEXT |
| `created_at` | TIMESTAMP |
| `updated_at` | TIMESTAMP |

### Order Statuses
- Pending
- Confirmed
- Ready for Pickup
- Picked Up
- Active
- Return Pending
- Returned
- Inspection
- Refund Pending
- Completed
- Cancelled

### Relationship

```text
Users ──► RentalOrders ──► Vehicle ──► Payment ──► Deposit ──► Invoice
```

---

## 7. Payments

### Fields

| Field | Type |
| :--- | :--- |
| `id` (PK) | UUID |
| `order_id` (FK) | UUID |
| `customer_id` (FK) | UUID |
| `rental_amount` | DECIMAL |
| `tax_amount` | DECIMAL |
| `total_amount` | DECIMAL |
| `payment_method` | ENUM(Cash, Card, UPI, Net Banking) |
| `transaction_id` | VARCHAR |
| `payment_status` | ENUM(Pending, Paid, Failed, Refunded) |
| `payment_date` | TIMESTAMP |
| `created_at` | TIMESTAMP |

### Relationship

```text
Rental Order ───► Payment
```

---

## 8. SecurityDeposits

### Fields

| Field | Type |
| :--- | :--- |
| `id` (PK) | UUID |
| `order_id` (FK) | UUID |
| `customer_id` (FK) | UUID |
| `deposit_amount` | DECIMAL |
| `penalty_amount` | DECIMAL |
| `penalty_reason` | TEXT |
| `refund_amount` | DECIMAL |
| `refund_method` | ENUM(Cash, UPI, Bank Transfer) |
| `refund_status` | ENUM(Pending, Refunded, Partially Refunded) |
| `deposit_status` | ENUM(Held, Released) |
| `refund_date` | TIMESTAMP |
| `remarks` | TEXT |
| `created_at` | TIMESTAMP |

### Relationship

```text
Rental Order ───► Security Deposit
```

---

## 9. Invoices

### Fields

| Field | Type |
| :--- | :--- |
| `id` (PK) | UUID |
| `invoice_number` | VARCHAR |
| `order_id` (FK) | UUID |
| `customer_id` (FK) | UUID |
| `payment_id` (FK) | UUID |
| `issue_date` | TIMESTAMP |
| `rental_amount` | DECIMAL |
| `tax_amount` | DECIMAL |
| `deposit_amount` | DECIMAL |
| `penalty_amount` | DECIMAL |
| `total_amount` | DECIMAL |
| `invoice_status` | ENUM(Paid, Pending, Cancelled) |
| `pdf_url` | TEXT |
| `created_at` | TIMESTAMP |

### Relationship

```text
Rental Order ───► Invoice
```

---

## Complete ER Diagram

```text
                          USERS
                       (id - PK)
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          │                │                │
          ▼                ▼                ▼
 USER_ADDRESSES      RENTAL_ORDERS      PAYMENTS
   (user_id FK)      (customer_id FK)   (order_id FK)
                          │
                          │
          ┌───────────────┼────────────────────┐
          │               │                    │
          ▼               ▼                    ▼
      VEHICLES      SECURITY_DEPOSITS      INVOICES
    (vehicle_id FK)    (order_id FK)      (order_id FK)
          │
          │
          ▼
   VEHICLE_IMAGES
   (vehicle_id FK)

          ▲
          │
     CATEGORIES
    (category_id FK)
```

---

## Suggested Foreign Keys

| Parent Table | Child Table | Relationship |
| :--- | :--- | :--- |
| Users | UserAddresses | One-to-Many |
| Users | RentalOrders | One-to-Many |
| Users | Payments | One-to-Many |
| Users | SecurityDeposits | One-to-Many |
| Users | Invoices | One-to-Many |
| Categories | Vehicles | One-to-Many |
| Vehicles | VehicleImages | One-to-Many |
| Vehicles | RentalOrders | One-to-Many |
| RentalOrders | Payments | One-to-One (typically) |
| RentalOrders | SecurityDeposits | One-to-One (typically) |
| RentalOrders | Invoices | One-to-One |
| UserAddresses | RentalOrders | One-to-Many (delivery address reference) |

---

## Suggested Design Improvement

> [!TIP]
> To avoid circular dependencies, it is recommended **not** to store `payment_id`, `deposit_id`, and `invoice_id` inside `RentalOrders`.
>
> Since `Payments`, `SecurityDeposits`, and `Invoices` already have an `order_id` foreign key, you can always retrieve those records by joining on `order_id`. This keeps the schema cleaner and avoids redundant references while maintaining a true one-to-one relationship.