-- Função simplificada (burra) para criar rounds
-- Ela apenas deleta os rounds existentes para a fase e cria a quantidade solicitada
CREATE OR REPLACE FUNCTION public.t_add_event_rounds(p_phase_id uuid, p_num_rounds integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_event_id uuid;
  i integer;
begin
  -- 1. Pegar o event_uuid da fase para manter a integridade
  SELECT event_uuid INTO v_event_id FROM event_phases WHERE id = p_phase_id;

  IF v_event_id IS NULL THEN 
    RETURN 'ERRO: Fase não encontrada'; 
  END IF;

  -- 2. Limpar rounds existentes para esta fase (abordagem radical/burra para garantir sincronia)
  DELETE FROM event_rounds WHERE event_phase_uuid = p_phase_id;

  -- 3. Criar a quantidade exata solicitada
  FOR i IN 1..p_num_rounds LOOP
    INSERT INTO event_rounds (event_phase_uuid, event_uuid, round_number) 
    VALUES (p_phase_id, v_event_id, i);
  END LOOP;
  
  RETURN 'SUCESSO: ' || p_num_rounds || ' rounds criados.';
end;
$function$;
