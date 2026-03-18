-- 고아 항목 정리:
-- template_item_id가 NULL인데, 같은 날 같은 제목으로 template_item_id가 있는 항목이 존재하는 경우
-- → FK on delete set null로 생긴 중복 고아 항목 제거
DELETE FROM public.daily_check_items AS a
WHERE a.template_item_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.daily_check_items b
    WHERE b.user_id = a.user_id
      AND b.date = a.date
      AND b.title = a.title
      AND b.template_item_id IS NOT NULL
  );
