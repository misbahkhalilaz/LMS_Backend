CREATE TABLE "users" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"user_id" varchar(50) NOT NULL UNIQUE,
	"password" varchar(72),
	"role" varchar(10) NOT NULL DEFAULT 'student',
	"name" varchar(30) NOT NULL,
	"phone_no" varchar(11) NOT NULL,
	"email" varchar(50),
	"admission_year" numeric(4),
	"isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "programs" (
	"id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"name" varchar(30) NOT NULL UNIQUE,
	"no_of_years" numeric(1) NOT NULL,
	"max_enrol_years" numeric(2) NOT NULL
);

CREATE TABLE "courses" (
	"id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"program_id" INT NOT NULL REFERENCES public.programs(id),
	"semester" NUMERIC(2) NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(10) NOT NULL UNIQUE,
	"credit_hr" NUMERIC(1) NOT NULL,
	"total_marks" NUMERIC(3) NOT NULL,
	"isActive" BOOLEAN NOT NULL default true
);

CREATE TABLE "batch" (
	"id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"program_id" INT NOT NULL REFERENCES public.programs(id),
	"name" varchar(50) NOT NULL UNIQUE,
	"shift" varchar(7) NOT NULL,
	"starting_yr" VARCHAR(8) NOT NULL,
	"ending_yr" VARCHAR(8) NOT NULL,
	"current_semester" NUMERIC(2) NOT NULL DEFAULT 1,
	"isActive" BOOLEAN NOT NULL default true
);
