-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('Active', 'Inactive', 'Blocked');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Two_Wheeler', 'Four_Wheeler');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('Available', 'Reserved', 'Rented', 'Maintenance');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('Manual', 'Automatic');

-- CreateEnum
CREATE TYPE "PickupType" AS ENUM ('Store_Pickup', 'Home_Delivery');

-- CreateEnum
CREATE TYPE "RentalUnit" AS ENUM ('Hour', 'Day', 'Week', 'Month');

-- CreateEnum
CREATE TYPE "ReturnCondition" AS ENUM ('Good', 'Damaged');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Confirmed', 'Ready_for_Pickup', 'Picked_Up', 'Active', 'Return_Pending', 'Returned', 'Inspection', 'Refund_Pending', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Card', 'UPI', 'Net_Banking');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');

-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('Cash', 'UPI', 'Bank_Transfer');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('Pending', 'Refunded', 'Partially_Refunded');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('Held', 'Released');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('Paid', 'Pending', 'Cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password" VARCHAR(255) NOT NULL,
    "profile_image" TEXT,
    "date_of_birth" DATE,
    "gender" "Gender",
    "driving_license_no" VARCHAR(100),
    "driving_license_image" TEXT,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'Active',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "address_type" VARCHAR(50) NOT NULL,
    "address_line" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "pincode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "vehicle_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "registration_number" VARCHAR(50) NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "fuel_type" "FuelType" NOT NULL,
    "transmission" "TransmissionType" NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "mileage" DECIMAL(10,2) NOT NULL,
    "engine_capacity" VARCHAR(100),
    "current_odometer" INTEGER NOT NULL DEFAULT 0,
    "rent_per_hour" DECIMAL(10,2) NOT NULL,
    "rent_per_day" DECIMAL(10,2) NOT NULL,
    "rent_per_week" DECIMAL(10,2) NOT NULL,
    "rent_per_month" DECIMAL(10,2) NOT NULL,
    "security_deposit" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "total_rentals" INTEGER NOT NULL DEFAULT 0,
    "last_service_date" DATE,
    "status" "VehicleStatus" NOT NULL DEFAULT 'Available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_images" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_orders" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(100) NOT NULL,
    "customer_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "pickup_type" "PickupType" NOT NULL,
    "delivery_address_id" UUID,
    "pickup_date" TIMESTAMP(3) NOT NULL,
    "pickup_otp" VARCHAR(20),
    "pickup_status" BOOLEAN NOT NULL DEFAULT false,
    "expected_return_date" TIMESTAMP(3) NOT NULL,
    "actual_return_date" TIMESTAMP(3),
    "rental_unit" "RentalUnit" NOT NULL,
    "rental_duration" INTEGER NOT NULL,
    "rental_amount" DECIMAL(10,2) NOT NULL,
    "return_condition" "ReturnCondition",
    "return_remarks" TEXT,
    "order_status" "OrderStatus" NOT NULL DEFAULT 'Pending',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "rental_amount" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "transaction_id" VARCHAR(255),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_deposits" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "deposit_amount" DECIMAL(10,2) NOT NULL,
    "penalty_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "penalty_reason" TEXT,
    "refund_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "refund_method" "RefundMethod",
    "refund_status" "RefundStatus" NOT NULL DEFAULT 'Pending',
    "deposit_status" "DepositStatus" NOT NULL DEFAULT 'Held',
    "refund_date" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "invoice_number" VARCHAR(100) NOT NULL,
    "order_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "payment_id" UUID,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rental_amount" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "deposit_amount" DECIMAL(10,2) NOT NULL,
    "penalty_amount" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "invoice_status" "InvoiceStatus" NOT NULL DEFAULT 'Pending',
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registration_number_key" ON "vehicles"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "rental_orders_order_number_key" ON "rental_orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "security_deposits_order_id_key" ON "security_deposits"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_order_id_key" ON "invoices"("order_id");

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_delivery_address_id_fkey" FOREIGN KEY ("delivery_address_id") REFERENCES "user_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_deposits" ADD CONSTRAINT "security_deposits_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_deposits" ADD CONSTRAINT "security_deposits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
