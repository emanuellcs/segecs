-- ==============================================================================
-- SEGECS SEED SCRIPT (FULL VERSION)
-- ==============================================================================

-- 1. ENVIRONMENT SETTINGS
ALTER ROLE authenticator SET search_path TO public, auth, extensions;
ALTER ROLE postgres SET search_path TO public, auth, extensions;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILE TRIGGER ADJUSTMENT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TOTAL CLEANUP (FRESH START)
TRUNCATE public.visits, public.frequencies, public.evaluations, public.social_projects, 
         public.internships, public.vacancies, public.students, public.guardians, 
         public.supervisors, public.advisors, public.companies, 
         public.courses, public.schools, public.levels, public.cities, 
         public.profiles CASCADE;

DELETE FROM auth.users;
DELETE FROM auth.identities;

-- 4. BASE DATA
INSERT INTO public.cities (name, state) VALUES 
('Crateus', 'CE'), ('Fortaleza', 'CE'), ('Sobral', 'CE'), ('Quixada', 'CE'), ('Juazeiro do Norte', 'CE');

INSERT INTO public.levels (description) VALUES 
('Integrated High School'), ('Subsequent'), ('Vocational Adult Education');

INSERT INTO public.schools (name, inep, city_id) VALUES 
('EEEP Manoel Mano', '23001234', (SELECT id FROM public.cities WHERE name = 'Crateus' LIMIT 1)),
('EEEP Paulo VI', '23005678', (SELECT id FROM public.cities WHERE name = 'Fortaleza' LIMIT 1)),
('EEEP Julio Franca', '23009999', (SELECT id FROM public.cities WHERE name = 'Sobral' LIMIT 1));

INSERT INTO public.courses (name, school_id, level_id, mandatory_workload) VALUES 
('IT Technician', (SELECT id FROM public.schools WHERE name = 'EEEP Manoel Mano' LIMIT 1), (SELECT id FROM public.levels WHERE description = 'Integrated High School' LIMIT 1), 400),
('Networking Technician', (SELECT id FROM public.schools WHERE name = 'EEEP Manoel Mano' LIMIT 1), (SELECT id FROM public.levels WHERE description = 'Integrated High School' LIMIT 1), 400),
('Nursing Technician', (SELECT id FROM public.schools WHERE name = 'EEEP Paulo VI' LIMIT 1), (SELECT id FROM public.levels WHERE description = 'Integrated High School' LIMIT 1), 320),
('Administration Technician', (SELECT id FROM public.schools WHERE name = 'EEEP Julio Franca' LIMIT 1), (SELECT id FROM public.levels WHERE description = 'Integrated High School' LIMIT 1), 300);

-- 5. MASS USER CREATION (60 STUDENTS + ADMINS + ADVISORS)
DO $$
DECLARE
  hashed_pw TEXT := extensions.crypt('12345678', extensions.gen_salt('bf'));
  instance_id_val UUID := '00000000-0000-0000-0000-000000000000';
  i INT;
  curr_id UUID;
  curr_email TEXT;
  curr_name TEXT;
  curr_role public.user_role;
  course_id UUID;
  resp_id UUID;
