// backend/src/migrations/1733840000000-InitialSchema.ts
// Initial database migration for Samay platform

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1733840000000 implements MigrationInterface {
  name = 'InitialSchema1733840000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('admin', 'manager', 'employee')
    `);

    await queryRunner.query(`
      CREATE TYPE "availability_type_enum" AS ENUM ('PREFERRED', 'NEUTRAL', 'AVOIDED', 'BLACKOUT')
    `);

    await queryRunner.query(`
      CREATE TYPE "shift_status_enum" AS ENUM ('OPEN', 'ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    `);

    // Create teams table
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "settings" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_teams_name" UNIQUE ("name"),
        CONSTRAINT "PK_teams" PRIMARY KEY ("id")
      )
    `);

    // Create skills table
    await queryRunner.query(`
      CREATE TABLE "skills" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(50) NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_skills_code" UNIQUE ("code"),
        CONSTRAINT "PK_skills" PRIMARY KEY ("id")
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'employee',
        "isActive" boolean NOT NULL DEFAULT true,
        "managerId" uuid,
        "teamId" uuid,
        "shiftPreferences" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create user_skills junction table
    await queryRunner.query(`
      CREATE TABLE "user_skills" (
        "userId" uuid NOT NULL,
        "skillId" uuid NOT NULL,
        CONSTRAINT "PK_user_skills" PRIMARY KEY ("userId", "skillId")
      )
    `);

    // Create availabilities table
    await queryRunner.query(`
      CREATE TABLE "availabilities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endTime" TIMESTAMP WITH TIME ZONE NOT NULL,
        "type" "availability_type_enum" NOT NULL DEFAULT 'NEUTRAL',
        "notes" text,
        "recurrence" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_availability_time" CHECK ("endTime" > "startTime"),
        CONSTRAINT "PK_availabilities" PRIMARY KEY ("id")
      )
    `);

    // Create shifts table with version column for optimistic locking
    await queryRunner.query(`
      CREATE TABLE "shifts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "version" integer NOT NULL DEFAULT 1,
        "teamId" uuid NOT NULL,
        "date" date NOT NULL,
        "startTime" time NOT NULL,
        "endTime" time NOT NULL,
        "startDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
        "shiftCode" character varying(50) NOT NULL,
        "durationHours" numeric(4,2) NOT NULL,
        "status" "shift_status_enum" NOT NULL DEFAULT 'OPEN',
        "requiredSkills" jsonb NOT NULL DEFAULT '[]',
        "assignedUserId" uuid,
        "assignedAt" TIMESTAMP WITH TIME ZONE,
        "assignmentSource" character varying(50),
        "notes" text,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_shift_time" CHECK ("endTime" > "startTime"),
        CONSTRAINT "PK_shifts" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_manager" 
      FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_team" 
      FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "user_skills" 
      ADD CONSTRAINT "FK_user_skills_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "user_skills" 
      ADD CONSTRAINT "FK_user_skills_skill" 
      FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "availabilities" 
      ADD CONSTRAINT "FK_availabilities_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "shifts" 
      ADD CONSTRAINT "FK_shifts_team" 
      FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "shifts" 
      ADD CONSTRAINT "FK_shifts_assigned_user" 
      FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_users_team_role" ON "users" ("teamId", "role")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_availabilities_user_time" ON "availabilities" ("userId", "startTime", "endTime")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_availabilities_time" ON "availabilities" ("startTime", "endTime")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_shifts_team_date_status" ON "shifts" ("teamId", "date", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_shifts_assigned_user_date" ON "shifts" ("assignedUserId", "date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_shifts_date_time" ON "shifts" ("date", "startTime", "endTime")
    `);

    // Enable UUID extension if not exists
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT "FK_shifts_assigned_user"`);
    await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT "FK_shifts_team"`);
    await queryRunner.query(`ALTER TABLE "availabilities" DROP CONSTRAINT "FK_availabilities_user"`);
    await queryRunner.query(`ALTER TABLE "user_skills" DROP CONSTRAINT "FK_user_skills_skill"`);
    await queryRunner.query(`ALTER TABLE "user_skills" DROP CONSTRAINT "FK_user_skills_user"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_team"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_manager"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_shifts_date_time"`);
    await queryRunner.query(`DROP INDEX "IDX_shifts_assigned_user_date"`);
    await queryRunner.query(`DROP INDEX "IDX_shifts_team_date_status"`);
    await queryRunner.query(`DROP INDEX "IDX_availabilities_time"`);
    await queryRunner.query(`DROP INDEX "IDX_availabilities_user_time"`);
    await queryRunner.query(`DROP INDEX "IDX_users_team_role"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "shifts"`);
    await queryRunner.query(`DROP TABLE "availabilities"`);
    await queryRunner.query(`DROP TABLE "user_skills"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TABLE "teams"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "shift_status_enum"`);
    await queryRunner.query(`DROP TYPE "availability_type_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}

