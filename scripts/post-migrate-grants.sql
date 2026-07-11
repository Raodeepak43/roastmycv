-- Run after CREATE TABLE — expose tables to Supabase Data API + reload PostgREST cache

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_usage', 'user_roasts', 'user_payments', 'user_tool_results',
    'user_tool_usage', 'job_applications', 'user_saved_cv', 'public_roasts'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('GRANT ALL ON TABLE public.%I TO postgres, service_role', t);
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',
        t
      );
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_usage' AND policyname = 'user_usage_own')
  THEN
    CREATE POLICY user_usage_own ON public.user_usage
      FOR ALL TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roasts')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roasts' AND policyname = 'user_roasts_own')
  THEN
    CREATE POLICY user_roasts_own ON public.user_roasts
      FOR ALL TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_payments')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_payments' AND policyname = 'user_payments_own')
  THEN
    CREATE POLICY user_payments_own ON public.user_payments
      FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_tool_results')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_tool_results' AND policyname = 'user_tool_results_own')
  THEN
    CREATE POLICY user_tool_results_own ON public.user_tool_results
      FOR ALL TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
