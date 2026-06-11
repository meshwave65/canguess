CREATE OR REPLACE FUNCTION public.add_event_rounds(p_phase_id uuid, p_new_rounds integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_current_count integer;
  v_event_id uuid;
  i integer;
begin
  -- 1. Descobrir quantos rounds já existem para esta fase
  SELECT count(*) INTO v_current_count FROM event_rounds WHERE event_phase_uuid = p_phase_id;
  
  -- 2. Descobrir o event_uuid ligado a esta fase
  SELECT event_uuid INTO v_event_id FROM event_phases WHERE id = p_phase_id;

  -- 3. Validações básicas
  IF v_event_id IS NULL THEN 
    RETURN 'ERRO: Fase não encontrada'; 
  END IF;
  
  IF p_new_rounds <= coalesce(v_current_count, 0) THEN 
    RETURN 'AVISO: Nada a fazer (quantidade atual já atende ou supera o pedido)'; 
  END IF;

  -- 4. Inserir apenas a diferença necessária
  -- Note que mantemos o event_uuid para manter a integridade da hierarquia conforme solicitado
  FOR i IN (coalesce(v_current_count, 0) + 1)..p_new_rounds LOOP
    INSERT INTO event_rounds (event_phase_uuid, event_uuid, round_number) 
    VALUES (p_phase_id, v_event_id, i);
  END LOOP;
  
  RETURN 'SUCESSO';
end;
$function$;

-- Função adicional para criar fases padrão ao criar um novo evento
CREATE OR REPLACE FUNCTION public.create_default_phases(p_event_id uuid, p_num_phases integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  i integer;
begin
  FOR i IN 1..p_num_phases LOOP
    INSERT INTO event_phases (event_uuid, phase_name, num_rounds) 
    VALUES (p_event_id, 'Fase ' || i, 0);
  END LOOP;
  RETURN 'SUCESSO';
end;
$function$;

-- Função para adicionar fases a um evento existente
CREATE OR REPLACE FUNCTION public.add_event_phases(p_event_id uuid, p_current_phases integer, p_new_phases integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  i integer;
begin
  FOR i IN (p_current_phases + 1)..p_new_phases LOOP
    INSERT INTO event_phases (event_uuid, phase_name, num_rounds) 
    VALUES (p_event_id, 'Fase ' || i, 0);
  END LOOP;
  RETURN 'SUCESSO';
end;
$function$;