BEGIN
  FOR i IN 1..70 LOOP
    
    IF i = 1 THEN
      curr_email := 'coord@eeep.com.br'; curr_name := 'General Coordination'; curr_role := 'admin'; curr_id := '00000000-0000-0000-0000-000000000001';
    ELSIF i = 2 THEN
      curr_email := 'prof.alberto@eeep.com.br'; curr_name := 'Professor Alberto'; curr_role := 'advisor'; curr_id := '00000000-0000-0000-0000-000000000002';
    ELSIF i = 3 THEN
      curr_email := 'prof.marcia@eeep.com.br'; curr_name := 'Professor Marcia'; curr_role := 'advisor'; curr_id := '00000000-0000-0000-0000-000000000003';
    ELSIF i = 4 THEN
      curr_email := 'supervisor.marcos@tech.com.br'; curr_name := 'Supervisor Marcos'; curr_role := 'supervisor'; curr_id := '00000000-0000-0000-0000-000000000004';
    ELSIF i = 5 THEN
      curr_email := 'admin@segecs.com.br'; curr_name := 'System Administrator'; curr_role := 'admin'; curr_id := extensions.uuid_generate_v4();
    ELSE
      curr_email := 'student' || (i-5) || '@eeep.com.br'; curr_name := 'Sample Student ' || (i-5); curr_role := 'student'; curr_id := extensions.uuid_generate_v4();
    END IF;

    -- A. Insert into AUTH.USERS
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, aud, role, 
      created_at, updated_at, 
      confirmation_token, recovery_token, email_change, email_change_token_new, 
      email_change_token_current, phone_change, phone_change_token, reauthentication_token
    )
    VALUES (
      curr_id, instance_id_val, curr_email, hashed_pw, now(), 
      '{"provider":"email","providers":["email"]}', format('{"full_name":"%s", "role":"%s"}', curr_name, curr_role)::jsonb, 
      'authenticated', 'authenticated', 
      now(), now(),
      '', '', '', '', '', '', '', ''
    );

    -- B. Insert into AUTH.IDENTITIES
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (extensions.uuid_generate_v4(), curr_id, format('{"sub":"%s","email":"%s"}', curr_id, curr_email)::jsonb, 'email', curr_email, now(), now(), now());

    -- C. Register in students table
    IF curr_role = 'student' THEN
      INSERT INTO public.guardians (name, cpf, phone) 
      VALUES ('Guardian ' || i, '111.222.333-' || LPAD(i::text, 2, '0'), '(88) 99999-' || LPAD(i::text, 4, '0')) 
      RETURNING id INTO resp_id;

      -- Alternate courses among students
      SELECT id INTO course_id FROM public.courses ORDER BY (i % 4) LIMIT 1 OFFSET (i % 4);

      INSERT INTO public.students (profile_id, name, registration, cpf, birth_date, course_id, guardian_id, status)
      VALUES (curr_id, curr_name, '2024' || LPAD((i-5)::text, 4, '0'), '000.000.000-' || LPAD((i-5)::text, 2, '0'), '2006-05-15', course_id, resp_id, 
        CASE 
          WHEN (i-5) <= 35 THEN 'interning' 
          WHEN (i-5) <= 50 THEN 'pending' 
          WHEN (i-5) <= 55 THEN 'completed' 
          ELSE 'dropped_out' 
        END);
    END IF;
  END LOOP;
END $$;

-- 6. COMPANIES AND PARTNERS
INSERT INTO public.companies (business_name, cnpj, address, city_id, contact_name, contact_email, agreement_number, agreement_validity) VALUES 
('Crateus Tech Solutions', '11.111.111/0001-01', 'Innovation St, 50', (SELECT id FROM public.cities WHERE name = 'Crateus' LIMIT 1), 'Carla Mendes', 'contact@crateustech.com', 'CONV-2024-01', '2026-12-31'),
('Digital Innovation ME', '22.222.222/0001-02', 'Central Ave, 1000', (SELECT id FROM public.cities WHERE name = 'Fortaleza' LIMIT 1), 'Joao Paulo', 'jp@innovation.com', 'CONV-2024-02', '2025-06-30'),
('SoftHouse Systems', '33.333.333/0001-03', 'Devs St, 12', (SELECT id FROM public.cities WHERE name = 'Sobral' LIMIT 1), 'Marta Rocha', 'marta@softhouse.com', 'CONV-2024-03', '2027-01-15');

-- Advisors
INSERT INTO public.advisors (profile_id, name, cpf, school_id) VALUES
('00000000-0000-0000-0000-000000000002', 'Prof. Alberto Santos', '222.333.444-55', (SELECT id FROM public.schools WHERE name = 'EEEP Manoel Mano' LIMIT 1)),
('00000000-0000-0000-0000-000000000003', 'Prof. Marcia Oliveira', '333.444.555-66', (SELECT id FROM public.schools WHERE name = 'EEEP Paulo VI' LIMIT 1));

