-- Enable the pg_cron extension to schedule jobs
create extension if not exists pg_cron;

-- Enable the pg_net extension to make HTTP requests
create extension if not exists pg_net;

-- Schedule the job to run every day at 8:00 AM
-- Note: Replace YOUR_SERVICE_ROLE_KEY with your actual Supabase Service Role Key
select
  cron.schedule(
    'send-expiry-emails-daily', -- name of the cron job
    '0 12 * * *', -- every day at 12:00 pm UTC (8:00 am Cuiabá)
    $$
    select
      net.http_post(
          url:='https://pyoxrmczifzwftnolqlf.supabase.co/functions/v1/send-expiry-emails',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b3hybWN6aWZ6d2Z0bm9scWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkwNDE4NywiZXhwIjoyMDY5NDgwMTg3fQ.TnieNt004E17eozrmYbbEgTtbwvhI-Iu86S_llMc0CE"}'::jsonb
      ) as request_id;
    $$
  );
