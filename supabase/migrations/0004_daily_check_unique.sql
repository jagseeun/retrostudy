-- daily_check_items 중복 데이터 정리 및 unique constraint 추가
-- 중복 중 checked=true인 것 우선 보존, 없으면 가장 최근 것 보존
DELETE FROM public.daily_check_items
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, date, template_item_id
             ORDER BY checked DESC, created_at DESC
           ) AS rn
    FROM public.daily_check_items
    WHERE template_item_id IS NOT NULL
  ) t
  WHERE rn > 1
);

-- (user_id, date, template_item_id) unique constraint
-- NULL은 서로 다른 값으로 취급되므로 수동 추가 항목(template_item_id=null)은 여러 개 허용됨
ALTER TABLE public.daily_check_items
ADD CONSTRAINT daily_check_items_user_date_template_unique
UNIQUE (user_id, date, template_item_id);
