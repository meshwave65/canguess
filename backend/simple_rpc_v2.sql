-- Função t_add_event_rounds (Versão 2 - Ultra Simples e Robusta)
-- Esta função deleta dependências (parts) antes de deletar os rounds para evitar erros de FK
CREATE OR REPLACE FUNCTION public.t_add_event_rounds(p_phase_id uuid, p_num_rounds integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_event_id uuid;
  i integer;
begin
  -- 1. Obter o event_uuid
  SELECT event_uuid INTO v_event_id FROM event_phases WHERE id = p_phase_id;
  
  IF v_event_id IS NULL THEN 
    RETURN 'ERRO: Fase não encontrada'; 
  END IF;

  -- 2. Limpar parts que dependem dos rounds desta fase (limpeza em cascata manual)
  DELETE FROM event_parts 
  WHERE round_uuid IN (SELECT id FROM event_rounds WHERE event_phase_uuid = p_phase_id);

  -- 3. Limpar rounds existentes
  DELETE FROM event_rounds WHERE event_phase_uuid = p_phase_id;

  -- 4. Criar os novos rounds
  FOR i IN 1..p_num_rounds LOOP
    INSERT INTO event_rounds (event_phase_uuid, event_uuid, round_number) 
    VALUES (p_phase_id, v_event_id, i);
  END LOOP;
  
  RETURN 'SUCESSO: ' || p_num_rounds || ' rounds criados para a fase ' || p_phase_id;
end;
$function$;
