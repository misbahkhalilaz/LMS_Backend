CREATE TABLE "programs" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"name" varchar(30) NOT NULL UNIQUE,
	"no_of_years" numeric(1) NOT NULL,
	"max_enrol_years" numeric(2) NOT NULL
);

CREATE TABLE "batch" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"program_id" INT NOT NULL REFERENCES public.programs(id),
	"name" varchar(50) NOT NULL UNIQUE,
	"shift" varchar(7) NOT NULL,
	"starting_yr" VARCHAR(8) NOT NULL,
	"ending_yr" VARCHAR(8) NOT NULL,
	"current_semester" NUMERIC(2) NOT NULL DEFAULT 1,
	"isActive" BOOLEAN NOT NULL default true
);

CREATE TABLE "sections" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"batch_id" INT NOT NULL REFERENCES public.batch(id)
);

CREATE TABLE "users" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"section_id" INT NOT NULL DEFAULT 1 REFERENCES public.sections(id),
	"user_id" varchar(50) NOT NULL UNIQUE,
	"password" varchar(72),
	"role" varchar(10) NOT NULL DEFAULT 'student',
	"name" varchar(30) NOT NULL,
	"phone_no" varchar(11) NOT NULL,
	"email" varchar(50),
	"admission_year" numeric(4),
	"isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "courses" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"program_id" INT NOT NULL REFERENCES public.programs(id),
	"semester" NUMERIC(2) NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(10) NOT NULL UNIQUE,
	"credit_hr" NUMERIC(1) NOT NULL,
	"total_marks" NUMERIC(3) NOT NULL,
	"isActive" BOOLEAN NOT NULL default true
);

CREATE TABLE "classes" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"course_id" INT NOT NULL REFERENCES public.courses(id),
	"type" VARCHAR(6) NOT NULL DEFAULT 'Theory',
	"section_id" INT NOT NULL REFERENCES public.sections(id),
	"teacher_id" INT NOT NULL REFERENCES public.users(id),
	"isActive" BOOLEAN NOT NULL DEFAULT true,
	UNIQUE (course_id, section_id, teacher_id, type)
);

CREATE TABLE "rooms" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"name" VARCHAR(5) NOT NULL
);

CREATE TABLE "time_table" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"shift" VARCHAR(7) NOT NULL,
	"semester" NUMERIC(1) NOT NULL,
	"section_id" INT NOT NULL REFERENCES public.sections(id),
	"class_id" INT NOT NULL REFERENCES public.classes(id),
	"teacher_id" INT NOT NULL REFERENCES public.users(id),
	"day" NUMERIC(1) NOT NULL,
	"period" NUMERIC(1) NOT NULL,
	"room_id" INT NOT NULL REFERENCES public.rooms(id),
	"canceled" BOOLEAN NOT NULL DEFAULT false,
	"replaced_with" INT DEFAULT NULL REFERENCES public.time_table(id),
	"isActive" BOOLEAN NOT NULL DEFAULT true,
	UNIQUE(teacher_id, day, period, shift),
	UNIQUE(room_id, day, period, shift)
);

CREATE TABLE "class_posts" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"class_id" INT NOT NULL REFERENCES public.classes(id),
	"date" TIMESTAMP NOT NULL DEFAULT NOW(),
	"title" VARCHAR(100) NOT NULL,
	"description" TEXT NOT NULL,
	"file_paths" TEXT[] NOT NULL,
	"allow_comments" BOOLEAN NOT NULL DEFAULT true,
	"isAssignment" BOOLEAN NOT NULL DEFAULT false,
	"deadline" TIMESTAMP,
	"total_marks" INT NOT NULL
);

CREATE TABLE "class_attendance" (
	"id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
	"date" TIMESTAMP NOT NULL DEFAULT NOW(),
	"class_id" INT NOT NULL REFERENCES public.classes(id),
	"student_id" INT NOT NULL REFERENCES public.users(id)
);
