-- Fix 1: Restrict profile visibility to authenticated users only
-- (Already applied in previous partial migration - this is idempotent)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Fix 2: Add server-side input validation constraints using NOT VALID to skip existing data

-- Quick bookings table constraints
ALTER TABLE public.quick_bookings 
  ADD CONSTRAINT quick_bookings_message_length 
  CHECK (message IS NULL OR length(message) <= 500) NOT VALID;

-- Mood forms table constraints (relaxed phone validation for existing data)
ALTER TABLE public.mood_forms 
  ADD CONSTRAINT mood_forms_name_min_length 
  CHECK (length(name) >= 1) NOT VALID;

-- QA threads table constraints  
ALTER TABLE public.qa_threads 
  ADD CONSTRAINT qa_threads_question_min_length 
  CHECK (length(question) >= 5) NOT VALID;

ALTER TABLE public.qa_threads 
  ADD CONSTRAINT qa_threads_question_max_length 
  CHECK (length(question) <= 2000) NOT VALID;