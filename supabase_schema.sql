-- ============================================================
-- "Có điều muốn nói không?" — Supabase Schema
-- Chạy file này trong SQL Editor của Supabase Dashboard
-- ============================================================

-- 1. Tạo bảng messages
CREATE TABLE IF NOT EXISTS public.messages (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text         DEFAULT 'Ẩn danh',
  recipient   text         DEFAULT 'Cả 3 thầy cô',
  content     text         NOT NULL,
  is_public   boolean      NOT NULL DEFAULT true,
  card_color  text         DEFAULT 'cream',
  created_at  timestamptz  DEFAULT now()
);

-- 2. Bật Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Policy INSERT: Mọi người (anon) được gửi lời nhắn
CREATE POLICY "Cho phép gửi lời nhắn"
  ON public.messages FOR INSERT TO anon
  WITH CHECK (true);

-- 4. Policy SELECT: Chỉ đọc được tin nhắn công khai
CREATE POLICY "Chỉ đọc tin công khai"
  ON public.messages FOR SELECT TO anon
  USING (is_public = true);

-- 5. Function: đọc TẤT CẢ tin nhắn (cần đúng PIN)
--    SECURITY DEFINER → bỏ qua RLS, chạy với quyền owner
CREATE OR REPLACE FUNCTION public.get_secret_messages(input_pin text)
RETURNS SETOF public.messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF input_pin IS DISTINCT FROM '2026' THEN
    RAISE EXCEPTION 'Mã PIN không đúng';
  END IF;
  RETURN QUERY SELECT * FROM public.messages ORDER BY created_at DESC;
END;
$$;

-- 6. Function: xóa tin nhắn spam (cần đúng PIN)
CREATE OR REPLACE FUNCTION public.delete_secret_message(target_id uuid, input_pin text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF input_pin IS DISTINCT FROM '2026' THEN
    RAISE EXCEPTION 'Mã PIN không đúng';
  END IF;
  DELETE FROM public.messages WHERE id = target_id;
END;
$$;

-- 7. Bật Realtime cho bảng messages (để tin nhắn mới hiện ngay)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 8. Cấp quyền truy cập bảng cho role anon và authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.messages TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
