-- Migration: expand admin_approvals_type_check to include application approval types
-- Run this in a transaction. Make a DB backup before running in production.

-- Inspect current constraint and values before applying changes
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'admin_approvals'::regclass;
-- SELECT pg_get_serial_sequence('admin_approvals', 'id');
-- SELECT DISTINCT type FROM admin_approvals ORDER BY type;

BEGIN;

-- Drop existing constraint if present
ALTER TABLE IF EXISTS public.admin_approvals
    DROP CONSTRAINT IF EXISTS admin_approvals_type_check;

-- Recreate the constraint including all approval type values used by the application
ALTER TABLE public.admin_approvals
    ADD CONSTRAINT admin_approvals_type_check CHECK (
        type::text = ANY (ARRAY[
            'schedule_change'::character varying::text,
            'contract_update'::character varying::text,
            'leave_request'::character varying::text,
            'infraction_create'::character varying::text,
            'infraction_delete'::character varying::text,
            'absence_create'::character varying::text,
            'absence_delete'::character varying::text,
            'retard_create'::character varying::text,
            'retard_delete'::character varying::text,
            'tenue_create'::character varying::text,
            'tenue_delete'::character varying::text,
            'employee_update'::character varying::text,
            'role_update'::character varying::text
        ])
    );

COMMIT;

-- After running, verify:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'admin_approvals'::regclass;
-- SELECT DISTINCT type FROM admin_approvals ORDER BY type;

-- NOTE:
-- If you prefer to allow arbitrary strings for `type` (not recommended), you can instead DROP the constraint and leave the column unconstrained.
-- Always run migrations on a staging environment first and have a DB backup if running in production.