-- Supervisors
INSERT INTO public.supervisors (profile_id, name, company_id, position, education) VALUES
('00000000-0000-0000-0000-000000000004', 'Eng. Marcos Viana', (SELECT id FROM public.companies WHERE business_name = 'Crateus Tech Solutions' LIMIT 1), 'IT Manager', 'Software Engineering'),
(NULL, 'Dr. Ana Beatriz', (SELECT id FROM public.companies WHERE business_name = 'Digital Innovation ME' LIMIT 1), 'Technical Coordinator', 'Computer Science');

-- 7. OPERATIONAL: VACANCIES AND INTERNSHIPS
INSERT INTO public.vacancies (company_id, course_id, title, description, quantity, status) VALUES 
((SELECT id FROM public.companies ORDER BY id LIMIT 1), (SELECT id FROM public.courses ORDER BY id LIMIT 1), 'Jr Web Development', 'Work on front-end with React and Tailwind.', 10, 'open'),
((SELECT id FROM public.companies ORDER BY id LIMIT 1 OFFSET 1), (SELECT id FROM public.courses ORDER BY id LIMIT 1), 'Networking Support', 'Infrastructure and server maintenance.', 5, 'open'),
((SELECT id FROM public.companies ORDER BY id LIMIT 1 OFFSET 2), (SELECT id FROM public.courses ORDER BY id LIMIT 1 OFFSET 3), 'Administrative Assistant', 'Document and spreadsheet management.', 8, 'open');

-- Create Internships for students with status 'interning'
INSERT INTO public.internships (student_id, vacancy_id, advisor_id, supervisor_id, start_date, end_date, status, total_workload, daily_workload)
SELECT 
  a.id, 
  (SELECT id FROM public.vacancies ORDER BY random() LIMIT 1),
  (SELECT id FROM public.advisors ORDER BY random() LIMIT 1),
  (SELECT id FROM public.supervisors ORDER BY random() LIMIT 1),
  current_date - interval '3 months', 
  current_date + interval '3 months', 
  'active',
  400,
  6
FROM public.students a WHERE a.status = 'interning';

-- 8. ACTIVITY LOGS (FREQUENCIES, VISITS, EVALUATIONS)

-- Frequencies for all active internships (last 30 days)
INSERT INTO public.frequencies (internship_id, date, performed_hours, activities, validated_by_supervisor, validated_by_advisor)
SELECT 
  e.id, 
  current_date - (n || ' days')::interval, 
  6, 
  'Development of system modules and bug fixes.', 
  (n > 5), -- Some not validated for testing
  (n > 10)
FROM public.internships e CROSS JOIN generate_series(1, 30) as n;

-- Technical Visits
INSERT INTO public.visits (internship_id, visit_date, type, summary, observations)
SELECT 
  e.id, 
  current_date - interval '1 month', 
  CASE WHEN random() > 0.5 THEN 'in_person' ELSE 'remote' END,
  'Technical monitoring visit to check activity progress.',
  'The student demonstrates good evolution and integration with the team.'
FROM public.internships e ORDER BY random() LIMIT 15;

-- Pedagogical Evaluations
INSERT INTO public.evaluations (internship_id, type, grade, comments, evaluation_date)
SELECT 
  e.id, 
  1, 
  (8 + random() * 2), 
  'Excellent technical performance and proactivity.',
  current_date - interval '1 month'
FROM public.internships e ORDER BY random() LIMIT 20;

-- Social Projects
INSERT INTO public.social_projects (student_id, title, description, estimated_hours, status, execution_date)
SELECT 
  a.id, 
  'Basic Computing Workshop ' || a.name, 
  'Teach computing classes to the local needy community.',
  30,
  CASE WHEN random() > 0.5 THEN 'executed' ELSE 'planned' END,
  CASE WHEN random() > 0.5 THEN current_date - interval '15 days' ELSE NULL END
FROM public.students a WHERE a.status IN ('interning', 'completed') LIMIT 25;

-- 9. FINALIZATION
NOTIFY pgrst, 'reload schema';
