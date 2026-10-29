# Життєвий цикл оголошень та автоматичне очищення (Cleanup & Retention Policy)

## 1. Загальна концепція та терміни
* **Активний період**: **25 днів** (`LISTING_DURATION_DAYS = 25` в `app/constants/listing.ts`).
* **Період збереження в архіві (Retention)**: **45 днів** (`LISTING_RETENTION_DAYS = 45` в `app/constants/listing.ts`).
* **Повний життєвий цикл протермінованого оголошення**: 25 днів активності + 45 днів очікування в неактивних = **70 днів**.
* **Автоматичне видалення**: виконується щоночі сервером через розширення PostgreSQL `pg_cron` (`SELECT public.cleanup_expired_listings();`).

---

## 2. Логіка підрахунку 45 днів для різних статусів

| Стан оголошення | Статус у базі (`listing_state`) | Базова дата відліку 45 днів | Пояснення |
| :--- | :--- | :--- | :--- |
| **Термін вийшов** | `active` або `null`, але `expires_at <= now()` | **`expires_at`** | Товар був активний до дати `expires_at`. Після цього починається 45 днів очікування перед остаточним видаленням. |
| **Продано** | `sold` | **`updated_at`** | Товар продано. Від дати продажу дається 45 днів архівного перегляду для продавця. |
| **Приховано (Деактивовано)** | `deactivated` | **`updated_at`** | Продавець сам приховав товар. Дається 45 днів на повторну активацію. |
| **Відхилено модерацією** | `rejected` | **`updated_at`** | Товар не пройшов модерацію. Дається 45 днів на виправлення або перегляд причини. |
| **Активне оголошення** | `active`, `expires_at > now()` | *Не видаляється* | Оголошення публічне і доступне покупцям на карті та в каталозі. |

---

## 3. Що видаляється разом з оголошенням

1. **Саме оголошення** (`public.listings`): рядок остаточно видаляється з бази.
2. **Чати по цьому товару** (`public.chats`): видаляються каскадно (`ON DELETE CASCADE`).
3. **Повідомлення в цих чатах** (`public.messages`): видаляються каскадно (`ON DELETE CASCADE`).
4. **Фотографії у Supabase Storage** (`storage.objects` в бакеті `listing_images`): фізично стираються з хмарного диску S3.

---

## 4. Фінальний SQL скрипт для Supabase

```sql
-- 1. Каскадне видалення: товар -> чати -> повідомлення
ALTER TABLE public.chats
DROP CONSTRAINT IF EXISTS chats_product_id_fkey,
ADD CONSTRAINT chats_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES public.listings(id)
  ON DELETE CASCADE;

ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_chat_id_fkey,
ADD CONSTRAINT messages_chat_id_fkey
  FOREIGN KEY (chat_id)
  REFERENCES public.chats(id)
  ON DELETE CASCADE;

-- 2. Оновлена процедура нічного очищення
CREATE OR REPLACE FUNCTION public.cleanup_expired_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_retention_interval interval := interval '45 days';
  v_listing record;
  v_image_url text;
  v_storage_path text;
  v_project_url text := 'https://glxkkoahhryubdcktvfg.supabase.co';
  v_service_key text := 'YOUR_SERVICE_ROLE_KEY';
BEGIN
  -- Знаходимо всі оголошення, які вичерпали 45 днів retention-періоду:
  FOR v_listing IN
    SELECT id, images
    FROM public.listings
    WHERE 
      -- 1. Будь-яке оголошення, термін дії якого минув понад 45 днів тому
      (expires_at IS NOT NULL AND expires_at < (now() - v_retention_interval))
      OR
      -- 2. Оголошення, які деактивовано / продано / відхилено / видалено понад 45 днів тому
      (listing_state IN ('sold', 'deactivated', 'rejected', 'deleted') AND updated_at < (now() - v_retention_interval))
  LOOP
    -- А. Видаляємо всі прикріплені фото зі сховища Supabase Storage через Storage API
    IF v_listing.images IS NOT NULL THEN
      FOREACH v_image_url IN ARRAY v_listing.images
      LOOP
        v_storage_path := substring(v_image_url FROM 'listing_images/([^?]+)');
        
        IF v_storage_path IS NOT NULL THEN
          PERFORM net.http_delete(
            url := v_project_url || '/storage/v1/object/listing_images/' || v_storage_path,
            headers := jsonb_build_object(
              'Authorization', 'Bearer ' || v_service_key,
              'apikey', v_service_key
            )
          );
        END IF;
      END LOOP;
    END IF;

    -- Б. Видаляємо саме оголошення
    -- (Завдяки ON DELETE CASCADE база сама вичистить чати та всі повідомлення)
    DELETE FROM public.listings WHERE id = v_listing.id;

  END LOOP;
END;
$$;
```

---

## 5. Як протестувати на тестовому товарі

```sql
-- 1. Знаходимо товар і назву картинки
SELECT id, title, listing_state, images 
FROM public.listings 
WHERE title ILIKE '%назва_товару%';

-- 2. "Старіємо" оголошення на 50 днів назад (оновлюємо обидві дати для будь-якого статусу)
UPDATE public.listings
SET updated_at = now() - interval '50 days',
    expires_at = now() - interval '50 days'
WHERE id = 'ID_ОБРАНОГО_ТОВАРУ';

-- 3. Викликаємо функцію очищення
SELECT public.cleanup_expired_listings();
```

